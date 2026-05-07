import { DataTable, KPICard, PageTitle, Panel } from "@/components/Cards";
import { ProductivityChart } from "@/components/Charts";
import { DecisionLayerPanel } from "@/components/DecisionLayerPanel";
import { CustomerOpportunityIntelligence } from "@/components/CustomerOpportunityIntelligence";
import { SalesmanCoachingIntelligence } from "@/components/SalesmanCoachingIntelligence";
import { executionDecisions } from "@/data/decisionLayers";
import { salesman } from "@/data/demo";

const executionKpis = [
  { label: "Underperforming salesmen", value: "2", delta: "S-04 / S-09", tone: "amber" },
  { label: "Average strike rate", value: "72.5%", delta: "+5.8 pp", tone: "emerald" },
  { label: "Van productivity", value: "86.1", delta: "+12.4%", tone: "emerald" },
  { label: "Must-sell SKU gap", value: "19%", delta: "Focus", tone: "danger" },
];

export default function ExecutionIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Improve field execution"
        title="Execution Intelligence"
        subtitle="Supervisor cockpit for salesman productivity, route productivity, van utilization, customer strike rate, and SKU-level interventions."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executionKpis.map((x) => (
          <KPICard key={x.label} {...x} />
        ))}
      </section>
      <section className="mt-10 grid gap-5">
        <DecisionLayerPanel
          title="Execution decision layer"
          subtitle="Low strike rate and underperforming salesman patterns — supervisor coaching actions with measurable strike-rate upside."
          items={executionDecisions}
        />
        <SalesmanCoachingIntelligence />
        <CustomerOpportunityIntelligence />
        <Panel title="Salesman productivity score" subtitle="Productivity blends revenue, strike rate, conversion, and route discipline.">
          <ProductivityChart data={salesman} />
        </Panel>
        <Panel title="Salesman action table" subtitle="Supervisor actions mapped to specific performance gaps.">
          <DataTable columns={["name", "route", "revenue", "strike", "productivity", "action"]} rows={salesman as any} />
        </Panel>
      </section>
    </>
  );
}
