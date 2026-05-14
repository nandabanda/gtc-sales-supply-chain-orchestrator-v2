"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/Cards";
import {
  ForecastChart,
  ForecastVsActualGroupedBar,
  GrowthBarChart,
  SkuRiskScatter,
} from "@/components/Charts";
import {
  brands,
  categories,
  channels,
  demoOperationalRows,
  demoSkuFilterOptions,
  gtcOperationalDataDisclaimer,
  regions,
  routes,
} from "@/data/gtcOperationalDemoData";
import { cn } from "@/lib/utils";
import {
  buildCompactDemandHandoffTable,
  buildDemandAiPlannerSummary,
  buildDemandForecastExceptions,
  filterOperationalForDemand,
  operationalRowsToDemandRows,
} from "@/lib/gtcOperationalBridge";
import {
  buildAccuracyHeatmap,
  buildForecastVsActualByDim,
  buildForecastVsActualWeekly,
  buildPlannerNarrative,
  buildSkuRiskMatrix,
  computeDrillKpis,
  defaultDrillFilters,
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
  const reg = heatmapRegions;
  const cat = heatmapCategories;
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
            {reg.map((r) => (
              <th key={r} className="p-2 font-semibold text-ivory/80">
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cat.map((c) => (
            <tr key={c}>
              <td className="p-2 text-left font-medium text-ivory/90">{c}</td>
              {reg.map((r) => {
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
      <p className="mt-2 text-[11px] text-muted">Darker green = higher forecast accuracy % (demo blend).</p>
    </div>
  );
}

export function DemandPlanningDrilldownConsole() {
  const [f, setF] = useState<DrillFilterState>(defaultDrillFilters);
  const [planningDim, setPlanningDim] = useState<PlanningDim>("region");

  const opFiltered = useMemo(() => filterOperationalForDemand(demoOperationalRows, f), [f]);
  const filtered = useMemo(() => operationalRowsToDemandRows(opFiltered), [opFiltered]);
  const kpis = useMemo(() => computeDrillKpis(filtered), [filtered]);
  const narrative = useMemo(() => buildPlannerNarrative(filtered, f), [filtered, f]);
  const weeklyFva = useMemo(() => buildForecastVsActualWeekly(f, filtered), [f, filtered]);
  const byDim = useMemo(() => buildForecastVsActualByDim(filtered, planningDim), [filtered, planningDim]);
  const growth = useMemo(() => growthByDimension(filtered, planningDim), [filtered, planningDim]);
  const heatCells = useMemo(() => buildAccuracyHeatmap(filtered, heatmapCategories, heatmapRegions), [filtered]);
  const skuRisk = useMemo(() => buildSkuRiskMatrix(filtered), [filtered]);
  const handoffRows = useMemo(() => buildCompactDemandHandoffTable(opFiltered), [opFiltered]);
  const exceptionRows = useMemo(() => buildDemandForecastExceptions(opFiltered, 5), [opFiltered]);
  const aiSummary = useMemo(
    () => buildDemandAiPlannerSummary(opFiltered, f, kpis),
    [opFiltered, f, kpis],
  );

  const biasHint = kpis.forecastBias < -3 ? "Under-forecast bias" : kpis.forecastBias > 5 ? "Over-forecast bias" : "Balanced bias";
  const accHint = kpis.forecastAccuracy >= 85 ? "On target" : kpis.forecastAccuracy >= 78 ? "Watch mix" : "Review slice";
  const growthHint = kpis.demandGrowth >= 8 ? "Elevated growth" : kpis.demandGrowth <= 2 ? "Soft growth" : "Steady trend";
  const riskHint = kpis.replenishmentRisk >= 50 ? "Elevated risk" : kpis.replenishmentRisk >= 30 ? "Controlled risk" : "Low risk";
  const confHint = kpis.planningConfidence >= 80 ? "High confidence" : kpis.planningConfidence >= 72 ? "Moderate" : "Volatile";

  const set = (key: keyof DrillFilterState) => (v: string) => setF((prev) => ({ ...prev, [key]: v }));
  const tableRows = filtered.slice(0, 10);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Demand Planning Drilldown Console</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Slice the shared GTC operational demo layer by Region, Category, Brand, SKU, Channel, and Route. KPIs and charts recompute from the same foundation used on Replenishment, Route, and Execution pages.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-ivory/10 bg-ivory/[0.02] p-5 ring-1 ring-ivory/[0.04]">
          <FilterSelect label="Region" value={f.region} onChange={set("region")} options={regions} />
          <FilterSelect label="Category" value={f.category} onChange={set("category")} options={categories} />
          <FilterSelect label="Brand" value={f.brand} onChange={set("brand")} options={brands} />
          <FilterSelect label="SKU / Pack" value={f.sku} onChange={set("sku")} options={demoSkuFilterOptions} />
          <FilterSelect label="Channel" value={f.channel} onChange={set("channel")} options={channels} />
          <FilterSelect label="Route / Customer type" value={f.route} onChange={set("route")} options={routes} />
        </div>
        <p className="mt-3 text-xs text-muted">{gtcOperationalDataDisclaimer}</p>

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

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Forecast vs actual (weekly)" subtitle="Trend lens for the selected filter fingerprint.">
          <ForecastChart data={weeklyFva} />
        </Panel>
        <Panel title={`Forecast vs actual by ${planningDim}`} subtitle="30d forecast vs 30d actual by slice.">
          <ForecastVsActualGroupedBar data={byDim.length ? byDim : [{ name: "—", forecast: 0, actual: 0 }]} />
        </Panel>
        <Panel title={`Demand growth by ${planningDim}`} subtitle="Volume-weighted growth % in the current slice.">
          <GrowthBarChart data={growth.length ? growth : [{ name: "—", growth: 0 }]} />
        </Panel>
        <Panel title="Forecast accuracy heatmap" subtitle="Category × Region (accuracy %).">
          <AccuracyHeatmapGrid cells={heatCells} />
        </Panel>
      </section>

      <section>
        <Panel title="SKU risk matrix" subtitle="Demand pressure vs cover — high demand with low cover reads as Act now.">
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
        <p className="mb-3 text-xs text-muted">Showing up to 10 lanes. Full operational depth is available on Replenishment and Execution views.</p>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 ring-1 ring-ivory/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
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
                {tableRows.map((r, i) => (
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
          {tableRows.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted">No rows for this combination — reset filters.</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Demand-to-Replenishment Handoff</h3>
        <p className="mb-3 text-xs text-muted">Executive handoff view — five canonical buckets. RAG: Red Act now, Amber Monitor, Green Stable.</p>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 ring-1 ring-ivory/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead className="bg-ivory/[0.06] text-[10px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  {["Action bucket", "SKU / Brand", "Region / Route", "Trigger", "Action", "Priority", "Owner", "RAG"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {handoffRows.map((row) => (
                  <tr key={row.actionBucket} className="border-t border-ivory/[0.06]">
                    <td className="px-3 py-3 font-semibold text-ivory">{row.actionBucket}</td>
                    <td className="px-3 py-3 text-ivory/90">{row.skuBrand}</td>
                    <td className="px-3 py-3 text-ivory/85">{row.regionRoute}</td>
                    <td className="max-w-[200px] px-3 py-3 text-xs text-ivory/80">{row.trigger}</td>
                    <td className="max-w-[260px] px-3 py-3 text-xs text-ivory/80">{row.action}</td>
                    <td className="px-3 py-3 text-xs font-medium text-ivory">{row.priority}</td>
                    <td className="px-3 py-3 text-xs text-ivory/75">{row.owner}</td>
                    <td className="px-3 py-3">
                      <RagPill rag={row.rag} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Forecast exceptions</h3>
        <p className="mb-3 text-xs text-muted">Top five lanes by composite exception score in the filtered slice.</p>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 ring-1 ring-ivory/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-ivory/[0.06] text-[10px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  {["Region", "Category", "Brand", "SKU", "Exception", "Business risk", "Recommended action"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exceptionRows.map((row, i) => (
                  <tr key={`${row.sku}-${i}`} className="border-t border-ivory/[0.06]">
                    <td className="px-3 py-3 font-medium text-ivory">{row.region}</td>
                    <td className="px-3 py-3 text-ivory/90">{row.category}</td>
                    <td className="px-3 py-3 text-ivory/90">{row.brand}</td>
                    <td className="px-3 py-3 text-ivory/90">{row.sku}</td>
                    <td className="max-w-[200px] px-3 py-3 text-xs text-ivory/85">{row.exception}</td>
                    <td className="max-w-[220px] px-3 py-3 text-xs text-ivory/80">{row.businessRisk}</td>
                    <td className="max-w-[260px] px-3 py-3 text-xs text-electric/95">{row.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 ring-1 ring-ivory/[0.05]">
        <h3 className="text-lg font-semibold text-ivory">AI Demand Planner Summary</h3>
        <p className="mt-1 text-sm text-muted">Concise readout for steering committee — includes narrative context for the same slice.</p>
        <ul className="mt-5 space-y-4 text-sm leading-relaxed text-ivory/88">
          <li>
            <span className="font-semibold text-electric">What changed?</span> {aiSummary.whatChanged}
          </li>
          <li>
            <span className="font-semibold text-electric">Where is the risk?</span> {aiSummary.whereRisk}
          </li>
          <li>
            <span className="font-semibold text-electric">What should replenishment do?</span> {aiSummary.replenishmentDo}
          </li>
          <li>
            <span className="font-semibold text-electric">What should sales execution watch?</span> {aiSummary.salesWatch}
          </li>
        </ul>
        <p className="mt-5 border-t border-ivory/[0.08] pt-4 text-sm leading-relaxed text-ivory/82">
          <span className="font-semibold text-ivory">Planner narrative:</span> {narrative}
        </p>
      </section>
    </div>
  );
}
