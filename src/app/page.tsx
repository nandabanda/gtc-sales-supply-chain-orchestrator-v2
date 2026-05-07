import Link from "next/link";
import { ArrowRight, Brain, Boxes, ClipboardList, LayoutDashboard, MapPinned, Route } from "lucide-react";
import { KPICard, PageTitle } from "@/components/Cards";
import { DecisionLayerPanel } from "@/components/DecisionLayerPanel";
import { orchestrationDashboardDecisions } from "@/data/decisionLayers";
import { kpis } from "@/data/demo";

const modules = [
  {
    href: "/command-center",
    title: "Command Center",
    icon: LayoutDashboard,
    text: "Executive view of revenue opportunity, forecast quality, inventory risk, route productivity, and strike rate — with prioritized interventions.",
  },
  {
    href: "/demand-intelligence",
    title: "Demand Intelligence",
    icon: Brain,
    text: "SKU × customer × route demand with confidence scoring, exception lanes, and where human judgment should enter the forecast process.",
  },
  {
    href: "/replenishment-orchestrator",
    title: "Replenishment Orchestrator",
    icon: Boxes,
    text: "Credit-aware replenishment, van loading guidance, and explicit trade-offs between stockout, expiry, and service.",
  },
  {
    href: "/route-intelligence",
    title: "Route Intelligence",
    icon: Route,
    text: "Optimized sequencing, priority customers, SLA risk, and the productivity upside from smarter movement — not more trucks.",
  },
  {
    href: "/execution-intelligence",
    title: "Execution Intelligence",
    icon: MapPinned,
    text: "Field execution cockpit: salesman and route productivity with supervisor-ready coaching narratives.",
  },
  {
    href: "/ai-action-board",
    title: "AI Action Board",
    icon: ClipboardList,
    text: "Governance layer for accepting, challenging, and tracking recommendations — the meeting screen for controllers and supervisors.",
  },
];

export default function Home() {
  return (
    <>
      <PageTitle
        eyebrow="Enterprise AI operating layer"
        title="GTC Sales & Supply Chain Orchestrator"
        subtitle="A boardroom-grade decision cockpit for Olayan Group / GTC: sense demand, recommend supply, optimize routes, coach execution, and govern actions — with SYDIAI narrating the story on every screen."
      />

      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-electric/25 bg-electric/[0.06] px-4 py-3 ring-1 ring-ivory/[0.05]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-electric">Operating pulse</span>
        <span className="hidden h-4 w-px bg-ivory/15 sm:block" aria-hidden />
        <p className="text-sm text-ivory/90">
          Models are synthesizing <span className="font-semibold text-ivory">demand, replenishment, routing, and field signals</span> into a single leadership narrative — open the intelligence panel on the right for live guidance.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </section>

      <section className="mt-10">
        <DecisionLayerPanel
          title="Decision orchestration layer"
          subtitle="The same AI decision cards used in Command Center — stockout, expiry, strike rate, routing, customer replenishment, van utilization, and forecast confidence. Status: Open · In Progress · Closed. Confidence: High · Medium · Low."
          items={orchestrationDashboardDecisions}
        />
      </section>

      <section className="mt-12">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">Modules</p>
            <h2 className="mt-2 text-2xl font-semibold text-ivory">Enter the cockpit by workflow</h2>
          </div>
          <p className="max-w-xl text-sm text-muted">Each area uses the same synthetic enterprise dataset — progress from sense to govern without switching tools.</p>
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
