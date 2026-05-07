"use client";

import { useMemo, useState } from "react";
import { Filter, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildCustomerOpportunityRows,
  customerOpportunityKpiMetrics,
  type ChurnRiskBand,
  type CustomerOpportunityRowView,
  type CustomerOpportunityStatus,
  type OpportunityLevel,
} from "@/lib/customerOpportunity";
import { aiCustomerOpportunityDecisions, customerOpportunitySeed } from "@/data/customerOpportunitySeed";

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

function ChurnBadge({ band }: { band: ChurnRiskBand }) {
  const map: Record<ChurnRiskBand, string> = {
    Low: "border-emerald/45 bg-emerald/12 text-ink",
    Medium: "border-amber/50 bg-amber/14 text-ink",
    High: "border-danger/45 bg-danger/12 text-ink",
    Critical: "border-danger/55 bg-danger/15 text-ink",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", map[band])}>
      {band}
    </span>
  );
}

function OpportunityBadge({ level }: { level: OpportunityLevel }) {
  const map: Record<OpportunityLevel, string> = {
    High: "border-danger/40 bg-danger/10 text-ink",
    Medium: "border-amber/50 bg-amber/12 text-ink",
    Low: "border-emerald/45 bg-emerald/12 text-ink",
    Standard: "border-ink/15 bg-ink/[0.06] text-ink/80",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", map[level])}>
      {level}
    </span>
  );
}

function StatusBadge({ s }: { s: CustomerOpportunityStatus }) {
  const map: Record<CustomerOpportunityStatus, string> = {
    Healthy: "border-emerald/45 bg-emerald/12 text-ink",
    "Growth opportunity": "border-electric/45 bg-electric/12 text-ink",
    "Churn risk": "border-danger/45 bg-danger/12 text-ink",
    "Recover priority": "border-danger/40 bg-danger/10 text-ink",
    "Review Required": "border-amber/55 bg-amber/14 text-ink",
    Watchlist: "border-amber/50 bg-amber/11 text-ink",
    "Standard service": "border-ink/15 bg-ink/[0.06] text-ink/75",
    "Credit friction": "border-electric/40 bg-electric/10 text-ink",
  };
  return (
    <span className={cn("inline-flex max-w-[180px] rounded-full border px-2.5 py-0.5 text-[10px] font-semibold leading-tight", map[s])}>
      {s}
    </span>
  );
}

