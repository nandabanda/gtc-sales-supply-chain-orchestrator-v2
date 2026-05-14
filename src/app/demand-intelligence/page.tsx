import { PageTitle } from "@/components/Cards";
import { DemandPlanningDrilldownConsole } from "@/components/DemandPlanningDrilldownConsole";

export default function DemandIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Planning"
        title="Demand Intelligence"
        subtitle="Forecast SKU, customer, and route demand so replenishment teams know what to prepare before dispatch."
      />

      <DemandPlanningDrilldownConsole />
    </>
  );
}
