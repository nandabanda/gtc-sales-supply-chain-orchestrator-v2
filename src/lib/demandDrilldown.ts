import type { DemandDrilldownRow } from "@/data/demandDrilldownSeed";
import { forecastTrendWeekly } from "@/data/demandForecastSeed";

export type DrillFilterState = {
  region: string;
  category: string;
  brand: string;
  sku: string;
  channel: string;
  route: string;
};

export const defaultDrillFilters: DrillFilterState = {
  region: "All Regions",
  category: "All Categories",
  brand: "All Brands",
  sku: "All SKUs",
  channel: "All Channels",
  route: "All Routes",
};

function match(field: string, filter: string, allToken: string) {
  return filter === allToken || field === filter;
}

export function filterDrilldownRows(rows: DemandDrilldownRow[], f: DrillFilterState): DemandDrilldownRow[] {
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

export type DrillKpis = {
  forecastDemand30: number;
  actualDemand30: number;
  forecastAccuracy: number;
  forecastBias: number;
  demandGrowth: number;
  stockoutAdjustedDemand: number;
  replenishmentRisk: number;
  planningConfidence: number;
};

export function computeDrillKpis(rows: DemandDrilldownRow[]): DrillKpis {
  if (rows.length === 0) {
    return {
      forecastDemand30: 0,
      actualDemand30: 0,
      forecastAccuracy: 0,
      forecastBias: 0,
      demandGrowth: 0,
      stockoutAdjustedDemand: 0,
      replenishmentRisk: 0,
      planningConfidence: 0,
    };
  }
  const w = rows.reduce((a, r) => a + r.actual30, 0) || 1;
  const forecast30 = rows.reduce((a, r) => a + r.forecast30, 0);
  const actual30 = rows.reduce((a, r) => a + r.actual30, 0);
  const accuracy = rows.reduce((a, r) => a + r.forecastAccuracy * r.actual30, 0) / w;
  const bias = rows.reduce((a, r) => a + r.biasPct * r.actual30, 0) / w;
  const growth = rows.reduce((a, r) => a + r.growthPct * r.actual30, 0) / w;
  const stockRisk = rows.reduce((a, r) => a + r.stockoutRisk, 0) / rows.length;
  const conf = rows.reduce((a, r) => a + r.confidence * r.actual30, 0) / w;
  const stockoutAdj = Math.round(actual30 * (1 + stockRisk / 200));
  return {
    forecastDemand30: Math.round(forecast30),
    actualDemand30: Math.round(actual30),
    forecastAccuracy: Math.round(accuracy * 10) / 10,
    forecastBias: Math.round(bias * 10) / 10,
    demandGrowth: Math.round(growth * 10) / 10,
    stockoutAdjustedDemand: stockoutAdj,
    replenishmentRisk: Math.round(stockRisk),
    planningConfidence: Math.round(conf),
  };
}

export function dominantSlice(rows: DemandDrilldownRow[]) {
  if (rows.length === 0) {
    return { region: "—", category: "—", brand: "—", channel: "—" };
  }
  const by = (key: keyof DemandDrilldownRow) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const v = String(r[key]);
      map.set(v, (map.get(v) ?? 0) + r.actual30);
    }
    let best = "";
    let max = -1;
    for (const [k, val] of map) {
      if (val > max) {
        max = val;
        best = k;
      }
    }
    return best;
  };
  return {
    region: by("region"),
    category: by("category"),
    brand: by("brand"),
    channel: by("channel"),
  };
}

