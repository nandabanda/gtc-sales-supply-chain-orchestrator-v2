import type {
  CreditTier,
  ExpirySensitivity,
  Priority,
  ReplenishmentEngineInputRow,
} from "@/data/replenishmentEngineSeed";

/** Credit tier: `High` = elevated commercial/collections risk → tighter caps */
export type RiskLevel = "High" | "Medium" | "Low";

const MIN_SUGGESTED_QTY = 2;
const MAX_SUGGESTED_QTY = 36;
const TARGET_DAYS_COVER = 7;
const VAN_UTIL_THRESHOLD = 72;
const LOW_CONFIDENCE_BELOW = 55;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundQty(n: number) {
  return Math.max(0, Math.round(n));
}

/** 0–100: higher = worse payment / higher need to cap */
export function creditRiskScore(tier: CreditTier): number {
  switch (tier) {
    case "High":
      return 82;
    case "Medium":
      return 48;
    case "Low":
      return 18;
    default:
      return 45;
  }
}

/** 0–100 stockout exposure */
export function stockoutRiskScore(row: ReplenishmentEngineInputRow): number {
  const coverGap = clamp((TARGET_DAYS_COVER - row.daysOfCoverEstimate) / TARGET_DAYS_COVER, 0, 1);
  const trendBoost = row.recentTrendFactor > 1.05 ? (row.recentTrendFactor - 1) * 40 : 0;
  const velocityBoost = row.skuVelocityIndex >= 75 ? (row.skuVelocityIndex - 50) * 0.5 : 0;
  const raw = coverGap * 55 + trendBoost + velocityBoost * 0.25;
  return clamp(Math.round(raw + (row.currentStockEstimate < 8 ? 12 : 0)), 0, 100);
}

/** 0–100 overstock exposure */
export function overstockRiskScore(row: ReplenishmentEngineInputRow): number {
  const excessCover = clamp((row.daysOfCoverEstimate - TARGET_DAYS_COVER) / TARGET_DAYS_COVER, 0, 1.2);
  const slowVelocity = clamp((55 - row.skuVelocityIndex) / 55, 0, 1) * 35;
  const highStock = row.currentStockEstimate > row.historicalAvgWeeklySales * 1.2 ? 22 : 0;
  return clamp(Math.round(excessCover * 40 + slowVelocity + highStock), 0, 100);
}

/** 0–100 expiry write-off exposure */
export function expiryRiskScore(row: ReplenishmentEngineInputRow, velocityIndex: number): number {
  const sens: Record<ExpirySensitivity, number> = { High: 38, Medium: 22, Low: 8 };
  const slow = clamp((60 - velocityIndex) / 60, 0, 1) * 45;
  const cover = row.daysOfCoverEstimate > 8 ? Math.min(25, (row.daysOfCoverEstimate - 8) * 3) : 0;
  return clamp(Math.round(sens[row.expirySensitivity] + slow + cover), 0, 100);
}

export type ReplenishmentComputation = {
  suggestedQty: number;
  riskLevel: RiskLevel;
  replenishmentReason: string;
  stockoutRisk: number;
  overstockRisk: number;
  expiryRisk: number;
  /** 0–100 credit / collections exposure (does not replace input `creditRisk` tier on the row) */
  creditRiskScore: number;
  vanLoadRecommendation: string;
  actionRecommendation: string;
  confidenceScore: number;
  reviewRequired: boolean;
  wasCreditCapped: boolean;
  wasExpiryReduced: boolean;
  wasStockoutBoosted: boolean;
};

function priorityWeight(p: Priority): number {
  switch (p) {
    case "High":
      return 1.12;
    case "Medium":
      return 1.0;
    case "Low":
      return 0.92;
    default:
      return 1;
  }
}

function maxRiskLevel(a: number, b: number, c: number, d: number): RiskLevel {
  const m = Math.max(a, b, c, d);
  if (m >= 66) return "High";
  if (m >= 38) return "Medium";
  return "Low";
}

/**
 * Core orchestration: suggested quantity and narrative fields from synthetic inputs.
 * Uses fallbacks when optional context is thin.
 */
