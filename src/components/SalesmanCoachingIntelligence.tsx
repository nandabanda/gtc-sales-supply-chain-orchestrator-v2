"use client";

import { useMemo, useState } from "react";
import { Filter, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildSalesmanCoachingRows,
  coachingKpiMetrics,
  type CoachingPriority,
  type CoachingStatus,
  type SalesmanCoachingRowView,
} from "@/lib/salesmanCoaching";
import { aiCoachingDecisions, salesmanCoachingSeed } from "@/data/salesmanCoachingSeed";

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

function PriorityBadge({ p }: { p: CoachingPriority }) {
  const map: Record<CoachingPriority, string> = {
    High: "border-danger/45 bg-danger/12 text-ink",
    Medium: "border-amber/50 bg-amber/14 text-ink",
    Watchlist: "border-amber/45 bg-amber/10 text-ink",
    Low: "border-emerald/45 bg-emerald/12 text-ink",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", map[p])}>
      {p}
    </span>
  );
}

function StatusBadge({ s }: { s: CoachingStatus }) {
  const map: Record<CoachingStatus, string> = {
    "High Risk": "border-danger/45 bg-danger/12 text-ink",
    Watchlist: "border-amber/50 bg-amber/12 text-ink",
    "Review Required": "border-amber/55 bg-amber/14 text-ink",
    "Supply constraint": "border-electric/45 bg-electric/12 text-ink",
    Recognized: "border-emerald/45 bg-emerald/14 text-ink",
    "On track": "border-emerald/40 bg-emerald/10 text-ink",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", map[s])}>{s}</span>
  );
}

export function SalesmanCoachingIntelligence() {
  const allRows = useMemo(() => buildSalesmanCoachingRows(salesmanCoachingSeed), []);
  const kpis = useMemo(() => coachingKpiMetrics(allRows), [allRows]);

  const salesmen = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.salesman))).sort()], [allRows]);
  const routes = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.route))).sort()], [allRows]);
  const vans = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.vanId))).sort()], [allRows]);
  const priorities = useMemo(
    () => ["All", ...Array.from(new Set(allRows.map((r) => r.coachingPriority))).sort()] as Array<CoachingPriority | "All">,
    [allRows],
  );
  const rootCauses = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.rootCause))).sort()], [allRows]);
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(allRows.map((r) => r.status))).sort()] as Array<CoachingStatus | "All">,
    [allRows],
  );

  const [salesmanFilter, setSalesmanFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");
  const [vanFilter, setVanFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState<CoachingPriority | "All">("All");
  const [rootCauseFilter, setRootCauseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<CoachingStatus | "All">("All");

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (salesmanFilter !== "All" && r.salesman !== salesmanFilter) return false;
      if (routeFilter !== "All" && r.route !== routeFilter) return false;
      if (vanFilter !== "All" && r.vanId !== vanFilter) return false;
      if (priorityFilter !== "All" && r.coachingPriority !== priorityFilter) return false;
      if (rootCauseFilter !== "All" && r.rootCause !== rootCauseFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      return true;
    });
  }, [allRows, salesmanFilter, routeFilter, vanFilter, priorityFilter, rootCauseFilter, statusFilter]);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/35">
            <GraduationCap className="h-5 w-5 text-electric" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">Salesman productivity & coaching intelligence</h3>
            <p className="mt-2 max-w-3xl text-sm text-muted">Supervisors diagnose underperformance across strike rate, basket, SKU mix, coverage, van alignment, and supply vs credit friction.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Salesmen needing coaching" value={kpis.needingCoaching} hint="High / medium priority / risk" tone="danger" />
          <SummaryCard label="Low strike-rate routes" value={kpis.lowStrikeRoutes} hint="Distinct routes under 60% strike" tone="amber" />
          <SummaryCard label="Missed high-value customers" value={kpis.missedHighValueCustomers} hint="Aggregate visits" tone="danger" />
          <SummaryCard label="Must-sell SKU gaps" value={kpis.mustSellGaps} hint="Adoption below 55%" tone="amber" />
          <SummaryCard label="Revenue recovery opportunity" value={kpis.revenueRecoveryOpportunity} hint="Synthetic uplift band" tone="emerald" />
          <SummaryCard label="Average productivity score" value={kpis.avgProductivityScore} hint="Fleet composite" tone="electric" />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Filters</h4>
          </div>
          <p className="text-xs text-ivory/45">
            {filteredRows.length} of {allRows.length} salesmen
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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
            Coaching priority
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as CoachingPriority | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {priorities.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Root cause
            <select
              value={rootCauseFilter}
              onChange={(e) => setRootCauseFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {rootCauses.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CoachingStatus | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {statuses.map((v) => (
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
            <h4 className="text-sm font-semibold text-ink">Salesman coaching matrix</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px] border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {[
                  "Salesman",
                  "Route",
                  "Van",
                  "Planned",
                  "Actual",
                  "Strike rate",
                  "Avg order (idx)",
                  "Basket (idx)",
                  "Must-sell %",
                  "Missed HV",
                  "Productivity",
                  "Root cause",
                  "Priority",
                  "Coaching action",
                  "Expected impact",
                  "Supervisor action",
                  "Confidence",
                  "Status",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <CoachingRow key={r.salesman} r={r} />
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-ink/55">No salesmen match the current filters.</p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
          <h4 className="text-lg font-semibold text-ivory">AI Coaching Decisions</h4>
        </div>
        <p className="mb-4 max-w-3xl text-sm text-muted">Narrative queue for today&apos;s supervisor stand-up — aligned to seeded scenarios.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {aiCoachingDecisions.map((line) => (
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

function CoachingRow({ r }: { r: SalesmanCoachingRowView }) {
  return (
    <tr className="border-t border-ink/[0.07] align-top hover:bg-ink/[0.02]">
      <td className="whitespace-nowrap px-2 py-3 font-medium text-ink/90">{r.salesman}</td>
      <td className="whitespace-nowrap px-2 py-3 text-ink/85">{r.route}</td>
      <td className="whitespace-nowrap px-2 py-3 text-ink/85">{r.vanId}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.plannedCalls}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.actualCalls}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold">{r.strikeRate}%</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.avgOrderValueIndex}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.basketSizeIndex}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.mustSellSkuAdoption}%</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums text-ink">{r.missedHighValueCustomers}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold text-ink">{r.salesmanProductivityScore}</td>
      <td className="max-w-[140px] px-2 py-3 text-xs leading-snug text-ink/85">{r.rootCause}</td>
      <td className="whitespace-nowrap px-2 py-3">
        <PriorityBadge p={r.coachingPriority} />
      </td>
      <td className="max-w-[220px] px-2 py-3 text-xs leading-snug text-ink/88">{r.recommendedCoachingAction}</td>
      <td className="max-w-[180px] px-2 py-3 text-xs leading-snug text-ink/80">{r.expectedImpact}</td>
      <td className="max-w-[200px] px-2 py-3 text-xs leading-snug text-ink/85">{r.supervisorAction}</td>
      <td className="whitespace-nowrap px-2 py-3">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold text-ink",
            r.reviewRequired ? "border-amber/50 bg-amber/15" : "border-emerald/40 bg-emerald/12",
          )}
        >
          {r.confidenceScore}
          {r.reviewRequired ? "% · Review" : "%"}
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-3">
        <StatusBadge s={r.status} />
      </td>
    </tr>
  );
}
