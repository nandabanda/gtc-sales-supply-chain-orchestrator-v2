import type { DemandDrilldownRow } from "@/data/demandDrilldownSeed";
import type { CreditTier, ExpirySensitivity, Priority, ReplenishmentEngineInputRow } from "@/data/replenishmentEngineSeed";
import type { GtcOperationalRow } from "@/data/gtcOperationalDemoData";
import type { DrillFilterState } from "@/lib/demandDrilldown";

function match(field: string, filter: string, allToken: string) {
  return filter === allToken || field === filter;
}

export function filterOperationalForDemand(rows: GtcOperationalRow[], f: DrillFilterState): GtcOperationalRow[] {
  return rows.filter(
    (r) =>
      match(r.region, f.region, "All Regions") &&
      match(r.category, f.category, "All Categories") &&
      match(r.brand, f.brand, "All Brands") &&
      match(r.sku, f.sku, "All SKUs") &&
      match(r.channel, f.channel, "All Channels") &&
      match(r.route, f.route, "All Routes"),
  );
}

export type ReplenishmentOpFilters = {
  region: string;
  warehouse: string;
  category: string;
  brand: string;
  route: string;
  channel: string;
};

export const defaultReplenishmentOpFilters: ReplenishmentOpFilters = {
  region: "All Regions",
  warehouse: "All Warehouses",
  category: "All Categories",
  brand: "All Brands",
  route: "All Routes",
  channel: "All Channels",
};

export function filterOperationalForReplenishment(rows: GtcOperationalRow[], f: ReplenishmentOpFilters): GtcOperationalRow[] {
  return rows.filter(
    (r) =>
      match(r.region, f.region, "All Regions") &&
      match(r.warehouse, f.warehouse, "All Warehouses") &&
      match(r.category, f.category, "All Categories") &&
      match(r.brand, f.brand, "All Brands") &&
      match(r.route, f.route, "All Routes") &&
      match(r.channel, f.channel, "All Channels"),
  );
}

export type RouteOpFilters = {
  region: string;
  route: string;
  salesman: string;
  channel: string;
  warehouse: string;
  deliveryRisk: string;
};

export const defaultRouteOpFilters: RouteOpFilters = {
  region: "All Regions",
  route: "All Routes",
  salesman: "All Salesmen",
  channel: "All Channels",
  warehouse: "All Warehouses",
  deliveryRisk: "All delivery risk",
};

export function filterOperationalForRoute(rows: GtcOperationalRow[], f: RouteOpFilters): GtcOperationalRow[] {
  return rows.filter(
    (r) =>
      match(r.region, f.region, "All Regions") &&
      match(r.route, f.route, "All Routes") &&
      match(r.salesman, f.salesman, "All Salesmen") &&
      match(r.channel, f.channel, "All Channels") &&
      match(r.warehouse, f.warehouse, "All Warehouses") &&
      (f.deliveryRisk === "All delivery risk" || r.deliveryRiskBand === f.deliveryRisk),
  );
}

export type ExecutionOpFilters = {
  region: string;
  route: string;
  salesman: string;
  channel: string;
  category: string;
  brand: string;
};

export const defaultExecutionOpFilters: ExecutionOpFilters = {
  region: "All Regions",
  route: "All Routes",
  salesman: "All Salesmen",
  channel: "All Channels",
  category: "All Categories",
  brand: "All Brands",
};

export function filterOperationalForExecution(rows: GtcOperationalRow[], f: ExecutionOpFilters): GtcOperationalRow[] {
  return rows.filter(
    (r) =>
      match(r.region, f.region, "All Regions") &&
      match(r.route, f.route, "All Routes") &&
      match(r.salesman, f.salesman, "All Salesmen") &&
      match(r.channel, f.channel, "All Channels") &&
      match(r.category, f.category, "All Categories") &&
      match(r.brand, f.brand, "All Brands"),
  );
}

