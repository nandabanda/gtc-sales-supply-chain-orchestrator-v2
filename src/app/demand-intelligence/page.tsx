import { PageTitle } from "@/components/Cards";
import { DemandPlanningDrilldownConsole } from "@/components/DemandPlanningDrilldownConsole";
import { DemandPlanningWorkspace } from "@/components/DemandPlanningWorkspace";

export default function DemandIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Planning"
        title="Demand Intelligence"
        subtitle="Forecast SKU, customer, and route demand so replenishment teams know what to prepare before dispatch."
      />

      <DemandPlanningDrilldownConsole />

      <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-ivory/12 to-transparent" aria-hidden />

      <DemandPlanningWorkspace />
    </>
  );
}
