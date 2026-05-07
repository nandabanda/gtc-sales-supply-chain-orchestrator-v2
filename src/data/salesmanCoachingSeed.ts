/**
 * Synthetic per-salesman execution & coaching inputs (GTC demo).
 */

export type SalesmanCoachingSeedRow = {
  salesman: string;
  route: string;
  vanId: string;
  plannedCalls: number;
  actualCalls: number;
  /** 0–100 */
  strikeRate: number;
  /** Average order value index 0–100 (proxy for SAR band) */
  avgOrderValueIndex: number;
  /** Average lines per order, proxy 0–100 */
  basketSizeIndex: number;
  /** 0–100 must-sell SKU tracking */
  mustSellSkuAdoption: number;
  /** 0–100 share of high-value customers in call mix */
  customerValueMix: number;
  missedHighValueCustomers: number;
  /** Total missed vs plan (incl. non-priority) */
  missedCustomerCount: number;
  routeProductivityIndex: number;
  /** 0–100 van manifest vs plan */
  vanLoadAlignment: number;
  /** 0–100 SKU on-van availability */
  skuAvailability: number;
  /** 0–100 network stockout risk affecting this route */
  stockoutRiskOnRoute: number;
  replenishmentUrgency: number;
  /** 0–100 credit hold / approval delays */
  creditApprovalFriction: number;
  /** 0–100 adherence to planned sequence */
  routeSequenceAdherence: number;
  /** Multiplier vs target, e.g. 1.05 = +5% */
  salesTrendVsTarget: number;
  repeatMissedCustomers: number;
  /** True if key metrics improved vs last week */
  weekOverWeekImproved: boolean;
};