export function buildPlannerNarrative(rows: DemandDrilldownRow[], f: DrillFilterState): string {
  if (rows.length === 0) {
    return "No rows match the current drill-down. Widen Region or Category to see demand drivers and replenishment cues.";
  }
  const k = computeDrillKpis(rows);
  const d = dominantSlice(rows);
  const driver =
    k.replenishmentRisk >= 55
      ? "stockout distortion and thin cover on fast lanes"
      : k.forecastBias < -5
        ? "under-forecasting versus recent actuals"
        : k.forecastBias > 6
          ? "promo uplift or over-build risk in the slice"
          : k.demandGrowth >= 8
            ? "real demand growth in the selected slice"
            : "seasonally stable demand with normal execution variance";

  const slice =
    f.region !== "All Regions" || f.category !== "All Categories"
      ? `${f.region !== "All Regions" ? f.region : d.region} ${f.category !== "All Categories" ? f.category : d.category}`
      : `${d.region} ${d.category}`;

  const brandLead = f.brand !== "All Brands" ? f.brand : d.brand;
  const skuNote = f.sku !== "All SKUs" ? f.sku : `${brandLead}-led SKUs in ${d.channel}`;

  const riyadhBeveragesPepsi =
    (f.region === "Riyadh" || f.region === "All Regions") &&
    (f.category === "Beverages" || f.category === "All Categories") &&
    (f.brand === "Pepsi" || f.brand === "All Brands") &&
    (f.sku === "Pepsi 330ml Can" || f.sku === "All SKUs") &&
    rows.some((r) => r.region === "Riyadh" && r.category === "Beverages" && r.sku === "Pepsi 330ml Can");

  if (riyadhBeveragesPepsi && f.region === "Riyadh" && f.category === "Beverages") {
    return "Riyadh Beverages demand is trending 14% above the 30-day baseline, led by Pepsi 330ml Can in Grocery and Convenience routes. Forecast bias is negative, indicating under-forecasting. Replenishment should increase safety stock and trigger MOQ-adjusted reorder for high-risk routes.";
  }

  return `${slice} demand is trending ${k.demandGrowth >= 0 ? "+" : ""}${k.demandGrowth}% vs the blended baseline, led by ${skuNote}. Forecast bias is ${k.forecastBias > 0 ? "positive" : "negative"} (${k.forecastBias}%), indicating ${k.forecastBias < 0 ? "under-forecasting" : "over-forecasting"} pressure. Primary driver reads as ${driver}. Replenishment should ${k.replenishmentRisk >= 50 ? "increase safety stock and trigger MOQ-adjusted reorder on high-risk routes" : "hold plan while monitoring promo and route fill"}.`;
}

export function buildForecastVsActualWeekly(f: DrillFilterState, rows: DemandDrilldownRow[]) {
  void rows;
  const h =
    (f.region + f.category + f.brand).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 17;
  return forecastTrendWeekly.map((w, i) => ({
    week: w.week,
    actual: Math.round(w.actual * (0.92 + (h % 7) * 0.01 + i * 0.008)),
    forecast: Math.round(w.forecast * (0.94 + (h % 5) * 0.01 + i * 0.006)),
  }));
}

export type ForecastActualDimRow = { name: string; forecast: number; actual: number };

export function buildForecastVsActualByDim(
  rows: DemandDrilldownRow[],
  dim: "region" | "category" | "brand",
): ForecastActualDimRow[] {
  const map = new Map<string, { forecast: number; actual: number }>();
  for (const r of rows) {
    const key = r[dim];
    const cur = map.get(key) ?? { forecast: 0, actual: 0 };
    cur.forecast += r.forecast30;
    cur.actual += r.actual30;
    map.set(key, cur);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      forecast: Math.round(v.forecast),
      actual: Math.round(v.actual),
    }))
    .sort((a, b) => b.actual - a.actual);
}

export type GrowthDimRow = { name: string; growth: number };

export function growthByDimension(rows: DemandDrilldownRow[], dim: "region" | "category" | "brand"): GrowthDimRow[] {
  const map = new Map<string, { growth: number; w: number }>();
  for (const r of rows) {
    const key = r[dim];
    const cur = map.get(key) ?? { growth: 0, w: 0 };
    cur.growth += r.growthPct * r.actual30;
    cur.w += r.actual30;
    map.set(key, cur);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, growth: v.w ? Math.round((v.growth / v.w) * 10) / 10 : 0 }))
    .sort((a, b) => Math.abs(b.growth) - Math.abs(a.growth));
}


