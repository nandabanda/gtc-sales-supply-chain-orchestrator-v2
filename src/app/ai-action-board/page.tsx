import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/Cards";
import { AIActionBoardDownloadBar } from "@/components/AIActionBoardDownloadBar";
import {
  actionPulse,
  actionQueue,
  approvalQueue,
  businessCaseCoverage,
  closedActions,
  funnel,
  valueByArea,
} from "@/data/aiActionBoardSeed";

export default function AIActionBoard() {
  return (
    <>
      <PageTitle
        eyebrow="Execution Governance"
        title="AI Action Board"
        subtitle="Track open actions, approvals, overdue items, owners, and value captured across the operating system."
      />

      <AIActionBoardDownloadBar />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Action Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {actionPulse.map((x) => (
            <PulseCard key={x.label} {...x} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Business Case Coverage</h3>
        <p className="mb-4 text-sm text-muted">How the operating system addresses the GTC supply chain efficiency requirements.</p>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Business Requirement", "Tool Capability", "Current Coverage", "Impact Metric"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {businessCaseCoverage.map((row) => (
                  <tr key={row.requirement} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 font-medium text-ink/90">{row.requirement}</td>
                    <td className="px-3 py-3 text-ink/85">{row.capability}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                          row.coverage === "Covered"
                            ? "border-emerald/45 bg-emerald/12 text-emerald"
                            : "border-amber/50 bg-amber/14 text-amber",
                        )}
                      >
                        {row.coverage}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-electric">{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 grid gap-3 rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-4 ring-1 ring-ivory/[0.06] md:grid-cols-3">
          <p className="text-sm font-medium text-ivory">9 of 10 business requirements covered</p>
          <p className="text-sm font-medium text-amber">1 requirement needs deeper tracking: success metrics tracker</p>
          <p className="text-sm font-medium text-electric">Recommended next build: Success Metrics Tracker</p>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Today&apos;s Action Queue</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Priority", "Action ID", "Area", "Action", "Owner", "Approval", "Value", "Status", "Next Step"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {actionQueue.map((r) => (
                  <tr key={r.id} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          r.priority === "High"
                            ? "border-danger/45 bg-danger/12 text-ink"
                            : r.priority === "Medium"
                              ? "border-amber/50 bg-amber/12 text-ink"
                              : "border-emerald/45 bg-emerald/12 text-ink",
                        )}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-ink/90">{r.id}</td>
                    <td className="px-3 py-3 text-ink/85">{r.area}</td>
                    <td className="px-3 py-3 text-ink/90">{r.action}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3">{r.approval}</td>
                    <td className="px-3 py-3 font-medium text-ink">{r.value}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                          r.status === "Overdue"
                            ? "border-danger/45 bg-danger/12 text-ink"
                            : r.status.includes("Approval")
                              ? "border-amber/50 bg-amber/14 text-ink"
                              : r.status === "Closed"
                                ? "border-emerald/45 bg-emerald/12 text-ink"
                                : "border-electric/45 bg-electric/10 text-ink",
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/85">{r.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Approval Queue</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {approvalQueue.map((x) => (
            <div key={x.title} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <p className="text-sm font-semibold text-ivory">{x.title}</p>
              <p className="mt-1 text-xs text-ivory/70">Owner: {x.owner}</p>
              <p className="mt-1 text-sm font-medium text-ivory">{x.value}</p>
              <p className="mt-2 text-xs text-electric">{x.decision}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-emerald/40 bg-emerald/12 px-2.5 py-0.5 text-[10px] font-semibold text-emerald">Approve</span>
                <span className="inline-flex rounded-full border border-amber/45 bg-amber/12 px-2.5 py-0.5 text-[10px] font-semibold text-amber">Review</span>
                <span className="inline-flex rounded-full border border-electric/45 bg-electric/10 px-2.5 py-0.5 text-[10px] font-semibold text-electric">Escalate</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Action Status Funnel</h3>
        <div className="grid gap-3 md:grid-cols-5">
          {funnel.map((x) => (
            <div key={x.stage} className="glass rounded-2xl px-4 py-5 text-center ring-1 ring-ivory/[0.05]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/55">{x.stage}</p>
              <p className="mt-2 text-3xl font-semibold text-ivory">{x.count}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Value by Action Area</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {valueByArea.map((x) => (
            <div key={x.area} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <p className="text-sm text-ivory/75">{x.area}</p>
              <p className="mt-2 text-2xl font-semibold text-ivory">{x.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Closed / Captured Actions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Action", "Owner", "Value Captured", "Learning"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {closedActions.map((r) => (
                  <tr key={r.action} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 text-ink/90">{r.action}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3 font-medium text-emerald">{r.value}</td>
                    <td className="px-3 py-3 text-ink/85">{r.learning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

function PulseCard({
  label,
  value,
  status,
  cue,
  tone,
}: {
  label: string;
  value: string;
  status: string;
  cue: string;
  tone: "amber" | "danger" | "electric" | "emerald";
}) {
  const map = {
    amber: "border-amber/50 bg-amber/12 text-amber",
    danger: "border-danger/45 bg-danger/12 text-danger",
    electric: "border-electric/45 bg-electric/10 text-electric",
    emerald: "border-emerald/45 bg-emerald/12 text-emerald",
  };
  return (
    <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ivory">{value}</p>
      <p className={cn("mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", map[tone])}>
        {status} · {cue}
      </p>
    </div>
  );
}