export function operationalToDemandDrilldownRow(r: GtcOperationalRow): DemandDrilldownRow {
  const biasRaw = r.forecast30d > 0 ? ((r.actual30d - r.forecast30d) / r.forecast30d) * 100 : 0;
  const biasPct = Math.round(biasRaw * 10) / 10;
  const forecastAccuracy = Math.round(Math.max(72, Math.min(96, 100 - Math.min(26, Math.abs(biasPct) * 0.82))));
  return {
    region: r.region,
    category: r.category,
    brand: r.brand,
    sku: r.sku,
    channel: r.channel,
    route: r.route,
    forecast7: r.forecast7d,
    forecast30: r.forecast30d,
    forecast90: r.forecast90d,
    actual30: r.actual30d,
    forecastAccuracy,
    biasPct,
    growthPct: Math.round(r.demandGrowthPct * 10) / 10,
    stockoutRisk: r.stockoutRisk,
    replenishmentAction: r.recommendedAction,
    confidence: Math.min(94, Math.max(65, Math.round(r.executionScore))),
    coverIndex: Math.min(100, Math.max(12, Math.round(r.daysCover * 3.2))),
  };
}

export function operationalRowsToDemandRows(rows: GtcOperationalRow[]): DemandDrilldownRow[] {
  return rows.map(operationalToDemandDrilldownRow);
}

export function operationalToReplenishmentInput(r: GtcOperationalRow, ix: number): ReplenishmentEngineInputRow {
  const daily = r.actual30d / 30;
  const hist = Array.from({ length: 14 }, (_, i) => Number((daily * (0.9 + (i % 6) * 0.025)).toFixed(2)));
  const credit: CreditTier = r.creditRisk >= 55 ? "High" : r.creditRisk >= 32 ? "Medium" : "Low";
  const priority: Priority = r.routePriority >= 75 ? "High" : r.routePriority >= 50 ? "Medium" : "Low";
  const expirySens: ExpirySensitivity = r.expiryRisk >= 45 ? "High" : r.expiryRisk >= 22 ? "Medium" : "Low";
  const casesScale = 48;
  return {
    customerDisplay: `${r.customerCode} | ${r.customerName}`,
    route: r.route,
    warehouse: r.warehouse,
    skuCode: `OP-${r.customerCode.replace(/[^A-Z0-9]/gi, "")}-${r.sku.replace(/[^A-Za-z0-9]/g, "").slice(0, 14)}`,
    skuName: r.sku,
    brand: r.brand,
    category: r.category,
    packSize: "Std",
    sku: r.sku,
    supplierName: `${r.brand} Dist.`,
    creditRisk: credit,
    customerPriority: priority,
    expirySensitivity: expirySens,
    leadTimeDays: r.leadTimeDays,
    moqCases: Math.max(1, Math.min(48, Math.round(r.moq / 24))),
    purchasePrice: 26 + (ix % 5) * 2,
    sellingPrice: 40 + (ix % 5) * 3,
    shelfLifeDays: 200,
    remainingShelfLifeDays: 100,
    historicalDailySales: hist,
    demandStdDev: Math.max(0.35, daily * 0.14),
    currentStockCases: Math.max(0, Math.round(r.currentStock / casesScale)),
    inTransitCases: Math.max(0, Math.round(r.inTransitStock / casesScale)),
    openPoCases: Math.max(0, Math.round(r.openOrders / casesScale)),
    pendingSalesOrderCases: Math.max(0, Math.round(r.pendingOrders / casesScale)),
    serviceLevelZ: 1.65,
    annualDemandCases: Math.max(400, Math.round(r.forecast90d / 12)),
    orderingCost: 115,
    holdingCostPerCase: 5.8,
    targetCoverDays: 10,
    recentTrendFactor: 1 + r.demandGrowthPct / 220,
    promoUpliftPct: r.demandGrowthPct > 10 ? 11 : 5,
    seasonalityUpliftPct: 4,
    fillRatePct: Math.min(98, Math.max(62, r.orderFillRate)),
    routeProductivityIndex: Math.round(r.executionScore),
    skuVelocityIndex: Math.max(30, Math.min(98, 100 - r.overstockRisk)),
    vanId: `V-${String((ix % 6) + 1).padStart(2, "0")}`,
    vanLoadUtilizationPct: 66 + (ix % 5) * 5,
    vanCapacityCases: 420,
  };
}

