import type { ExpiryOverstockSeedRow } from "@/data/expiryOverstockSeed";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export type RiskBand = "Low" | "Medium" | "High" | "Critical";

export type LiquidationPriority = "Urgent" | "High" | "Medium" | "Low";

export type ActionCategory =
  | "Rebalance"
  | "Liquidate"
  | "Reduce load"
  | "Priority push"
  | "Escalate"
  | "Monitor"
  | "Review";

export type ExpiryOverstockOwner = "Warehouse" | "Salesman" | "Supervisor" | "Supply controller" | "Finance";

export type ExpiryOverstockStatus =
  | "Safe"
  | "Review Required"
  | "Urgent"
  | "Rebalance opportunity"
  | "Liquidation priority"
  | "Reduce dispatch"
  | "Watchlist";

export type ExpiryOverstockComputation = {
  expiryRiskScore: number;
  overstockRiskScore: number;
  daysToExpiry: number;
  daysCover: number;
  velocityScore: number;
  liquidationPriority: LiquidationPriority;
  rebalanceOpportunity: boolean;
  suggestedDestinationRoute: string;
  suggestedDestinationCustomer: string;
  salesmanPushRecommendation: string;
  avoidableExpiryLoss: number;
  stockValueAtRisk: number;
  recommendedAction: string;
  actionReason: string;
  actionCategory: ActionCategory;
  owner: ExpiryOverstockOwner;
  confidenceScore: number;
  status: ExpiryOverstockStatus;
  expiryRiskBand: RiskBand;
  overstockRiskBand: RiskBand;
};

export type ExpiryOverstockRowView = ExpiryOverstockSeedRow & ExpiryOverstockComputation & { rowKey: string };

function bandFromScore(score: number): RiskBand {
  if (score >= 78) return "Critical";
  if (score >= 58) return "High";
  if (score >= 38) return "Medium";
  return "Low";
}

function liquidationFromScores(expiryS: number, overS: number, valueK: number): LiquidationPriority {
  const combined = expiryS * 0.55 + overS * 0.35 + clamp(valueK / 4, 0, 22);
  if (combined >= 82 || (expiryS >= 78 && valueK >= 120)) return "Urgent";
  if (combined >= 64) return "High";
  if (combined >= 44) return "Medium";
  return "Low";
}

