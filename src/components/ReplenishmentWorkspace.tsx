"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { buildReplenishmentRows, replenishmentExecutiveKpis, type ReplenishmentRowView } from "@/lib/replenishment";
import { replenishmentEngineSeed } from "@/data/replenishmentEngineSeed";
import { ReplenishmentEngine } from "@/components/ReplenishmentEngine";

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

export function ReplenishmentWorkspace() {
  const rows = useMemo(() => buildReplenishmentRows(replenishmentEngineSeed), []);
  const exec = useMemo(() => replenishmentExecutiveKpis(rows), [rows]);

  const poSuggestions = useMemo(
    () =>
      rows
        .filter((r) => r.suggestedQty > 0)
        .map((r) => ({
          supplier: r.supplierName,
          sku: r.skuCode,
          qty: r.suggestedQty,
          route: r.route,
          valueSar: Math.round(r.suggestedQty * r.purchasePrice),
        })),
    [rows],
  );

  const aiBullets = useMemo(() => {
    const critical = rows.filter((r) => r.netAvailableStock < r.reorderPoint).slice(0, 3);
    const lines = [
      `ROP engine: ${exec.lanesBelowRop} customer lanes sit below reorder point before next supplier cycle.`,
      `MOQ ladder suggests ${exec.totalMoqSuggestedCases} cases inbound (avg EOQ reference ${exec.avgEoqReferenceCases} cs).`,
      critical.length
        ? `Priority: ${critical.map((c) => `${c.skuCode} on ${c.route}`).join(", ")} — net available trails safety-adjusted lead-time demand.`
        : "Pipeline covers ROP on all seeded lanes; maintain wave discipline.",
      `Avg engine confidence ${exec.avgEngineConfidence}% · avg cover ${exec.avgPipelineCoverDays}d on net available.`,
    ];
    return lines;
  }, [rows, exec]);

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Executive Supply Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ExecCard label="Lanes below ROP" value={String(exec.lanesBelowRop)} status="Pre-wave" cue="Dispatch window" tone="danger" />
          <ExecCard label="MOQ suggested inbound" value={`${exec.totalMoqSuggestedCases} cs`} status="Warehouse" cue="Pick + PO alignment" tone="electric" />
          <ExecCard label="Avg pipeline cover" value={`${exec.avgPipelineCoverDays}d`} status="Net / ADS" cue="Across seeded outlets" tone="amber" />
          <ExecCard label="Engine confidence" value={`${exec.avgEngineConfidence}%`} status="ROP-first" cue="Credit/expiry secondary" tone="emerald" />
          <ExecCard label="EOQ reference (avg)" value={`${exec.avgEoqReferenceCases} cs`} status="PO batching" cue="Versus MOQ ladder" tone="electric" />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">ROP Engine Summary</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
            <p className="text-xs text-muted">Safety stock model</p>
            <p className="mt-2 text-lg font-semibold text-ivory">Z × σ × √LT</p>
            <p className="mt-2 text-xs text-ivory/60">Per-lane service level Z from seed; demand σ from outlet history.</p>
          </div>
          <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
            <p className="text-xs text-muted">Reorder point</p>
            <p className="mt-2 text-lg font-semibold text-ivory">LT demand + SS</p>
            <p className="mt-2 text-xs text-ivory/60">Compared to net available (on-hand + inbound PO − pending SO).</p>
          </div>
          <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
            <p className="text-xs text-muted">Target stock</p>
            <p className="mt-2 text-lg font-semibold text-ivory">ADS × cover + SS</p>
            <p className="mt-2 text-xs text-ivory/60">Cover days priority-weighted (High 8d · Med 7d · Low 6d).</p>
          </div>
          <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
            <p className="text-xs text-muted">MOQ & EOQ</p>
            <p className="mt-2 text-lg font-semibold text-ivory">ceil(raw ÷ MOQ) × MOQ</p>
            <p className="mt-2 text-xs text-ivory/60">EOQ = √(2×D×S÷H) for supplier batch reference.</p>
          </div>
        </div>
      </section>

      <ReplenishmentEngine />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Supplier PO Suggestions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Supplier / DC", "SKU", "Route", "Suggested PO qty", "Est. buy (SAR)", "Next step"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {poSuggestions.map((p) => (
                  <tr key={`${p.supplier}-${p.sku}-${p.route}`} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 text-ink/90">{p.supplier}</td>
                    <td className="px-3 py-3 font-medium">{p.sku}</td>
                    <td className="px-3 py-3">{p.route}</td>
                    <td className="px-3 py-3 tabular-nums font-semibold">{p.qty} cs</td>
                    <td className="px-3 py-3 tabular-nums text-emerald">SAR {p.valueSar.toLocaleString("en-SA")}</td>
                    <td className="px-3 py-3 text-ink/80">Raise draft PO · wave align</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {poSuggestions.length === 0 && <p className="px-5 py-6 text-center text-sm text-ink/55">No incremental PO lines — all lanes at or above target.</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Van Load Readiness</h3>
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
                  <tr key={r.target} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 font-semibold text-ink/90">{r.target}</td>
                    <td className="px-3 py-3 text-ink/85">{r.issue}</td>
                    <td className="px-3 py-3 text-ink/90">{r.correction}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                          r.status === "In Progress"
                            ? "border-electric/45 bg-electric/10 text-ink"
                            : r.status === "Review"
                              ? "border-amber/50 bg-amber/12 text-ink"
                              : "border-emerald/45 bg-emerald/12 text-ink",
                        )}
                      >
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

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Expiry / Overstock Actions</h3>
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
                  <tr key={r.target} className="border-t border-ink/[0.07]">
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

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-5 ring-1 ring-ivory/[0.06]">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">AI Replenishment Explanation</h3>
        <ul className="space-y-2.5 text-sm font-medium text-ivory/90">
          {aiBullets.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ivory/55">
          If no action: lanes below ROP burn cover inside lead time — expect stockouts on fast movers and chilled spoilage on over-covered SKUs.
        </p>
      </section>
    </div>
  );
}

function ExecCard({
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
  tone: "amber" | "danger" | "electric" | "emerald";
}) {
  const map = {
    amber: "border-amber/50 bg-amber/12 text-amber",
    danger: "border-danger/45 bg-danger/12 text-danger",
    electric: "border-electric/45 bg-electric/10 text-electric",
    emerald: "border-emerald/45 bg-emerald/12 text-emerald",
  };
  return (
    <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ivory">{value}</p>
      <p className={cn("mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", map[tone])}>
        {status} · {cue}
      </p>
    </div>
  );
}
