"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { demoOperationalRows } from "@/data/gtcOperationalDemoData";
import {
  buildCompactDemandHandoffTable,
  buildDemandAiPlannerSummary,
  buildDemandForecastExceptions,
  filterOperationalForDemand,
  operationalRowsToDemandRows,
} from "@/lib/gtcOperationalBridge";
import {
  buildAccuracyHeatmap,
  buildForecastVsActualByDim,
  buildForecastVsActualWeekly,
  buildPlannerNarrative,
  buildSkuRiskMatrix,
  computeDrillKpis,
  defaultDrillFilters,
  growthByDimension,
  heatmapCategories,
  heatmapRegions,
  type DrillFilterState,
} from "@/lib/demandDrilldown";
import { objectsToCsvRows, type CsvPrimitive } from "@/lib/download";

export type PlanningDim = "region" | "category" | "brand";

export type DemandPlanningSession = {
  f: DrillFilterState;
  setF: React.Dispatch<React.SetStateAction<DrillFilterState>>;
  planningDim: PlanningDim;
  setPlanningDim: React.Dispatch<React.SetStateAction<PlanningDim>>;
  setFilter: (key: keyof DrillFilterState) => (v: string) => void;
  opFiltered: ReturnType<typeof filterOperationalForDemand>;
  filtered: ReturnType<typeof operationalRowsToDemandRows>;
  kpis: ReturnType<typeof computeDrillKpis>;
  narrative: string;
  weeklyFva: ReturnType<typeof buildForecastVsActualWeekly>;
  byDim: ReturnType<typeof buildForecastVsActualByDim>;
  growth: ReturnType<typeof growthByDimension>;
  heatCells: ReturnType<typeof buildAccuracyHeatmap>;
  skuRisk: ReturnType<typeof buildSkuRiskMatrix>;
  handoffRows: ReturnType<typeof buildCompactDemandHandoffTable>;
  exceptionRows: ReturnType<typeof buildDemandForecastExceptions>;
  aiSummary: ReturnType<typeof buildDemandAiPlannerSummary>;
  demandFullExportRows: Record<string, CsvPrimitive>[];
  demandDrilldownExportRows: Record<string, CsvPrimitive>[];
  biasHint: string;
  accHint: string;
  growthHint: string;
  riskHint: string;
  confHint: string;
  tableRows: ReturnType<typeof operationalRowsToDemandRows>;
};

const DemandPlanningSessionContext = createContext<DemandPlanningSession | null>(null);

export function DemandPlanningSessionProvider({ children }: { children: ReactNode }) {
  const [f, setF] = useState<DrillFilterState>(defaultDrillFilters);
  const [planningDim, setPlanningDim] = useState<PlanningDim>("region");

  const opFiltered = useMemo(() => filterOperationalForDemand(demoOperationalRows, f), [f]);
  const filtered = useMemo(() => operationalRowsToDemandRows(opFiltered), [opFiltered]);
  const kpis = useMemo(() => computeDrillKpis(filtered), [filtered]);
  const narrative = useMemo(() => buildPlannerNarrative(filtered, f), [filtered, f]);
  const weeklyFva = useMemo(() => buildForecastVsActualWeekly(f, filtered), [f, filtered]);
  const byDim = useMemo(() => buildForecastVsActualByDim(filtered, planningDim), [filtered, planningDim]);
  const growth = useMemo(() => growthByDimension(filtered, planningDim), [filtered, planningDim]);
  const heatCells = useMemo(() => buildAccuracyHeatmap(filtered, heatmapCategories, heatmapRegions), [filtered]);
  const skuRisk = useMemo(() => buildSkuRiskMatrix(filtered), [filtered]);
  const handoffRows = useMemo(() => buildCompactDemandHandoffTable(opFiltered), [opFiltered]);
  const exceptionRows = useMemo(() => buildDemandForecastExceptions(opFiltered, 5), [opFiltered]);
  const aiSummary = useMemo(() => buildDemandAiPlannerSummary(opFiltered, f, kpis), [opFiltered, f, kpis]);

  const demandFullExportRows = useMemo(
    () => [
      ...objectsToCsvRows(opFiltered.map((r) => ({ ...r, csv_section: "Operational lane" }))),
      ...objectsToCsvRows(handoffRows.map((h) => ({ ...h, csv_section: "Replenishment handoff" }))),
      ...objectsToCsvRows(exceptionRows.map((e) => ({ ...e, csv_section: "Forecast exception" }))),
    ],
    [opFiltered, handoffRows, exceptionRows],
  );
  const demandDrilldownExportRows = useMemo(
    () => objectsToCsvRows(filtered.map((r) => ({ ...r, csv_section: "Demand planning" }))),
    [filtered],
  );

  const biasHint = kpis.forecastBias < -3 ? "Under-forecast bias" : kpis.forecastBias > 5 ? "Over-forecast bias" : "Balanced bias";
  const accHint = kpis.forecastAccuracy >= 85 ? "On target" : kpis.forecastAccuracy >= 78 ? "Watch mix" : "Review slice";
  const growthHint = kpis.demandGrowth >= 8 ? "Elevated growth" : kpis.demandGrowth <= 2 ? "Soft growth" : "Steady trend";
  const riskHint = kpis.replenishmentRisk >= 50 ? "Elevated risk" : kpis.replenishmentRisk >= 30 ? "Controlled risk" : "Low risk";
  const confHint = kpis.planningConfidence >= 80 ? "High confidence" : kpis.planningConfidence >= 72 ? "Moderate" : "Volatile";

  const setFilter = (key: keyof DrillFilterState) => (v: string) => setF((prev) => ({ ...prev, [key]: v }));
  const tableRows = filtered.slice(0, 10);

  const value: DemandPlanningSession = {
    f,
    setF,
    planningDim,
    setPlanningDim,
    setFilter,
    opFiltered,
    filtered,
    kpis,
    narrative,
    weeklyFva,
    byDim,
    growth,
    heatCells,
    skuRisk,
    handoffRows,
    exceptionRows,
    aiSummary,
    demandFullExportRows,
    demandDrilldownExportRows,
    biasHint,
    accHint,
    growthHint,
    riskHint,
    confHint,
    tableRows,
  };

  return <DemandPlanningSessionContext.Provider value={value}>{children}</DemandPlanningSessionContext.Provider>;
}

export function useDemandPlanningSession(): DemandPlanningSession {
  const ctx = useContext(DemandPlanningSessionContext);
  if (!ctx) {
    throw new Error("useDemandPlanningSession must be used within DemandPlanningSessionProvider");
  }
  return ctx;
}
