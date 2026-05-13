import type {
  CreditTier,
  ExpirySensitivity,
  Priority,
  ReplenishmentEngineInputRow,
} from "@/data/replenishmentEngineSeed";

/** Credit tier: `High` = elevated commercial/collections risk → tighter caps */
export type RiskLevel = "High" | "Medium" | "Low";

const MIN_SUGGESTED_QTY = 0;
const MAX_SUGGESTED_QTY = 48;
const BASE_TARGET_COVER_DAYS = 7;
const VAN_UTIL_THRESHOLD = 72;
const LOW_CONFIDENCE_BELOW = 55;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundQty(n: number) {
  return Math.max(0, Math.round(n));
}

/** Effective ADS (cases/day) */
export function effectiveAds(row: ReplenishmentEngineInputRow): number {
  if (row.historicalDailySales > 0.001) return row.historicalDailySales;
  return (row.historicalAvgWeeklySales / 7) * row.recentTrendFactor;
}

/** Net available stock (cases) including pipeline minus committed outbound */
export function effectiveNetAvailable(row: ReplenishmentEngineInputRow): number {
  return row.currentStockCases + row.inTransitCases + row.openPoCases - row.pendingSalesOrderCases;
}

/** Days of cover on net available at current ADS */
export function effectiveDaysCover(row: ReplenishmentEngineInputRow): number {
  const ads = effectiveAds(row);
  if (ads <= 0.001) return row.daysOfCoverEstimate;
  return effectiveNetAvailable(row) / ads;
}

/** ROP = lead-time demand + safety stock (cases) */
export function reorderPointCases(row: ReplenishmentEngineInputRow): number {
  const ads = effectiveAds(row);
  const ltd = ads * row.leadTimeDays;
  const ss = row.serviceLevelZ * row.demandStdDev * Math.sqrt(Math.max(0.25, row.leadTimeDays));
  return ltd + ss;
}