export const salesmanCoachingSeed: SalesmanCoachingSeedRow[] = [
  {
    salesman: "S-04 Ahmed",
    route: "R-07",
    vanId: "V-07",
    plannedCalls: 28,
    actualCalls: 26,
    strikeRate: 42,
    avgOrderValueIndex: 72,
    basketSizeIndex: 64,
    mustSellSkuAdoption: 48,
    customerValueMix: 70,
    missedHighValueCustomers: 4,
    missedCustomerCount: 7,
    routeProductivityIndex: 68,
    vanLoadAlignment: 62,
    skuAvailability: 74,
    stockoutRiskOnRoute: 78,
    replenishmentUrgency: 80,
    creditApprovalFriction: 32,
    routeSequenceAdherence: 71,
    salesTrendVsTarget: 0.96,
    repeatMissedCustomers: 3,
    weekOverWeekImproved: false,
  },
  {
    salesman: "S-09 Faisal",
    route: "R-12",
    vanId: "V-12",
    plannedCalls: 30,
    actualCalls: 27,
    strikeRate: 58,
    avgOrderValueIndex: 68,
    basketSizeIndex: 58,
    mustSellSkuAdoption: 52,
    customerValueMix: 66,
    missedHighValueCustomers: 6,
    missedCustomerCount: 9,
    routeProductivityIndex: 63,
    vanLoadAlignment: 68,
    skuAvailability: 78,
    stockoutRiskOnRoute: 52,
    replenishmentUrgency: 66,
    creditApprovalFriction: 38,
    routeSequenceAdherence: 64,
    salesTrendVsTarget: 0.94,
    repeatMissedCustomers: 4,
    weekOverWeekImproved: false,
  },
  {
    salesman: "S-11 Omar",
    route: "R-03",
    vanId: "V-03",
    plannedCalls: 26,
    actualCalls: 25,
    strikeRate: 79,
    avgOrderValueIndex: 88,
    basketSizeIndex: 76,
    mustSellSkuAdoption: 48,
    customerValueMix: 62,
    missedHighValueCustomers: 1,
    missedCustomerCount: 2,
    routeProductivityIndex: 86,
    vanLoadAlignment: 82,
    skuAvailability: 85,
    stockoutRiskOnRoute: 44,
    replenishmentUrgency: 48,
    creditApprovalFriction: 22,
    routeSequenceAdherence: 88,
    salesTrendVsTarget: 1.04,
    repeatMissedCustomers: 0,
    weekOverWeekImproved: true,
  },
  {
    salesman: "S-15 Khalid",
    route: "R-18",
    vanId: "V-18",
    plannedCalls: 24,
    actualCalls: 23,
    strikeRate: 67,
    avgOrderValueIndex: 74,
    basketSizeIndex: 66,
    mustSellSkuAdoption: 61,
    customerValueMix: 70,
    missedHighValueCustomers: 2,
    missedCustomerCount: 4,
    routeProductivityIndex: 72,
    vanLoadAlignment: 76,
    skuAvailability: 80,
    stockoutRiskOnRoute: 58,
    replenishmentUrgency: 62,
    creditApprovalFriction: 35,
    routeSequenceAdherence: 73,
    salesTrendVsTarget: 0.99,
    repeatMissedCustomers: 1,
    weekOverWeekImproved: true,
  },
  {
    salesman: "S-20 Yousuf",
    route: "R-22",
    vanId: "V-09",
    plannedCalls: 22,
    actualCalls: 22,
    strikeRate: 84,
    avgOrderValueIndex: 92,
    basketSizeIndex: 88,
    mustSellSkuAdoption: 86,
    customerValueMix: 84,
    missedHighValueCustomers: 0,
    missedCustomerCount: 0,
    routeProductivityIndex: 91,
    vanLoadAlignment: 90,
    skuAvailability: 92,
    stockoutRiskOnRoute: 40,
    replenishmentUrgency: 42,
    creditApprovalFriction: 18,
    routeSequenceAdherence: 91,
    salesTrendVsTarget: 1.08,
    repeatMissedCustomers: 0,
    weekOverWeekImproved: true,
  },
  {
    salesman: "S-03 Karim",
    route: "R-05",
    vanId: "V-05",
    plannedCalls: 27,
    actualCalls: 25,
    strikeRate: 55,
    avgOrderValueIndex: 70,
    basketSizeIndex: 62,
    mustSellSkuAdoption: 54,
    customerValueMix: 68,
    missedHighValueCustomers: 2,
    missedCustomerCount: 5,
    routeProductivityIndex: 64,
    vanLoadAlignment: 48,
    skuAvailability: 58,
    stockoutRiskOnRoute: 76,
    replenishmentUrgency: 74,
    creditApprovalFriction: 28,
    routeSequenceAdherence: 69,
    salesTrendVsTarget: 0.92,
    repeatMissedCustomers: 2,
    weekOverWeekImproved: false,
  },
  {
    salesman: "S-07 Majid",
    route: "R-09",
    vanId: "V-11",
    plannedCalls: 25,
    actualCalls: 24,
    strikeRate: 63,
    avgOrderValueIndex: 69,
    basketSizeIndex: 54,
    mustSellSkuAdoption: 49,
    customerValueMix: 58,
    missedHighValueCustomers: 3,
    missedCustomerCount: 6,
    routeProductivityIndex: 58,
    vanLoadAlignment: 72,
    skuAvailability: 76,
    stockoutRiskOnRoute: 48,
    replenishmentUrgency: 52,
    creditApprovalFriction: 34,
    routeSequenceAdherence: 61,
    salesTrendVsTarget: 1.02,
    repeatMissedCustomers: 2,
    weekOverWeekImproved: true,
  },
  {
    salesman: "S-12 Hani",
    route: "R-16",
    vanId: "V-16",
    plannedCalls: 29,
    actualCalls: 22,
    strikeRate: 51,
    avgOrderValueIndex: 76,
    basketSizeIndex: 60,
    mustSellSkuAdoption: 46,
    customerValueMix: 82,
    missedHighValueCustomers: 5,
    missedCustomerCount: 11,
    routeProductivityIndex: 55,
    vanLoadAlignment: 70,
    skuAvailability: 82,
    stockoutRiskOnRoute: 42,
    replenishmentUrgency: 50,
    creditApprovalFriction: 66,
    routeSequenceAdherence: 52,
    salesTrendVsTarget: 0.89,
    repeatMissedCustomers: 5,
    weekOverWeekImproved: false,
  },
  {
    salesman: "S-02 Nasser",
    route: "R-02",
    vanId: "V-02",
    plannedCalls: 24,
    actualCalls: 24,
    strikeRate: 88,
    avgOrderValueIndex: 90,
    basketSizeIndex: 86,
    mustSellSkuAdoption: 90,
    customerValueMix: 86,
    missedHighValueCustomers: 0,
    missedCustomerCount: 0,
    routeProductivityIndex: 93,
    vanLoadAlignment: 91,
    skuAvailability: 94,
    stockoutRiskOnRoute: 35,
    replenishmentUrgency: 38,
    creditApprovalFriction: 15,
    routeSequenceAdherence: 94,
    salesTrendVsTarget: 1.1,
    repeatMissedCustomers: 0,
    weekOverWeekImproved: true,
  },
];

export const aiCoachingDecisions: string[] = [
  "Coach Salesman S-04 on conversion because planned calls are high but strike rate is 42%.",
  "Review Salesman S-09 route execution because 6 high-value customers were missed.",
  "Coach Salesman S-11 on must-sell SKU basket because SKU-102 and SKU-204 adoption is below benchmark.",
  "Do not penalize Salesman S-03 because missed sales were caused by stockout and van loading mismatch.",
  "Put Salesman S-07 on watchlist because route productivity improved but basket size remains low.",
  "Escalate Customer C-220 orders for approval because credit holds are blocking conversion.",
  "Create focused route plan for Salesman S-12 because route potential is high but customer coverage is weak.",
  "Recognize Salesman S-02 because strike rate and must-sell SKU adoption are above benchmark.",
];
