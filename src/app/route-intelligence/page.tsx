import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/Cards";

const routePulse = [
  { label: "Routes Needing Resequence", value: "3", status: "Open", cue: "Approve before dispatch", tone: "amber" },
  { label: "Priority Stops", value: "18", status: "High", cue: "Move first-visit customers earlier", tone: "danger" },
  { label: "SLA-Risk Customers", value: "7", status: "Active", cue: "Protect service windows", tone: "amber" },
  { label: "Time Saving Opportunity", value: "14%", status: "Ready", cue: "R-12 sequence ready", tone: "electric" },
  { label: "Supervisor Approvals", value: "4", status: "Pending", cue: "Review route changes", tone: "amber" },
] as const;

const routeDecisions = [
  {
    priority: "High",
    routeVan: "R-12 / V-12",
    customer: "C-392 Riyadh Grocery",
    action: "Move to first stop before 11:00 AM",
    reason: "High value and SLA risk",
    owner: "Route Planner",
    impact: "Protect SAR 189K",
    status: "Ready",
  },
  {
    priority: "High",
    routeVan: "R-07 / V-07",
    customer: "C-184 Al Noor Mini Market",
    action: "Move from stop 4 to stop 1",
    reason: "Stockout risk and high demand",
    owner: "Sales Supervisor",
    impact: "Protect SAR 232K",
    status: "Approval Required",
  },
  {
    priority: "Medium",
    routeVan: "R-12 / V-12",
    customer: "C-310 Downtown Fresh",
    action: "Move earlier in sequence",
    reason: "SLA window and replenishment urgency",
    owner: "Route Planner",
    impact: "Protect SAR 182K",
    status: "Ready",
  },
  {
    priority: "Medium",
    routeVan: "R-09 / V-11",
    customer: "C-601 Eastern Hub",
    action: "Create focused visit plan",
    reason: "Route potential is high but confidence is low",
    owner: "Sales Supervisor",
    impact: "Review required",
    status: "Review",
  },
  {
    priority: "Medium",
    routeVan: "R-07 / V-07",
    customer: "C-401 Corner Express",
    action: "Defer lower-priority stop",
    reason: "Make space for higher-value customers",
    owner: "Route Planner",
    impact: "Improve service window",
    status: "Ready",
  },
  {
    priority: "Low",
    routeVan: "R-18 / V-18",
    customer: "C-455 Express Mart",
    action: "Maintain current sequence",
    reason: "Route is stable",
    owner: "Route Planner",
    impact: "No change required",
    status: "Closed",
  },
] as const;

const routeActionMap = [
  { title: "Prioritize First", summary: "5 customers · SAR 603K protected", next: "Move high-value stops earlier" },
  { title: "Defer Lower Priority", summary: "3 stops · service window improved", next: "Push low-value stops later" },
  { title: "Approval Required", summary: "4 route changes · supervisor review", next: "Approve before dispatch" },
  { title: "Maintain Plan", summary: "2 routes · stable execution", next: "No change" },
] as const;

const r12Sequence = [
  { stop: 1, customer: "C-392 Riyadh Grocery", time: "08:45", priority: "High", reason: "Protect SAR 189K" },
  { stop: 2, customer: "C-310 Downtown Fresh", time: "09:30", priority: "High", reason: "Protect SAR 182K" },
  { stop: 3, customer: "C-220 Metro Wholesale Mini", time: "10:15", priority: "Medium", reason: "Credit approval" },
  { stop: 4, customer: "C-455 Express Mart", time: "11:20", priority: "Medium", reason: "Standard service" },
  { stop: 5, customer: "C-502 Northern Express", time: "12:05", priority: "Low", reason: "Standard service" },
] as const;

const routeReadiness = [
  { label: "Van load aligned", status: "Yes" },
  { label: "Must-load SKUs loaded", status: "Review" },
  { label: "Credit holds cleared", status: "No" },
  { label: "SLA windows protected", status: "Yes" },
  { label: "Supervisor approval", status: "Required" },
] as const;

export default function RouteIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Route Planning"
        title="Route Intelligence"
        subtitle="Decide which customers to visit first, which routes to resequence, and which approvals are needed before dispatch."
      />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Route Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {routePulse.map((x) => (
            <PulseCard key={x.label} {...x} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Today&apos;s Route Decisions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Priority", "Route / Van", "Customer", "Action", "Reason", "Owner", "Impact", "Status"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routeDecisions.map((r) => (
                  <tr key={`${r.routeVan}-${r.customer}`} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", r.priority === "High" ? "border-danger/45 bg-danger/12 text-ink" : r.priority === "Medium" ? "border-amber/50 bg-amber/12 text-ink" : "border-emerald/45 bg-emerald/12 text-ink")}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/90">{r.routeVan}</td>
                    <td className="px-3 py-3 text-ink/85">{r.customer}</td>
                    <td className="px-3 py-3 text-ink/90">{r.action}</td>
                    <td className="px-3 py-3 text-ink/85">{r.reason}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3 font-medium text-ink">{r.impact}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", r.status === "Approval Required" ? "border-amber/50 bg-amber/14 text-ink" : r.status === "Review" ? "border-amber/50 bg-amber/12 text-ink" : r.status === "Closed" ? "border-emerald/45 bg-emerald/12 text-ink" : "border-electric/45 bg-electric/10 text-ink")}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Route Action Map</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {routeActionMap.map((x) => (
            <div key={x.title} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <p className="text-sm font-semibold text-ivory">{x.title}</p>
              <p className="mt-2 text-sm text-ivory/85">{x.summary}</p>
              <p className="mt-3 text-xs font-medium text-electric">Next action: {x.next}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Optimized Sequence Preview</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Stop", "Customer", "Suggested Time", "Priority", "Route Reason"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r12Sequence.map((r) => (
                  <tr key={r.stop} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 tabular-nums font-semibold text-ink/90">{r.stop}</td>
                    <td className="px-3 py-3 text-ink/90">{r.customer}</td>
                    <td className="px-3 py-3 text-ink/85">{r.time}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", r.priority === "High" ? "border-danger/45 bg-danger/12 text-ink" : r.priority === "Medium" ? "border-amber/50 bg-amber/12 text-ink" : "border-emerald/45 bg-emerald/12 text-ink")}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/85">{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-electric">R-12 sequence should be approved before dispatch.</p>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Route Readiness</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  <th className="px-3 py-3 font-medium">Check</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {routeReadiness.map((r) => (
                  <tr key={r.label} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 text-ink/90">{r.label}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", r.status === "Yes" ? "border-emerald/45 bg-emerald/12 text-ink" : r.status === "No" || r.status === "Required" ? "border-danger/45 bg-danger/12 text-ink" : "border-amber/50 bg-amber/12 text-ink")}>
                        {r.status}
                      </span>
                    </td>
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
  tone: "amber" | "danger" | "electric";
}) {
  const map = {
    amber: "border-amber/50 bg-amber/12 text-amber",
    danger: "border-danger/45 bg-danger/12 text-danger",
    electric: "border-electric/45 bg-electric/10 text-electric",
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
