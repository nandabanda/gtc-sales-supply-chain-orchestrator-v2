import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/Cards";

const operatingPulse = [
  { label: "Revenue at Risk", value: "SAR 1.24M", status: "High", cue: "9 open actions", tone: "danger" },
  { label: "Stockout Risk", value: "14 customers", status: "Active", cue: "Prioritize R-07", tone: "amber" },
  { label: "Expiry Exposure", value: "SAR 210K", status: "High", cue: "Rebalance pending", tone: "danger" },
  { label: "Route Productivity", value: "3 routes below benchmark", status: "Watch", cue: "R-12 ready", tone: "amber" },
  { label: "Open Actions", value: "9 actions", status: "Open", cue: "4 approvals pending", tone: "electric" },
] as const;

const criticalActions = [
  {
    priority: "High",
    issue: "R-07 stockout risk",
    action: "Increase fast-moving SKU load before dispatch",
    owner: "Supply Controller",
    impact: "Protect SAR 95K",
    status: "Open",
  },
  {
    priority: "High",
    issue: "SKU-118 expiry exposure",
    action: "Rebalance stock from R-03 to R-12",
    owner: "Inventory Controller",
    impact: "Avoid SAR 210K loss",
    status: "Approval Required",
  },
  {
    priority: "Medium",
    issue: "S-04 low strike rate",
    action: "Coach on priority customer conversion",
    owner: "Sales Supervisor",
    impact: "+7.5% strike rate",
    status: "In Progress",
  },
  {
    priority: "Medium",
    issue: "R-12 inefficient sequence",
    action: "Approve optimized route sequence",
    owner: "Route Planner",
    impact: "-14% travel time",
    status: "Ready",
  },
  {
    priority: "High",
    issue: "C-184 under-replenished",
    action: "Increase replenishment before next cycle",
    owner: "Supply Controller",
    impact: "Growth account protected",
    status: "Open",
  },
] as const;

const riskMap = [
  { area: "Demand", count: "6 forecast exceptions", value: "SAR 320K at risk", next: "Review top SKU lanes" },
  { area: "Inventory", count: "5 SKU exposures", value: "SAR 210K expiry", next: "Rebalance SKU-118" },
  { area: "Routes", count: "3 routes below target", value: "14% time gain open", next: "Approve R-12 sequence" },
  { area: "Vans", count: "2 underloaded vans", value: "Utilization below plan", next: "Correct pre-dispatch loads" },
  { area: "Customers", count: "14 at risk", value: "SAR 95K near-term", next: "Prioritize replenishment" },
  { area: "Salesmen", count: "2 coaching gaps", value: "+7.5% strike upside", next: "Run conversion coaching" },
] as const;

const funnel = [
  { stage: "Detected", count: 18 },
  { stage: "Assigned", count: 12 },
  { stage: "In Progress", count: 7 },
  { stage: "Approval", count: 4 },
  { stage: "Closed", count: 3 },
] as const;

const topActions = [
  { action: "Rebalance van load for R-07", impact: "SAR 142K", owner: "Supply Controller" },
  { action: "Prioritize missed high-value customers", impact: "SAR 96K", owner: "Sales Supervisor" },
  { action: "Restrict SKU-330 replenishment", impact: "SAR 41K", owner: "Warehouse" },
  { action: "Resequence Route R-12", impact: "14% time saving", owner: "Route Planner" },
] as const;

export default function CommandCenter() {
  return (
    <>
      <PageTitle
        eyebrow="Daily Operations"
        title="Command Center"
        subtitle="Today’s operating view across demand, inventory, routes, vans, customers, and field execution."
      />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Operating Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {operatingPulse.map((k) => (
            <PulseCard key={k.label} {...k} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Today&apos;s Critical Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {criticalActions.map((x) => (
            <ActionCard key={x.issue} {...x} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Operating Risk Map</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {riskMap.map((x) => (
            <div key={x.area} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <p className="text-sm font-semibold text-ivory">{x.area}</p>
              <p className="mt-2 text-sm text-ivory/85">{x.count}</p>
              <p className="mt-1 text-xs text-ivory/65">{x.value}</p>
              <p className="mt-3 text-xs font-medium text-electric">{x.next}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Execution Funnel</h3>
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
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Top AI Actions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  <th className="px-3 py-3 font-medium">Action</th>
                  <th className="px-3 py-3 font-medium">Impact</th>
                  <th className="px-3 py-3 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {topActions.map((x) => (
                  <tr key={x.action} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 text-ink/90">{x.action}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{x.impact}</td>
                    <td className="px-3 py-3 text-ink/85">{x.owner}</td>
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
  tone: "danger" | "amber" | "electric";
}) {
  const map = {
    danger: "border-danger/45 bg-danger/10 text-danger",
    amber: "border-amber/50 bg-amber/10 text-amber",
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

function ActionCard({
  priority,
  issue,
  action,
  owner,
  impact,
  status,
}: {
  priority: string;
  issue: string;
  action: string;
  owner: string;
  impact: string;
  status: string;
}) {
  const statusTone =
    status === "Approval Required"
      ? "border-amber/50 bg-amber/12 text-ink"
      : status === "In Progress" || status === "Ready"
        ? "border-electric/45 bg-electric/12 text-ink"
        : "border-emerald/45 bg-emerald/12 text-ink";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ivory p-5 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04]">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-electric via-electric/80 to-electric/30" aria-hidden />
      <p className="pl-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/55">Priority</p>
      <p className={cn("pl-2 text-sm font-semibold", priority === "High" ? "text-danger" : "text-amber")}>{priority}</p>
      <p className="mt-3 pl-2 text-sm font-semibold text-ink">{issue}</p>
      <p className="mt-1 pl-2 text-sm text-ink/85">{action}</p>
      <p className="mt-3 pl-2 text-xs text-ink/75">
        <span className="font-semibold text-ink/90">Owner:</span> {owner}
      </p>
      <p className="mt-1 pl-2 text-xs text-ink/75">
        <span className="font-semibold text-ink/90">Impact:</span> {impact}
      </p>
      <div className="mt-3 pl-2">
        <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", statusTone)}>{status}</span>
      </div>
    </div>
  );
}
