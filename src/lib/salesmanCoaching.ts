import type { SalesmanCoachingSeedRow } from "@/data/salesmanCoachingSeed";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export type CoachingPriority = "High" | "Medium" | "Watchlist" | "Low";

export type RootCauseKind =
  | "Conversion"
  | "Basket / SKU mix"
  | "Must-sell gap"
  | "Coverage & discipline"
  | "Van & load planning"
  | "Supply constraint"
  | "Credit friction"
  | "Improving / mixed";

export type CoachingStatus =
  | "High Risk"
  | "Watchlist"
  | "Review Required"
  | "Supply constraint"
  | "Recognized"
  | "On track";

export type SalesmanCoachingComputation = {
  salesmanProductivityScore: number;
  strikeRateScore: number;
  routeQualityScore: number;
  basketSizeScore: number;
  skuMixScore: number;
  vanLoadAlignmentScore: number;
  customerCoverageScore: number;
  missedCustomerCount: number;
  missedHighValueCustomers: number;
  mustSellSkuMissCount: number;
  coachingPriority: CoachingPriority;
  rootCause: RootCauseKind;
  recommendedCoachingAction: string;
  expectedImpact: string;
  supervisorAction: string;
  confidenceScore: number;
  status: CoachingStatus;
  reviewRequired: boolean;
};

export type SalesmanCoachingRowView = SalesmanCoachingSeedRow & SalesmanCoachingComputation;

function forecastConfidenceProxy(row: SalesmanCoachingSeedRow): number {
  return clamp(
    72 + (row.salesTrendVsTarget - 1) * 40 - row.stockoutRiskOnRoute * 0.08,
    45,
    92,
  );
}

function missedCoveragePenalty(row: SalesmanCoachingSeedRow): number {
  return row.missedHighValueCustomers * 6 + row.missedCustomerCount * 1.2;
}

function repeatMissPenalty(row: SalesmanCoachingSeedRow): number {
  return row.repeatMissedCustomers;
}

