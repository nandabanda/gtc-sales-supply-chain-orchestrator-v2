import type { CreditTier, ExpirySensitivity, Priority, ReplenishmentEngineInputRow } from "@/data/replenishmentEngineSeed";

export type RiskLevel = "High" | "Medium" | "Low";

const VAN_UTIL_THRESHOLD = 72;
const LOW_CONFIDENCE_BELOW = 58;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundUpToMoq(qty: number, moq: number) {
  if (qty <= 0) return 0;
  return Math.ceil(qty / moq) * moq;
}

function avg(values: number[]) {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

function priorityWeight(p: Priority): number {
  if (p === "High") return 1.08;
  if (p === "Low") return 0.94;
  return 1;
}

export function creditRiskScore(tier: CreditTier): number {
  if (tier === "High") return 84;
  if (tier === "Medium") return 48;
  return 18;
}

function expirySensitivityScore(sensitivity: ExpirySensitivity): number {
  if (sensitivity === "High") return 34;
  if (sensitivity === "Medium") return 20;
  return 8;
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 66) return "High";
  if (score >= 38) return "Medium";
  return "Low";
}

export type ReplenishmentComputation = {
  ads: number;
  adjustedAds: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  netAvailableStock: number;
  daysCover: number;
  targetStock: number;
  rawReorderQty: number;
  moqAdjustedQty: number;
  eoq: number;
  suggestedQty: number;
  supplierPoQty: number;
  grossMarginPct: number;
  stockoutRisk: number;
  overstockRisk: number;
  expiryRisk: number;
  creditRiskScore: number;
  riskLevel: RiskLevel;
  replenishmentReason: string;
  vanLoadRecommendation: string;
  actionRecommendation: string;
  confidenceScore: number;
  reviewRequired: boolean;
  wasCreditCapped: boolean;
  wasExpiryReduced: boolean;
  wasStockoutBoosted: boolean;
};

