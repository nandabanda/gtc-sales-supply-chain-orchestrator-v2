import type { Priority } from "@/data/replenishmentEngineSeed";
import type { VanLoadingSeedRow } from "@/data/vanLoadingSeed";
import {
  computeReplenishment,
  expiryRiskScore,
  overstockRiskScore,
  stockoutRiskScore,
  type RiskLevel,
} from "@/lib/replenishment";

export type { RiskLevel };

const UTIL_LOW = 72;
const UTIL_HIGH = 90;
const MIN_LOAD = 2;
const MAX_LOAD = 36;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundCases(n: number) {
  return Math.max(0, Math.round(n));
}

function priorityWeight(p: Priority): number {
  switch (p) {
    case "High":
      return 1.15;
    case "Medium":
      return 1;
    case "Low":
      return 0.88;
    default:
      return 1;
  }
}

export type RoutePriorityBand = "P1" | "P2" | "P3";

export type DispatchKind =
  | "Urgent uplift"
  | "Review required"
  | "Reduce load"
  | "Liquidate / rebalance"
  | "Credit-capped"
  | "Utilization fill"
  | "Focused basket"
  | "Standard";

export type VanLoadingComputation = {
  recommendedLoadQty: number;
  currentLoadQty: number;
  loadGap: number;
  loadUtilization: number;
  priorityScore: number;
  mustLoadFlag: boolean;
  reduceLoadFlag: boolean;
  expiryLiquidationFlag: boolean;
  customerDemandPriority: Priority;
  routePriority: RoutePriorityBand;
  loadReason: string;
  dispatchAction: string;
  dispatchKind: DispatchKind;
  confidenceScore: number;
  reviewRequired: boolean;
  priorityTier: RiskLevel;
};

export type VanLoadingRowView = VanLoadingSeedRow & VanLoadingComputation;

/**
 * Connects replenishment signals to dispatch manifest recommendations (synthetic GTC rules).
 */
