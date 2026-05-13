"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/Cards";
import {
  ForecastChart,
  ForecastVsActualGroupedBar,
  GrowthBarChart,
  SkuRiskScatter,
} from "@/components/Charts";
import { cn } from "@/lib/utils";
import {
  DRILL_BRANDS,
  DRILL_CATEGORIES,
  DRILL_CHANNELS,
  DRILL_REGIONS,
  DRILL_ROUTES,
  DRILL_SKUS,
  demandDrilldownSeed,
} from "@/data/demandDrilldownSeed";
import {
  buildAccuracyHeatmap,
  buildForecastVsActualByDim,
  buildForecastVsActualWeekly,
  buildPlannerNarrative,
  buildReplenishmentHandoffBuckets,
  buildSkuRiskMatrix,
  computeDrillKpis,
  defaultDrillFilters,
  filterDrilldownRows,
  growthByDimension,
  heatmapCategories,
  heatmapRegions,
  type DrillFilterState,
} from "@/lib/demandDrilldown";

type PlanningDim = "region" | "category" | "brand";

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
    <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-xs font-medium text-muted">
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

function RagPill({ rag }: { rag: "Act now" | "Monitor" | "Stable" }) {
  const map = {
    "Act now": "border-danger/50 bg-danger/15 text-danger",
    Monitor: "border-amber/50 bg-amber/14 text-amber",
    Stable: "border-emerald/45 bg-emerald/12 text-emerald",
  };
  const legend = rag === "Act now" ? "Red · Act now" : rag === "Monitor" ? "Amber · Monitor" : "Green · Stable";
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold", map[rag])}>{legend}</span>
  );
}

function DrillKpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "electric" | "emerald" | "amber" | "danger";
}) {
  const map = {
    electric: "border-electric/40 bg-electric/10 text-electric",
    emerald: "border-emerald/45 bg-emerald/12 text-emerald",
    amber: "border-amber/50 bg-amber/14 text-amber",
    danger: "border-danger/45 bg-danger/12 text-danger",
  };
  return (
    <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ivory">{value}</p>
      <p className={cn("mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", map[tone])}>{hint}</p>
    </div>
  );
}

