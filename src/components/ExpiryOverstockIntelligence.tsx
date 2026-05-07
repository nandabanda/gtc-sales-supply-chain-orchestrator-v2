"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildExpiryOverstockRows,
  expiryOverstockKpiMetrics,
  type ActionCategory,
  type ExpiryOverstockRowView,
  type ExpiryOverstockStatus,
  type RiskBand,
} from "@/lib/expiryOverstock";
import { aiExpiryOverstockDecisions, expiryOverstockSeed } from "@/data/expiryOverstockSeed";

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

function RiskBadge({ band }: { band: RiskBand }) {
  const map: Record<RiskBand, string> = {
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

function StatusBadge({ s }: { s: ExpiryOverstockStatus }) {
  const map: Record<ExpiryOverstockStatus, string> = {
    Safe: "border-emerald/45 bg-emerald/12 text-ink",
    "Review Required": "border-amber/55 bg-amber/14 text-ink",
    Urgent: "border-danger/50 bg-danger/12 text-ink",
    "Rebalance opportunity": "border-electric/45 bg-electric/12 text-ink",
    "Liquidation priority": "border-danger/40 bg-danger/10 text-ink",
    "Reduce dispatch": "border-amber/50 bg-amber/12 text-ink",
    Watchlist: "border-amber/48 bg-amber/11 text-ink",
  };
  return (
    <span className={cn("inline-flex max-w-[200px] rounded-full border px-2.5 py-0.5 text-[10px] font-semibold leading-tight", map[s])}>
      {s}
    </span>
  );
}

type Props = { variant?: "full" | "summary" };

export function ExpiryOverstockIntelligence({ variant = "full" }: Props) {
  const allRows = useMemo(() => buildExpiryOverstockRows(expiryOverstockSeed), []);
  const kpis = useMemo(() => expiryOverstockKpiMetrics(allRows), [allRows]);

  const skus = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.sku))).sort()], [allRows]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.category))).sort()], [allRows]);
  const routes = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.route))).sort()], [allRows]);
  const customers = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.customer))).sort()], [allRows]);
  const expiryBands = useMemo(
    () => ["All", "Low", "Medium", "High", "Critical"] as Array<RiskBand | "All">,
    [],
  );
  const overBands = useMemo(
    () => ["All", "Low", "Medium", "High", "Critical"] as Array<RiskBand | "All">,
    [],
  );
  const actionCats = useMemo(
    () =>
      ["All", ...Array.from(new Set(allRows.map((r) => r.actionCategory))).sort()] as Array<ActionCategory | "All">,
    [allRows],
  );
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(allRows.map((r) => r.status))).sort()] as Array<ExpiryOverstockStatus | "All">,
    [allRows],
  );

  const [skuFilter, setSkuFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState<RiskBand | "All">("All");
  const [overstockFilter, setOverstockFilter] = useState<RiskBand | "All">("All");
  const [actionFilter, setActionFilter] = useState<ActionCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ExpiryOverstockStatus | "All">("All");

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (skuFilter !== "All" && r.sku !== skuFilter) return false;
      if (categoryFilter !== "All" && r.category !== categoryFilter) return false;
      if (routeFilter !== "All" && r.route !== routeFilter) return false;
      if (customerFilter !== "All" && r.customer !== customerFilter) return false;
      if (expiryFilter !== "All" && r.expiryRiskBand !== expiryFilter) return false;
      if (overstockFilter !== "All" && r.overstockRiskBand !== overstockFilter) return false;
      if (actionFilter !== "All" && r.actionCategory !== actionFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      return true;
    });
  }, [
    allRows,
    skuFilter,
    categoryFilter,
    routeFilter,
    customerFilter,
    expiryFilter,
    overstockFilter,
    actionFilter,
    statusFilter,
  ]);

  if (variant === "summary") {
    return (
      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-6 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-electric" strokeWidth={1.75} />
          <h3 className="text-lg font-semibold text-ivory">Expiry & overstock snapshot</h3>
        </div>
        <p className="mb-5 max-w-2xl text-sm text-muted">
          Near-expiry rotation, slow-moving cover, and rebalance targets before write-offs (synthetic demo).
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard label="SKUs at expiry risk" value={kpis.skusAtExpiryRisk} tone="danger" />
          <SummaryCard label="Stock value at risk" value={kpis.stockValueAtRiskLabel} tone="amber" />
          <SummaryCard label="Avoidable expiry loss" value={kpis.avoidableExpiryLossLabel} tone="emerald" />
        </div>
        <ul className="mt-5 space-y-2 text-sm text-ivory/80">
          {aiExpiryOverstockDecisions.slice(0, 4).map((line) => (
            <li key={line} className="flex gap-2 border-l-2 border-electric/50 pl-3">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ivory/45">
          Full expiry & overstock matrix lives on <span className="text-electric">Replenishment Orchestrator</span>.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/35">
            <CalendarClock className="h-5 w-5 text-electric" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">Expiry & overstock risk intelligence</h3>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Shelf-life pressure, slow cover, liquidation vs rebalance paths, and salesman push guidance — no backend; synthetic scoring only.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="SKUs at expiry risk" value={kpis.skusAtExpiryRisk} hint="High / critical band" tone="danger" />
          <SummaryCard label="Overstocked SKUs" value={kpis.overstockedSkus} hint="Cover vs velocity" tone="amber" />
          <SummaryCard label="Stock value at risk" value={kpis.stockValueAtRiskLabel} hint="On-hand exposure" tone="danger" />
          <SummaryCard label="Avoidable expiry loss" value={kpis.avoidableExpiryLossLabel} hint="Sell-through upside" tone="emerald" />
          <SummaryCard label="Rebalance opportunities" value={kpis.rebalanceOpportunities} hint="Transfer-fit signals" tone="electric" />
          <SummaryCard label="Liquidation actions required" value={kpis.liquidationActionsRequired} hint="Urgent / high priority" tone="amber" />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Filters</h4>
          </div>
          <p className="text-xs text-ivory/45">
            {filteredRows.length} of {allRows.length} rows
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            SKU
            <select
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {skus.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Category
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {categories.map((v) => (
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
            Expiry risk
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as RiskBand | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {expiryBands.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Overstock risk
            <select
              value={overstockFilter}
              onChange={(e) => setOverstockFilter(e.target.value as RiskBand | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {overBands.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Recommended action
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionCategory | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {actionCats.map((v) => (
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
              onChange={(e) => setStatusFilter(e.target.value as ExpiryOverstockStatus | "All")}
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
            <h4 className="text-sm font-semibold text-ink">Expiry & overstock risk matrix</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1760px] border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {[
                  "SKU",
                  "Category",
                  "Route",
                  "Customer",
                  "Stock",
                  "Days cover",
                  "Days to expiry",
                  "Velocity",
                  "Expiry risk",
                  "Overstock risk",
                  "Value at risk",
                  "Avoidable loss",
                  "Liq. priority",
                  "Rebalance?",
                  "Dest. route",
                  "Dest. customer",
                  "Salesman push",
                  "Recommended action",
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
                <ExpiryRow key={r.rowKey} r={r} />
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
          <h4 className="text-lg font-semibold text-ivory">AI Expiry & Overstock Decisions</h4>
        </div>
        <p className="mb-4 max-w-3xl text-sm text-muted">Controller queue — static narratives for weekly expiry council.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {aiExpiryOverstockDecisions.map((line) => (
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

function ExpiryRow({ r }: { r: ExpiryOverstockRowView }) {
  return (
    <tr className="border-t border-ink/[0.07] align-top hover:bg-ink/[0.02]">
      <td className="whitespace-nowrap px-2 py-3 font-semibold text-ink/90">{r.sku}</td>
      <td className="max-w-[120px] px-2 py-3 text-xs text-ink/85">{r.category}</td>
      <td className="whitespace-nowrap px-2 py-3 text-ink/85">{r.route}</td>
      <td className="max-w-[160px] px-2 py-3 text-xs text-ink/85">{r.customer}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.currentStockUnits}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.daysCover}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-medium">{r.daysToExpiry}</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold">{r.velocityScore}</td>
      <td className="whitespace-nowrap px-2 py-3">
        <div className="flex flex-col gap-1">
          <RiskBadge band={r.expiryRiskBand} />
          <span className="text-[10px] text-ink/45">{r.expiryRiskScore}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-2 py-3">
        <div className="flex flex-col gap-1">
          <RiskBadge band={r.overstockRiskBand} />
          <span className="text-[10px] text-ink/45">{r.overstockRiskScore}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold">SAR {r.stockValueAtRisk}K</td>
      <td className="whitespace-nowrap px-2 py-3 tabular-nums">SAR {r.avoidableExpiryLoss}K</td>
      <td className="whitespace-nowrap px-2 py-3">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            r.liquidationPriority === "Urgent" || r.liquidationPriority === "High"
              ? "border-danger/45 bg-danger/12 text-ink"
              : "border-ink/15 bg-ink/[0.05] text-ink/80",
          )}
        >
          {r.liquidationPriority}
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-3">
        <span
          className={cn(
            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            r.rebalanceOpportunity ? "border-emerald/45 bg-emerald/12 text-ink" : "border-ink/15 bg-ink/[0.05] text-ink/50",
          )}
        >
          {r.rebalanceOpportunity ? "Yes" : "No"}
        </span>
      </td>
      <td className="whitespace-nowrap px-2 py-3 text-xs text-ink/85">{r.suggestedDestinationRoute}</td>
      <td className="max-w-[140px] px-2 py-3 text-xs text-ink/85">{r.suggestedDestinationCustomer}</td>
      <td className="max-w-[220px] px-2 py-3 text-xs leading-snug text-ink/88">{r.salesmanPushRecommendation}</td>
      <td className="max-w-[240px] px-2 py-3 text-xs leading-snug text-ink/88">
        <p className="font-medium text-ink/90">{r.recommendedAction}</p>
        <p className="mt-1 text-[11px] text-ink/55">{r.actionReason}</p>
      </td>
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
