import { DataTable, KPICard, PageTitle, Panel } from "@/components/Cards";
import { ExpiryOverstockIntelligence } from "@/components/ExpiryOverstockIntelligence";
import { DecisionLayerPanel } from "@/components/DecisionLayerPanel";
import { SupervisorActionBoard } from "@/components/SupervisorActionBoard";
import { actionBoardDecisions } from "@/data/decisionLayers";
import { actions } from "@/data/demo";

const actionKpis = [
  { label: "Open AI actions", value: "24", delta: "9 critical", tone: "amber" },
  { label: "Projected impact", value: "SAR 312K", delta: "This month", tone: "emerald" },
  { label: "Avg confidence", value: "81%", delta: "+6 pp", tone: "emerald" },
  { label: "Adoption rate", value: "67%", delta: "+14 pp", tone: "cyan" },
];

export default function AIActionBoard() {
  return (
    <>
      <PageTitle
        eyebrow="Govern decisions"
        title="AI Action Board"
        subtitle="One surface for controllers, supervisors, and leadership to review, accept, challenge, and audit AI recommendations — with owners and rationale visible."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actionKpis.map((x) => (
          <KPICard key={x.label} {...x} />
        ))}
      </section>
      <section className="mt-10">
        <SupervisorActionBoard />
      </section>
      <section className="mt-10">
        <ExpiryOverstockIntelligence variant="summary" />
      </section>
      <section className="mt-10 grid gap-5">
        <DecisionLayerPanel
          title="Governed decision layer"
          subtitle="Each queue item expressed as signal, diagnosis, action, impact, owner, status, and confidence — ready for leadership review."
          items={actionBoardDecisions}
        />
        <Panel title="Prioritized decision queue" subtitle="Ranked by impact, confidence, urgency, and business owner.">
          <DataTable columns={["rank", "title", "impact", "confidence", "owner", "reason"]} rows={actions as any} />
        </Panel>
        <Panel title="Governance logic" subtitle="How the action board closes the loop in weekly operations.">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Detect", "AI flags risk or opportunity using unified signals."],
              ["Recommend", "The system proposes a next-best action with rationale."],
              ["Approve", "Owners accept, adjust, or challenge with audit context."],
              ["Learn", "Outcomes refine models and tighten enterprise trust."],
            ].map(([h, t]) => (
              <div key={h} className="rounded-xl border border-ivory/10 bg-ivory/[0.04] p-5 ring-1 ring-ivory/[0.04]">
                <p className="text-lg font-semibold text-electric">{h}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
