import { DataTable, KPICard, PageTitle, Panel } from "@/components/Cards";
import { ConfidenceChart, ForecastChart, RouteRiskChart } from "@/components/Charts";
import { DecisionLayerPanel } from "@/components/DecisionLayerPanel";
import { demandDecisions } from "@/data/decisionLayers";
import { demandTrend, routeRisk } from "@/data/demo";

const forecastKpis = [
  { label: "Next week demand", value: "12.4K cases", delta: "+9.1%", tone: "emerald" },
  { label: "Forecast confidence", value: "88%", delta: "+10 pp", tone: "emerald" },
  { label: "High-risk routes", value: "2", delta: "R-07 / R-12", tone: "amber" },
];

export default function DemandIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Sense demand"
        title="Demand Intelligence"
        subtitle="Predict SKU, customer, and route-level demand using historical movement, seasonality, customer frequency, and route momentum — with explicit confidence."
      />
      <section className="grid gap-4 md:grid-cols-3">
        {forecastKpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </section>
      <section className="mt-10 grid gap-5">
        <DecisionLayerPanel
          title="Demand decision layer"
          subtitle="Forecast confidence drops and high-potential customer signals — translated into planning actions with clear owners."
          items={demandDecisions}
        />
        <Panel title="Forecast vs actual" subtitle="Forecast is shown against recent actual sales trend.">
          <ForecastChart data={demandTrend} />
        </Panel>
        <Panel title="Forecast confidence" subtitle="Confidence improves as data stability and signal agreement improve.">
          <ConfidenceChart data={demandTrend} />
        </Panel>
        <Panel title="Demand risk by route" subtitle="Demand score vs fill score highlights supply–service mismatch.">
          <RouteRiskChart data={routeRisk} />
        </Panel>
        <Panel title="Route forecast exceptions">
          <DataTable columns={["route", "demand", "fill", "risk"]} rows={routeRisk as any} />
        </Panel>
      </section>
    </>
  );
}
