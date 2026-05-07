"use client";

import { useMemo, useState } from "react";
import { Filter, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildRouteOptimizationRows,
  routeOptimizationKpis,
  type RouteActionKind,
  type SlaRiskBucket,
} from "@/lib/routeOptimization";
import { aiRouteOptimizationDecisions, routeOptimizationSeed } from "@/data/routeOptimizationSeed";

const routeActions: Array<RouteActionKind | "All"> = [
  "All",
  "Re-sequence earlier",
  "SLA window priority",
  "Focus visit plan",
  "Credit approval queue",
  "Liquidation priority",
  "Defer / lower priority",
  "Standard",
];

const slaBuckets: Array<SlaRiskBucket | "All"> = ["All", "High", "Medium", "Low"];

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

function SlaBadge({ bucket }: { bucket: SlaRiskBucket }) {
  const map: Record<SlaRiskBucket, string> = {
    High: "border-danger/40 bg-danger/10 text-ink",
    Medium: "border-amber/50 bg-amber/12 text-ink",
    Low: "border-emerald/45 bg-emerald/12 text-ink",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", map[bucket])}>
      {bucket}
    </span>
  );
}

function SeqChange({ v }: { v: number }) {
  if (v === 0) return <span className="tabular-nums text-ink/55">0</span>;
  const tone = v > 0 ? "text-emerald" : "text-danger";
  return <span className={cn("font-semibold tabular-nums", tone)}>{v > 0 ? `+${v}` : v}</span>;
}

export function RouteOptimizationIntelligence() {
  const allRows = useMemo(() => buildRouteOptimizationRows(routeOptimizationSeed), []);
  const kpis = useMemo(() => routeOptimizationKpis(allRows), [allRows]);

  const routes = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.route))).sort()], [allRows]);
  const vans = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.vanId))).sort()], [allRows]);
  const salesmen = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.salesman))).sort()], [allRows]);

  const [routeFilter, setRouteFilter] = useState("All");
  const [vanFilter, setVanFilter] = useState("All");
  const [salesmanFilter, setSalesmanFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("");
  const [slaFilter, setSlaFilter] = useState<SlaRiskBucket | "All">("All");
  const [actionFilter, setActionFilter] = useState<RouteActionKind | "All">("All");
  const [supervisorFilter, setSupervisorFilter] = useState<"All" | "Yes" | "No">("All");

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (routeFilter !== "All" && r.route !== routeFilter) return false;
      if (vanFilter !== "All" && r.vanId !== vanFilter) return false;
      if (salesmanFilter !== "All" && r.salesman !== salesmanFilter) return false;
      if (customerFilter.trim() && !r.customerDisplay.toLowerCase().includes(customerFilter.toLowerCase().trim()))
        return false;
      if (slaFilter !== "All" && r.slaRiskBucket !== slaFilter) return false;
      if (actionFilter !== "All" && r.routeAction !== actionFilter) return false;
      if (supervisorFilter === "Yes" && !r.supervisorApprovalRequired) return false;
      if (supervisorFilter === "No" && r.supervisorApprovalRequired) return false;
      return true;
    });
  }, [allRows, routeFilter, vanFilter, salesmanFilter, customerFilter, slaFilter, actionFilter, supervisorFilter]);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-2 flex items-center gap-2">
          <MapPinned className="h-6 w-6 text-electric" strokeWidth={1.75} />
          <h3 className="text-lg font-semibold text-ivory">Route optimization intelligence</h3>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Sequence rank connects replenishment and van readiness to SLA, revenue protection, strike uplift, and supervisor governance — synthetic demo rules only.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Routes optimized" value={kpis.routesOptimized} hint="Routes with sequence changes" tone="electric" />
          <SummaryCard label="SLA-critical customers" value={kpis.slaCriticalCustomers} tone="danger" />
          <SummaryCard label="Revenue protected (rollup)" value={kpis.revenueProtectedLabel} tone="emerald" />
          <SummaryCard label="Missed-call exposure reduced" value={`${kpis.missedCallsPrevented} pts`} hint="Synthetic index" tone="amber" />
          <SummaryCard label="Average time saving / stop" value={kpis.avgTimeSaving} tone="electric" />
          <SummaryCard label="Supervisor approvals required" value={kpis.supervisorApprovalsRequired} tone="amber" />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Filters</h4>
          </div>
          <p className="text-xs text-ivory/45">
            {filteredRows.length} of {allRows.length} stops
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
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
            Customer
            <input
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Contains…"
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/35 outline-none ring-1 ring-black/20 focus:border-electric/40"
            />
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            SLA risk
            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value as SlaRiskBucket | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {slaBuckets.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Route action
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as RouteActionKind | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {routeActions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Supervisor approval
            <select
              value={supervisorFilter}
              onChange={(e) => setSupervisorFilter(e.target.value as "All" | "Yes" | "No")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {(["All", "Yes", "No"] as const).map((v) => (
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
            <h4 className="text-sm font-semibold text-ink">Visit sequence — current vs optimized</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {[
                  "Route",
                  "Van",
                  "Salesman",
                  "Customer",
                  "Current #",
                  "Optimized #",
                  "Δ Seq",
                  "Priority",
                  "SLA",
                  "Revenue @ risk",
                  "Strike opp.",
                  "Time save",
                  "Dist. save",
                  "Route action",
                  "Supervisor",
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
                <tr key={`${r.route}-${r.customerDisplay}-${idx}`} className="border-t border-ink/[0.07] hover:bg-ink/[0.02]">
                  <td className="whitespace-nowrap px-2 py-3 font-medium">{r.route}</td>
                  <td className="whitespace-nowrap px-2 py-3">{r.vanId}</td>
                  <td className="max-w-[110px] px-2 py-3 text-xs">{r.salesman}</td>
                  <td className="max-w-[180px] px-2 py-3 text-xs">{r.customerDisplay}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.currentSequence}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold">{r.optimizedSequence}</td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <SeqChange v={r.sequenceChange} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.customerPriorityScore}</td>
                  <td className="px-2 py-3">
                    <SlaBadge bucket={r.slaRiskBucket} />
                    <span className="ml-1 text-[10px] text-ink/45">{r.slaRisk}</span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 font-medium text-ink">{r.revenueAtRisk}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.strikeRateOpportunity}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-xs">{r.timeSaving}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-xs">{r.distanceSaving}</td>
                  <td className="max-w-[200px] px-2 py-3 text-xs leading-snug">{r.routeAction}</td>
                  <td className="px-2 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        r.supervisorApprovalRequired
                          ? "border-amber/50 bg-amber/15 text-ink"
                          : "border-emerald/45 bg-emerald/12 text-ink",
                      )}
                    >
                      {r.supervisorApprovalRequired ? "Required" : "No"}
                    </span>
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-ink/55">No stops match the current filters.</p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
          <h4 className="text-lg font-semibold text-ivory">AI Route Optimization Decisions</h4>
        </div>
        <p className="mb-4 max-w-3xl text-sm text-muted">Static dispatch narratives for leadership review — aligned to GTC demo routes.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {aiRouteOptimizationDecisions.map((line) => (
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