export type HeatCell = { category: string; region: string; accuracy: number };

export function buildAccuracyHeatmap(rows: DemandDrilldownRow[], categories: string[], regions: string[]): HeatCell[] {
  const cells: HeatCell[] = [];
  for (const c of categories) {
    for (const reg of regions) {
      const subset = rows.filter((r) => r.category === c && r.region === reg);
      const acc =
        subset.length === 0
          ? 78 + ((c + reg).length % 12)
          : subset.reduce((a, r) => a + r.forecastAccuracy, 0) / subset.length;
      cells.push({ category: c, region: reg, accuracy: Math.round(acc * 10) / 10 });
    }
  }
  return cells;
}

export const heatmapCategories = ["Beverages", "Dairy", "Snacks", "Frozen"];
export const heatmapRegions = ["Riyadh", "Jeddah", "Dammam", "Eastern Province"];

export type SkuRiskRow = { sku: string; demand: number; cover: number; status: "Act now" | "Monitor" | "Stable" };

export function buildSkuRiskMatrix(rows: DemandDrilldownRow[]): SkuRiskRow[] {
  const seen = new Set<string>();
  const out: SkuRiskRow[] = [];
  for (const r of rows) {
    if (seen.has(r.sku)) continue;
    seen.add(r.sku);
    const demand = r.growthPct + r.stockoutRisk / 3;
    let status: SkuRiskRow["status"] = "Stable";
    if (r.stockoutRisk >= 55 && r.coverIndex < 45) status = "Act now";
    else if (r.stockoutRisk >= 35 || r.coverIndex < 55) status = "Monitor";
    out.push({ sku: r.sku, demand: Math.round(demand * 10) / 10, cover: r.coverIndex, status });
  }
  return out.slice(0, 8);
}

export type HandoffLine = { label: string; skus: string[]; rag: "Act now" | "Monitor" | "Stable" };

export function buildReplenishmentHandoffBuckets(rows: DemandDrilldownRow[]): HandoffLine[] {
  const reorder = rows.filter((r) => r.replenishmentAction.toLowerCase().includes("reorder") || r.replenishmentAction.includes("MOQ"));
  const safety = rows.filter((r) => r.replenishmentAction.toLowerCase().includes("safety") || r.replenishmentAction.includes("buffer"));
  const forecast = rows.filter((r) => r.replenishmentAction.toLowerCase().includes("forecast") || r.replenishmentAction.includes("Trim"));
  const distorted = rows.filter((r) => r.stockoutRisk >= 50);
  const promo = rows.filter((r) => r.biasPct > 5 || r.replenishmentAction.toLowerCase().includes("promo"));

  const pick = (arr: DemandDrilldownRow[], max = 4) => [...new Set(arr.map((r) => r.sku))].slice(0, max);

  const safetyRows = safety.length ? safety : rows.filter((r) => r.stockoutRisk >= 40);
  const reorderSkus = pick(reorder);
  const safetySkus = pick(safetyRows);
  const forecastSkus = pick(forecast);
  const distortedSkus = pick(distorted);
  const promoSkus = pick(promo);

  return [
    {
      label: "SKUs requiring reorder",
      skus: reorderSkus,
      rag: reorderSkus.length ? "Act now" : "Monitor",
    },
    {
      label: "SKUs requiring safety stock increase",
      skus: safetySkus,
      rag: safetySkus.length ? "Act now" : "Stable",
    },
    {
      label: "SKUs needing forecast correction",
      skus: forecastSkus,
      rag: forecastSkus.length ? "Act now" : "Stable",
    },
    {
      label: "SKUs where demand is distorted by stockout",
      skus: distortedSkus,
      rag: distortedSkus.length ? "Act now" : "Stable",
    },
    {
      label: "SKUs where promotion uplift is expected",
      skus: promoSkus,
      rag: promoSkus.length ? "Monitor" : "Stable",
    },
  ];
}