function targetCoverDays(p: Priority): number {
  switch (p) {
    case "High":
      return 8;
    case "Medium":
      return 7;
    case "Low":
      return 6;
    default:
      return BASE_TARGET_COVER_DAYS;
  }
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

/** 0–100 stockout exposure (secondary signal — primary path is ROP vs net available) */
export function stockoutRiskScore(row: ReplenishmentEngineInputRow): number {
  const ads = effectiveAds(row);
  const cover = effectiveDaysCover(row);
  const target = targetCoverDays(row.customerPriority);
  const coverGap = clamp((target - cover) / target, 0, 1);
  const trendBoost = row.recentTrendFactor > 1.05 ? (row.recentTrendFactor - 1) * 40 : 0;
  const velocityBoost = row.skuVelocityIndex >= 75 ? (row.skuVelocityIndex - 50) * 0.5 : 0;
  const net = effectiveNetAvailable(row);
  const rop = reorderPointCases(row);
  const ropGap = ads > 0.001 ? clamp((rop - net) / Math.max(1, rop), 0, 1) * 45 : 0;
  const raw = coverGap * 40 + trendBoost + velocityBoost * 0.2 + ropGap;
  return clamp(Math.round(raw + (net < ads * 2 ? 14 : 0)), 0, 100);
}

/** 0–100 overstock exposure */
export function overstockRiskScore(row: ReplenishmentEngineInputRow): number {
  const ads = effectiveAds(row);
  const cover = effectiveDaysCover(row);
  const target = targetCoverDays(row.customerPriority);
  const excessCover = clamp((cover - target) / target, 0, 1.4);
  const slowVelocity = clamp((55 - row.skuVelocityIndex) / 55, 0, 1) * 35;
  const weeklyEq = ads * 7;
  const highStock = effectiveNetAvailable(row) > weeklyEq * 1.35 ? 18 : 0;
  return clamp(Math.round(excessCover * 38 + slowVelocity + highStock), 0, 100);
}

/** 0–100 expiry write-off exposure */
export function expiryRiskScore(row: ReplenishmentEngineInputRow, velocityIndex: number): number {
  const sens: Record<ExpirySensitivity, number> = { High: 38, Medium: 22, Low: 8 };
  const slow = clamp((60 - velocityIndex) / 60, 0, 1) * 42;
  const cover = effectiveDaysCover(row);
  const coverPenalty = cover > 8 ? Math.min(28, (cover - 8) * 2.8) : 0;
  const shelfPressure =
    row.shelfLifeDays > 0 ? clamp((1 - row.remainingShelfLifeDays / row.shelfLifeDays) * 28, 0, 28) : 0;
  return clamp(Math.round(sens[row.expirySensitivity] + slow + coverPenalty + shelfPressure), 0, 100);
}

export type ReplenishmentComputation = {
  /** Average daily sales (cases/day) */
  ads: number;
  /** Coefficient of variation (demandStdDev / ADS) */
  demandVariability: number;
  leadTimeDays: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  netAvailableStock: number;
  daysOfCover: number;
  targetStock: number;
  suggestedReorderRaw: number;
  moqAdjustedQty: number;
  eoq: number;
  supplierRecommendation: string;
  purchaseOrderRecommendation: string;
  /** Why the engine recommends this position */
  driverSummary: string;
  /** Service / margin impact if no supply action */
  noActionConsequence: string;
  suggestedQty: number;
  riskLevel: RiskLevel;
  replenishmentReason: string;
  stockoutRisk: number;
  overstockRisk: number;
  expiryRisk: number;
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

function moqRoundUp(qty: number, moq: number): number {
  if (qty <= 0 || moq <= 0) return 0;
  return Math.ceil(qty / moq) * moq;
}

function computeEoq(row: ReplenishmentEngineInputRow): number {
  const h = row.holdingCostPerCase;
  if (h <= 0 || row.annualDemandCases <= 0 || row.orderingCost <= 0) return 0;
  return Math.sqrt((2 * row.annualDemandCases * row.orderingCost) / h);
}

/**
 * ROP-first replenishment: ADS, safety stock, ROP, target cover, MOQ, EOQ reference;
 * then credit, expiry, overstock, and van context as secondary guardrails.
 */
export function computeReplenishment(row: ReplenishmentEngineInputRow): ReplenishmentComputation {
  const ads = effectiveAds(row);
  const demandVariability = ads > 0.001 ? row.demandStdDev / ads : 0;

  const leadTimeDays = row.leadTimeDays;
  const leadTimeDemand = ads * leadTimeDays;
  const safetyStock = row.serviceLevelZ * row.demandStdDev * Math.sqrt(Math.max(0.25, leadTimeDays));
  const reorderPoint = reorderPointCases(row);

  const netAvailableStock = effectiveNetAvailable(row);
  const daysOfCover = effectiveDaysCover(row);

  const coverDays = targetCoverDays(row.customerPriority) * priorityWeight(row.customerPriority);
  const targetStock = ads * coverDays + safetyStock;

  let suggestedReorderRaw = Math.max(0, targetStock - netAvailableStock);
  let moqAdjustedQty = moqRoundUp(suggestedReorderRaw, row.moqCases);

  const eoq = computeEoq(row);

  const creditScore = creditRiskScore(row.creditRisk);
  const stockout = stockoutRiskScore(row);
  const overstock = overstockRiskScore(row);
  const expiry = expiryRiskScore(row, row.skuVelocityIndex);

  if (netAvailableStock < reorderPoint && moqAdjustedQty === 0 && suggestedReorderRaw > 0) {
    moqAdjustedQty = row.moqCases;
  }

  let workingQty = moqAdjustedQty;

  const creditCap = row.creditRisk === "High" ? 10 : row.creditRisk === "Medium" ? 24 : MAX_SUGGESTED_QTY;
  let wasCreditCapped = false;
  if (workingQty > creditCap) {
    workingQty = creditCap;
    wasCreditCapped = true;
  }

  let wasExpiryReduced = false;
  if (expiry >= 58 && row.skuVelocityIndex < 52) {
    const maxAllow = row.expirySensitivity === "High" ? row.moqCases : Math.min(workingQty, row.moqCases * 3);
    const next = Math.min(workingQty, maxAllow);
    if (next < workingQty) wasExpiryReduced = true;
    workingQty = next;
  }

  let wasStockoutBoosted = false;
  if (netAvailableStock < reorderPoint && stockout >= 55) {
    const boosted = Math.min(MAX_SUGGESTED_QTY, Math.max(workingQty, moqRoundUp(workingQty * 1.08, row.moqCases)));
    if (boosted > workingQty) wasStockoutBoosted = true;
    workingQty = boosted;
    if (wasCreditCapped && row.creditRisk !== "High") {
      workingQty = Math.min(workingQty, creditCap + row.moqCases);
    }
  }

  if (overstock >= 62 && expiry >= 48) {
    workingQty = Math.min(workingQty, row.moqCases);
  }

  const suggestedQty = clamp(roundQty(workingQty), MIN_SUGGESTED_QTY, MAX_SUGGESTED_QTY);

  const riskLevel = maxRiskLevel(stockout, overstock, expiry, creditScore);

  const supplierRecommendation = `${row.supplierName} · LT ${row.leadTimeDays}d · MOQ ${row.moqCases} cs · EOQ ref ${Math.round(eoq) || "—"} cs`;

  const purchaseOrderRecommendation =
    suggestedQty > 0
      ? `Raise warehouse PO — ${row.skuCode} × ${suggestedQty} cs @ ~SAR ${row.purchasePrice.toFixed(1)} / cs`
      : `No incremental PO — hold replenishment on ${row.skuCode}`;

  const ropBreached = netAvailableStock < reorderPoint;
  const driverParts: string[] = [];
  driverParts.push(
    ropBreached
      ? `Net ${roundQty(netAvailableStock)} cs below ROP ${roundQty(reorderPoint)} cs (ADS ${ads.toFixed(2)} cs/d)`
      : `Net ${roundQty(netAvailableStock)} cs at/above ROP ${roundQty(reorderPoint)} cs`,
  );
  driverParts.push(`LT demand ${leadTimeDemand.toFixed(1)} cs + SS ${safetyStock.toFixed(1)} cs`);
  if (row.recentTrendFactor > 1.08) driverParts.push(`demand uplift ×${row.recentTrendFactor.toFixed(2)}`);
  if (row.pendingSalesOrderCases > 0) driverParts.push(`${row.pendingSalesOrderCases} cs pending SO`);
  if (wasCreditCapped) driverParts.push("credit tier cap");
  if (wasExpiryReduced) driverParts.push("expiry guardrail");
  const driverSummary = driverParts.join(" · ");

  const noActionConsequence = ropBreached
    ? `Risk stockout on ${row.route}: service loss on ${row.skuCode} within ${Math.max(1, Math.floor(daysOfCover))} selling days at current ADS.`
    : overstock >= 55 || expiry >= 55
      ? `Without rebalance, ${row.skuCode} ages toward write-off on ${row.route} (cover ${daysOfCover.toFixed(1)}d).`
      : `No immediate service risk; monitor ADS vs target cover ${coverDays.toFixed(1)}d.`;

  let vanLoadRecommendation: string;
  if (row.vanLoadUtilizationPct < VAN_UTIL_THRESHOLD) {
    vanLoadRecommendation = `Increase fast movers on ${row.vanId} (${row.vanLoadUtilizationPct}% util vs ${VAN_UTIL_THRESHOLD}% floor) for ${row.route}.`;
  } else if (row.vanLoadUtilizationPct > 92) {
    vanLoadRecommendation = `${row.vanId} cube-constrained — sequence ${row.skuCode} with must-load priority on ${row.route}.`;
  } else {
    vanLoadRecommendation = `${row.vanId} in band (${row.vanLoadUtilizationPct}%); align manifest to dispatch wave for ${row.route}.`;
  }

  let actionRecommendation: string;
  if (ropBreached && suggestedQty > 0) {
    actionRecommendation = `Approve ${suggestedQty} cs pick — bring net above ROP before next ${row.leadTimeDays}d supplier cycle.`;
  } else if (wasCreditCapped) {
    actionRecommendation = "Finance review — release or cap PO under collections policy before pick.";
  } else if (overstock >= 64 && expiry >= 52) {
    actionRecommendation = "Transfer or promo-push before new inbound — avoid stacking slow chilled cover.";
  } else if (expiry >= 62 && row.skuVelocityIndex < 48) {
    actionRecommendation = "Reduce inbound — protect margin on short-life SKU at this outlet.";
  } else {
    actionRecommendation = "Maintain lane — ROP satisfied; refresh on next cycle unless ADS shifts.";
  }

  let confidenceScore = 74;
  confidenceScore += row.recentTrendFactor > 0.85 && row.recentTrendFactor < 1.35 ? 6 : -4;
  confidenceScore += daysOfCover > 0.4 && daysOfCover < 22 ? 5 : -2;
  confidenceScore -= Math.abs(stockout - expiry) > 45 ? 7 : 0;
  confidenceScore -= row.creditRisk === "High" ? 12 : 0;
  confidenceScore -= demandVariability > 0.45 ? 5 : 0;
  confidenceScore = clamp(Math.round(confidenceScore), 35, 94);

  const reviewRequired = confidenceScore < LOW_CONFIDENCE_BELOW || riskLevel === "High";

  if (reviewRequired && !actionRecommendation.toLowerCase().includes("review")) {
    actionRecommendation = "Controller review — validate ADS, pipeline POs, and credit before execution.";
  }

  const replenishmentReason = [
    `ROP ${roundQty(reorderPoint)} cs vs net ${roundQty(netAvailableStock)} cs`,
    `Target ${roundQty(targetStock)} cs (${coverDays.toFixed(1)}d cover + SS)`,
    stockout >= 55 ? "stockout pressure" : null,
    expiry >= 55 ? "expiry pressure" : null,
    overstock >= 55 ? "overstock pressure" : null,
  ]
    .filter(Boolean)
    .join("; ")
    .concat(".");

  return {
    ads,
    demandVariability,
    leadTimeDays,
    leadTimeDemand,
    safetyStock,
    reorderPoint,
    netAvailableStock,
    daysOfCover,
    targetStock,
    suggestedReorderRaw,
    moqAdjustedQty,
    eoq,
    supplierRecommendation,
    purchaseOrderRecommendation,
    driverSummary,
    noActionConsequence,
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

export type ReplenishmentExecutiveKpis = {
  lanesBelowRop: number;
  totalMoqSuggestedCases: number;
  avgPipelineCoverDays: number;
  avgEngineConfidence: number;
  avgEoqReferenceCases: number;
};

export function replenishmentExecutiveKpis(rows: ReplenishmentRowView[]): ReplenishmentExecutiveKpis {
  const below = rows.filter((r) => r.netAvailableStock < r.reorderPoint).length;
  const totalMoq = rows.reduce((a, r) => a + r.moqAdjustedQty, 0);
  const avgCover = rows.length ? rows.reduce((acc, r) => acc + r.daysOfCover, 0) / rows.length : 0;
  const avgConf = rows.length ? rows.reduce((acc, r) => acc + r.confidenceScore, 0) / rows.length : 0;
  const avgEoq = rows.length ? rows.reduce((acc, r) => acc + r.eoq, 0) / rows.length : 0;
  return {
    lanesBelowRop: below,
    totalMoqSuggestedCases: roundQty(totalMoq),
    avgPipelineCoverDays: Math.round(avgCover * 10) / 10,
    avgEngineConfidence: Math.round(avgConf),
    avgEoqReferenceCases: Math.round(avgEoq),
  };
}
