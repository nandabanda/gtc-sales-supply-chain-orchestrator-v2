import { DataTable, KPICard, PageTitle, Panel } from "@/components/Cards";
import { ForecastChart, RouteRiskChart } from "@/components/Charts";
import { DecisionLayerPanel } from "@/components/DecisionLayerPanel";
import { commandCenterDecisions } from "@/data/decisionLayers";
import { actions, demandTrend, kpis, routeRisk } from "@/data/demo";

export default function CommandCenter() {
  return (
    <>
      <PageTitle
        eyebrow="Executive view"
        title="Command Center"
        subtitle="Leadership line of sight across revenue opportunity, demand risk, inventory exposure, productivity leakage, and the decisions that matter this week."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </section>
      <section className="mt-10 grid gap-5">
        <Panel title="Forecast vs actual trend" subtitle="Demand trend and forecast accuracy over recent weeks.">
          <ForecastChart data={demandTrend} />
        </Panel>
        <Panel title="Route demand vs fill accuracy" subtitle="High demand with weak fill accuracy creates service and revenue risk — the agent highlights exception routes.">
          <RouteRiskChart data={routeRisk} />
        </Panel>
        <Panel title="Top AI actions" subtitle="Prioritized by value impact, confidence, and operational urgency.">
          <DataTable columns={["rank", "title", "impact", "confidence", "owner"]} rows={actions as any} />
        </Panel>
        <DecisionLayerPanel
          title="AI decision orchestration layer"
          subtitle="Open, in-progress, and closed decisions with confidence, owner, and impact."
          items={commandCenterDecisions}
        />
      </section>
    </>
  );
}
