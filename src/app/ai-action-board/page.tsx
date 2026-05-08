import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/Cards";

const actionPulse = [
  { label: "Open Actions", value: "9", status: "Open", cue: "Close today", tone: "amber" },
  { label: "Urgent Actions", value: "3", status: "High", cue: "Resolve first", tone: "danger" },
  { label: "Approvals Required", value: "4", status: "Pending", cue: "Manager review needed", tone: "amber" },
  { label: "Overdue Actions", value: "2", status: "Late", cue: "Escalate now", tone: "danger" },
  { label: "Value at Stake", value: "SAR 1.04M", status: "Active", cue: "Active queue", tone: "electric" },
  { label: "Value Captured", value: "SAR 30K", status: "Closed", cue: "Track closure daily", tone: "emerald" },
] as const;

const actionQueue = [
  {
    priority: "High",
    id: "ACT-006",
    area: "Stock Rebalance",
    action: "Rebalance SKU-118 from R-03 to R-12",
    owner: "Supply Controller",
    approval: "Required",
    value: "SAR 210K",
    status: "Approval Pending",
    next: "Approve transfer note",
  },
  {
    priority: "High",
    id: "ACT-003",
    area: "Route Resequencing",
    action: "Approve R-12 optimized route sequence",
    owner: "Sales Supervisor",
    approval: "Required",
    value: "SAR 180K",
    status: "Approval Pending",
    next: "Push revised route to driver",
  },
  {
    priority: "High",
    id: "ACT-009",
    area: "Expiry Risk",
    action: "Stop loading SKU-330 on R-07",
    owner: "Inventory Controller",
    approval: "Required",
    value: "SAR 128K",
    status: "Overdue",
    next: "Approve load freeze",
  },
  {
    priority: "High",
    id: "ACT-001",
    area: "Replenishment",
    action: "Release urgent supply for C-184 on R-07",
    owner: "Supply Controller",
    approval: "No",
    value: "SAR 95K",
    status: "Open",
    next: "Publish updated pick list",
  },
  {
    priority: "Medium",
    id: "ACT-007",
    area: "Credit Approval",
    action: "Escalate C-220 temporary credit release",
    owner: "Finance Controller",
    approval: "Required",
    value: "SAR 88K",
    status: "Approval Pending",
    next: "Finance decision today",
  },
  {
    priority: "Medium",
    id: "ACT-004",
    area: "Salesman Coaching",
    action: "Coach S-04 on conversion",
    owner: "Sales Supervisor",
    approval: "No",
    value: "SAR 72K",
    status: "In Progress",
    next: "Schedule ride-along",
  },
  {
    priority: "Medium",
    id: "ACT-002",
    area: "Van Load Correction",
    action: "Add SKU-204 to V-09 load",
    owner: "Dispatch Controller",
    approval: "No",
    value: "SAR 54K",
    status: "In Progress",
    next: "Update wave-2 manifest",
  },
  {
    priority: "Low",
    id: "ACT-010",
    area: "Execution Follow-up",
    action: "Publish S-02 best-practice note",
    owner: "Sales Supervisor",
    approval: "No",
    value: "SAR 30K captured",
    status: "Closed",
    next: "Share coaching template",
  },
] as const;

const approvalQueue = [
  { title: "SKU-118 rebalance", owner: "Supply Controller", value: "SAR 210K", decision: "Approve transfer" },
  { title: "R-12 route sequence", owner: "Sales Supervisor", value: "SAR 180K", decision: "Approve route" },
  { title: "SKU-330 load freeze", owner: "Inventory Controller", value: "SAR 128K", decision: "Stop loading" },
  { title: "C-220 credit release", owner: "Finance Controller", value: "SAR 88K", decision: "Approve or reject credit" },
] as const;

const funnel = [
  { stage: "Detected", count: 18 },
  { stage: "Assigned", count: 12 },
  { stage: "In Progress", count: 7 },
  { stage: "Approval", count: 4 },
  { stage: "Closed", count: 3 },
] as const;

const valueByArea = [
  { area: "Replenishment", value: "SAR 95K" },
  { area: "Route", value: "SAR 180K" },
  { area: "Inventory", value: "SAR 338K" },
  { area: "Credit", value: "SAR 88K" },
  { area: "Sales Execution", value: "SAR 102K" },
  { area: "Van Loading", value: "SAR 54K" },
] as const;

const closedActions = [
  { action: "ACT-010: S-02 best-practice note published", owner: "Sales Supervisor", value: "SAR 30K captured", learning: "Playbook shared to two routes" },
  { action: "ACT-011: R-18 delivery window protected", owner: "Route Planner", value: "SAR 18K captured", learning: "Morning SLA window preserved" },
  { action: "ACT-012: SKU-301 maintained on healthy route", owner: "Supply Controller", value: "SAR 12K protected", learning: "No corrective load required" },
] as const;

export default function AIActionBoard() {
  return (
    <>
      <PageTitle
        eyebrow="Execution Governance"
        title="AI Action Board"
        subtitle="Track open actions, approvals, overdue items, owners, and value captured across the operating system."
      />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Action Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {actionPulse.map((x) => (
            <PulseCard key={x.label} {...x} />
          ))}
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
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", r.priority === "High" ? "border-danger/45 bg-danger/12 text-ink" : r.priority === "Medium" ? "border-amber/50 bg-amber/12 text-ink" : "border-emerald/45 bg-emerald/12 text-ink")}>
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
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", r.status === "Overdue" ? "border-danger/45 bg-danger/12 text-ink" : r.status.includes("Approval") ? "border-amber/50 bg-amber/14 text-ink" : r.status === "Closed" ? "border-emerald/45 bg-emerald/12 text-ink" : "border-electric/45 bg-electric/10 text-ink")}>
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
