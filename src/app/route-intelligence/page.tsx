import { DataTable, KPICard, PageTitle, Panel } from "@/components/Cards";
import { RouteRiskChart } from "@/components/Charts";
import { RouteOptimizationIntelligence } from "@/components/RouteOptimizationIntelligence";
import { VanLoadingIntelligence } from "@/components/VanLoadingIntelligence";
import { DecisionLayerPanel } from "@/components/DecisionLayerPanel";
import { routeDecisions } from "@/data/decisionLayers";
import { routePlan, routeRisk } from "@/data/demo";

const routeKpis = [
  { label: "Travel time saving", value: "14%", delta: "R-12", tone: "emerald" },
  { label: "High-priority stops", value: "18", delta: "Before 11:30", tone: "cyan" },
  { label: "SLA risk", value: "7 customers", delta: "Watchlist", tone: "amber" },
  { label: "Van utilization", value: "91%", delta: "+6%", tone: "emerald" },
];

export default function RouteIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Optimize movement"
        title="Route Intelligence"
        subtitle="Optimize van sequence using customer priority, order value, SLA risk, travel time, and route productivity — aligned to replenishment reality."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {routeKpis.map((x) => (
          <KPICard key={x.label} {...x} />
        ))}
      </section>
      <section className="mt-10 grid gap-5">
        <DecisionLayerPanel
          title="Route decision layer"
          subtitle="Route productivity gaps and sequencing opportunities — aligned to replenishment reality before vans depart."
          items={routeDecisions}
        />
        <Panel title="Optimized route sequence" subtitle="Prioritizes high-value customers and reduces downstream service risk.">
          <DataTable columns={["stop", "customer", "priority", "planned", "optimized", "value"]} rows={routePlan as any} />
        </Panel>
        <Panel title="Route demand vs fill accuracy" subtitle="Mismatch routes are candidates for joint loading and sequencing intervention.">
          <RouteRiskChart data={routeRisk} />
        </Panel>
        <section className="mt-12">
          <RouteOptimizationIntelligence />
        </section>
        <section className="mt-10">
          <VanLoadingIntelligence variant="summary" />
        </section>
      </section>
    </>
  );
}