export type DemandHandoffTableRow = {
  actionBucket: string;
  skuBrand: string;
  regionRoute: string;
  trigger: string;
  action: string;
  priority: "High" | "Medium" | "Low";
  owner: string;
  rag: "Act now" | "Monitor" | "Stable";
};

function rowToHandoff(actionBucket: string, r: GtcOperationalRow, trigger: string, owner: string): DemandHandoffTableRow {
  const rag: DemandHandoffTableRow["rag"] =
    r.stockoutRisk >= 58 ? "Act now" : r.stockoutRisk >= 38 || r.daysCover < 7 ? "Monitor" : "Stable";
  const priority: DemandHandoffTableRow["priority"] =
    r.stockoutRisk >= 62 ? "High" : r.stockoutRisk >= 40 || r.deliveryRisk >= 55 ? "Medium" : "Low";
  return {
    actionBucket,
    skuBrand: `${r.sku} · ${r.brand}`,
    regionRoute: `${r.region} · ${r.route}`,
    trigger,
    action: r.recommendedAction,
    priority,
    owner,
    rag,
  };
}

function emptyHandoffRow(actionBucket: string): DemandHandoffTableRow {
  return {
    actionBucket,
    skuBrand: "—",
    regionRoute: "—",
    trigger: "No qualifying lane in current slice",
    action: "Widen filters or take no automated action",
    priority: "Low",
    owner: "Supply Controller",
    rag: "Stable",
  };
}

/** Five canonical buckets; picks best-matching lane per bucket from the filtered slice. */
export function buildCompactDemandHandoffTable(rows: GtcOperationalRow[]): DemandHandoffTableRow[] {
  const reorder = rows.find((r) => r.suggestedReorderQty >= 1800);
  const safety = rows.find((r) => r.stockoutRisk >= 50 && r.daysCover < 9);
  const forecast = rows.find((r) => Math.abs(r.actual30d - r.forecast30d) / Math.max(1, r.forecast30d) > 0.08);
  const distortion = rows.find((r) => r.stockoutRisk >= 55 && r.orderFillRate < 82);
  const promo = rows.find((r) => r.demandGrowthPct >= 9);

  const out: DemandHandoffTableRow[] = [];
  if (reorder)
    out.push(
      rowToHandoff(
        "Reorder Required",
        reorder,
        `Suggested reorder ${reorder.suggestedReorderQty.toLocaleString("en-SA")} units · cover ${reorder.daysCover.toFixed(1)}d`,
        "Supply Controller",
      ),
    );
  else out.push(emptyHandoffRow("Reorder Required"));

  if (safety)
    out.push(
      rowToHandoff(
        "Safety Stock Increase",
        safety,
        `Stockout risk ${safety.stockoutRisk} · cover ${safety.daysCover.toFixed(1)}d`,
        "Demand Planning Lead",
      ),
    );
  else out.push(emptyHandoffRow("Safety Stock Increase"));

  if (forecast) {
    const biasPct = Math.round(((forecast.actual30d - forecast.forecast30d) / Math.max(1, forecast.forecast30d)) * 100);
    out.push(
      rowToHandoff(
        "Forecast Correction",
        forecast,
        `Actual vs 30d fcst bias ${biasPct > 0 ? "+" : ""}${biasPct}%`,
        "Demand Planning Lead",
      ),
    );
  } else out.push(emptyHandoffRow("Forecast Correction"));

  if (distortion)
    out.push(
      rowToHandoff(
        "Stockout Distortion",
        distortion,
        `Fill ${distortion.orderFillRate}% with stockout risk ${distortion.stockoutRisk}`,
        "Route Operations",
      ),
    );
  else out.push(emptyHandoffRow("Stockout Distortion"));

  if (promo)
    out.push(
      rowToHandoff(
        "Promo Uplift Watch",
        promo,
        `Demand growth +${promo.demandGrowthPct}% vs baseline`,
        "Category Manager",
      ),
    );
  else out.push(emptyHandoffRow("Promo Uplift Watch"));

  return out.slice(0, 7);
}

