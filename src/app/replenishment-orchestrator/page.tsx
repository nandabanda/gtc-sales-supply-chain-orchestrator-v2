import { ReplenishmentEngine } from "@/components/ReplenishmentEngine";
import { PageTitle } from "@/components/Cards";

export default function ReplenishmentOrchestrator() {
  return (
    <>
      <PageTitle
        eyebrow="Supply Planning"
        title="Replenishment Orchestrator"
        subtitle="ROP-based planning engine that decides what to supply, how much to order, what to cap, and what needs controller review before dispatch."
      />
      <ReplenishmentEngine />
    </>
  );
}
