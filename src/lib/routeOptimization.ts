import type { CreditTier } from "@/data/replenishmentEngineSeed";
import type { RouteOptimizationSeedRow } from "@/data/routeOptimizationSeed";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function creditPenalty(tier: CreditTier): number {
  switch (tier) {
    case "High":
      return 18;
    case "Medium":
      return 8;
    case "Low":
      return 0;
    default:
      return 5;
  }
}

export type RouteActionKind =
  | "Re-sequence earlier"
  | "SLA window priority"
  | "Focus visit plan"
  | "Credit approval queue"
  | "Liquidation priority"
  | "Defer / lower priority"
  | "Standard";

export type SlaRiskBucket = "High" | "Medium" | "Low";

export type RouteOptimizationComputation = {
  optimizedSequence: number;
  currentSequence: number;
  sequenceChange: number;
  customerPriorityScore: number;
  slaRisk: number;
  revenueAtRisk: string;
  strikeRateOpportunity: number;
  distanceSaving: string;
  timeSaving: string;
  missedCallRisk: number;
  customerVisitUrgency: number;
  routeEfficiencyScore: number;
  supervisorApprovalRequired: boolean;
  routeAction: RouteActionKind;
  optimizationReason: string;
  confidenceScore: number;
  reviewRequired: boolean;
  slaRiskBucket: SlaRiskBucket;
};

export type RouteOptimizationRowView = RouteOptimizationSeedRow & RouteOptimizationComputation;

/** Higher = should be visited earlier */
export function computeCustomerPriorityScore(row: RouteOptimizationSeedRow): number {
  const strikeGap = clamp(82 - row.customerStrikeRate, 0, 45);
  const raw =
    row.customerValueIndex * 0.26 +
    row.slaRisk * 0.22 +
    row.stockoutRisk * 0.18 +
    row.replenishmentUrgency * 0.14 +
    row.demandPotentialIndex * 0.12 +
    strikeGap * 0.35 +
    row.missedVisitsLast30d * 4 +
    (row.mustLoadForCustomer ? 14 : 0) +
    (row.expiryLiquidationFit ? 10 : 0) -
    creditPenalty(row.creditRisk);

  return clamp(Math.round(raw), 15, 98);
}

export function slaRiskBucket(score: number): SlaRiskBucket {
  if (score >= 62) return "High";
  if (score >= 42) return "Medium";
  return "Low";
}

function formatDistanceKm(delta: number): string {
  const v = clamp(Math.abs(delta) * 0.42 + 0.15, 0.2, 8);
  return `${v.toFixed(1)} km`;
}

function formatTimeMin(delta: number): string {
  const mins = clamp(Math.round(Math.abs(delta) * 3.5 + 2), 2, 45);
  return `${mins} min`;
}

function revenueAtRiskLabel(row: RouteOptimizationSeedRow, seqDelta: number): string {
  const base = (row.customerValueIndex / 100) * (row.stockoutRisk / 100) * (row.slaRisk / 100) * 420;
  const bump = Math.abs(seqDelta) > 0 ? 1.12 : 1;
  const k = Math.round(base * bump);
  return `SAR ${Math.max(8, k)}K`;
}