export function computeSalesmanCoaching(row: SalesmanCoachingSeedRow): SalesmanCoachingComputation {
  const strikeRateScore = clamp(Math.round(row.strikeRate), 0, 100);
  const routeQualityScore = clamp(
    Math.round(row.routeProductivityIndex * 0.55 + row.customerValueMix * 0.45),
    0,
    100,
  );
  const basketSizeScore = clamp(Math.round(row.basketSizeIndex * 0.6 + row.avgOrderValueIndex * 0.4), 0, 100);
  const skuMixScore = clamp(
    Math.round(row.mustSellSkuAdoption * 0.5 + row.customerValueMix * 0.5),
    0,
    100,
  );
  const vanLoadAlignmentScore = clamp(Math.round(row.vanLoadAlignment), 0, 100);
  const callGap = Math.max(0, row.plannedCalls - row.actualCalls);
  const customerCoverageScore = clamp(
    Math.round(100 - missedCoveragePenalty(row) - callGap * 1.8),
    0,
    100,
  );

  const missedCustomerCount = row.missedCustomerCount;
  const missedHighValueCustomers = row.missedHighValueCustomers;
  const mustSellSkuMissCount = clamp(Math.round((100 - row.mustSellSkuAdoption) / 8 + row.repeatMissedCustomers), 0, 24);

  const productivityRaw =
    strikeRateScore * 0.22 +
    routeQualityScore * 0.18 +
    basketSizeScore * 0.14 +
    skuMixScore * 0.14 +
    vanLoadAlignmentScore * 0.1 +
    customerCoverageScore * 0.12 +
    row.skuAvailability * 0.06 +
    row.routeSequenceAdherence * 0.04;

  const salesmanProductivityScore = clamp(Math.round(productivityRaw), 28, 97);

  const supplyDriven =
    row.stockoutRiskOnRoute >= 68 && row.vanLoadAlignment < 62 && row.skuAvailability < 68;

  let rootCause: RootCauseKind = "Improving / mixed";
  if (supplyDriven && row.strikeRate < 65) {
    rootCause = "Supply constraint";
  } else if (row.plannedCalls >= 26 && row.actualCalls >= row.plannedCalls - 3 && row.strikeRate < 52) {
    rootCause = "Conversion";
  } else if (missedHighValueCustomers >= 4 || row.repeatMissedCustomers >= 4) {
    rootCause = "Coverage & discipline";
  } else if (row.creditApprovalFriction >= 62) {
    rootCause = "Credit friction";
  } else if (row.strikeRate >= 68 && row.avgOrderValueIndex < 72 && row.basketSizeIndex < 66) {
    rootCause = "Basket / SKU mix";
  } else if (row.mustSellSkuAdoption < 52) {
    rootCause = "Must-sell gap";
  } else if (row.vanLoadAlignment < 65 && row.routeSequenceAdherence < 66) {
    rootCause = "Van & load planning";
  } else if (row.routeProductivityIndex < 62 && row.customerValueMix >= 75) {
    rootCause = "Coverage & discipline";
  }

  let coachingPriority: CoachingPriority = "Medium";
  if (rootCause === "Supply constraint") {
    coachingPriority = "Low";
  } else if (
    missedHighValueCustomers >= 4 ||
    repeatMissPenalty(row) >= 3 ||
    (rootCause === "Conversion" && row.strikeRate < 48)
  ) {
    coachingPriority = "High";
  } else if (salesmanProductivityScore >= 78) {
    coachingPriority = "Low";
  } else if (row.weekOverWeekImproved && salesmanProductivityScore >= 58 && salesmanProductivityScore < 72) {
    coachingPriority = "Watchlist";
  } else if (row.weekOverWeekImproved) {
    coachingPriority = "Watchlist";
  }

  let status: CoachingStatus = "On track";
  if (salesmanProductivityScore >= 88 && row.strikeRate >= 82 && row.mustSellSkuAdoption >= 82) {
    status = "Recognized";
  } else if (rootCause === "Supply constraint") {
    status = "Supply constraint";
  } else if (row.creditApprovalFriction >= 58 && missedHighValueCustomers >= 2) {
    status = "Review Required";
  } else if (coachingPriority === "High") {
    status = "High Risk";
  } else if (coachingPriority === "Watchlist") {
    status = "Watchlist";
  }

  const { action: recommendedCoachingAction, supervisorAction, expectedImpact } = buildActions(
    row,
    rootCause,
    coachingPriority,
    supplyDriven,
  );

  let confidenceScore = clamp(
    Math.round(
      row.skuAvailability * 0.22 +
        row.routeSequenceAdherence * 0.18 +
        (100 - row.stockoutRiskOnRoute * 0.25) +
        forecastConfidenceProxy(row) * 0.15,
    ),
    35,
    94,
  );

  confidenceScore -= row.repeatMissedCustomers * 2;
  confidenceScore = clamp(confidenceScore, 35, 94);

  const reviewRequired =
    confidenceScore < 54 || (rootCause === "Credit friction" && row.creditApprovalFriction >= 55);

  if (
    reviewRequired &&
    status !== "Recognized" &&
    status !== "Supply constraint" &&
    status !== "Watchlist"
  ) {
    status = "Review Required";
  }

  return {
    salesmanProductivityScore,
    strikeRateScore,
    routeQualityScore,
    basketSizeScore,
    skuMixScore,
    vanLoadAlignmentScore,
    customerCoverageScore,
    missedCustomerCount,
    missedHighValueCustomers,
    mustSellSkuMissCount,
    coachingPriority,
    rootCause,
    recommendedCoachingAction,
    expectedImpact,
    supervisorAction,
    confidenceScore,
    status,
    reviewRequired,
  };
}

