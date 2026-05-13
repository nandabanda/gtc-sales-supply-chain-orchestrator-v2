import { PageTitle } from "@/components/Cards";
import { ReplenishmentWorkspace } from "@/components/ReplenishmentWorkspace";

export default function ReplenishmentOrchestrator() {
  return (
    <>
      <PageTitle
        eyebrow="Supply Planning"
        title="Replenishment Orchestrator"
        subtitle="Decide what to supply, restrict, rebalance, and approve before dispatch."
      />

      <ReplenishmentWorkspace />
    </>
  );
}
