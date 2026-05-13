import { PageTitle } from "@/components/Cards";
import { DemandPlanningWorkspace } from "@/components/DemandPlanningWorkspace";

export default function DemandIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Planning"
        title="Demand Intelligence"
        subtitle="Forecast SKU, customer, and route demand so replenishment teams know what to prepare before dispatch."
      />

      <DemandPlanningWorkspace />
    </>
  );
}
