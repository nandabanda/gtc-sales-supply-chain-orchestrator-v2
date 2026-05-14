import { PageTitle } from "@/components/Cards";
import { ExecutionIntelligenceView } from "@/components/ExecutionIntelligenceView";

export default function ExecutionIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Supervisor View"
        title="Execution Intelligence"
        subtitle="Identify salesmen, customers, and SKU gaps that need supervisor action today."
      />

      <ExecutionIntelligenceView />
    </>
  );
}
