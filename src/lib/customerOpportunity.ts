import type { CustomerOpportunitySeedRow } from "@/data/customerOpportunitySeed";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export type StrikeRateStatus = "Above benchmark" | "Fair" | "Below benchmark" | "Critical";

export type ChurnRiskBand = "Low" | "Medium" | "High" | "Critical";

export type OpportunityLevel = "High" | "Medium" | "Low" | "Standard";

export type CustomerOpportunityStatus =
  | "Healthy"
  | "Growth opportunity"
  | "Churn risk"
  | "Recover priority"
  | "Review Required"
  | "Watchlist"
  | "Standard service"
  | "Credit friction";

export type OpportunityOwner = "Supervisor" | "Salesman" | "Finance" | "Supply controller";

export type CustomerOpportunityComputation = {
  customerOpportunityScore: number;
  strikeRateStatus: StrikeRateStatus;
  expectedPurchaseFrequency: number;
  actualPurchaseFrequency: number;
  purchaseFrequencyGap: number;
  expectedRevenue: number;
  actualRevenue: number;
  revenueGap: number;
  churnRisk: number;
  churnRiskBand: ChurnRiskBand;
  serviceGap: number;
  visitFrequencyRecommendation: string;
  skuRecommendation: string;
  missedVisitCount: number;
  missedOrderCount: number;
  highPotentialFlag: boolean;
  lowServiceFlag: boolean;
  priorityCustomerFlag: boolean;
  opportunityLevel: OpportunityLevel;
  nextBestAction: string;
  expectedImpact: string;
  owner: OpportunityOwner;
  confidenceScore: number;
  status: CustomerOpportunityStatus;
};

export type CustomerOpportunityRowView = CustomerOpportunitySeedRow & CustomerOpportunityComputation;

function strikeStatusFromRate(rate: number): StrikeRateStatus {
  if (rate >= 82) return "Above benchmark";
  if (rate >= 65) return "Fair";
  if (rate >= 48) return "Below benchmark";
  return "Critical";
}

function revenueFromIndices(row: CustomerOpportunitySeedRow): { expected: number; actual: number } {
  const baseSar = 12 + row.historicalRevenueIndex * 1.85;
  const expected = clamp(Math.round(baseSar * (row.expectedPurchaseFrequency / 10)), 28, 980);
  const actual = clamp(Math.round(baseSar * row.recentRevenueTrend * (row.actualPurchaseFrequency / 10)), 18, 920);
  return { expected, actual };
}

function churnRiskScore(row: CustomerOpportunitySeedRow, freqGap: number): number {
  let r =
    clamp(freqGap * -8, 0, 48) +
    row.churnSignalCycles * 14 +
    (100 - row.customerStrikeRate) * 0.18 +
    row.stockoutRisk * 0.12 +
    (row.recentRevenueTrend < 0.95 ? (1 - row.recentRevenueTrend) * 55 : 0);
  if (row.customerPriority === "Platinum" || row.customerPriority === "Gold") {
    r += row.missedVisitCount * 4;
  }
  return clamp(Math.round(r), 0, 100);
}

function churnBand(score: number): ChurnRiskBand {
  if (score >= 78) return "Critical";
  if (score >= 58) return "High";
  if (score >= 38) return "Medium";
  return "Low";
}

function missedOrders(row: CustomerOpportunitySeedRow): number {
  const visitOrdersGap = Math.max(0, row.actualVisitsPerCycle - row.ordersFromVisits);
  const planMissOrders = Math.max(0, row.plannedVisitsPerCycle - row.actualVisitsPerCycle);
  return clamp(Math.round(visitOrdersGap + planMissOrders * 0.35), 0, 40);
}