export function computeRouteOptimizationFields(
  row: RouteOptimizationSeedRow,
  optimizedSequence: number,
  routeChangeFraction: number,
): RouteOptimizationComputation {
  const currentSequence = row.currentSequence;
  const sequenceChange = currentSequence - optimizedSequence;
  const customerPriorityScore = computeCustomerPriorityScore(row);

  const strikeRateOpportunity = clamp(
    Math.round((72 - row.customerStrikeRate) * (row.demandPotentialIndex / 100) + row.demandPotentialIndex * 0.25),
    0,
    100,
  );

  const missedCallRisk = clamp(
    Math.round(row.missedVisitsLast30d * 14 + row.slaRisk * 0.35),
    0,
    100,
  );

  const customerVisitUrgency = clamp(
    Math.round(row.replenishmentUrgency * 0.45 + row.stockoutRisk * 0.35 + row.slaRisk * 0.25),
    0,
    100,
  );

  const routeEfficiencyScore = clamp(
    Math.round(row.routeProductivityIndex * 0.55 + (100 - missedCallRisk) * 0.25 + customerPriorityScore * 0.2),
    22,
    96,
  );

  let routeAction: RouteActionKind = "Standard";
  if (row.creditRisk === "High" && row.demandPotentialIndex >= 70) {
    routeAction = "Credit approval queue";
  } else if (row.slaRisk >= 68 && row.slaWindowHour <= 11) {
    routeAction = "SLA window priority";
  } else if (row.expiryLiquidationFit && row.route === "R-12") {
    routeAction = "Liquidation priority";
  } else if (
    row.customerStrikeRate < 62 &&
    row.demandPotentialIndex >= 75 &&
    row.routeProductivityIndex < 75
  ) {
    routeAction = "Focus visit plan";
  } else if (sequenceChange >= 2 && row.stockoutRisk >= 60) {
    routeAction = "Re-sequence earlier";
  } else if (sequenceChange <= -2 || (row.demandPotentialIndex < 45 && row.stockoutRisk < 45)) {
    routeAction = "Defer / lower priority";
  }

  const reasons: string[] = [];
  if (sequenceChange > 0) reasons.push("pull forward for SLA/stockout/value");
  if (sequenceChange < 0) reasons.push("defer low urgency vs network priority");
  if (row.mustLoadForCustomer) reasons.push("must-load replenishment on van");
  if (row.expiryLiquidationFit) reasons.push("expiry liquidation fit on high-velocity lane");
  if (row.missedVisitsLast30d >= 2) reasons.push("missed visit history increases urgency");
  if (row.forecastConfidence < 58) reasons.push("forecast confidence thin — manual validation");
  if (reasons.length === 0) reasons.push("maintain efficient tour order");

  let supervisorApprovalRequired = routeChangeFraction > 0.3 || (row.creditRisk === "High" && row.customerValueIndex >= 70);
  if (Math.abs(sequenceChange) >= 2 && row.creditRisk === "High") supervisorApprovalRequired = true;

  let confidenceScore = Math.round(
    row.forecastConfidence * 0.45 + customerPriorityScore * 0.35 + (100 - missedCallRisk) * 0.2,
  );
  confidenceScore -= row.routeProductivityIndex < 62 ? 8 : 0;
  confidenceScore = clamp(confidenceScore, 36, 94);

  const reviewRequired = row.forecastConfidence < 56 || confidenceScore < 52;

  if (reviewRequired && routeAction === "Standard") {
    routeAction = "Focus visit plan";
  }

  const optimizationReason = reasons.slice(0, 4).join("; ") + ".";

  return {
    optimizedSequence,
    currentSequence,
    sequenceChange,
    customerPriorityScore,
    slaRisk: row.slaRisk,
    revenueAtRisk: revenueAtRiskLabel(row, sequenceChange),
    strikeRateOpportunity,
    distanceSaving: formatDistanceKm(sequenceChange),
    timeSaving: formatTimeMin(sequenceChange),
    missedCallRisk,
    customerVisitUrgency,
    routeEfficiencyScore,
    supervisorApprovalRequired,
    routeAction,
    optimizationReason,
    confidenceScore,
    reviewRequired,
    slaRiskBucket: slaRiskBucket(row.slaRisk),
  };
}

export function buildRouteOptimizationRows(seed: RouteOptimizationSeedRow[]): RouteOptimizationRowView[] {
  const byRoute = new Map<string, RouteOptimizationSeedRow[]>();
  for (const row of seed) {
    const list = byRoute.get(row.route) ?? [];
    list.push(row);
    byRoute.set(row.route, list);
  }

  const changeFractionByRoute = new Map<string, number>();

  for (const [route, stops] of byRoute) {
    const scored = stops
      .map((r) => ({ r, score: computeCustomerPriorityScore(r) }))
      .sort((a, b) => b.score - a.score);
    let changed = 0;
    scored.forEach((item, idx) => {
      const opt = idx + 1;
      if (opt !== item.r.currentSequence) changed += 1;
    });
    changeFractionByRoute.set(route, stops.length > 0 ? changed / stops.length : 0);
  }

  const out: RouteOptimizationRowView[] = [];

  for (const [route, stops] of byRoute) {
    const frac = changeFractionByRoute.get(route) ?? 0;
    const scored = stops
      .map((r) => ({ r, score: computeCustomerPriorityScore(r) }))
      .sort((a, b) => b.score - a.score);

    scored.forEach((item, idx) => {
      const optimizedSequence = idx + 1;
      const base = computeRouteOptimizationFields(item.r, optimizedSequence, frac);
      const supervisor =
        frac > 0.3 || base.supervisorApprovalRequired ? true : base.supervisorApprovalRequired;
      out.push({
        ...item.r,
        ...base,
        supervisorApprovalRequired: supervisor,
      });
    });
  }

  return out.sort((a, b) => a.route.localeCompare(b.route) || a.optimizedSequence - b.optimizedSequence);
}

export function routeOptimizationKpis(rows: RouteOptimizationRowView[]) {
  const routes = new Set(rows.map((r) => r.route));
  const routesWithChange = new Set(rows.filter((r) => r.sequenceChange !== 0).map((r) => r.route));
  const slaCritical = rows.filter((r) => r.slaRiskBucket === "High").length;

  let revenueK = 0;
  rows.forEach((r) => {
    const m = r.revenueAtRisk.match(/(\d+)/);
    if (m) revenueK += parseInt(m[1], 10);
  });

  const missedPrevented = rows.reduce((s, r) => s + r.missedVisitsLast30d * 0.35, 0);

  const timeDigits = rows.map((r) => {
    const m = r.timeSaving.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const avgTime =
    timeDigits.length > 0 ? Math.round(timeDigits.reduce((a, b) => a + b, 0) / timeDigits.length) : 0;

  const supervisorCount = rows.filter((r) => r.supervisorApprovalRequired).length;

  return {
    routesOptimized: routesWithChange.size,
    slaCriticalCustomers: slaCritical,
    revenueProtectedLabel: `SAR ${Math.min(980, Math.round(revenueK * 0.55))}K`,
    missedCallsPrevented: missedPrevented.toFixed(1),
    avgTimeSaving: `${avgTime} min`,
    supervisorApprovalsRequired: supervisorCount,
  };
}
