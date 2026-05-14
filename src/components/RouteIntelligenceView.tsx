"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  channels,
  demoOperationalRows,
  deliveryRiskFilters,
  gtcOperationalDataDisclaimer,
  regions,
  routes,
  salesmen,
  warehouses,
} from "@/data/gtcOperationalDemoData";
import { defaultRouteOpFilters, filterOperationalForRoute, type RouteOpFilters } from "@/lib/gtcOperationalBridge";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="flex min-w-[130px] flex-1 flex-col gap-1.5 text-xs font-medium text-muted">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-electric/90">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-ivory/12 bg-[#0a121c] px-3 py-2.5 text-sm font-medium text-ivory shadow-inner ring-1 ring-black/20 focus:border-electric/40 focus:outline-none focus:ring-1 focus:ring-electric/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
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

export function RouteIntelligenceView() {
  const [f, setF] = useState<RouteOpFilters>(defaultRouteOpFilters);
  const set = (k: keyof RouteOpFilters) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => filterOperationalForRoute(demoOperationalRows, f), [f]);

  const metrics = useMemo(() => {
    const n = rows.length || 1;
    const plannedVisits = rows.length * 6;
    const highPri = rows.filter((r) => r.routePriority >= 75).length;
    const fillRisk = rows.filter((r) => r.orderFillRate < 82).length;
    const avgDel = Math.round(rows.reduce((a, r) => a + r.deliveryRisk, 0) / n);
    const productivity = Math.round(rows.reduce((a, r) => a + r.executionScore, 0) / n);
    const worst = [...rows].sort((a, b) => b.deliveryRisk - a.deliveryRisk)[0];
    const action = worst
      ? `Protect ${worst.customerName} on ${worst.route} — ${worst.deliveryRiskBand} delivery risk.`
      : "No route stress in current slice.";
    return { plannedVisits, highPri, fillRisk, avgDel, productivity, action };
  }, [rows]);

  const tableRows = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.deliveryRisk - a.deliveryRisk)
      .slice(0, 8)
      .map((r, i) => ({
        key: `${r.customerCode}-${i}`,
        priority: r.routePriority >= 75 ? "High" : r.routePriority >= 50 ? "Medium" : "Low",
        routeVan: `${r.route} / V-${String((i % 5) + 7).padStart(2, "0")}`,
        customer: `${r.customerCode} ${r.customerName}`,
        action: r.recommendedAction,
        reason: `${r.deliveryRiskBand} risk · fill ${r.orderFillRate}%`,
        owner: r.salesman,
        impact: `SAR ${Math.round(r.actual30d * 12).toLocaleString("en-SA")} proxy`,
        status: r.deliveryRiskBand === "High" ? "Approval Required" : r.deliveryRiskBand === "Elevated" ? "Review" : "Ready",
      }));
  }, [rows]);

  const aiRoute = useMemo(() => {
    const r = f.route !== "All Routes" ? f.route : rows[0]?.route ?? "enterprise routes";
    const reg = f.region !== "All Regions" ? f.region : rows[0]?.region ?? "KSA";
    return `For ${reg}, prioritize sequence integrity on ${r}. ${metrics.action} Estimated mean delivery risk is ${metrics.avgDel}% with ${metrics.fillRisk} fill-risk outlets in the filtered slice.`;
  }, [f, rows, metrics]);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Route Planning Data Filters</h3>
        <div className="mt-4 flex flex-wrap gap-4 rounded-2xl border border-ivory/10 bg-ivory/[0.02] p-5 ring-1 ring-ivory/[0.04]">
          <FilterSelect label="Region" value={f.region} onChange={set("region")} options={regions} />
          <FilterSelect label="Route" value={f.route} onChange={set("route")} options={routes} />
          <FilterSelect label="Salesman" value={f.salesman} onChange={set("salesman")} options={salesmen} />
          <FilterSelect label="Channel" value={f.channel} onChange={set("channel")} options={channels} />
          <FilterSelect label="Warehouse" value={f.warehouse} onChange={set("warehouse")} options={warehouses} />
          <FilterSelect label="Delivery risk" value={f.deliveryRisk} onChange={set("deliveryRisk")} options={deliveryRiskFilters} />
        </div>
        <p className="mt-3 text-xs text-muted">{gtcOperationalDataDisclaimer}</p>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Route planning metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PulseCard label="Planned visits" value={String(metrics.plannedVisits)} status="Today" cue="Demo plan load" tone="electric" />
          <PulseCard label="High priority customers" value={String(metrics.highPri)} status="In slice" cue="Route priority ≥ 75" tone="danger" />
          <PulseCard label="Fill-risk customers" value={String(metrics.fillRisk)} status="Watch" cue="Fill &lt; 82%" tone="amber" />
          <PulseCard label="Estimated delivery risk" value={`${metrics.avgDel}%`} status="Mean" cue="Across filtered rows" tone="amber" />
          <PulseCard label="Route productivity" value={`${metrics.productivity}`} status="Execution" cue="Mean score" tone="electric" />
          <PulseCard
            label="Suggested route action"
            value={metrics.action.length > 40 ? `${metrics.action.slice(0, 38)}…` : metrics.action}
            status="Worst lane"
            cue="Delivery-led"
            tone="amber"
          />
        </div>
        <p className="mt-3 text-sm text-ivory/80">{metrics.action}</p>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Today&apos;s route recommendations</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Priority", "Route / Van", "Customer", "Action", "Reason", "Owner", "Impact", "Status"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.key} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          r.priority === "High"
                            ? "border-danger/45 bg-danger/12 text-ink"
                            : r.priority === "Medium"
                              ? "border-amber/50 bg-amber/12 text-ink"
                              : "border-emerald/45 bg-emerald/12 text-ink",
                        )}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/90">{r.routeVan}</td>
                    <td className="px-3 py-3 text-ink/85">{r.customer}</td>
                    <td className="px-3 py-3 text-ink/90">{r.action}</td>
                    <td className="px-3 py-3 text-ink/85">{r.reason}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3 font-medium text-ink">{r.impact}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                          r.status === "Approval Required"
                            ? "border-amber/50 bg-amber/14 text-ink"
                            : r.status === "Review"
                              ? "border-amber/50 bg-amber/12 text-ink"
                              : "border-electric/45 bg-electric/10 text-ink",
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
          {tableRows.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink/55">No rows for this filter combination.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-[#0a121c] p-5 ring-1 ring-ivory/[0.05]">
        <h4 className="text-sm font-semibold text-electric">AI route recommendation</h4>
        <p className="mt-2 text-sm leading-relaxed text-ivory/85">{aiRoute}</p>
      </section>
    </div>
  );
}