export type DemandExceptionTableRow = {
  region: string;
  category: string;
  brand: string;
  sku: string;
  exception: string;
  businessRisk: string;
  recommendedAction: string;
};

export function buildDemandForecastExceptions(rows: GtcOperationalRow[], max = 5): DemandExceptionTableRow[] {
  const scored = [...rows].map((r) => ({
    r,
    score: r.stockoutRisk + Math.abs(r.actual30d - r.forecast30d) / Math.max(1, r.forecast30d) * 40,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map(({ r }) => {
    const bias = r.forecast30d > 0 ? ((r.actual30d - r.forecast30d) / r.forecast30d) * 100 : 0;
    const exception =
      r.stockoutRisk >= 60
        ? "Under-forecast with thin cover"
        : bias < -8
          ? "Sustained negative forecast bias"
          : r.orderFillRate < 80
            ? "Route execution gap depressing sell-through"
            : "Elevated volatility vs plan";
    const risk =
      r.stockoutRisk >= 65
        ? "Revenue loss on priority SKUs within 48h window"
        : r.stockoutRisk >= 45
          ? "Service risk on modern trade call-offs"
          : "Margin erosion if over-corrected";
    return {
      region: r.region,
      category: r.category,
      brand: r.brand,
      sku: r.sku,
      exception,
      businessRisk: risk,
      recommendedAction: r.recommendedAction,
    };
  });
}

export type DemandAiSummary = {
  whatChanged: string;
  whereRisk: string;
  replenishmentDo: string;
  salesWatch: string;
};

export function buildDemandAiPlannerSummary(
  rows: GtcOperationalRow[],
  f: DrillFilterState,
  kpis: { demandGrowth: number; replenishmentRisk: number; forecastBias: number },
): DemandAiSummary {
  if (rows.length === 0) {
    return {
      whatChanged: "No operational lanes match the current drill-down.",
      whereRisk: "Expand Region or Category to restore signal.",
      replenishmentDo: "Hold automated releases until slice is repopulated.",
      salesWatch: "Pause exception escalations until filters widen.",
    };
  }
  const byVol = [...rows].sort((a, b) => b.actual30d - a.actual30d)[0]!;
  const hotRoute = [...rows].sort((a, b) => b.stockoutRisk - a.stockoutRisk)[0]!;
  const slice =
    f.region !== "All Regions" || f.category !== "All Categories"
      ? `${f.region !== "All Regions" ? f.region : byVol.region} / ${f.category !== "All Categories" ? f.category : byVol.category}`
      : `${byVol.region} / ${byVol.category}`;
  return {
    whatChanged: `Demand mix shifted ${kpis.demandGrowth >= 0 ? "+" : ""}${kpis.demandGrowth}% (volume-weighted) in ${slice}, led by ${byVol.sku} via ${byVol.channel}.`,
    whereRisk: `Highest operational pressure: ${hotRoute.region} on ${hotRoute.route} (${hotRoute.customerName}) — stockout risk ${hotRoute.stockoutRisk}, delivery risk ${hotRoute.deliveryRiskBand}.`,
    replenishmentDo:
      kpis.replenishmentRisk >= 50
        ? "Increase MOQ-adjusted reorder and safety stock on the at-risk slice; publish handoff to DC picking before next wave."
        : "Maintain planned releases; monitor fill-rate recovery on modern trade lanes.",
    salesWatch:
      kpis.forecastBias < -5
        ? "Field teams should watch phantom availability and protect must-win outlets where bias is negative."
        : "Sales should guard promo stacking on high-growth SKUs to avoid double-counted uplift in replenishment.",
  };
}
