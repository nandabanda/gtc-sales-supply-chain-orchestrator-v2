"use client";

import { PageTitle } from "@/components/Cards";
import { DownloadButton } from "@/components/DownloadButton";
import { DemandPlanningDrilldownConsole } from "@/components/DemandPlanningDrilldownConsole";
import {
  DemandPlanningSessionProvider,
  useDemandPlanningSession,
} from "@/components/DemandPlanningSessionContext";

function DemandIntelligenceTitleActions() {
  const { demandFullExportRows, demandDrilldownExportRows } = useDemandPlanningSession();
  return (
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:pt-1">
      <DownloadButton label="Download Current View" filename="gtc-demand-planning-view.csv" rows={demandFullExportRows} />
      <DownloadButton
        label="Export Table"
        filename="gtc-demand-drilldown-table.csv"
        rows={demandDrilldownExportRows}
        variant="ghost"
      />
    </div>
  );
}

export function DemandIntelligencePage() {
  return (
    <DemandPlanningSessionProvider>
      <PageTitle
        eyebrow="Planning"
        title="Demand Intelligence"
        subtitle="Forecast SKU, customer, and route demand so replenishment teams know what to prepare before dispatch."
        aside={<DemandIntelligenceTitleActions />}
      />
      <DemandPlanningDrilldownConsole />
    </DemandPlanningSessionProvider>
  );
}