export function computeReplenishment(row: ReplenishmentEngineInputRow): ReplenishmentComputation {
  const creditScore = creditRiskScore(row.creditRisk);
  const stockout = stockoutRiskScore(row);
  const overstock = overstockRiskScore(row);
  const expiry = expiryRiskScore(row, row.skuVelocityIndex);

  const weeklyNeed =
    row.historicalAvgWeeklySales * row.recentTrendFactor * priorityWeight(row.customerPriority);
  const targetStock = (weeklyNeed / 7) * TARGET_DAYS_COVER;
  let rawSuggested = targetStock - row.currentStockEstimate;

  if (stockout >= 60 && row.recentTrendFactor >= 1) {
    rawSuggested *= 1.15;
  }
  if (overstock >= 55 && expiry < 50) {
    rawSuggested *= 0.65;
  }
  if (expiry >= 50 && row.skuVelocityIndex < 55) {
    rawSuggested *= 0.55;
  }

  if (row.routeProductivityIndex >= 80 && row.skuVelocityIndex >= 78) {
    rawSuggested *= 1.08;
  }

  let suggestedQty = roundQty(rawSuggested);
  suggestedQty = clamp(suggestedQty, MIN_SUGGESTED_QTY, MAX_SUGGESTED_QTY);

  const creditCap =
    row.creditRisk === "High" ? 10 : row.creditRisk === "Medium" ? 22 : MAX_SUGGESTED_QTY;
  let wasCreditCapped = false;
  if (suggestedQty > creditCap) {
    suggestedQty = creditCap;
    wasCreditCapped = true;
  }

  let wasExpiryReduced = false;
  if (expiry >= 60 && row.skuVelocityIndex < 50) {
    const capped = Math.min(suggestedQty, Math.max(MIN_SUGGESTED_QTY, 6));
    if (capped < suggestedQty) wasExpiryReduced = true;
    suggestedQty = capped;
  }

  let wasStockoutBoosted = false;
  if (stockout >= 70) {
    const boosted = Math.min(MAX_SUGGESTED_QTY, Math.max(suggestedQty, roundQty(suggestedQty * 1.12)));
    if (boosted > suggestedQty) wasStockoutBoosted = true;
    suggestedQty = boosted;
    if (wasCreditCapped && row.creditRisk !== "High") {
      suggestedQty = Math.min(suggestedQty, creditCap + 2);
    }
  }

  if (overstock >= 70 && expiry >= 45) {
    suggestedQty = Math.min(suggestedQty, MIN_SUGGESTED_QTY);
  }

  const riskLevel = maxRiskLevel(stockout, overstock, expiry, creditScore);

  const reasons: string[] = [];
  if (row.recentTrendFactor > 1.08 && row.currentStockEstimate < weeklyNeed * 0.45) {
    reasons.push("recent demand above baseline with thin on-hand");
  }
  if (stockout >= 55) reasons.push("elevated stockout risk on days-of-cover");
  if (expiry >= 55) reasons.push("expiry sensitivity and velocity warrant caution");
  if (overstock >= 55) reasons.push("overstock risk on cover vs movement");
  if (wasCreditCapped) reasons.push("credit-aware cap applied");
  if (row.routeProductivityIndex >= 78) reasons.push("high route productivity — prioritize fast movers");
  if (row.vanLoadUtilizationPct < VAN_UTIL_THRESHOLD) reasons.push("van below utilization target — room for fast movers");
  if (reasons.length === 0) reasons.push("standard replenishment to target cover");

  let vanLoadRecommendation: string;
  if (row.vanLoadUtilizationPct < VAN_UTIL_THRESHOLD) {
    vanLoadRecommendation = `Increase fast-moving SKUs on ${row.vanId} (utilization ${row.vanLoadUtilizationPct}% vs ${VAN_UTIL_THRESHOLD}% threshold).`;
  } else if (row.vanLoadUtilizationPct > 92) {
    vanLoadRecommendation = `${row.vanId} is cube-constrained; sequence high-margin SKUs and defer discretionary volume.`;
  } else {
    vanLoadRecommendation = `${row.vanId} within band (${row.vanLoadUtilizationPct}%); align manifest to route sequence.`;
  }

  let actionRecommendation: string;
  if (stockout >= 72) {
    actionRecommendation = "Urgent replenishment — prioritize pick and early dispatch.";
  } else if (overstock >= 68 && expiry >= 50) {
    actionRecommendation = "No additional issue — rebalance or transfer excess before new supply.";
  } else if (wasCreditCapped) {
    actionRecommendation = "Credit-capped supply — confirm collections status before uplift.";
  } else if (expiry >= 62 && row.skuVelocityIndex < 48) {
    actionRecommendation = "Reduce suggested quantity — protect margin on slow chilled/short-life SKUs.";
  } else if (row.routeProductivityIndex >= 82 && row.skuVelocityIndex >= 80) {
    actionRecommendation = "Prioritize SKU on productive route — protect service on high-yield calls.";
  } else {
    actionRecommendation = "Approve suggested replenishment within standard governance.";
  }

  let confidenceScore = 72;
  confidenceScore += row.recentTrendFactor > 0.85 && row.recentTrendFactor < 1.35 ? 8 : -4;
  confidenceScore += row.daysOfCoverEstimate > 0.5 && row.daysOfCoverEstimate < 20 ? 6 : -2;
  confidenceScore -= Math.abs(stockout - expiry) > 45 ? 8 : 0;
  confidenceScore -= row.creditRisk === "High" ? 10 : 0; // tier from input row
  confidenceScore = clamp(Math.round(confidenceScore), 35, 94);

  const reviewRequired = confidenceScore < LOW_CONFIDENCE_BELOW || riskLevel === "High";

  if (reviewRequired && !actionRecommendation.includes("Review")) {
    actionRecommendation = "Review required — validate demand signal, credit, and manifest before execution.";
  }

  const replenishmentReason = reasons.slice(0, 4).join("; ") + ".";

  return {
    suggestedQty,
    riskLevel,
    replenishmentReason,
    stockoutRisk: stockout,
    overstockRisk: overstock,
    expiryRisk: expiry,
    creditRiskScore: creditScore,
    vanLoadRecommendation,
    actionRecommendation,
    confidenceScore,
    reviewRequired,
    wasCreditCapped,
    wasExpiryReduced,
    wasStockoutBoosted,
  };
}

export type ReplenishmentRowView = ReplenishmentEngineInputRow & ReplenishmentComputation;

export function buildReplenishmentRows(seed: ReplenishmentEngineInputRow[]): ReplenishmentRowView[] {
  return seed.map((row) => ({ ...row, ...computeReplenishment(row) }));
}
