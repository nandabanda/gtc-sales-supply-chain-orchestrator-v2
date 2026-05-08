"use client";

import { useMemo, useState } from "react";
import { Filter, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildVanLoadingRows,
  vanLoadingKpiMetrics,
  type DispatchKind,
  type RiskLevel,
  type VanLoadingRowView,
} from "@/lib/vanLoading";
import { aiVanLoadingDecisions, vanLoadingSeed } from "@/data/vanLoadingSeed";

const dispatchKinds: Array<DispatchKind | "All"> = [
  "All",
  "Urgent uplift",
  "Review required",
  "Reduce load",
  "Liquidate / rebalance",
  "Credit-capped",
  "Utilization fill",
  "Focused basket",
  "Standard",
];

const priorityTiers: Array<RiskLevel | "All"> = ["All", "High", "Medium", "Low"];

function YesNoBadge({ value, goodWhenTrue }: { value: boolean; goodWhenTrue?: boolean }) {
  const on = value;
  const isGood = goodWhenTrue ? on : !on;
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        on
          ? isGood
            ? "border-emerald/50 bg-emerald/12 text-ink"
            : "border-amber/50 bg-amber/15 text-ink"
          : "border-ink/15 bg-ink/[0.04] text-ink/50",
      )}
    >
      {on ? "Yes" : "No"}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone = "electric",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "electric" | "amber" | "danger" | "emerald";
}) {
  const ring: Record<string, string> = {
    electric: "from-electric/80 to-electric/20",
    amber: "from-amber/80 to-amber/20",
    danger: "from-danger/80 to-danger/20",
    emerald: "from-emerald/80 to-emerald/20",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ivory/10 bg-[#0a121c] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] ring-1 ring-ivory/[0.05]">
      <div className={cn("absolute left-0 top-0 h-full w-1 bg-gradient-to-b", ring[tone])} aria-hidden />
      <p className="pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/45">{label}</p>
      <p className="mt-2 pl-3 text-2xl font-semibold tabular-nums text-ivory">{value}</p>
      {hint && <p className="mt-1.5 pl-3 text-xs text-ivory/50">{hint}</p>}
    </div>
  );
}

type Props = { variant?: "full" | "summary" };

export function VanLoadingIntelligence({ variant = "full" }: Props) {
  const allRows = useMemo(() => buildVanLoadingRows(vanLoadingSeed), []);
  const kpis = useMemo(() => vanLoadingKpiMetrics(allRows), [allRows]);

  const vans = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.vanId))).sort()], [allRows]);
  const routes = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.route))).sort()], [allRows]);
  const salesmen = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.salesman))).sort()], [allRows]);

  const [vanFilter, setVanFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");
  const [salesmanFilter, setSalesmanFilter] = useState("All");
  const [skuFilter, setSkuFilter] = useState("");
  const [dispatchFilter, setDispatchFilter] = useState<DispatchKind | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<RiskLevel | "All">("All");

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (vanFilter !== "All" && r.vanId !== vanFilter) return false;
      if (routeFilter !== "All" && r.route !== routeFilter) return false;
      if (salesmanFilter !== "All" && r.salesman !== salesmanFilter) return false;
      if (skuFilter.trim() && !r.sku.toLowerCase().includes(skuFilter.toLowerCase().trim())) return false;
      if (dispatchFilter !== "All" && r.dispatchKind !== dispatchFilter) return false;
      if (priorityFilter !== "All" && r.priorityTier !== priorityFilter) return false;
      return true;
    });
  }, [allRows, vanFilter, routeFilter, salesmanFilter, skuFilter, dispatchFilter, priorityFilter]);

  if (variant === "summary") {
    return (
      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-6 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-electric" strokeWidth={1.75} />
          <h3 className="text-lg font-semibold text-ivory">Van loading snapshot</h3>
        </div>
        <p className="mb-5 max-w-2xl text-sm text-muted">Dispatch planning for utilization gaps, must-load SKUs, and expiry rotations.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard label="Vans needing load correction" value={kpis.vansNeedingCorrection} tone="amber" />
          <SummaryCard label="Must-load SKUs" value={kpis.mustLoad} tone="emerald" />
          <SummaryCard label="Avg load utilization (fleet)" value={`${kpis.avgUtilization}%`} tone="electric" />
        </div>
        <ul className="mt-5 space-y-2 text-sm text-ivory/80">
          {aiVanLoadingDecisions.slice(0, 3).map((line) => (
            <li key={line} className="flex gap-2 border-l-2 border-electric/50 pl-3">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ivory/45">
          Full van loading intelligence lives on <span className="text-electric">Replenishment Orchestrator</span>.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">Van loading intelligence</h3>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Tomorrow&apos;s manifest logic: must-load, reductions, expiry liquidation, credit caps, and utilization — tied to customer replenishment (no backend).
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            label="Vans needing load correction"
            value={kpis.vansNeedingCorrection}
            hint="Gap, must-load, or reduce flags"
            tone="amber"
          />
          <SummaryCard label="Must-load SKUs" value={kpis.mustLoad} tone="emerald" />
          <SummaryCard label="Reduce-load SKUs" value={kpis.reduceLoad} tone="danger" />
          <SummaryCard label="Near-expiry liquidation actions" value={kpis.expiryLiq} tone="amber" />
          <SummaryCard label="Average load utilization" value={`${kpis.avgUtilization}%`} hint="Unique vans" tone="electric" />
          <SummaryCard
            label="Expected revenue protected"
            value={kpis.revenueProtectedLabel}
            hint="Estimated from load gap and margin"
            tone="emerald"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Filters</h4>
          </div>
          <p className="text-xs text-ivory/45">
            {filteredRows.length} of {allRows.length} lines
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Van
            <select
              value={vanFilter}
              onChange={(e) => setVanFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {vans.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Route
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {routes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Salesman
            <select
              value={salesmanFilter}
              onChange={(e) => setSalesmanFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {salesmen.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            SKU
            <input
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              placeholder="Contains…"
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/35 outline-none ring-1 ring-black/20 focus:border-electric/40"
            />
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Dispatch action
            <select
              value={dispatchFilter}
              onChange={(e) => setDispatchFilter(e.target.value as DispatchKind | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {dispatchKinds.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Risk / priority level
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as RiskLevel | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {priorityTiers.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
        <div className="border-b border-ink/10 bg-ivory px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
            <h4 className="text-sm font-semibold text-ink">Dispatch manifest recommendations</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {[
                  "Van",
                  "Route",
                  "Salesman",
                  "SKU",
                  "Current load",
                  "Recommended load",
                  "Load gap",
                  "Utilization",
                  "Priority",
                  "Must",
                  "Reduce",
                  "Expiry Liq.",
                  "Dispatch action",
                  "Confidence",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <VanRow key={`${r.vanId}-${r.sku}-${idx}`} r={r} />
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-ink/55">No rows match the current filters.</p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
          <h4 className="text-lg font-semibold text-ivory">AI Van Loading Decisions</h4>
        </div>
        <p className="mb-4 max-w-3xl text-sm text-muted">Dispatch decisions for tomorrow&apos;s run.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {aiVanLoadingDecisions.map((line) => (
            <li
              key={line}
              className="relative overflow-hidden rounded-xl border border-ink/10 bg-ivory px-4 py-3.5 pl-5 text-sm font-medium leading-snug text-ink/90 shadow-md ring-1 ring-black/[0.04]"
            >
              <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-electric via-electric/75 to-electric/25" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function TierBadge({ tier }: { tier: RiskLevel }) {
  const map: Record<RiskLevel, string> = {
    High: "border-danger/40 bg-danger/10 text-ink",
    Medium: "border-amber/50 bg-amber/12 text-ink",
    Low: "border-emerald/45 bg-emerald/12 text-ink",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", map[tier])}>
      {tier}
    </span>
  );
}

function VanRow({ r }: { r: VanLoadingRowView }) {
  const gapTone = r.loadGap > 0 ? "text-emerald" : r.loadGap < 0 ? "text-danger" : "text-ivory/70";
  return (
    <tr className="border-t border-ink/[0.07] hover:bg-ink/[0.02]">
      <td className="whitespace-nowrap px-2 py-3 font-medium text-ink/90">{r.vanId}</td>
      <td className="whitespace-nowrap px-2 py-3 text-ink/85">{r.route}</td>
      <td className="max-w-[120px] px-2 py-3 text-xs text-ink/85">{r.salesman}</td>
      <td className="max-w-[150px] px-2 py-3 text-xs text-ink/85">{r.sku}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.currentLoadQty}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold text-ink">{r.recommendedLoadQty}</td>
      <td className={cn("whitespace-nowrap px-2 py-3 tabular-nums font-semibold", gapTone)}>{r.loadGap > 0 ? `+${r.loadGap}` : r.loadGap}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums text-ink/90">{r.loadUtilization}%</td>
      <td className="whitespace-nowrap px-2 py-3">
        <TierBadge tier={r.priorityTier} />
        <span className="ml-1 text-[10px] text-ink/50">{r.priorityScore}</span>
      </td>
      <td className="px-2 py-3">
        <YesNoBadge value={r.mustLoadFlag} goodWhenTrue />
      </td>
      <td className="px-2 py-3">
        <YesNoBadge value={r.reduceLoadFlag} />
      </td>
      <td className="px-2 py-3">
        <YesNoBadge value={r.expiryLiquidationFlag} />
      </td>
      <td className="max-w-[240px] px-2 py-3 text-xs leading-snug text-ink/85">{r.dispatchAction}</td>
      <td className="whitespace-nowrap px-2 py-3">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold text-ink",
            r.reviewRequired ? "border-amber/50 bg-amber/15" : "border-emerald/40 bg-emerald/12",
          )}
        >
          {r.confidenceScore}%{r.reviewRequired ? " · Review" : ""}
        </span>
      </td>
    </tr>
  );
}