function AccuracyHeatmapGrid({ cells }: { cells: { category: string; region: string; accuracy: number }[] }) {
  const regions = heatmapRegions;
  const categories = heatmapCategories;
  const cellMap = new Map(cells.map((c) => [`${c.region}|${c.category}`, c.accuracy]));
  const heat = (acc: number) => {
    const t = (acc - 72) / 24;
    const g = Math.min(255, Math.max(0, Math.round(40 + t * 200)));
    const b = Math.min(255, Math.max(0, Math.round(180 - t * 120)));
    return `rgba(${Math.round(26 + t * 80)}, ${g}, ${b}, 0.85)`;
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] border-collapse text-center text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left text-muted">Category × Region</th>
            {regions.map((r) => (
              <th key={r} className="p-2 font-semibold text-ivory/80">
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c}>
              <td className="p-2 text-left font-medium text-ivory/90">{c}</td>
              {regions.map((r) => {
                const acc = cellMap.get(`${r}|${c}`) ?? 80;
                return (
                  <td key={r} className="p-1">
                    <div
                      className="rounded-lg px-2 py-3 font-semibold text-ink shadow-sm ring-1 ring-black/10"
                      style={{ backgroundColor: heat(acc) }}
                      title={`${c} · ${r}`}
                    >
                      {acc}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-muted">Darker green = higher forecast accuracy % (mock blend for empty cells).</p>
    </div>
  );
}

export function DemandPlanningDrilldownConsole() {
  const [f, setF] = useState<DrillFilterState>(defaultDrillFilters);
  const [planningDim, setPlanningDim] = useState<PlanningDim>("region");

  const filtered = useMemo(() => filterDrilldownRows(demandDrilldownSeed, f), [f]);
  const kpis = useMemo(() => computeDrillKpis(filtered), [filtered]);
  const narrative = useMemo(() => buildPlannerNarrative(filtered, f), [filtered, f]);
  const weeklyFva = useMemo(() => buildForecastVsActualWeekly(f, filtered), [f, filtered]);
  const byDim = useMemo(() => buildForecastVsActualByDim(filtered, planningDim), [filtered, planningDim]);
  const growth = useMemo(() => growthByDimension(filtered, planningDim), [filtered, planningDim]);
  const heatCells = useMemo(() => buildAccuracyHeatmap(filtered, heatmapCategories, heatmapRegions), [filtered]);
  const skuRisk = useMemo(() => buildSkuRiskMatrix(filtered), [filtered]);
  const handoff = useMemo(() => buildReplenishmentHandoffBuckets(filtered), [filtered]);

  const biasHint = kpis.forecastBias < -3 ? "Under-forecast bias" : kpis.forecastBias > 5 ? "Over-forecast bias" : "Balanced bias";
  const accHint = kpis.forecastAccuracy >= 85 ? "On target" : kpis.forecastAccuracy >= 78 ? "Watch mix" : "Review slice";
  const growthHint = kpis.demandGrowth >= 8 ? "Elevated growth" : kpis.demandGrowth <= 2 ? "Soft growth" : "Steady trend";
  const riskHint = kpis.replenishmentRisk >= 50 ? "Elevated risk" : kpis.replenishmentRisk >= 30 ? "Controlled risk" : "Low risk";
  const confHint = kpis.planningConfidence >= 80 ? "High confidence" : kpis.planningConfidence >= 72 ? "Moderate" : "Volatile";

  const set = (key: keyof DrillFilterState) => (v: string) => setF((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Demand Planning Drilldown Console</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Slice enterprise demand into Region, Category, Brand, SKU, Channel, and Route. KPIs, planner narrative, and replenishment handoff update from mock planning logic.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-ivory/10 bg-ivory/[0.02] p-5 ring-1 ring-ivory/[0.04]">
          <FilterSelect label="Region" value={f.region} onChange={set("region")} options={DRILL_REGIONS} />
          <FilterSelect label="Category" value={f.category} onChange={set("category")} options={DRILL_CATEGORIES} />
          <FilterSelect label="Brand" value={f.brand} onChange={set("brand")} options={DRILL_BRANDS} />
          <FilterSelect label="SKU / Pack" value={f.sku} onChange={set("sku")} options={DRILL_SKUS} />
          <FilterSelect label="Channel" value={f.channel} onChange={set("channel")} options={DRILL_CHANNELS} />
          <FilterSelect label="Route / Customer type" value={f.route} onChange={set("route")} options={DRILL_ROUTES} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Planning charts slice by</span>
          {(["region", "category", "brand"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setPlanningDim(d)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-semibold capitalize transition",
                planningDim === d
                  ? "border-electric/50 bg-electric/15 text-ivory"
                  : "border-ivory/15 bg-[#0a121c] text-ivory/65 hover:border-electric/35",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Planning KPIs (filtered)</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DrillKpi label="Forecast demand (30d)" value={`${kpis.forecastDemand30.toLocaleString("en-SA")} units`} hint="Horizon total" tone="electric" />
          <DrillKpi label="Actual demand (30d)" value={`${kpis.actualDemand30.toLocaleString("en-SA")} units`} hint="Realized baseline" tone="emerald" />
          <DrillKpi label="Forecast accuracy" value={`${kpis.forecastAccuracy}%`} hint={accHint} tone={kpis.forecastAccuracy >= 85 ? "emerald" : "amber"} />
          <DrillKpi label="Forecast bias" value={`${kpis.forecastBias > 0 ? "+" : ""}${kpis.forecastBias}%`} hint={biasHint} tone={kpis.forecastBias < -5 ? "danger" : kpis.forecastBias > 6 ? "amber" : "emerald"} />
          <DrillKpi label="Demand growth" value={`${kpis.demandGrowth > 0 ? "+" : ""}${kpis.demandGrowth}%`} hint={growthHint} tone={kpis.demandGrowth >= 8 ? "electric" : "emerald"} />
          <DrillKpi label="Stockout-adjusted demand" value={`${kpis.stockoutAdjustedDemand.toLocaleString("en-SA")} units`} hint="Distortion-adjusted proxy" tone="amber" />
          <DrillKpi label="Replenishment risk" value={`${kpis.replenishmentRisk}`} hint={riskHint} tone={kpis.replenishmentRisk >= 50 ? "danger" : "amber"} />
          <DrillKpi label="Planning confidence" value={`${kpis.planningConfidence}%`} hint={confHint} tone={kpis.planningConfidence >= 78 ? "emerald" : "amber"} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05] xl:col-span-2">
          <h3 className="text-lg font-semibold text-ivory">AI Demand Planner</h3>
          <p className="mt-1 text-sm text-muted">What moved demand, which slice is leading, whether the signal is growth, promo, seasonality, stockout distortion, or route execution — and what replenishment should do.</p>
          <p className="mt-4 text-sm leading-relaxed text-ivory/90">{narrative}</p>
        </div>
        <Panel title="Forecast vs actual (weekly)" subtitle="Trend lens for the selected filter fingerprint.">
          <ForecastChart data={weeklyFva} />
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title={`Forecast vs actual by ${planningDim}`} subtitle="30d forecast stacked against 30d actual by slice.">
          <ForecastVsActualGroupedBar data={byDim.length ? byDim : [{ name: "—", forecast: 0, actual: 0 }]} />
        </Panel>
        <Panel title={`Demand growth by ${planningDim}`} subtitle="Volume-weighted growth % within the current drill-down.">
          <GrowthBarChart data={growth.length ? growth : [{ name: "—", growth: 0 }]} />
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Forecast accuracy heatmap" subtitle="Category × Region (accuracy %).">
          <AccuracyHeatmapGrid cells={heatCells} />
        </Panel>
        <Panel title="SKU risk matrix" subtitle="Demand pressure vs cover index — high demand with low cover flags Act now.">
          <SkuRiskScatter data={skuRisk} />
          <div className="mt-4 overflow-x-auto rounded-xl border border-ivory/10">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Demand pressure</th>
                  <th className="px-3 py-2">Cover</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {skuRisk.map((r) => (
                  <tr key={r.sku} className="border-t border-ivory/[0.06]">
                    <td className="px-3 py-2 font-medium text-ivory">{r.sku}</td>
                    <td className="px-3 py-2 tabular-nums text-ivory/85">{r.demand}</td>
                    <td className="px-3 py-2 tabular-nums text-ivory/85">{r.cover}</td>
                    <td className="px-3 py-2">
                      <RagPill rag={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Drilldown table</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 ring-1 ring-ivory/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] border-collapse text-left text-sm">
              <thead className="bg-ivory/[0.06] text-[10px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  {[
                    "Region",
                    "Category",
                    "Brand",
                    "SKU",
                    "Channel",
                    "Route",
                    "Fcst 7d",
                    "Fcst 30d",
                    "Fcst 90d",
                    "Actual 30d",
                    "Accuracy %",
                    "Bias %",
                    "Growth %",
                    "Stockout risk",
                    "Replenishment",
                    "Confidence",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={`${r.sku}-${r.route}-${i}`} className="border-t border-ivory/[0.06] transition hover:bg-ivory/[0.04]">
                    <td className="px-3 py-3 font-medium text-ivory">{r.region}</td>
                    <td className="px-3 py-3 text-ivory/90">{r.category}</td>
                    <td className="px-3 py-3 text-ivory/90">{r.brand}</td>
                    <td className="px-3 py-3 text-ivory/90">{r.sku}</td>
                    <td className="px-3 py-3 text-ivory/90">{r.channel}</td>
                    <td className="px-3 py-3 text-ivory/90">{r.route}</td>
                    <td className="px-3 py-3 tabular-nums text-ivory/85">{r.forecast7.toLocaleString("en-SA")}</td>
                    <td className="px-3 py-3 tabular-nums text-ivory/85">{r.forecast30.toLocaleString("en-SA")}</td>
                    <td className="px-3 py-3 tabular-nums text-ivory/85">{r.forecast90.toLocaleString("en-SA")}</td>
                    <td className="px-3 py-3 tabular-nums text-ivory/85">{r.actual30.toLocaleString("en-SA")}</td>
                    <td className="px-3 py-3 tabular-nums">{r.forecastAccuracy}%</td>
                    <td className="px-3 py-3 tabular-nums">{r.biasPct > 0 ? `+${r.biasPct}` : r.biasPct}%</td>
                    <td className="px-3 py-3 tabular-nums">{r.growthPct > 0 ? `+${r.growthPct}` : r.growthPct}%</td>
                    <td className="px-3 py-3 tabular-nums">{r.stockoutRisk}</td>
                    <td className="max-w-[220px] px-3 py-3 text-xs text-ivory/80">{r.replenishmentAction}</td>
                    <td className="px-3 py-3 tabular-nums">{r.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No rows for this combination — reset filters.</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Demand-to-Replenishment Handoff</h3>
        <p className="mb-4 max-w-3xl text-sm text-muted">
          Buckets derived from the filtered slice. RAG: <span className="text-danger">Red — Act now</span>, <span className="text-amber">Amber — Monitor</span>,{" "}
          <span className="text-emerald">Green — Stable</span>.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {handoff.map((h) => (
            <div key={h.label} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-ivory">{h.label}</p>
                <RagPill rag={h.rag} />
              </div>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-xs text-ivory/75">
                {h.skus.length === 0 && <li className="list-none text-muted">No SKUs in this bucket for the current filters.</li>}
                {h.skus.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
