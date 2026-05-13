import { replenishmentEngineSeed, type ReplenishmentEngineInputRow } from "@/data/replenishmentEngineSeed";

/**
 * Extra dispatch-planning fields aligned to replenishment seed rows.
 */
export type VanLoadingSeedRow = ReplenishmentEngineInputRow & {
  salesman: string;
  /** 0–100 margin / strategic importance */
  skuMarginIndex: number;
  /** Demand forecast confidence for this lane */
  forecastConfidence: number;
  /** Outlet strike rate 0–100 */
  customerStrikeRate: number;
  /** Cases of this SKU already allocated on tomorrow's van manifest */
  currentSkuLoadQty: number;
};

/** Route → field salesman (demo alignment with demo.ts salesman) */
export const routeSalesmanMap: Record<string, string> = {
  "R-07": "S-04 Ahmed",
  "R-12": "S-09 Faisal",
  "R-03": "S-11 Omar",
  "R-18": "S-15 Khalid",
  "R-22": "S-20 Yousuf",
};

const dispatchExtras = [
  { salesman: "S-04 Ahmed", skuMarginIndex: 82, forecastConfidence: 81, customerStrikeRate: 61, currentSkuLoadQty: 14 },
  { salesman: "S-09 Faisal", skuMarginIndex: 74, forecastConfidence: 76, customerStrikeRate: 58, currentSkuLoadQty: 10 },
  { salesman: "S-11 Omar", skuMarginIndex: 63, forecastConfidence: 67, customerStrikeRate: 54, currentSkuLoadQty: 12 },
  { salesman: "S-15 Khalid", skuMarginIndex: 59, forecastConfidence: 84, customerStrikeRate: 72, currentSkuLoadQty: 18 },
  { salesman: "S-04 Ahmed", skuMarginIndex: 76, forecastConfidence: 78, customerStrikeRate: 66, currentSkuLoadQty: 8 },
  { salesman: "S-11 Omar", skuMarginIndex: 70, forecastConfidence: 62, customerStrikeRate: 49, currentSkuLoadQty: 9 },
  { salesman: "S-09 Faisal", skuMarginIndex: 88, forecastConfidence: 74, customerStrikeRate: 57, currentSkuLoadQty: 6 },
  { salesman: "S-20 Yousuf", skuMarginIndex: 78, forecastConfidence: 80, customerStrikeRate: 69, currentSkuLoadQty: 11 },
] as const;

export const vanLoadingSeed: VanLoadingSeedRow[] = replenishmentEngineSeed.map((row, idx) => ({
  ...row,
  ...dispatchExtras[idx % dispatchExtras.length],
}));

export const aiVanLoadingDecisions: string[] = [
  "Prioritize R-07 cola must-load SKUs because the replenishment engine shows net stock below ROP.",
  "Use V-09 cube opportunity for approved fast movers, but keep high-credit-risk energy drink release under finance control.",
  "Reduce chilled dairy load on R-03 where expiry and slow movement signals are high.",
  "Sequence pick waves by stockout exposure first, then route productivity and margin priority.",
  "Hold broad loading for low-strike outlets and shift to a focused basket for conversion improvement.",
];
