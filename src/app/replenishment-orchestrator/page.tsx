import { DataTable, KPICard, PageTitle, Panel } from "@/components/Cards";
import { ExpiryOverstockIntelligence } from "@/components/ExpiryOverstockIntelligence";
import { ReplenishmentEngine } from "@/components/ReplenishmentEngine";
import { VanLoadingIntelligence } from "@/components/VanLoadingIntelligence";
import { DecisionLayerPanel } from "@/components/DecisionLayerPanel";
import { replenishmentDecisions } from "@/data/decisionLayers";
import { replenishment } from "@/data/demo";

const k = [
  { label: "Stockout customers", value: "64", delta: "-18 vs last week", tone: "amber" },
  { label: "Expiry risk", value: "SAR 186K", delta: "-9.3%", tone: "danger" },
  { label: "AI load accuracy", value: "84%", delta: "+7 pp", tone: "emerald" },
  { label: "Credit-aware holds", value: "11", delta: "Review", tone: "amber" },
];

export default function ReplenishmentOrchestrator() {
  return (
    <>
      <PageTitle
        eyebrow="Recommend supply"
        title="Replenishment Orchestrator"
        subtitle="Customer-level replenishment that recommends what to supply, where to restrict, and how to balance stockout, expiry, and credit risk before dispatch."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {k.map((x) => (
          <KPICard key={x.label} {...x} />
        ))}
      </section>
      <section className="mt-10">
        <ReplenishmentEngine />
      </section>
      <section className="mt-14">
        <VanLoadingIntelligence />
      </section>
      <section className="mt-14">
        <ExpiryOverstockIntelligence />
      </section>
      <section className="mt-10 grid gap-5">
        <DecisionLayerPanel
          title="Replenishment decision layer"
          subtitle="Van loading mismatch, stockout risk, and expiry exposure — controller-ready recommendations with expected commercial impact."
          items={replenishmentDecisions}
        />
        <Panel
          title="Customer-level replenishment recommendations"
          subtitle="Suggested quantities combine demand, velocity, route frequency, inventory, and credit posture."
        >
          <DataTable columns={["customer", "route", "credit", "sku", "suggested", "risk", "action"]} rows={replenishment as any} />
        </Panel>
        <Panel title="Van loading logic" subtitle="Controller-ready summary before vehicles depart the depot.">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-ivory/10 bg-ivory/[0.04] p-5 ring-1 ring-ivory/[0.04]">
              <p className="text-sm text-muted">Increase</p>
              <p className="mt-2 text-2xl font-semibold text-emerald">SKU-204</p>
              <p className="mt-2 text-sm text-muted">High demand and stockout risk in R-07.</p>
            </div>
            <div className="rounded-xl border border-ivory/10 bg-ivory/[0.04] p-5 ring-1 ring-ivory/[0.04]">
              <p className="text-sm text-muted">Protect</p>
              <p className="mt-2 text-2xl font-semibold text-electric">SKU-118</p>
              <p className="mt-2 text-sm text-muted">High velocity with strong confidence.</p>
            </div>
            <div className="rounded-xl border border-ivory/10 bg-ivory/[0.04] p-5 ring-1 ring-ivory/[0.04]">
              <p className="text-sm text-muted">Restrict</p>
              <p className="mt-2 text-2xl font-semibold text-danger">SKU-330</p>
              <p className="mt-2 text-sm text-muted">Low movement and expiry exposure.</p>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}
