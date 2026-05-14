"use client";

import { useMemo, useState } from "react";
import { DataTable, Panel } from "@/components/Cards";
import { ProductivityChart } from "@/components/Charts";
import { DownloadButton } from "@/components/DownloadButton";
import {
  brands,
  categories,
  channels,
  demoOperationalRows,
  gtcOperationalDataDisclaimer,
  regions,
  routes,
  salesmen,
} from "@/data/gtcOperationalDemoData";
import { defaultExecutionOpFilters, filterOperationalForExecution, type ExecutionOpFilters } from "@/lib/gtcOperationalBridge";
import { objectsToCsvRows } from "@/lib/download";
import { cn } from "@/lib/utils";

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
  tone: "danger" | "amber" | "electric";
}) {
  const map = {
    danger: "border-danger/45 bg-danger/12 text-danger",
    amber: "border-amber/50 bg-amber/12 text-amber",
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

export function ExecutionIntelligenceView() {
  const [f, setF] = useState<ExecutionOpFilters>(defaultExecutionOpFilters);
  const set = (k: keyof ExecutionOpFilters) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const rows = useMemo(() => filterOperationalForExecution(demoOperationalRows, f), [f]);

  const metrics = useMemo(() => {
    const n = rows.length || 1;
    const planned = rows.length * 5;
    const avgComp = rows.reduce((a, r) => a + r.visitCompliance, 0) / n;
    const completed = Math.round((planned * avgComp) / 100);
    const fill = Math.round(rows.reduce((a, r) => a + r.orderFillRate, 0) / n);
    const atRisk = rows.filter((r) => r.executionScore < 78).length;
    const exec = Math.round(rows.reduce((a, r) => a + r.executionScore, 0) / n);
    const revenueRisk = Math.round(rows.reduce((a, r) => a + Math.max(0, r.forecast30d - r.actual30d) * 10, 0));
    const field =
      atRisk > 0
        ? `Ride-along on weakest lane: ${[...rows].sort((a, b) => a.executionScore - b.executionScore)[0]?.salesman ?? "supervisor"}.`
        : "Maintain cadence — execution stable in slice.";
    return { planned, completed, avgComp, fill, atRisk, exec, revenueRisk, field };
  }, [rows]);

  const chartData = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const r of rows) {
      const cur = map.get(r.salesman) ?? [];
      cur.push(r.executionScore);
      map.set(r.salesman, cur);
    }
    return Array.from(map.entries())
      .map(([name, scores]) => ({
        name,
        productivity: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 8);
  }, [rows]);

  const outletRows = useMemo(() => {
    return [...rows]
      .sort((a, b) => a.executionScore - b.executionScore)
      .slice(0, 8)
      .map((r) => ({
        outlet: r.customerName,
        route: r.route,
        salesman: r.salesman,
        compliance: `${r.visitCompliance}%`,
        fill: `${r.orderFillRate}%`,
        score: `${r.executionScore}`,
        delivery: `${r.deliveryRisk}%`,
        action: r.recommendedAction,
      }));
  }, [rows]);

  const executionFullExportRows = useMemo(() => objectsToCsvRows(rows.map((r) => ({ ...r, csv_section: "Execution intelligence" }))), [rows]);
  const executionTableExportRows = useMemo(
    () => objectsToCsvRows(outletRows.map((r) => ({ ...r, csv_section: "Outlet execution" }))),
    [outletRows],
  );

  const aiExecution = useMemo(() => {
    const sm = f.salesman !== "All Salesmen" ? f.salesman : rows[0]?.salesman ?? "field team";
    const rt = f.route !== "All Routes" ? f.route : rows[0]?.route ?? "priority routes";
    const rg = f.region !== "All Regions" ? f.region : rows[0]?.region ?? "KSA";
    return `Execution view for ${rg}: focus ${sm} on ${rt}. Mean fill ${metrics.fill}% with ${metrics.atRisk} at-risk outlets. ${metrics.field}`;
  }, [f, rows, metrics]);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Execution Data Filters</h3>
        <div className="mt-4 flex flex-wrap gap-4 rounded-2xl border border-ivory/10 bg-ivory/[0.02] p-5 ring-1 ring-ivory/[0.04]">
          <FilterSelect label="Region" value={f.region} onChange={set("region")} options={regions} />
          <FilterSelect label="Route" value={f.route} onChange={set("route")} options={routes} />
          <FilterSelect label="Salesman" value={f.salesman} onChange={set("salesman")} options={salesmen} />
          <FilterSelect label="Channel" value={f.channel} onChange={set("channel")} options={channels} />
          <FilterSelect label="Category" value={f.category} onChange={set("category")} options={categories} />
          <FilterSelect label="Brand" value={f.brand} onChange={set("brand")} options={brands} />
        </div>
        <p className="mt-3 text-xs text-muted">{gtcOperationalDataDisclaimer}</p>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <DownloadButton label="Download Current View" filename="gtc-execution-intelligence-view.csv" rows={executionFullExportRows} />
          <DownloadButton label="Export Table" filename="gtc-execution-outlets-table.csv" rows={executionTableExportRows} variant="ghost" />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Execution metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PulseCard label="Planned visits" value={String(metrics.planned)} status="Cycle" cue="Demo plan" tone="electric" />
          <PulseCard label="Completed visits" value={String(metrics.completed)} status="Modelled" cue="From compliance %" tone="electric" />
          <PulseCard label="Visit compliance %" value={`${Math.round(metrics.avgComp)}%`} status="Mean" cue="Across slice" tone="amber" />
          <PulseCard label="Order fill rate %" value={`${metrics.fill}%`} status="Mean" cue="Supply + execution" tone="amber" />
          <PulseCard label="At-risk outlets" value={String(metrics.atRisk)} status="Score &lt; 78" cue="In slice" tone="danger" />
          <PulseCard label="Execution score" value={String(metrics.exec)} status="Mean" cue="0–100" tone="electric" />
          <PulseCard label="Revenue at risk (proxy)" value={`SAR ${metrics.revenueRisk.toLocaleString("en-SA")}`} status="Illustrative" cue="Fcst vs actual gap" tone="danger" />
          <PulseCard label="Recommended field action" value="See AI" status="Brief" cue="Below" tone="electric" />
        </div>
        <p className="mt-3 text-sm text-ivory/80">{metrics.field}</p>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Outlet execution table</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <DataTable
            columns={["outlet", "route", "salesman", "compliance", "fill", "score", "delivery", "action"]}
            rows={outletRows as unknown as Array<Record<string, string | number>>}
          />
        </div>
      </section>

      <Panel title="Salesman productivity (filtered)" subtitle="Mean execution score by salesman in the current slice.">
        <ProductivityChart data={chartData.length ? chartData : [{ name: "—", productivity: 0 }]} />
      </Panel>

      <section className="rounded-2xl border border-ivory/10 bg-[#0a121c] p-5 ring-1 ring-ivory/[0.05]">
        <h4 className="text-sm font-semibold text-electric">AI execution recommendation</h4>
        <p className="mt-2 text-sm leading-relaxed text-ivory/85">{aiExecution}</p>
      </section>
    </div>
  );
}