function buildActions(
  row: SalesmanCoachingSeedRow,
  rootCause: RootCauseKind,
  priority: CoachingPriority,
  supplyDriven: boolean,
): { action: string; supervisorAction: string; expectedImpact: string } {
  if (supplyDriven && rootCause === "Supply constraint") {
    return {
      action: "Do not penalize field — align replenishment and van loading with warehouse before coaching strike.",
      supervisorAction: "Coordinate with supply controller on stock availability and manifest accuracy for this route.",
      expectedImpact: "Recover SAR 35–90K when availability matches calls (synthetic range).",
    };
  }
  if (rootCause === "Credit friction") {
    return {
      action: "Escalate credit holds on priority outlets — finance approval for constrained accounts.",
      supervisorAction: "Joint call with credit desk on top blocked customers; track approval SLA.",
      expectedImpact: "Unlock SAR 18–40K in constrained orders (synthetic).",
    };
  }
  if (rootCause === "Conversion") {
    return {
      action: "Conversion clinic — objection handling, must-sell pitch, and stock confirmation at the door.",
      supervisorAction: "Ride-along two days this week; record strike by outlet tier.",
      expectedImpact: "+6–10 pp strike within 30 days (synthetic).",
    };
  }
  if (rootCause === "Basket / SKU mix") {
    return {
      action: "Basket coaching — attach rate, upsell bundles, replace low-turn SKUs with must-sell ladder.",
      supervisorAction: "Weekly basket review with SKU photo standards on van.",
      expectedImpact: "+8–12% revenue per call (synthetic).",
    };
  }
  if (rootCause === "Must-sell gap") {
    return {
      action: "SKU drill on SKU-102 / SKU-204 — tie incentives to must-sell compliance.",
      supervisorAction: "Daily must-sell checklist sign-off until adoption exceeds 65%.",
      expectedImpact: "+12 pts must-sell adoption (synthetic).",
    };
  }
  if (rootCause === "Van & load planning") {
    return {
      action: "Pre-route planning session — align cube, sequence, and SKU availability before departure.",
      supervisorAction: "Approve revised pick list with warehouse before next dispatch.",
      expectedImpact: "Fewer missed SKUs and +5–8 pp strike (synthetic).",
    };
  }
  if (rootCause === "Coverage & discipline") {
    return {
      action: "Focused route plan — priority customers first; recover missed high-value outlets.",
      supervisorAction: "Supervisor-approved weekly coverage map; exception log for skips.",
      expectedImpact: "Recover 3–6 high-value visits per week (synthetic).",
    };
  }
  if (priority === "Watchlist" && row.weekOverWeekImproved) {
    return {
      action: "Maintain momentum — tighten basket size focus while productivity recovers.",
      supervisorAction: "Fortnightly check-in; keep on watchlist until basket index clears 62.",
      expectedImpact: "Sustain uplift and close residual gap (synthetic).",
    };
  }
  return {
    action: "Standard performance review — reinforce discipline and route adherence.",
    supervisorAction: "Monthly 1:1 with productivity dashboard.",
    expectedImpact: "Stabilize execution metrics vs target (synthetic).",
  };
}

export function buildSalesmanCoachingRows(seed: SalesmanCoachingSeedRow[]): SalesmanCoachingRowView[] {
  return seed.map((row) => ({ ...row, ...computeSalesmanCoaching(row) }));
}

export function coachingKpiMetrics(rows: SalesmanCoachingRowView[]) {
  const needingCoaching = rows.filter(
    (r) => r.coachingPriority === "High" || r.coachingPriority === "Medium" || r.status === "High Risk",
  ).length;

  const lowStrikeRoutes = new Set(rows.filter((r) => r.strikeRate < 60).map((r) => r.route)).size;

  const missedHv = rows.reduce((s, r) => s + r.missedHighValueCustomers, 0);

  const mustSellGap = rows.filter((r) => r.mustSellSkuAdoption < 55).length;

  const revenueRecovery = `SAR ${Math.min(920, Math.round(rows.reduce((s, r) => s + r.missedHighValueCustomers * 14 + r.mustSellSkuMissCount * 3.2, 0)))}K`;

  const avgProd =
    rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.salesmanProductivityScore, 0) / rows.length) : 0;

  return {
    needingCoaching,
    lowStrikeRoutes,
    missedHighValueCustomers: missedHv,
    mustSellGaps: mustSellGap,
    revenueRecoveryOpportunity: revenueRecovery,
    avgProductivityScore: avgProd,
  };
}