export function computeVanLoading(row: VanLoadingSeedRow): VanLoadingComputation {
  const replen = computeReplenishment(row);
  const stockout = stockoutRiskScore(row);
  const overstock = overstockRiskScore(row);
  const expiry = expiryRiskScore(row, row.skuVelocityIndex);

  let recommendedLoadQty = replen.suggestedQty;

  if (row.vanLoadUtilizationPct < UTIL_LOW && row.skuVelocityIndex >= 74) {
    recommendedLoadQty = Math.min(MAX_LOAD, Math.ceil(recommendedLoadQty * 1.1));
  }
  if (row.vanLoadUtilizationPct > UTIL_HIGH) {
    recommendedLoadQty = Math.max(MIN_LOAD, Math.floor(recommendedLoadQty * 0.94));
  }
  if (replen.wasCreditCapped || row.creditRisk === "High") {
    recommendedLoadQty = Math.min(recommendedLoadQty, row.creditRisk === "High" ? 10 : recommendedLoadQty);
  }
  if (overstock >= 58 && row.skuVelocityIndex < 48) {
    recommendedLoadQty = Math.max(MIN_LOAD, Math.floor(recommendedLoadQty * 0.55));
  }
  if (expiry >= 58 && row.skuVelocityIndex < 45) {
    recommendedLoadQty = Math.max(MIN_LOAD, Math.min(recommendedLoadQty, 6));
  }

  const mustLoadFlag =
    (row.routeProductivityIndex >= 78 && stockout >= 52) || stockout >= 68 || (row.customerPriority === "High" && stockout >= 55);

  const reduceLoadFlag = overstock >= 52 || (row.skuVelocityIndex < 42 && row.daysOfCoverEstimate > 8);

  const expiryLiquidationFlag =
    (expiry >= 56 && row.skuVelocityIndex >= 72 && row.route !== "R-12") ||
    (expiry >= 60 && row.skuVelocityIndex >= 78);

  if (mustLoadFlag) {
    recommendedLoadQty = Math.min(MAX_LOAD, Math.max(recommendedLoadQty, replen.suggestedQty));
  }

  recommendedLoadQty = clamp(roundCases(recommendedLoadQty), MIN_LOAD, MAX_LOAD);

  const currentLoadQty = row.currentSkuLoadQty;
  const loadGap = recommendedLoadQty - currentLoadQty;
  const loadUtilization = row.vanLoadUtilizationPct;

  const priorityScore = clamp(
    Math.round(
      stockout * 0.28 +
        row.skuMarginIndex * 0.22 +
        row.routeProductivityIndex * 0.22 +
        row.skuVelocityIndex * 0.18 +
        priorityWeight(row.customerPriority) * 14,
    ),
    0,
    100,
  );

  let routePriority: RoutePriorityBand = "P2";
  if (row.routeProductivityIndex >= 82 && stockout >= 50) routePriority = "P1";
  else if (row.routeProductivityIndex < 66 || overstock >= 60) routePriority = "P3";

  let priorityTier: RiskLevel = "Medium";
  if (priorityScore >= 72 || stockout >= 65) priorityTier = "High";
  else if (priorityScore <= 42 && expiry < 50) priorityTier = "Low";

  const reasons: string[] = [];
  if (mustLoadFlag) reasons.push("must-load signal from stockout exposure and route service priority");
  if (reduceLoadFlag) reasons.push("reduce discretionary volume — overstock or slow velocity");
  if (expiryLiquidationFlag) reasons.push("near-expiry rotation toward higher-velocity route");
  if (row.vanLoadUtilizationPct < UTIL_LOW) reasons.push("van below utilization band — room for fast movers");
  if (row.vanLoadUtilizationPct > UTIL_HIGH) reasons.push("van cube constrained — prioritize must-load SKUs");
  if (row.customerStrikeRate < 64) reasons.push("low strike — prefer focused basket over broad loading");
  if (reasons.length === 0) reasons.push("standard manifest alignment to replenishment");

  let dispatchAction: string;
  let dispatchKind: DispatchKind = "Standard";

  if (row.forecastConfidence < 55 || replen.reviewRequired) {
    dispatchAction = "Review required — validate forecast lane before gate-out.";
    dispatchKind = "Review required";
  } else if (row.customerStrikeRate < 62 && row.skuVelocityIndex < 60) {
    dispatchAction = "Focused basket — narrow SKU mix to lift conversion on weak strike outlets.";
    dispatchKind = "Focused basket";
  } else if (expiryLiquidationFlag) {
    dispatchAction = "Liquidate / rebalance — rotate dated stock to higher-velocity R-12 lane.";
    dispatchKind = "Liquidate / rebalance";
  } else if (mustLoadFlag && stockout >= 65) {
    dispatchAction = "Urgent dispatch uplift — prioritize pick wave for must-load SKU.";
    dispatchKind = "Urgent uplift";
  } else if (reduceLoadFlag) {
    dispatchAction = "Reduce manifest — cut low-priority volume to protect margin and cube.";
    dispatchKind = "Reduce load";
  } else if (row.creditRisk === "High") {
    dispatchAction = "Credit-capped load — hold uplift until collections clearance.";
    dispatchKind = "Credit-capped";
  } else if (row.vanLoadUtilizationPct < UTIL_LOW) {
    dispatchAction = "Fill cube — add high-velocity SKUs to raise utilization safely.";
    dispatchKind = "Utilization fill";
  } else {
    dispatchAction = "Approve manifest — align with optimized route sequence.";
    dispatchKind = "Standard";
  }

  let confidenceScore = Math.round((replen.confidenceScore + row.forecastConfidence) / 2);
  if (row.customerStrikeRate < 58) confidenceScore -= 6;
  if (expiryLiquidationFlag) confidenceScore -= 4;
  confidenceScore = clamp(confidenceScore, 34, 93);

  const reviewRequired = confidenceScore < 56 || row.forecastConfidence < 55 || replen.reviewRequired;

  if (reviewRequired && dispatchKind !== "Review required") {
    dispatchAction = "Review required — cross-check replenishment, credit, and manifest.";
    dispatchKind = "Review required";
  }

  const loadReason = reasons.slice(0, 4).join("; ") + ".";

  return {
    recommendedLoadQty,
    currentLoadQty,
    loadGap,
    loadUtilization,
    priorityScore,
    mustLoadFlag,
    reduceLoadFlag,
    expiryLiquidationFlag,
    customerDemandPriority: row.customerPriority,
    routePriority,
    loadReason,
    dispatchAction,
    dispatchKind,
    confidenceScore,
    reviewRequired,
    priorityTier,
  };
}

export function buildVanLoadingRows(seed: VanLoadingSeedRow[]): VanLoadingRowView[] {
  return seed.map((row) => ({ ...row, ...computeVanLoading(row) }));
}

/** Aggregates for KPIs — revenue proxy from positive gaps × margin index */
export function vanLoadingKpiMetrics(rows: VanLoadingRowView[]) {
  const vansNeedingCorrection = new Set(
    rows.filter((r) => Math.abs(r.loadGap) >= 3 || r.mustLoadFlag || r.reduceLoadFlag).map((r) => r.vanId),
  ).size;

  const mustLoad = rows.filter((r) => r.mustLoadFlag).length;
  const reduceLoad = rows.filter((r) => r.reduceLoadFlag).length;
  const expiryLiq = rows.filter((r) => r.expiryLiquidationFlag).length;

  const vanIds = [...new Set(rows.map((r) => r.vanId))];
  const utilByVan = vanIds.map((id) => {
    const first = rows.find((r) => r.vanId === id);
    return first?.loadUtilization ?? 0;
  });
  const avgUtil =
    utilByVan.length > 0 ? Math.round(utilByVan.reduce((a, b) => a + b, 0) / utilByVan.length) : 0;

  const revenueProtected = rows.reduce((sum, r) => {
    const uplift = Math.max(0, r.loadGap) * (r.skuMarginIndex / 100) * 2.8;
    return sum + uplift;
  }, 0);

  return {
    vansNeedingCorrection,
    mustLoad,
    reduceLoad,
    expiryLiq,
    avgUtilization: avgUtil,
    revenueProtectedLabel: `SAR ${Math.round(revenueProtected)}K`,
  };
}
