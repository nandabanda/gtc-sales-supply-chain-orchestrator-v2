/**
 * Synthetic inputs for customer-level replenishment orchestration (GTC demo).
 * Values are illustrative; `computeReplenishment` in lib applies business rules.
 */

export type CreditTier = "Low" | "Medium" | "High";
export type Priority = "High" | "Medium" | "Low";
export type ExpirySensitivity = "High" | "Medium" | "Low";

export type ReplenishmentEngineInputRow = {
  customerDisplay: string;
  route: string;
  sku: string;
  creditRisk: CreditTier;
  customerPriority: Priority;
  /** Rolling average units per week (cases) */
  historicalAvgWeeklySales: number;
  /** Recent vs historical demand multiplier (e.g. 1.2 = +20%) */
  recentTrendFactor: number;
  /** 0–100 SKU velocity index */
  skuVelocityIndex: number;
  /** Estimated on-hand at outlet + in-transit (cases) */
  currentStockEstimate: number;
  /** Estimated days of cover at current run-rate */
  daysOfCoverEstimate: number;
  expirySensitivity: ExpirySensitivity;
  /** Route / field productivity 0–100 */
  routeProductivityIndex: number;
  vanId: string;
  /** Current van load vs capacity, 0–100 */
  vanLoadUtilizationPct: number;
  vanCapacityCases: number;
};

export const replenishmentEngineSeed: ReplenishmentEngineInputRow[] = [
  {
    customerDisplay: "C-184 | Al Noor Mini Market",
    route: "R-07",
    sku: "SKU-204 Cola 250ml",
    creditRisk: "Medium",
    customerPriority: "High",
    historicalAvgWeeklySales: 22,
    recentTrendFactor: 1.22,
    skuVelocityIndex: 88,
    currentStockEstimate: 6,
    daysOfCoverEstimate: 2.1,
    expirySensitivity: "Low",
    routeProductivityIndex: 68,
    vanId: "V-07",
    vanLoadUtilizationPct: 78,
    vanCapacityCases: 420,
  },
  {
    customerDisplay: "C-392 | Riyadh Grocery",
    route: "R-12",
    sku: "SKU-118 Juice 1L",
    creditRisk: "Low",
    customerPriority: "High",
    historicalAvgWeeklySales: 14,
    recentTrendFactor: 1.18,
    skuVelocityIndex: 82,
    currentStockEstimate: 10,
    daysOfCoverEstimate: 4.2,
    expirySensitivity: "High",
    routeProductivityIndex: 63,
    vanId: "V-12",
    vanLoadUtilizationPct: 71,
    vanCapacityCases: 400,
  },
  {
    customerDisplay: "C-081 | City Convenience",
    route: "R-03",
    sku: "SKU-330 Dairy 500ml",
    creditRisk: "Low",
    customerPriority: "Medium",
    historicalAvgWeeklySales: 9,
    recentTrendFactor: 0.88,
    skuVelocityIndex: 38,
    currentStockEstimate: 14,
    daysOfCoverEstimate: 9.5,
    expirySensitivity: "High",
    routeProductivityIndex: 86,
    vanId: "V-03",
    vanLoadUtilizationPct: 84,
    vanCapacityCases: 380,
  },
  {
    customerDisplay: "C-455 | Express Mart",
    route: "R-18",
    sku: "SKU-090 Water 600ml",
    creditRisk: "Low",
    customerPriority: "Medium",
    historicalAvgWeeklySales: 30,
    recentTrendFactor: 1.35,
    skuVelocityIndex: 91,
    currentStockEstimate: 18,
    daysOfCoverEstimate: 3.4,
    expirySensitivity: "Low",
    routeProductivityIndex: 72,
    vanId: "V-18",
    vanLoadUtilizationPct: 88,
    vanCapacityCases: 450,
  },
  {
    customerDisplay: "C-216 | Family Store",
    route: "R-07",
    sku: "SKU-155 Snack Pack",
    creditRisk: "Medium",
    customerPriority: "High",
    historicalAvgWeeklySales: 11,
    recentTrendFactor: 0.95,
    skuVelocityIndex: 52,
    currentStockEstimate: 8,
    daysOfCoverEstimate: 5.1,
    expirySensitivity: "Medium",
    routeProductivityIndex: 68,
    vanId: "V-07",
    vanLoadUtilizationPct: 78,
    vanCapacityCases: 420,
  },
  {
    customerDisplay: "C-091 | Oasis Corner Shop",
    route: "R-03",
    sku: "SKU-118 Juice 1L",
    creditRisk: "Medium",
    customerPriority: "Low",
    historicalAvgWeeklySales: 5,
    recentTrendFactor: 0.72,
    skuVelocityIndex: 34,
    currentStockEstimate: 11,
    daysOfCoverEstimate: 12.4,
    expirySensitivity: "High",
    routeProductivityIndex: 86,
    vanId: "V-03",
    vanLoadUtilizationPct: 84,
    vanCapacityCases: 380,
  },
  {
    customerDisplay: "C-220 | Metro Wholesale Mini",
    route: "R-12",
    sku: "SKU-102 Energy Drink 250ml",
    creditRisk: "High",
    customerPriority: "Medium",
    historicalAvgWeeklySales: 16,
    recentTrendFactor: 1.28,
    skuVelocityIndex: 76,
    currentStockEstimate: 4,
    daysOfCoverEstimate: 1.8,
    expirySensitivity: "Medium",
    routeProductivityIndex: 63,
    vanId: "V-09",
    vanLoadUtilizationPct: 58,
    vanCapacityCases: 410,
  },
  {
    customerDisplay: "C-502 | Northern Express",
    route: "R-22",
    sku: "SKU-204 Cola 250ml",
    creditRisk: "Low",
    customerPriority: "Medium",
    historicalAvgWeeklySales: 18,
    recentTrendFactor: 1.05,
    skuVelocityIndex: 79,
    currentStockEstimate: 12,
    daysOfCoverEstimate: 5.5,
    expirySensitivity: "Low",
    routeProductivityIndex: 91,
    vanId: "V-09",
    vanLoadUtilizationPct: 58,
    vanCapacityCases: 410,
  },
];

export const aiReplenishmentDecisions: string[] = [
  "Increase SKU-102 for Customer C-184 on Route R-07 due to high recent demand and low estimated stock.",
  "Reduce SKU-118 allocation for Customer C-091 due to slow movement and expiry exposure.",
  "Cap replenishment for Customer C-220 due to high credit risk pending collections review.",
  "Add fast-moving SKU-204 to Van V-09 to improve load utilization ahead of R-12 and R-22 dispatches.",
  "Rebalance near-expiry stock from low-velocity Route R-03 to high-velocity Route R-12 on the next inter-depot transfer.",
  "Prioritize early pick-wave for SKU-118 on R-12 to protect high-priority Riyadh Grocery while chilled age bands are elevated.",
  "Hold incremental issue for SKU-330 at City Convenience until velocity recovers — recommend swap volume to Express Mart spike lane.",
  "Escalate R-07 manifest alignment: suggested cola uplift for C-184 conflicts with current van cube; rebalance with controller sign-off.",
];