export function computeCustomerOpportunity(row: CustomerOpportunitySeedRow): CustomerOpportunityComputation {
  const strikeRateStatus = strikeStatusFromRate(row.customerStrikeRate);
  const expectedPurchaseFrequency = row.expectedPurchaseFrequency;
  const actualPurchaseFrequency = row.actualPurchaseFrequency;
  const purchaseFrequencyGap = clamp(
    Math.round((actualPurchaseFrequency - expectedPurchaseFrequency) * 10) / 10,
    -12,
    12,
  );

  const { expected: expectedRevenue, actual: actualRevenue } = revenueFromIndices(row);
  const revenueGap = clamp(expectedRevenue - actualRevenue, -420, 620);

  const churnRisk = churnRiskScore(row, purchaseFrequencyGap);
  const churnRiskBand = churnBand(churnRisk);

  const visitCompliance =
    row.plannedVisitsPerCycle > 0 ? row.actualVisitsPerCycle / row.plannedVisitsPerCycle : 1;
  const serviceGap = clamp(Math.round((1 - visitCompliance) * 100 + row.missedVisitCount * 9), 0, 100);

  const missedVisitCount = row.missedVisitCount;
  const missedOrderCount = missedOrders(row);

  const highPotentialFlag =
    row.categoryPotentialIndex >= 72 && (row.historicalRevenueIndex >= 70 || row.customerPriority !== "Standard");

  const lowServiceFlag =
    serviceGap >= 42 ||
    (visitCompliance < 0.82 && row.customerPriority !== "Standard") ||
    purchaseFrequencyGap <= -3;

  const priorityCustomerFlag =
    (row.customerPriority === "Platinum" || row.customerPriority === "Gold") &&
    (missedVisitCount >= 3 || revenueGap >= 120);

  let skuRecommendation = "Maintain core basket — selective upsell on chilled.";
  if (row.mustSellSkuAdoption < 52) {
    skuRecommendation = "Priority push SKU-102 / SKU-204 — incentives tied to must-sell ladder.";
  } else if (row.skuBasketDepthIndex < 48) {
    skuRecommendation = "Expand basket depth — bundle snacks + beverages; attach chilled.";
  } else if (row.stockoutRisk >= 68 && row.replenishmentUrgency >= 68) {
    skuRecommendation = "Urgent replenishment SKU mix aligned to stockout risk profile.";
  }

  let visitFrequencyRecommendation = "Keep cadence — align to planned SLA.";
  if (row.stockoutRisk >= 72 && purchaseFrequencyGap < 0) {
    visitFrequencyRecommendation = "Increase to weekly+ visits until stockout risk clears.";
  } else if (serviceGap >= 55 && row.routeProductivityIndex >= 74) {
    visitFrequencyRecommendation = "Add one incremental visit per cycle — route has capacity.";
  } else if (purchaseFrequencyGap <= -4 && churnRisk >= 50) {
    visitFrequencyRecommendation = "Shorten cycle — recover buying rhythm before churn.";
  } else if (lowServiceFlag && highPotentialFlag) {
    visitFrequencyRecommendation = "Prioritize slot — restore coverage before revenue leaks.";
  }

  let opportunityScoreRaw =
    clamp(revenueGap / 6, 0, 42) +
    serviceGap * 0.22 +
    churnRisk * 0.18 +
    row.categoryPotentialIndex * 0.12 +
    row.skuBasketDepthIndex * 0.06 +
    (100 - row.mustSellSkuAdoption) * 0.08;

  if (row.customerStrikeRate >= 78) opportunityScoreRaw -= 8;
  if (row.recentRevenueTrend >= 1.02) opportunityScoreRaw -= 6;
  if (highPotentialFlag && lowServiceFlag) opportunityScoreRaw += 14;

  const customerOpportunityScore = clamp(Math.round(opportunityScoreRaw), 18, 96);

  let opportunityLevel: OpportunityLevel = "Medium";
  if (row.customerPriority === "Standard" && row.categoryPotentialIndex < 42 && revenueGap < 80) {
    opportunityLevel = "Standard";
  } else if (customerOpportunityScore >= 72 || (priorityCustomerFlag && revenueGap >= 100)) {
    opportunityLevel = "High";
  } else if (customerOpportunityScore <= 38) {
    opportunityLevel = "Low";
  }

  let status: CustomerOpportunityStatus = "Growth opportunity";
  let owner: OpportunityOwner = "Salesman";
  let nextBestAction = "Coach basket & strike on next visit — reinforce SLA windows.";
  let expectedImpact = "Stabilize revenue vs prior cycle (synthetic range).";

  if (row.creditRisk >= 62 && row.historicalRevenueIndex >= 78) {
    status = "Credit friction";
    owner = "Finance";
    nextBestAction = "Joint visit with credit approval path — unblock constrained orders.";
    expectedImpact = "Unlock SAR 25–70K constrained demand when limits align (synthetic).";
    skuRecommendation = "Hold SKU expansion until credit release — protect returns.";
  } else if (
    (row.stockoutRisk >= 70 && row.replenishmentUrgency >= 72 && actualRevenue < expectedRevenue * 0.88) ||
    (row.stockoutRisk >= 75 && purchaseFrequencyGap <= -1)
  ) {
    owner = "Supply controller";
    nextBestAction = "Schedule replenishment-led visit — confirm availability before upsell.";
    expectedImpact = "Recover fills lost to stockouts — SAR 15–40K band (synthetic).";
    status = churnRisk >= 58 ? "Churn risk" : "Growth opportunity";
  } else if (missedVisitCount >= 3 && (row.customerPriority === "Gold" || row.customerPriority === "Platinum")) {
    status = "Recover priority";
    owner = "Supervisor";
    nextBestAction = "Priority recovery slot — supervisor-approved coverage map this week.";
    expectedImpact = "Close missed-visit revenue gap — SAR 20–55K upside (synthetic).";
  } else if (visitCompliance >= 0.9 && row.ordersFromVisits / Math.max(1, row.actualVisitsPerCycle) < 0.58) {
    status = "Growth opportunity";
    nextBestAction = "Conversion clinic at outlet — must-sell pitch + availability check.";
    expectedImpact = "+8–12 pp effective strike from visit-to-order (synthetic).";
  } else if (row.churnSignalCycles >= 3) {
    status = "Watchlist";
    owner = "Supervisor";
    nextBestAction = "Watchlist — buying frequency declined for consecutive cycles; validate ranging & replenishment.";
    expectedImpact = "Stabilize frequency before churn escalates — SAR 8–22K protected (synthetic).";
  } else if (churnRiskBand === "Critical" || (row.churnSignalCycles >= 2 && churnRisk >= 55)) {
    status = "Churn risk";
    owner = "Supervisor";
    nextBestAction = "Retention touch — diagnose frequency drop; align replenishment & credit.";
    expectedImpact = "Reduce churn probability — protect SAR 12–30K ARR (synthetic).";
  } else if (churnRiskBand === "High" && purchaseFrequencyGap <= -3) {
    status = "Watchlist";
    nextBestAction = "Increase cadence and confirm ranging — watch basket trend weekly.";
    expectedImpact = "Recover buying rhythm within 2 cycles (synthetic).";
  } else if (highPotentialFlag && lowServiceFlag) {
    status = "Growth opportunity";
    owner = "Supervisor";
    nextBestAction = "High-potential low-service — assign protected visit window.";
    expectedImpact = "Capture whitespace vs category potential — SAR 18–45K (synthetic).";
  } else if (
    row.customerPriority === "Standard" &&
    row.categoryPotentialIndex < 40 &&
    revenueGap < 70 &&
    churnRisk < 45
  ) {
    status = "Standard service";
    opportunityLevel = "Standard";
    nextBestAction = "Maintain standard cadence — no incremental investment this cycle.";
    expectedImpact = "Baseline maintenance — minimal incremental SAR (synthetic).";
  } else if (
    row.customerStrikeRate >= 84 &&
    row.skuBasketDepthIndex >= 78 &&
    row.recentRevenueTrend >= 1.02
  ) {
    status = "Healthy";
    opportunityLevel = "Low";
    nextBestAction = "Recognize performance — keep ranging discipline and share learnings.";
    expectedImpact = "Sustain growth trajectory; minimal intervention (synthetic).";
  }

  let confidenceScore = clamp(
    Math.round(
      row.serviceSlaScore * 0.22 +
        row.salesmanPerformanceIndex * 0.2 +
        row.routeProductivityIndex * 0.14 +
        (100 - row.stockoutRisk) * 0.12 +
        (100 - row.creditRisk) * 0.1 +
        (100 - Math.abs(purchaseFrequencyGap) * 6) * 0.12,
    ),
    34,
    94,
  );

  confidenceScore -= row.missedVisitCount * 2;
  confidenceScore = clamp(confidenceScore, 34, 94);

  const reviewRequired = confidenceScore < 52;

  if (
    reviewRequired &&
    status !== "Healthy" &&
    status !== "Standard service" &&
    status !== "Credit friction" &&
    status !== "Watchlist"
  ) {
    status = "Review Required";
  }

  if (expectedImpact.length < 8) {
    expectedImpact = "Route-aligned uplift vs baseline (synthetic).";
  }

  return {
    customerOpportunityScore,
    strikeRateStatus,
    expectedPurchaseFrequency,
    actualPurchaseFrequency,
    purchaseFrequencyGap,
    expectedRevenue,
    actualRevenue,
    revenueGap,
    churnRisk,
    churnRiskBand,
    serviceGap,
    visitFrequencyRecommendation,
    skuRecommendation,
    missedVisitCount,
    missedOrderCount,
    highPotentialFlag,
    lowServiceFlag,
    priorityCustomerFlag,
    opportunityLevel,
    nextBestAction,
    expectedImpact,
    owner,
    confidenceScore,
    status,
  };
}