export function CustomerOpportunityIntelligence() {
  const allRows = useMemo(() => buildCustomerOpportunityRows(customerOpportunitySeed), []);
  const kpis = useMemo(() => customerOpportunityKpiMetrics(allRows), [allRows]);

  const customers = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.customerId))).sort()], [allRows]);
  const channels = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.channel))).sort()], [allRows]);
  const routes = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.route))).sort()], [allRows]);
  const salesmen = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.salesman))).sort()], [allRows]);
  const churnBands = useMemo(
    () => ["All", "Low", "Medium", "High", "Critical"] as Array<ChurnRiskBand | "All">,
    [],
  );
  const oppLevels = useMemo(
    () => ["All", "High", "Medium", "Low", "Standard"] as Array<OpportunityLevel | "All">,
    [],
  );
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(allRows.map((r) => r.status))).sort()] as Array<CustomerOpportunityStatus | "All">,
    [allRows],
  );

  const [customerFilter, setCustomerFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");
  const [salesmanFilter, setSalesmanFilter] = useState("All");
  const [churnFilter, setChurnFilter] = useState<ChurnRiskBand | "All">("All");
  const [opportunityFilter, setOpportunityFilter] = useState<OpportunityLevel | "All">("All");
  const [statusFilter, setStatusFilter] = useState<CustomerOpportunityStatus | "All">("All");

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (customerFilter !== "All" && r.customerId !== customerFilter) return false;
      if (channelFilter !== "All" && r.channel !== channelFilter) return false;
      if (routeFilter !== "All" && r.route !== routeFilter) return false;
      if (salesmanFilter !== "All" && r.salesman !== salesmanFilter) return false;
      if (churnFilter !== "All" && r.churnRiskBand !== churnFilter) return false;
      if (opportunityFilter !== "All" && r.opportunityLevel !== opportunityFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      return true;
    });
  }, [allRows, customerFilter, channelFilter, routeFilter, salesmanFilter, churnFilter, opportunityFilter, statusFilter]);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/35">
            <Target className="h-5 w-5 text-electric" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">Customer strike rate & opportunity intelligence</h3>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Missed coverage, underserved high-potential outlets, churn risk, revenue gap, and SKU / visit recommendations — synthetic scoring (no backend).
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Missed customers" value={kpis.missedCustomers} hint="Visits short vs plan" tone="danger" />
          <SummaryCard
            label="High-potential low-service"
            value={kpis.highPotentialLowService}
            hint="Whitespace vs visits"
            tone="amber"
          />
          <SummaryCard label="Customers at churn risk" value={kpis.churnAtRisk} hint="High / critical band" tone="danger" />
          <SummaryCard label="Revenue gap opportunity" value={kpis.revenueGapOpportunity} hint="Aggregate upside band" tone="emerald" />
          <SummaryCard label="SKU expansion opportunities" value={kpis.skuExpansionOpportunities} hint="Basket / must-sell gap" tone="electric" />
          <SummaryCard label="Visit frequency upgrades" value={kpis.visitFrequencyUpgrades} hint="AI recommends more touches" tone="amber" />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Filters</h4>
          </div>
          <p className="text-xs text-ivory/45">
            {filteredRows.length} of {allRows.length} customers
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Customer
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {customers.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Channel
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {channels.map((v) => (
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
            Churn risk
            <select
              value={churnFilter}
              onChange={(e) => setChurnFilter(e.target.value as ChurnRiskBand | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {churnBands.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Opportunity level
            <select
              value={opportunityFilter}
              onChange={(e) => setOpportunityFilter(e.target.value as OpportunityLevel | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {oppLevels.map((v) => (
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
              onChange={(e) => setStatusFilter(e.target.value as CustomerOpportunityStatus | "All")}
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
            <h4 className="text-sm font-semibold text-ink">Customer opportunity matrix</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1680px] border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {[
                  "Customer",
                  "Channel",
                  "Route",
                  "Salesman",
                  "Planned visits",
                  "Actual visits",
                  "Strike rate",
                  "Exp. freq",
                  "Act. freq",
                  "Revenue gap",
                  "Service gap",
                  "Churn risk",
                  "Opp. score",
                  "SKU rec.",
                  "Visit freq rec.",
                  "Next best action",
                  "Expected impact",
                  "Owner",
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
                <OpportunityRow key={r.customerId} r={r} />
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-ink/55">No customers match the current filters.</p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
          <h4 className="text-lg font-semibold text-ivory">AI Customer Opportunity Decisions</h4>
        </div>
        <p className="mb-4 max-w-3xl text-sm text-muted">Supervisor queue — static narratives aligned to seeded customer scenarios.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {aiCustomerOpportunityDecisions.map((line) => (
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

function OpportunityRow({ r }: { r: CustomerOpportunityRowView }) {
  return (
    <tr className="border-t border-ink/[0.07] align-top hover:bg-ink/[0.02]">
      <td className="px-2 py-3">
        <p className="font-semibold text-ink/90">{r.customerId}</p>
        <p className="max-w-[140px] text-xs text-ink/65">{r.displayName}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <OpportunityBadge level={r.opportunityLevel} />
        </div>
      </td>
      <td className="whitespace-nowrap px-2 py-3 text-ink/85">{r.channel}</td>
      <td className="whitespace-nowrap px-2 py-3 text-ink/85">{r.route}</td>
      <td className="max-w-[120px] px-2 py-3 text-xs text-ink/85">{r.salesman}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.plannedVisitsPerCycle}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.actualVisitsPerCycle}</td>
      <td className="whitespace-nowrap px-2 py-3">
        <span className="font-semibold tabular-nums">{r.customerStrikeRate}%</span>
        <span className="ml-1 text-[10px] text-ink/45">{r.strikeRateStatus}</span>
      </td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.expectedPurchaseFrequency}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.actualPurchaseFrequency}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold text-ink">
        {r.revenueGap >= 0 ? "+" : ""}
        {r.revenueGap} SAR/mo
      </td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.serviceGap}</td>
      <td className="whitespace-nowrap px-2 py-3">
        <span className="tabular-nums font-medium">{r.churnRisk}</span>
        <div className="mt-0.5">
          <ChurnBadge band={r.churnRiskBand} />
        </div>
      </td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold">{r.customerOpportunityScore}</td>
      <td className="max-w-[200px] px-2 py-3 text-xs leading-snug text-ink/85">{r.skuRecommendation}</td>
      <td className="max-w-[200px] px-2 py-3 text-xs leading-snug text-ink/85">{r.visitFrequencyRecommendation}</td>
      <td className="max-w-[220px] px-2 py-3 text-xs leading-snug text-ink/88">{r.nextBestAction}</td>
      <td className="max-w-[180px] px-2 py-3 text-xs leading-snug text-ink/80">{r.expectedImpact}</td>
      <td className="whitespace-nowrap px-2 py-3 text-xs font-medium text-ink/90">{r.owner}</td>
      <td className="whitespace-nowrap px-2 py-3">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold text-ink",
            r.confidenceScore < 52 ? "border-amber/50 bg-amber/15" : "border-emerald/40 bg-emerald/12",
          )}
        >
          {r.confidenceScore}%
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-3">
        <StatusBadge s={r.status} />
      </td>
    </tr>
  );
}
