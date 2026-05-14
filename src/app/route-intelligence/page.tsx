import { PageTitle } from "@/components/Cards";
import { RouteIntelligenceView } from "@/components/RouteIntelligenceView";

export default function RouteIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Route Planning"
        title="Route Intelligence"
        subtitle="Decide which customers to visit first, which routes to resequence, and which approvals are needed before dispatch."
      />

      <RouteIntelligenceView />
    </>
  );
}