export function buildCustomerOpportunityRows(seed: CustomerOpportunitySeedRow[]): CustomerOpportunityRowView[] {
  return seed.map((row) => ({ ...row, ...computeCustomerOpportunity(row) }));
}

export function customerOpportunityKpiMetrics(rows: CustomerOpportunityRowView[]) {
  const missedCustomers = rows.filter((r) => r.missedVisitCount > 0).length;
  const highPotentialLowService = rows.filter((r) => r.highPotentialFlag && r.lowServiceFlag).length;
  const churnAtRisk = rows.filter((r) => r.churnRiskBand === "High" || r.churnRiskBand === "Critical").length;
  const revenueGapK = Math.round(rows.reduce((s, r) => s + Math.max(0, r.revenueGap), 0));
  const skuExpansion = rows.filter((r) => r.skuBasketDepthIndex < 52 || r.mustSellSkuAdoption < 52).length;
  const visitUpgrades = rows.filter((r) =>
    /increase|incremental|weekly\+|shorten cycle|prioritize slot/i.test(r.visitFrequencyRecommendation),
  ).length;

  return {
    missedCustomers,
    highPotentialLowService,
    churnAtRisk,
    revenueGapOpportunity: `SAR ${revenueGapK}K`,
    skuExpansionOpportunities: skuExpansion,
    visitFrequencyUpgrades: visitUpgrades,
  };
}