export function computeExpiryOverstock(row: ExpiryOverstockSeedRow, _rowKey: string): ExpiryOverstockComputation {
  const ads = Math.max(row.avgDailySales, 0.05);
  const daysCover = clamp(row.currentStockUnits / ads, 0, 600);

  const expiryPressure = clamp(100 - (row.daysToExpiry / Math.max(row.shelfLifeDays, 1)) * 100, 0, 100);
  const coverPressure = clamp((daysCover - 28) * 1.15, 0, 72);

  const expiryRiskScore = clamp(
    Math.round(expiryPressure * 0.62 + coverPressure * 0.28 + (100 - row.skuVelocityIndex) * 0.1),
    0,
    100,
  );

  const overstockRiskScore = clamp(
    Math.round(
      clamp(daysCover - 35, 0, 120) * 0.45 +
        (100 - row.skuVelocityIndex) * 0.28 +
        (100 - row.customerVelocityIndex) * 0.14 +
        (100 - row.routeVelocityIndex) * 0.13,
    ),
    0,
    100,
  );

  const velocityScore = clamp(
    Math.round(
      row.skuVelocityIndex * 0.38 +
        row.routeVelocityIndex * 0.22 +
        row.customerVelocityIndex * 0.22 +
        row.customerStrikeRate * 0.18,
    ),
    0,
    100,
  );

  const stockValueAtRisk = clamp(Math.round(row.stockValueSarK * (expiryRiskScore / 100) * 1.05), 8, 520);
  const avoidableExpiryLoss = clamp(
    Math.round(row.stockValueSarK * (expiryRiskScore / 100) * (row.promotionLiquidationFit / 100)),
    6,
    240,
  );

  const rebalanceOpportunity =
    row.daysToExpiry <= 26 &&
    row.altRouteVelocityIndex - row.routeVelocityIndex >= 18 &&
    daysCover >= 24 &&
    row.replenishmentRecommendationFit >= 48;

  let liquidationPriority = liquidationFromScores(expiryRiskScore, overstockRiskScore, row.stockValueSarK);

  const expiryRiskBand = bandFromScore(expiryRiskScore);
  const overstockRiskBand = bandFromScore(overstockRiskScore);

  let suggestedDestinationRoute = row.suggestedDestinationRoute;
  let suggestedDestinationCustomer = row.suggestedDestinationCustomer;
  if (!suggestedDestinationRoute) suggestedDestinationRoute = "R-12";
  if (!suggestedDestinationCustomer) suggestedDestinationCustomer = "C-310 City Express";

  let salesmanPushRecommendation = `Maintain shelf standards — monitor weekly sell-through on ${row.sku}.`;
  if (row.daysToExpiry <= 22 && velocityScore >= 72 && row.promotionLiquidationFit >= 72) {
    salesmanPushRecommendation = `Priority push ${row.sku} via ${row.salesman} — bundle promo + chilled visibility this week.`;
  } else if (row.creditRisk >= 62) {
    salesmanPushRecommendation = `Hold aggressive push — coordinate with finance before deep liquidation (${row.customer}).`;
  } else if (rebalanceOpportunity) {
    salesmanPushRecommendation = `After transfer lands, assign ${row.salesman} on origin route to clear residual facing.`;
  }

  let recommendedAction = "Monitor sell-through — no structural change this cycle.";
  let actionReason = "Risk scores within tolerance versus velocity and cover.";
  let actionCategory: ActionCategory = "Monitor";
  let owner: ExpiryOverstockOwner = "Supply controller";
  let status: ExpiryOverstockStatus = "Safe";

  const forecastWeak = row.forecastConfidence < 48;
  const creditBlocks = row.creditRisk >= 62;

  if (forecastWeak && row.stockValueSarK >= 120) {
    status = "Review Required";
    actionCategory = "Review";
    recommendedAction = "Supervisor review — validate forecast and shrink risk before liquidation.";
    actionReason = "Forecast confidence is low while stock value at risk remains elevated.";
    owner = "Supervisor";
    salesmanPushRecommendation = "Pause autonomous pushes pending scenario review.";
  } else if (creditBlocks && liquidationPriority !== "Low") {
    status = "Watchlist";
    actionCategory = "Review";
    recommendedAction = "Finance-approved liquidation path — avoid unconstrained push.";
    actionReason = "Credit risk constrains outlet uptake without supervisor alignment.";
    owner = "Finance";
  } else if (row.sku === "SKU-330" && daysCover >= 90 && velocityScore < 52) {
    status = "Reduce dispatch";
    actionCategory = "Reduce load";
    recommendedAction = "Stop incremental loads on this route — tighten forward orders.";
    actionReason = "High days cover with weak SKU and route velocity.";
    owner = "Warehouse";
    salesmanPushRecommendation = "Shift focus to faster lanes; do not incentivize slow SKU on this route.";
  } else if (
    rebalanceOpportunity &&
    row.altRouteVelocityIndex >= row.routeVelocityIndex + 16 &&
    row.daysToExpiry <= 24
  ) {
    status = "Rebalance opportunity";
    actionCategory = "Rebalance";
    recommendedAction = `Transfer inventory toward ${suggestedDestinationRoute} / ${suggestedDestinationCustomer}.`;
    actionReason = "Alternate route shows materially higher velocity while expiry window is tight.";
    owner = "Supply controller";
    salesmanPushRecommendation = `Coordinate van transfer with ${row.salesman} and receiving salesman at destination.`;
  } else if (
    row.daysToExpiry <= 26 &&
    velocityScore >= 74 &&
    row.promotionLiquidationFit >= 76 &&
    row.vanLoadSpareCapacity >= 58
  ) {
    status = "Liquidation priority";
    actionCategory = "Liquidate";
    recommendedAction = `Liquidation push at ${row.customer} — use spare van capacity for uplift.`;
    actionReason = "Strong demand fit and available cube for near-expiry SKU.";
    owner = "Salesman";
    salesmanPushRecommendation = `Push ${row.sku} through ${row.salesman} with promo ladder this week.`;
  } else if (expiryRiskBand === "Critical" || liquidationPriority === "Urgent") {
    status = "Urgent";
    actionCategory = "Escalate";
    recommendedAction = "Escalate cross-route rotation — minimize write-off exposure.";
    actionReason = "Expiry risk and stock value combine above urgent threshold.";
    owner = "Supervisor";
  } else if (expiryRiskBand === "High" && overstockRiskBand === "High") {
    status = "Liquidation priority";
    actionCategory = "Liquidate";
    recommendedAction = "Accelerate sell-down — pair promo with targeted outlet list.";
    actionReason = "Elevated expiry and overstock signals simultaneously.";
    owner = "Salesman";
  } else if (velocityScore >= 88 && daysCover <= 45 && row.daysToExpiry >= 120) {
    status = "Safe";
    actionCategory = "Monitor";
    recommendedAction = "Maintain plan — velocity and cover within guardrails.";
    actionReason = "Healthy funnel with adequate runway before expiry.";
    owner = "Supply controller";
  }

  let confidenceScore = clamp(
    Math.round(
      row.forecastConfidence * 0.34 +
        row.replenishmentRecommendationFit * 0.18 +
        row.mustSellSkuFit * 0.12 +
        (100 - row.creditRisk) * 0.14 +
        row.vanLoadSpareCapacity * 0.1 +
        velocityScore * 0.12,
    ),
    32,
    96,
  );

  confidenceScore -= row.daysToExpiry < 16 ? 4 : 0;
  confidenceScore = clamp(confidenceScore, 32, 96);

  if (forecastWeak && status !== "Review Required") {
    status = "Review Required";
    actionCategory = "Review";
    recommendedAction = "Review Required — tighten forecast inputs before execution.";
    actionReason = "Model confidence below governance threshold.";
    owner = "Supervisor";
  }

  if (avoidableExpiryLoss >= 170 && status !== "Safe") {
    liquidationPriority = liquidationPriority === "Low" ? "High" : liquidationPriority;
  }

  return {
    expiryRiskScore,
    overstockRiskScore,
    daysToExpiry: row.daysToExpiry,
    daysCover: Math.round(daysCover * 10) / 10,
    velocityScore,
    liquidationPriority,
    rebalanceOpportunity,
    suggestedDestinationRoute,
    suggestedDestinationCustomer,
    salesmanPushRecommendation,
    avoidableExpiryLoss,
    stockValueAtRisk,
    recommendedAction,
    actionReason,
    actionCategory,
    owner,
    confidenceScore,
    status,
    expiryRiskBand,
    overstockRiskBand,
  };
}

