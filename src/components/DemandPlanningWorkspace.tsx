"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/Cards";
import { ConfidenceChart, ForecastChart } from "@/components/Charts";
import { demandForecastSeed, forecastTrendWeekly } from "@/data/demandForecastSeed";
import type { DemandHorizonDays } from "@/lib/demandPlanning";
import { aggregateDemandPulse, activeDemandRow, buildDemandMultiSeed, derivePlanningActions } from "@/lib/demandPlanning";

function HorizonBtn({
  active,
  days,
  onClick,
}: {
  active: boolean;
  days: DemandHorizonDays;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-electric/50 bg-electric/15 text-ivory"
          : "border-ivory/15 bg-[#0a121c] text-ivory/70 hover:border-electric/35",
      )}
    >
      {days} days
    </button>
  );
}

function StatusTone({ kind, label }: { kind: "ok" | "warn" | "bad"; label: string }) {
  const cls =
    kind === "bad"
      ? "border-danger/45 bg-danger/12 text-danger"
      : kind === "warn"
        ? "border-amber/50 bg-amber/14 text-amber"
        : "border-emerald/45 bg-emerald/12 text-emerald";
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", cls)}>{label}</span>;
}

export function DemandPlanningWorkspace() {
  const [horizon, setHorizon] = useState<DemandHorizonDays>(7);

  const multi = useMemo(() => buildDemandMultiSeed(demandForecastSeed), []);
  const rows = useMemo(() => multi.map((m) => activeDemandRow(m, horizon)), [multi, horizon]);
  const pulse = useMemo(() => aggregateDemandPulse(rows), [rows]);
  const exceptions = useMemo(() => rows.filter((r) => r.underForecastRisk >= 38 || r.overForecastRisk >= 38 || r.confidenceScore < 65), [rows]);
  const planning = useMemo(() => derivePlanningActions(rows), [rows]);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Forecast horizon</h3>
          <p className="mt-1 text-xs text-muted">Switch bucket to recompute SKU × route forecasts, bias, and risk.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([7, 30, 90] as const).map((d) => (
            <HorizonBtn key={d} days={d} active={horizon === d} onClick={() => setHorizon(d)} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Demand pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <PulseCard
            label={`${horizon}d forecast (sum)`}
            value={`${pulse.sumForecastCases.toLocaleString("en-SA")} cs`}
            status="Horizon total"
            cue="SKU × route lanes"
            tone="electric"
          />
          <PulseCard
            label="Avg accuracy"
            value={`${pulse.avgAccuracyPct}%`}
            status={pulse.avgAccuracyPct >= 85 ? "On target" : "Review lanes"}
            cue="MAPE-style vs proxy actual"
            tone={pulse.avgAccuracyPct >= 85 ? "emerald" : "amber"}
          />
          <PulseCard
            label="Avg confidence"
            value={`${pulse.avgConfidence}%`}
            status={pulse.avgConfidence >= 72 ? "Stable" : "Volatile mix"}
            cue="Volatility + fill correction"
            tone={pulse.avgConfidence >= 72 ? "emerald" : "amber"}
          />
          <PulseCard
            label="Under-forecast risk"
            value={`${pulse.underForecastLanes} lanes`}
            status="Replenishment gap"
            cue="Bias &lt; 0"
            tone={pulse.underForecastLanes > 0 ? "danger" : "emerald"}
          />
          <PulseCard
            label="Over-forecast risk"
            value={`${pulse.overForecastLanes} lanes`}
            status="Inventory drag"
            cue="Bias &gt; 0"
            tone={pulse.overForecastLanes > 0 ? "amber" : "emerald"}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">SKU × route forecast</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Route", "SKU", "Fill-corr. cs/d", "7d fcst", "30d fcst", "90d fcst", "Accuracy", "Bias", "Confidence", "Under risk", "Over risk", "Primary signal"].map((h) => (
                    <th key={h} className="px-2 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {multi.map((m) => {
                  const r = activeDemandRow(m, horizon);
                  return (
                    <tr key={`${m.base.route}-${m.base.skuCode}`} className="border-t border-ink/[0.07]">
                      <td className="px-2 py-3 font-semibold">{m.base.route}</td>
                      <td className="px-2 py-3">
                        <span className="font-medium">{m.base.skuCode}</span> <span className="text-ink/70">{m.base.skuName}</span>
                      </td>
                      <td className="px-2 py-3 tabular-nums text-electric font-medium">{r.fillCorrectedDailyCases.toFixed(2)}</td>
                      <td className="px-2 py-3 tabular-nums">{Math.round(m.h7.forecastHorizonCases)}</td>
                      <td className="px-2 py-3 tabular-nums">{Math.round(m.h30.forecastHorizonCases)}</td>
                      <td className="px-2 py-3 tabular-nums">{Math.round(m.h90.forecastHorizonCases)}</td>
                    <td className="px-2 py-3">
                      <StatusTone kind={r.forecastAccuracyPct >= 85 ? "ok" : r.forecastAccuracyPct >= 75 ? "warn" : "bad"} label={`${r.forecastAccuracyPct}%`} />
                    </td>
                    <td className="px-2 py-3 tabular-nums">{r.forecastBiasPct > 0 ? `+${r.forecastBiasPct}` : r.forecastBiasPct}%</td>
                    <td className="px-2 py-3">
                      <StatusTone kind={r.confidenceScore >= 72 ? "ok" : r.confidenceScore >= 58 ? "warn" : "bad"} label={`${r.confidenceScore}%`} />
                    </td>
                    <td className="px-2 py-3">
                      <StatusTone kind={r.underForecastRisk >= 45 ? "bad" : r.underForecastRisk >= 25 ? "warn" : "ok"} label={`${r.underForecastRisk}%`} />
                    </td>
                    <td className="px-2 py-3">
                      <StatusTone kind={r.overForecastRisk >= 45 ? "bad" : r.overForecastRisk >= 25 ? "warn" : "ok"} label={`${r.overForecastRisk}%`} />
                    </td>
                    <td className="max-w-[220px] px-2 py-3 text-xs text-ink/80">
                      {r.primarySignal}
                      <p className="mt-1 text-[11px] text-ink/55">{r.signalMix}</p>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Forecast exception workbench</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Route", "SKU", "Issue", "Why it fired", "If no action", "Owner", "Next step"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exceptions.map((r) => {
                  const issue =
                    r.underForecastRisk >= 38
                      ? "Under-forecast vs proxy demand"
                      : r.overForecastRisk >= 38
                        ? "Over-forecast vs proxy demand"
                        : "Low confidence lane";
                  const why =
                    r.underForecastRisk >= 38
                      ? `Bias ${r.forecastBiasPct}% · fill-corrected ${r.fillCorrectedDailyCases.toFixed(2)} cs/d`
                      : r.overForecastRisk >= 38
                        ? `Promo / route growth stack inflates ${horizon}d bucket`
                        : `Volatility ${r.volatilityIndex} · confidence ${r.confidenceScore}%`;
                  const noAct =
                    r.underForecastRisk >= 38
                      ? "Replenishment runs light — stockouts on chilled / CSD priority calls."
                      : "Warehouse over-build — write-offs and cube contention on vans.";
                  return (
                    <tr key={`ex-${r.route}-${r.skuCode}`} className="border-t border-ink/[0.07]">
                      <td className="px-3 py-3 font-semibold">{r.route}</td>
                      <td className="px-3 py-3">{r.skuCode}</td>
                      <td className="px-3 py-3 text-ink/90">{issue}</td>
                      <td className="max-w-[260px] px-3 py-3 text-xs text-ink/80">{why}</td>
                      <td className="max-w-[260px] px-3 py-3 text-xs text-danger/90">{noAct}</td>
                      <td className="px-3 py-3 text-ink/80">Demand Planning Lead</td>
                      <td className="px-3 py-3 text-xs font-medium text-electric">Re-baseline → publish handoff to supply</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {exceptions.length === 0 && <p className="px-5 py-6 text-center text-sm text-ink/55">No exceptions at current thresholds.</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Planning actions (from exceptions)</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {planning.map((a) => (
            <div key={a.action} className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ivory p-5 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04]">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-electric via-electric/80 to-electric/30" aria-hidden />
              <p className="pl-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">Priority</p>
              <p className={cn("pl-2 text-sm font-semibold", a.priority === "High" ? "text-danger" : "text-amber")}>{a.priority}</p>
              <p className="mt-3 pl-2 text-sm font-semibold text-ink">{a.action}</p>
              <p className="mt-2 pl-2 text-xs text-ink/75">
                <span className="font-semibold text-ink/90">Owner:</span> {a.owner}
              </p>
              <p className="mt-1 pl-2 text-xs text-ink/75">
                <span className="font-semibold text-ink/90">Impact:</span> {a.impact}
              </p>
              <div className="mt-3 pl-2">
                <span className="inline-flex rounded-full border border-electric/35 bg-electric/10 px-2.5 py-0.5 text-[10px] font-semibold text-ink">{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Forecast vs actual" subtitle="Where demand departs from plan (weekly lens).">
          <ForecastChart data={forecastTrendWeekly} />
        </Panel>
        <Panel title="Forecast confidence" subtitle="Where the model is reliable vs where planners intervene.">
          <ConfidenceChart data={forecastTrendWeekly} />
        </Panel>
      </section>
    </div>
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
  tone: "emerald" | "electric" | "amber" | "danger";
}) {
  const map = {
    emerald: "border-emerald/45 bg-emerald/12 text-emerald",
    electric: "border-electric/45 bg-electric/10 text-electric",
    amber: "border-amber/50 bg-amber/12 text-amber",
    danger: "border-danger/45 bg-danger/12 text-danger",
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
