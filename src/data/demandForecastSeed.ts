/**
 * SKU × route demand planning inputs (GTC / KSA FMCG lanes).
 */

export type DemandSignalReason = "Trend" | "Promo" | "Seasonality" | "Route growth" | "Customer buying frequency";

export type DemandForecastSeedRow = {
  route: string;
  skuCode: string;
  skuName: string;
  category: string;
  /** Observed run-rate demand at outlet cluster (cases/day) */
  baseDailyDemandCases: number;
  /** Fill correction: demand / fill (e.g. 0.82 = 18% unfilled orders historically) */
  fillCorrection: number;
  trendYoY: number;
  promoUplift: number;
  seasonalityFactor: number;
  routeGrowthYoY: number;
  customerFreqUplift: number;
  /** 0–100 higher = harder to forecast */
  volatilityIndex: number;
};

export const demandForecastSeed: DemandForecastSeedRow[] = [
  {
    route: "R-07",
    skuCode: "SKU-204",
    skuName: "Cola PET 250ml",
    category: "CSD",
    baseDailyDemandCases: 42,
    fillCorrection: 0.86,
    trendYoY: 0.12,
    promoUplift: 0.06,
    seasonalityFactor: 1.04,
    routeGrowthYoY: 0.09,
    customerFreqUplift: 0.04,
    volatilityIndex: 28,
  },
  {
    route: "R-12",
    skuCode: "SKU-118",
    skuName: "Chilled juice 1L",
    category: "Chilled",
    baseDailyDemandCases: 18,
    fillCorrection: 0.78,
    trendYoY: 0.08,
    promoUplift: 0.14,
    seasonalityFactor: 1.06,
    routeGrowthYoY: 0.05,
    customerFreqUplift: 0.07,
    volatilityIndex: 44,
  },
  {
    route: "R-03",
    skuCode: "SKU-330",
    skuName: "Fresh milk 500ml",
    category: "Dairy",
    baseDailyDemandCases: 11,
    fillCorrection: 0.74,
    trendYoY: -0.03,
    promoUplift: 0.02,
    seasonalityFactor: 0.97,
    routeGrowthYoY: 0.02,
    customerFreqUplift: 0.01,
    volatilityIndex: 52,
  },
  {
    route: "R-18",
    skuCode: "SKU-090",
    skuName: "Water 600ml",
    category: "Water",
    baseDailyDemandCases: 55,
    fillCorrection: 0.92,
    trendYoY: 0.15,
    promoUplift: 0.03,
    seasonalityFactor: 1.02,
    routeGrowthYoY: 0.11,
    customerFreqUplift: 0.05,
    volatilityIndex: 22,
  },
  {
    route: "R-07",
    skuCode: "SKU-155",
    skuName: "Snack multipack",
    category: "Snacks",
    baseDailyDemandCases: 9,
    fillCorrection: 0.88,
    trendYoY: 0.04,
    promoUplift: 0.08,
    seasonalityFactor: 1.0,
    routeGrowthYoY: 0.03,
    customerFreqUplift: 0.02,
    volatilityIndex: 36,
  },
  {
    route: "R-03",
    skuCode: "SKU-118",
    skuName: "Chilled juice 1L",
    category: "Chilled",
    baseDailyDemandCases: 6,
    fillCorrection: 0.81,
    trendYoY: -0.02,
    promoUplift: 0.05,
    seasonalityFactor: 1.01,
    routeGrowthYoY: 0.01,
    customerFreqUplift: -0.02,
    volatilityIndex: 48,
  },
  {
    route: "R-12",
    skuCode: "SKU-102",
    skuName: "Energy drink 250ml",
    category: "Energy",
    baseDailyDemandCases: 14,
    fillCorrection: 0.84,
    trendYoY: 0.18,
    promoUplift: 0.11,
    seasonalityFactor: 1.03,
    routeGrowthYoY: 0.06,
    customerFreqUplift: 0.09,
    volatilityIndex: 38,
  },
  {
    route: "R-22",
    skuCode: "SKU-204",
    skuName: "Cola PET 250ml",
    category: "CSD",
    baseDailyDemandCases: 31,
    fillCorrection: 0.9,
    trendYoY: 0.07,
    promoUplift: 0.02,
    seasonalityFactor: 0.99,
    routeGrowthYoY: 0.08,
    customerFreqUplift: 0.03,
    volatilityIndex: 26,
  },
  {
    route: "R-18",
    skuCode: "SKU-301",
    skuName: "Still water 330ml",
    category: "Water",
    baseDailyDemandCases: 22,
    fillCorrection: 0.93,
    trendYoY: 0.05,
    promoUplift: 0.0,
    seasonalityFactor: 1.01,
    routeGrowthYoY: 0.04,
    customerFreqUplift: 0.02,
    volatilityIndex: 20,
  },
  {
    route: "R-12",
    skuCode: "SKU-204",
    skuName: "Cola PET 250ml",
    category: "CSD",
    baseDailyDemandCases: 28,
    fillCorrection: 0.87,
    trendYoY: 0.1,
    promoUplift: 0.04,
    seasonalityFactor: 1.05,
    routeGrowthYoY: 0.07,
    customerFreqUplift: 0.05,
    volatilityIndex: 30,
  },
];

/** Weekly series for forecast vs actual charts */
export const forecastTrendWeekly = [
  { week: "W1", actual: 840, forecast: 810, confidence: 72 },
  { week: "W2", actual: 910, forecast: 895, confidence: 75 },
  { week: "W3", actual: 870, forecast: 900, confidence: 70 },
  { week: "W4", actual: 980, forecast: 955, confidence: 78 },
  { week: "W5", actual: 1030, forecast: 1015, confidence: 81 },
  { week: "W6", actual: 1080, forecast: 1105, confidence: 84 },
  { week: "W7", actual: 1160, forecast: 1140, confidence: 86 },
  { week: "W8", actual: 1210, forecast: 1235, confidence: 88 },
];
