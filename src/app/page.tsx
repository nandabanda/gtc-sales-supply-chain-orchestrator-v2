import Link from "next/link";
import { ArrowRight, Brain, Boxes, ClipboardList, LayoutDashboard, MapPinned, Route } from "lucide-react";
import { KPICard, PageTitle } from "@/components/Cards";
import { cn } from "@/lib/utils";

const modules = [
  {
    href: "/command-center",
    title: "Command Center",
    icon: LayoutDashboard,
    text: "Leadership view of risks, value, and actions.",
  },
  {
    href: "/demand-intelligence",
    title: "Demand Intelligence",
    icon: Brain,
    text: "Forecast SKU, customer, and route demand.",
  },
  {
    href: "/replenishment-orchestrator",
    title: "Replenishment",
    icon: Boxes,
    text: "Recommend customer and van supply.",
  },
  {
    href: "/route-intelligence",
    title: "Route Intelligence",
    icon: Route,
    text: "Sequence visits by value, SLA, and service risk.",
  },
  {
    href: "/execution-intelligence",
    title: "Execution Intelligence",
    icon: MapPinned,
    text: "Improve salesman, route, and customer productivity.",
  },
  {
    href: "/ai-action-board",
    title: "Action Board",
    icon: ClipboardList,
    text: "Track ownership, approvals, and value capture.",
  },
];

const topPulse = [
  { label: "Revenue at Risk", value: "SAR 1.24M", delta: "+8.7%", tone: "danger" as const },
  { label: "Forecast Accuracy", value: "78.4%", delta: "+6.2 pp", tone: "emerald" as const },
  { label: "Stockout Risk", value: "11.8%", delta: "-4.1 pp", tone: "amber" as const },
  { label: "Expiry Exposure", value: "SAR 186K", delta: "-9.3%", tone: "danger" as const },
  { label: "Route Productivity", value: "86.1", delta: "+12.4%", tone: "emerald" as const },
  { label: "Strike Rate", value: "72.5%", delta: "+5.8 pp", tone: "emerald" as const },
];

const priorityActions = [
  {
    priority: "High",
    issue: "Route R-07 stockout risk",
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
    issue: "Salesman S-04 low strike rate",
    action: "Coach on priority customer conversion",
    owner: "Sales Supervisor",
    impact: "+7.5% strike rate",
    status: "In Progress",
  },
  {
    priority: "Medium",
    issue: "Route R-12 inefficient sequence",
    action: "Approve optimized route sequence",
    owner: "Route Planner",
    impact: "-14% travel time",
    status: "Ready",
  },
  {
    priority: "High",
    issue: "Customer C-184 under-replenished",
    action: "Increase replenishment before next cycle",
    owner: "Supply Controller",
    impact: "Protect growth account",
    status: "Open",
  },
];

export default function Home() {
  return (
    <>
      <PageTitle
        eyebrow="Operating Layer"
        title="GTC Sales & Supply Chain Orchestrator"
        subtitle="One operating layer to forecast demand, replenish customers, load vans, optimize routes, improve execution, and govern actions."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topPulse.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-ivory">Today&apos;s Priority Actions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {priorityActions.map((x) => (
            <PriorityActionCard key={x.issue} {...x} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">Modules</p>
            <h2 className="mt-2 text-2xl font-semibold text-ivory">Operating Workflows</h2>
          </div>
          <p className="max-w-xl text-sm text-muted">Open the workflow you need and act on the top issues.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="glass group relative overflow-hidden rounded-2xl p-6 ring-1 ring-ivory/[0.05] transition hover:-translate-y-0.5 hover:border-electric/20 hover:shadow-glow"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-electric/10 blur-2xl transition group-hover:bg-electric/15" aria-hidden />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/30">
                    <Icon className="h-6 w-6 text-electric" strokeWidth={1.75} />
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-electric" strokeWidth={1.75} />
                </div>
                <h3 className="relative mt-5 text-xl font-semibold text-ivory">{m.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{m.text}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

function PriorityActionCard({
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
  const priorityTone = priority === "High" ? "text-danger" : "text-amber";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ivory p-5 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04]">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-electric via-electric/80 to-electric/30" aria-hidden />
      <p className="pl-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">Priority</p>
      <p className={cn("pl-2 text-sm font-semibold", priorityTone)}>{priority}</p>
      <p className="mt-3 pl-2 text-sm font-semibold text-ink">{issue}</p>
      <p className="mt-1 pl-2 text-sm text-ink/85">{action}</p>
      <div className="mt-4 grid gap-1 pl-2 text-xs text-ink/75">
        <p>
          <span className="font-semibold text-ink/90">Owner:</span> {owner}
        </p>
        <p>
          <span className="font-semibold text-ink/90">Impact:</span> {impact}
        </p>
      </div>
      <div className="mt-4 pl-2">
        <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", statusTone)}>{status}</span>
      </div>
    </div>
  );
}