export function computeReplenishment(row: ReplenishmentEngineInputRow): ReplenishmentComputation {
  const ads = avg(row.historicalDailySales);
  const uplift = 1 + row.promoUpliftPct / 100 + row.seasonalityUpliftPct / 100;
  const adjustedAds = ads * row.recentTrendFactor * uplift * priorityWeight(row.customerPriority);
  const leadTimeDemand = adjustedAds * row.leadTimeDays;
  const safetyStock = row.serviceLevelZ * row.demandStdDev * Math.sqrt(row.leadTimeDays);
  const reorderPoint = leadTimeDemand + safetyStock;
  const netAvailableStock = row.currentStockCases + row.inTransitCases + row.openPoCases - row.pendingSalesOrderCases;
  const daysCover = adjustedAds > 0 ? netAvailableStock / adjustedAds : 99;
  const targetStock = adjustedAds * row.targetCoverDays + safetyStock;
  const rawReorderQty = Math.max(0, targetStock - netAvailableStock);
  const moqAdjustedQty = roundUpToMoq(rawReorderQty, row.moqCases);
  const eoq = Math.sqrt((2 * row.annualDemandCases * row.orderingCost) / Math.max(1, row.holdingCostPerCase));
  const grossMarginPct = ((row.sellingPrice - row.purchasePrice) / row.sellingPrice) * 100;

  const ropGap = reorderPoint - netAvailableStock;
  const stockoutRisk = clamp(Math.round((ropGap / Math.max(1, reorderPoint)) * 82 + (row.fillRatePct < 80 ? 12 : 0)), 0, 100);
  const overstockRisk = clamp(Math.round(((daysCover - row.targetCoverDays) / Math.max(1, row.targetCoverDays)) * 70 + (row.skuVelocityIndex < 45 ? 18 : 0)), 0, 100);
  const expiryRisk = clamp(
    Math.round(expirySensitivityScore(row.expirySensitivity) + (1 - row.remainingShelfLifeDays / Math.max(1, row.shelfLifeDays)) * 42 + (daysCover > row.targetCoverDays ? 12 : 0)),
    0,
    100,
  );
  const creditScore = creditRiskScore(row.creditRisk);

  let suggestedQty = moqAdjustedQty;
  let wasCreditCapped = false;
  let wasExpiryReduced = false;
  let wasStockoutBoosted = false;

  if (stockoutRisk >= 70 && suggestedQty > 0) {
    suggestedQty = roundUpToMoq(suggestedQty * 1.1, row.moqCases);
    wasStockoutBoosted = true;
  }

  if (expiryRisk >= 62 && overstockRisk >= 45) {
    const reduced = Math.min(suggestedQty, row.moqCases);
    wasExpiryReduced = reduced < suggestedQty;
    suggestedQty = reduced;
  }

  const creditCap = row.creditRisk === "High" ? row.moqCases : row.creditRisk === "Medium" ? row.moqCases * 3 : Number.POSITIVE_INFINITY;
  if (suggestedQty > creditCap) {
    suggestedQty = creditCap;
    wasCreditCapped = true;
  }

  if (overstockRisk >= 70 && expiryRisk >= 55) suggestedQty = 0;
  const supplierPoQty = suggestedQty > 0 ? roundUpToMoq(Math.max(suggestedQty, Math.min(eoq, suggestedQty * 2)), row.moqCases) : 0;

  const compositeRisk = Math.max(stockoutRisk, overstockRisk, expiryRisk, creditScore);
  const riskLevel = riskLevelFromScore(compositeRisk);

  const reasons: string[] = [];
  if (netAvailableStock <= reorderPoint) reasons.push(`net stock ${Math.round(netAvailableStock)} is below ROP ${Math.round(reorderPoint)}`);
  if (stockoutRisk >= 55) reasons.push("stockout risk is elevated versus lead-time demand");
  if (row.promoUpliftPct > 0 || row.seasonalityUpliftPct > 0) reasons.push("forecast includes promo/seasonality uplift");
  if (wasCreditCapped) reasons.push("credit cap applied before release");
  if (wasExpiryReduced) reasons.push("expiry risk reduced the issue quantity");
  if (reasons.length === 0) reasons.push("stock is above ROP; maintain standard watchlist");

  const vanLoadRecommendation =
    row.vanLoadUtilizationPct < VAN_UTIL_THRESHOLD
      ? `${row.vanId} has cube opportunity (${row.vanLoadUtilizationPct}%); load approved fast movers first.`
      : row.vanLoadUtilizationPct > 92
        ? `${row.vanId} is cube-constrained; protect high-margin and high-risk SKUs.`
        : `${row.vanId} is within load band (${row.vanLoadUtilizationPct}%); align pick wave to route sequence.`;

  let actionRecommendation = "Approve standard replenishment and monitor after dispatch.";
  if (suggestedQty === 0 && overstockRisk >= 55) actionRecommendation = "Do not replenish; rebalance or consume existing stock first.";
  else if (row.creditRisk === "High") actionRecommendation = "Release only after finance approval; use MOQ-capped supply.";
  else if (stockoutRisk >= 70) actionRecommendation = "Urgent pick-wave; replenish before next route dispatch.";
  else if (expiryRisk >= 62) actionRecommendation = "Replenish cautiously; check FEFO and expiry bands.";

  let confidenceScore = 78;
  confidenceScore += row.historicalDailySales.length >= 14 ? 5 : -5;
  confidenceScore += row.fillRatePct >= 85 ? 5 : -4;
  confidenceScore -= row.creditRisk === "High" ? 9 : 0;
  confidenceScore -= Math.abs(stockoutRisk - expiryRisk) > 55 ? 6 : 0;
  confidenceScore = clamp(Math.round(confidenceScore), 38, 94);

  const reviewRequired = confidenceScore < LOW_CONFIDENCE_BELOW || riskLevel === "High" || row.creditRisk === "High";

  return {
    ads: Number(ads.toFixed(1)),
    adjustedAds: Number(adjustedAds.toFixed(1)),
    leadTimeDemand: Number(leadTimeDemand.toFixed(1)),
    safetyStock: Number(safetyStock.toFixed(1)),
    reorderPoint: Number(reorderPoint.toFixed(1)),
    netAvailableStock: Number(netAvailableStock.toFixed(1)),
    daysCover: Number(daysCover.toFixed(1)),
    targetStock: Number(targetStock.toFixed(1)),
    rawReorderQty: Number(rawReorderQty.toFixed(1)),
    moqAdjustedQty,
    eoq: Number(eoq.toFixed(0)),
    suggestedQty,
    supplierPoQty,
    grossMarginPct: Number(grossMarginPct.toFixed(1)),
    stockoutRisk,
    overstockRisk,
    expiryRisk,
    creditRiskScore: creditScore,
    riskLevel,
    replenishmentReason: `${reasons.slice(0, 4).join("; ")}.`,
    vanLoadRecommendation,
    actionRecommendation: reviewRequired ? `${actionRecommendation} Controller review required.` : actionRecommendation,
    confidenceScore,
    reviewRequired,
    wasCreditCapped,
    wasExpiryReduced,
    wasStockoutBoosted,
  };
}


export function stockoutRiskScore(row: ReplenishmentEngineInputRow): number {
  return computeReplenishment(row).stockoutRisk;
}

export function overstockRiskScore(row: ReplenishmentEngineInputRow): number {
  return computeReplenishment(row).overstockRisk;
}

export function expiryRiskScore(row: ReplenishmentEngineInputRow, _velocityIndex?: number): number {
  return computeReplenishment(row).expiryRisk;
}

export type ReplenishmentRowView = ReplenishmentEngineInputRow & ReplenishmentComputation;

export function buildReplenishmentRows(seed: ReplenishmentEngineInputRow[]): ReplenishmentRowView[] {
  return seed.map((row) => ({ ...row, ...computeReplenishment(row) }));
}
