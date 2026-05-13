import type { DemandForecastSeedRow, DemandSignalReason } from "@/data/demandForecastSeed";

export type DemandHorizonDays = 7 | 30 | 90;

export type DemandPlanningComputation = {
  horizonDays: DemandHorizonDays;
  fillCorrectedDailyCases: number;
  forecastDailyCases: number;
  forecastHorizonCases: number;
  /** Proxy “actual” demand the model is scored against (same horizon) */
  actualHorizonCases: number;
  forecastAccuracyPct: number;
  forecastBiasPct: number;
  confidenceScore: number;
  underForecastRisk: number;
  overForecastRisk: number;
  primarySignal: DemandSignalReason;
  signalMix: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pickPrimarySignal(row: DemandForecastSeedRow): DemandSignalReason {
  const scores: Record<DemandSignalReason, number> = {
    Trend: Math.abs(row.trendYoY) * 100,
    Promo: row.promoUplift * 120,
    Seasonality: Math.abs(1 - row.seasonalityFactor) * 200,
    "Route growth": row.routeGrowthYoY * 110,
    "Customer buying frequency": Math.abs(row.customerFreqUplift) * 130,
  };
  let best: DemandSignalReason = "Trend";
  let max = -1;
  (Object.keys(scores) as DemandSignalReason[]).forEach((k) => {
    if (scores[k] > max) {
      max = scores[k];
      best = k;
    }
  });
  return best;
}

function signalMixLabel(row: DemandForecastSeedRow, primary: DemandSignalReason): string {
  const parts = [`Primary: ${primary}`];
  if (row.promoUplift >= 0.08) parts.push("promo-heavy");
  if (row.volatilityIndex >= 45) parts.push("volatile lane");
  if (row.fillCorrection < 0.82) parts.push("fill-corrected");
  return parts.join(" · ");
}

/**
 * Demand planning view for a SKU×route row at a forecast horizon.
 * Uses fill-corrected baseline, multiplicative uplift stack, and MAPE-style accuracy vs a latent actual proxy.
 */
export function computeDemandPlanning(row: DemandForecastSeedRow, horizonDays: DemandHorizonDays): DemandPlanningComputation {
  const fillCorrectedDaily = row.baseDailyDemandCases / clamp(row.fillCorrection, 0.65, 0.99);

  const forecastDaily =
    fillCorrectedDaily *
    (1 + row.trendYoY) *
    row.seasonalityFactor *
    (1 + row.promoUplift) *
    (1 + row.routeGrowthYoY) *
    (1 + row.customerFreqUplift);

  const forecastHorizon = forecastDaily * horizonDays;

  /** Latent “actual” demand proxy: base run rate with small execution noise */
  const noise = 0.97 + (row.volatilityIndex % 7) * 0.01;
  const actualHorizon = row.baseDailyDemandCases * horizonDays * noise;

  const mape = actualHorizon > 0.01 ? (Math.abs(forecastHorizon - actualHorizon) / actualHorizon) * 100 : 0;
  const forecastAccuracyPct = clamp(100 - mape, 52, 99.5);

  const bias = actualHorizon > 0.01 ? ((forecastHorizon - actualHorizon) / actualHorizon) * 100 : 0;
  const forecastBiasPct = Math.round(bias * 10) / 10;

  const underForecastRisk = clamp(bias < -3 ? Math.round(-bias * 2.2) : 0, 0, 100);
  const overForecastRisk = clamp(bias > 3 ? Math.round(bias * 2.0) : 0, 0, 100);

  let confidenceScore = clamp(
    92 - row.volatilityIndex * 0.55 - underForecastRisk * 0.12 - overForecastRisk * 0.12 - (1 - row.fillCorrection) * 35,
    38,
    96,
  );
  confidenceScore = Math.round(confidenceScore);

  const primarySignal = pickPrimarySignal(row);

  return {
    horizonDays,
    fillCorrectedDailyCases: Math.round(fillCorrectedDaily * 100) / 100,
    forecastDailyCases: Math.round(forecastDaily * 100) / 100,
    forecastHorizonCases: Math.round(forecastHorizon * 10) / 10,
    actualHorizonCases: Math.round(actualHorizon * 10) / 10,
    forecastAccuracyPct: Math.round(forecastAccuracyPct * 10) / 10,
    forecastBiasPct,
    confidenceScore,
    underForecastRisk,
    overForecastRisk,
    primarySignal,
    signalMix: signalMixLabel(row, primarySignal),
  };
}

export type DemandPlanningRowView = DemandForecastSeedRow & DemandPlanningComputation;

export function buildDemandPlanningRows(seed: DemandForecastSeedRow[], horizonDays: DemandHorizonDays): DemandPlanningRowView[] {
  return seed.map((r) => ({ ...r, ...computeDemandPlanning(r, horizonDays) }));
}

export function aggregateDemandPulse(rows: DemandPlanningRowView[]) {
  const sumForecast = rows.reduce((a, r) => a + r.forecastHorizonCases, 0);
  const avgAcc = rows.reduce((a, r) => a + r.forecastAccuracyPct, 0) / Math.max(1, rows.length);
  const avgConf = rows.reduce((a, r) => a + r.confidenceScore, 0) / Math.max(1, rows.length);
  const highUnder = rows.filter((r) => r.underForecastRisk >= 42).length;
  const highOver = rows.filter((r) => r.overForecastRisk >= 42).length;
  return {
    sumForecastCases: Math.round(sumForecast),
    avgAccuracyPct: Math.round(avgAcc * 10) / 10,
    avgConfidence: Math.round(avgConf),
    underForecastLanes: highUnder,
    overForecastLanes: highOver,
  };
}

export type PlanningActionFromDemand = {
  priority: "High" | "Medium" | "Low";
  action: string;
  owner: string;
  impact: string;
  status: "Open" | "In Progress" | "Ready";
  route: string;
  skuCode: string;
};

/** Planning work queue derived from exception thresholds */
export function derivePlanningActions(rows: DemandPlanningRowView[]): PlanningActionFromDemand[] {
  const actions: PlanningActionFromDemand[] = [];

  for (const r of rows) {
    if (r.underForecastRisk >= 45 || (r.forecastBiasPct < -6 && r.route === "R-07")) {
      actions.push({
        priority: "High",
        action: `Lift ${r.skuCode} baseline on ${r.route} — under-forecast risk ${r.underForecastRisk}%`,
        owner: "Demand Planning Lead",
        impact: "Protect replenishment pick before dispatch",
        status: "Open",
        route: r.route,
        skuCode: r.skuCode,
      });
    } else if (r.overForecastRisk >= 45 || r.forecastBiasPct > 8) {
      actions.push({
        priority: "Medium",
        action: `Trim ${r.skuCode} promo stack on ${r.route} — over-forecast risk ${r.overForecastRisk}%`,
        owner: "Demand Planning Lead",
        impact: "Reduce overstocks on chilled / short-life",
        status: "Ready",
        route: r.route,
        skuCode: r.skuCode,
      });
    } else if (r.confidenceScore < 62) {
      actions.push({
        priority: "Medium",
        action: `Exception review: ${r.skuCode} on ${r.route} (confidence ${r.confidenceScore}%)`,
        owner: "Planner",
        impact: "Hold auto-replen until signal validated",
        status: "In Progress",
        route: r.route,
        skuCode: r.skuCode,
      });
    }
  }

  const dedup = new Map<string, PlanningActionFromDemand>();
  for (const a of actions) {
    dedup.set(`${a.route}-${a.skuCode}-${a.action.slice(0, 40)}`, a);
  }
  return Array.from(dedup.values()).slice(0, 8);
}

export type DemandReplenishmentHandoff = {
  route: string;
  skuCode: string;
  forecastHorizonCases: number;
  fillCorrectedDailyCases: number;
  replenishmentCue: string;
  owner: string;
};

export function buildDemandReplenishmentHandoff(rows: DemandPlanningRowView[]): DemandReplenishmentHandoff[] {
  return rows
    .filter((r) => r.underForecastRisk >= 35 || r.forecastAccuracyPct < 78)
    .slice(0, 6)
    .map((r) => ({
      route: r.route,
      skuCode: r.skuCode,
      forecastHorizonCases: r.forecastHorizonCases,
      fillCorrectedDailyCases: r.fillCorrectedDailyCases,
      replenishmentCue:
        r.underForecastRisk >= 40
          ? `Publish must-load ${r.skuCode} for ${r.route} — corrected demand ${r.fillCorrectedDailyCases.toFixed(1)} cs/d`
          : `Align ROP inputs for ${r.skuCode} on ${r.route} with horizon ${r.horizonDays}d forecast ${Math.round(r.forecastHorizonCases)} cs`,
      owner: "Supply Controller",
    }));
}

export type DemandRowMulti = {
  base: DemandForecastSeedRow;
  h7: DemandPlanningComputation;
  h30: DemandPlanningComputation;
  h90: DemandPlanningComputation;
};

export function buildDemandMultiSeed(seed: DemandForecastSeedRow[]): DemandRowMulti[] {
  return seed.map((base) => ({
    base,
    h7: computeDemandPlanning(base, 7),
    h30: computeDemandPlanning(base, 30),
    h90: computeDemandPlanning(base, 90),
  }));
}

export function activeDemandRow(multi: DemandRowMulti, horizonDays: DemandHorizonDays): DemandPlanningRowView {
  const c = horizonDays === 7 ? multi.h7 : horizonDays === 30 ? multi.h30 : multi.h90;
  return { ...multi.base, ...c };
}
