import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/Cards";

const supplyPulse = [
  { label: "Customers Needing Supply", value: "64", status: "High", cue: "Prioritize before dispatch", tone: "amber" },
  { label: "Stockout Risk", value: "14 customers", status: "Active", cue: "Increase fast movers", tone: "danger" },
  { label: "Expiry Exposure", value: "SAR 210K", status: "High", cue: "Rebalance required", tone: "danger" },
  { label: "Credit Holds", value: "11 accounts", status: "Pending", cue: "Finance review needed", tone: "amber" },
  { label: "Van Load Gaps", value: "2 vans", status: "Open", cue: "Correct before dispatch", tone: "electric" },
] as const;

const supplyDecisions = [
  {
    priority: "High",
    type: "Increase Supply",
    target: "C-184 / R-07",
    sku: "SKU-204 Cola 250ml",
    action: "Increase fast-moving SKU load before dispatch",
    owner: "Supply Controller",
    impact: "Protect SAR 95K",
    status: "Open",
  },
  {
    priority: "High",
    type: "Rebalance Stock",
    target: "R-03 to R-12",
    sku: "SKU-118 Juice 1L",
    action: "Move near-expiry stock to higher-velocity route",
    owner: "Inventory Controller",
    impact: "Avoid SAR 210K loss",
    status: "Approval Required",
  },
  {
    priority: "Medium",
    type: "Restrict Supply",
    target: "C-091 / R-03",
    sku: "SKU-118 Juice 1L",
    action: "Cap replenishment due to slow movement and expiry risk",
    owner: "Supply Controller",
    impact: "Reduce write-off risk",
    status: "Ready",
  },
  {
    priority: "High",
    type: "Credit Hold",
    target: "C-220 / R-12",
    sku: "SKU-102 Energy Drink",
    action: "Release supply only after credit approval",
    owner: "Finance Controller",
    impact: "Protect revenue with control",
    status: "Approval Required",
  },
  {
    priority: "Medium",
    type: "Van Load Correction",
    target: "V-09 / R-12",
    sku: "SKU-204 Cola 250ml",
    action: "Add fast-moving SKUs to improve utilization",
    owner: "Warehouse Supervisor",
    impact: "Improve load utilization",
    status: "In Progress",
  },
  {
    priority: "Low",
    type: "Maintain Plan",
    target: "C-301 / R-02",
    sku: "SKU-301 Water",
    action: "Maintain current supply plan",
    owner: "Supply Controller",
    impact: "Healthy velocity",
    status: "Closed",
  },
] as const;

const decisionMap = [
  { title: "Increase Supply", summary: "2 routes · SAR 95K protected", next: "Update load plan" },
  { title: "Restrict Supply", summary: "3 SKUs · write-off risk reduced", next: "Apply caps" },
  { title: "Rebalance Stock", summary: "2 moves · SAR 210K avoided", next: "Approve transfer" },
  { title: "Credit Approval", summary: "11 accounts · controlled release", next: "Finance review" },
] as const;

const vanReadiness = [
  { target: "V-07 / R-07", issue: "Fast mover gap", correction: "Increase SKU-204 by 8 cases", owner: "Warehouse Supervisor", status: "Ready" },
  { target: "V-09 / R-12", issue: "Underloaded", correction: "Add fast-moving SKUs", owner: "Warehouse Supervisor", status: "In Progress" },
  { target: "V-03 / R-03", issue: "Overloaded on chilled", correction: "Reduce SKU-118 by 13 cases", owner: "Supply Controller", status: "Ready" },
  { target: "V-12 / R-12", issue: "Cube underused", correction: "Fill cube to improve utilization", owner: "Warehouse Supervisor", status: "Review" },
] as const;

const expiryActions = [
  { target: "SKU-118 / R-03", risk: "Near expiry", action: "Rebalance to R-12", impact: "Avoid SAR 210K", owner: "Inventory Controller" },
  { target: "SKU-330 / R-07", risk: "Slow movement", action: "Stop incremental load", impact: "Reduce write-off risk", owner: "Supply Controller" },
  { target: "SKU-145 / R-18", risk: "High stock value at risk", action: "Supervisor review", impact: "Protect margin", owner: "Supervisor" },
  { target: "SKU-301 / R-02", risk: "Low", action: "Maintain plan", impact: "Healthy velocity", owner: "Supply Controller" },
] as const;

export default function ReplenishmentOrchestrator() {
  return (
    <>
      <PageTitle
        eyebrow="Supply Planning"
        title="Replenishment Orchestrator"
        subtitle="Decide what to supply, restrict, rebalance, and approve before dispatch."
      />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Supply Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {supplyPulse.map((x) => (
            <PulseCard key={x.label} {...x} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Today&apos;s Supply Decisions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Priority", "Decision Type", "Customer / Route", "SKU", "Action", "Owner", "Impact", "Status"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supplyDecisions.map((r) => (
                  <tr key={`${r.type}-${r.target}-${r.sku}`} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", r.priority === "High" ? "border-danger/45 bg-danger/12 text-ink" : r.priority === "Medium" ? "border-amber/50 bg-amber/12 text-ink" : "border-emerald/45 bg-emerald/12 text-ink")}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/90">{r.type}</td>
                    <td className="px-3 py-3 text-ink/85">{r.target}</td>
                    <td className="px-3 py-3 text-ink/85">{r.sku}</td>
                    <td className="px-3 py-3 text-ink/90">{r.action}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3 font-medium text-ink">{r.impact}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", r.status === "Approval Required" ? "border-amber/50 bg-amber/14 text-ink" : r.status === "In Progress" ? "border-electric/45 bg-electric/10 text-ink" : r.status === "Closed" ? "border-emerald/45 bg-emerald/12 text-ink" : "border-ink/20 bg-ink/[0.05] text-ink/80")}>
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
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Supply Decision Map</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {decisionMap.map((x) => (
            <div key={x.title} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <p className="text-sm font-semibold text-ivory">{x.title}</p>
              <p className="mt-2 text-sm text-ivory/85">{x.summary}</p>
              <p className="mt-3 text-xs font-medium text-electric">Next action: {x.next}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Van Loading Readiness</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Van / Route", "Load Issue", "Required Correction", "Owner", "Status"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vanReadiness.map((r) => (
                  <tr key={`${r.target}-${r.correction}`} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 font-semibold text-ink/90">{r.target}</td>
                    <td className="px-3 py-3 text-ink/85">{r.issue}</td>
                    <td className="px-3 py-3 text-ink/90">{r.correction}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", r.status === "In Progress" ? "border-electric/45 bg-electric/10 text-ink" : r.status === "Review" ? "border-amber/50 bg-amber/12 text-ink" : "border-emerald/45 bg-emerald/12 text-ink")}>
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
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Expiry & Overstock Actions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["SKU / Route", "Risk", "Action", "Impact", "Owner"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expiryActions.map((r) => (
                  <tr key={`${r.target}-${r.action}`} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 font-semibold text-ink/90">{r.target}</td>
                    <td className="px-3 py-3 text-ink/85">{r.risk}</td>
                    <td className="px-3 py-3 text-ink/90">{r.action}</td>
                    <td className="px-3 py-3 text-ink/90">{r.impact}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
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