export function buildExpiryOverstockRows(seed: ExpiryOverstockSeedRow[]): ExpiryOverstockRowView[] {
  return seed.map((row, idx) => {
    const rowKey = `${row.sku}-${row.route}-${row.customer}-${idx}`;
    return { ...row, rowKey, ...computeExpiryOverstock(row, rowKey) };
  });
}

export function expiryOverstockKpiMetrics(rows: ExpiryOverstockRowView[]) {
  const expiryRiskSkus = rows.filter((r) => r.expiryRiskBand === "High" || r.expiryRiskBand === "Critical").length;
  const overstockSkus = rows.filter((r) => r.overstockRiskBand === "High" || r.overstockRiskBand === "Critical").length;
  const stockValue = rows.reduce((s, r) => s + r.stockValueAtRisk, 0);
  const avoidable = rows.reduce((s, r) => s + r.avoidableExpiryLoss, 0);
  const rebalance = rows.filter((r) => r.rebalanceOpportunity).length;
  const liquidationActions = rows.filter(
    (r) => r.liquidationPriority === "Urgent" || r.liquidationPriority === "High" || r.status === "Liquidation priority",
  ).length;

  return {
    skusAtExpiryRisk: expiryRiskSkus,
    overstockedSkus: overstockSkus,
    stockValueAtRiskLabel: `SAR ${Math.round(stockValue)}K`,
    avoidableExpiryLossLabel: `SAR ${Math.round(avoidable)}K`,
    rebalanceOpportunities: rebalance,
    liquidationActionsRequired: liquidationActions,
  };
}
