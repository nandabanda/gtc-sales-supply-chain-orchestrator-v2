"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReplenishmentRowView, RiskLevel } from "@/lib/replenishment";
import { aiReplenishmentDecisions } from "@/data/replenishmentEngineSeed";

function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, string> = {
    High: "border-danger/45 bg-danger/15 text-ivory",
    Medium: "border-amber/50 bg-amber/18 text-ivory",
    Low: "border-emerald/45 bg-emerald/14 text-ivory",
  };
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[level])}>
      {level}
    </span>
  );
}

function PctRisk({ value }: { value: number }) {
  let tone = "text-emerald";
  if (value >= 66) tone = "text-danger";
  else if (value >= 38) tone = "text-amber";
  return <span className={cn("tabular-nums font-semibold", tone)}>{value}%</span>;
}

export function ReplenishmentEngine({ rows: allRows }: { rows: ReplenishmentRowView[] }) {
  const routes = useMemo(() => ["All", ...Array.from(new Set(allRows.map((r) => r.route))).sort()], [allRows]);
  const riskLevels: Array<RiskLevel | "All"> = ["All", "High", "Medium", "Low"];

  const [routeFilter, setRouteFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("");
  const [skuFilter, setSkuFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");

  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (routeFilter !== "All" && r.route !== routeFilter) return false;
      if (riskFilter !== "All" && r.riskLevel !== riskFilter) return false;
      if (customerFilter.trim() && !r.customerDisplay.toLowerCase().includes(customerFilter.toLowerCase().trim())) return false;
      if (skuFilter.trim() && !`${r.skuCode} ${r.skuName}`.toLowerCase().includes(skuFilter.toLowerCase().trim())) return false;
      return true;
    });
  }, [allRows, routeFilter, customerFilter, skuFilter, riskFilter]);

  const kpis = useMemo(() => computeKpis(filteredRows), [filteredRows]);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">Replenishment recommendations</h3>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          ROP-first engine (ADS, lead-time demand, safety stock, MOQ, EOQ). Credit, expiry, and van signals cap or explain variance.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <MiniKpi label="Lanes with pick signal" value={kpis.needingReplenishment} hint="Suggested qty &gt; 0" />
          <MiniKpi label="Stockout risk (engine)" value={kpis.stockoutRisky} hint="Risk ≥ 55%" tone="danger" />
          <MiniKpi label="Expiry risk" value={kpis.expiryRisky} hint="Risk ≥ 55%" tone="amber" />
          <MiniKpi label="Credit-capped" value={kpis.creditCapped} hint="Tier ceiling hit" tone="amber" />
          <MiniKpi label="Vans &lt; 72% util" value={kpis.vanOpportunity} hint="Fill opportunity" tone="electric" />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Filters</h4>
          </div>
          <p className="text-xs text-ivory/45">
            {filteredRows.length} of {allRows.length} lanes
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Route
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {routes.map((r) => (
                <option key={r} value={r}>
                  {r}
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
            SKU
            <input
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              placeholder="Code or name…"
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/35 outline-none ring-1 ring-black/20 focus:border-electric/40"
            />
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Risk level
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
              className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
            >
              {riskLevels.map((r) => (
                <option key={r} value={r}>
                  {r}
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
            <h4 className="text-sm font-semibold text-ink">ROP replenishment table</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[2200px] border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {[
                  "Customer",
                  "Route",
                  "SKU",
                  "ADS",
                  "Current",
                  "In-transit",
                  "Open PO",
                  "Pending SO",
                  "Net avail.",
                  "Days cover",
                  "LT (d)",
                  "Safety stk",
                  "ROP",
                  "Raw reorder",
                  "MOQ qty",
                  "Supplier",
                  "Risk",
                  "Action",
                  "Conf.",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <tr key={`${r.customerDisplay}-${r.skuCode}-${idx}`} className="border-t border-ink/[0.07] align-top hover:bg-ink/[0.02]">
                  <td className="max-w-[200px] px-2 py-3 font-medium text-ink/90">{r.customerDisplay}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-ink/85">{r.route}</td>
                  <td className="max-w-[140px] px-2 py-3 text-xs leading-snug text-ink/85">
                    <span className="font-semibold text-ink">{r.skuCode}</span>
                    <br />
                    {r.skuName}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.ads.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.currentStockCases}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.inTransitCases}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.openPoCases}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.pendingSalesOrderCases}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums font-medium">{Math.round(r.netAvailableStock)}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.daysOfCover.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.leadTimeDays}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{r.safetyStock.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold text-electric">{Math.round(r.reorderPoint)}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums">{Math.round(r.suggestedReorderRaw)}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold">{r.moqAdjustedQty}</td>
                  <td className="max-w-[200px] px-2 py-3 text-[11px] leading-snug text-ink/75">{r.supplierName}</td>
                  <td className="px-2 py-3">
                    <RiskBadge level={r.riskLevel} />
                    <div className="mt-1 flex flex-wrap gap-1 text-[9px] text-ink/50">
                      <span>
                        S:<PctRisk value={r.stockoutRisk} />
                      </span>
                      <span>
                        O:<PctRisk value={r.overstockRisk} />
                      </span>
                      <span>
                        E:<PctRisk value={r.expiryRisk} />
                      </span>
                      <span>
                        C:<PctRisk value={r.creditRiskScore} />
                      </span>
                    </div>
                  </td>
                  <td className="max-w-[260px] px-2 py-3 text-xs leading-snug text-ink/85">
                    <p className="font-medium text-ink">{r.actionRecommendation}</p>
                    <p className="mt-1 text-[11px] text-ink/55">{r.driverSummary}</p>
                    <p className="mt-1 text-[11px] text-danger/90">If no action: {r.noActionConsequence}</p>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        r.reviewRequired ? "border-amber/50 bg-amber/15 text-ink" : "border-emerald/40 bg-emerald/12 text-ink",
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
        {filteredRows.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink/55">No lanes match filters.</p>}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
          <h4 className="text-lg font-semibold text-ivory">Controller narrative queue</h4>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {aiReplenishmentDecisions.map((line) => (
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

function MiniKpi({
  label,
  value,
  hint,
  tone = "ivory",
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "ivory" | "danger" | "amber" | "electric";
}) {
  const valTone =
    tone === "danger" ? "text-danger" : tone === "amber" ? "text-amber" : tone === "electric" ? "text-electric" : "text-ivory";
  return (
    <div className="rounded-2xl border border-ivory/10 bg-[#0a121c] p-4 ring-1 ring-ivory/[0.05]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", valTone)}>{value}</p>
      <p className="mt-1 text-xs text-ivory/50">{hint}</p>
    </div>
  );
}

function computeKpis(rows: ReplenishmentRowView[]) {
  const needingReplenishment = rows.filter((r) => r.suggestedQty > 0).length;
  const stockoutRisky = rows.filter((r) => r.stockoutRisk >= 55).length;
  const expiryRisky = rows.filter((r) => r.expiryRisk >= 55).length;
  const creditCapped = rows.filter((r) => r.wasCreditCapped).length;
  const lowUtilVans = new Set(rows.filter((r) => r.vanLoadUtilizationPct < 72).map((r) => r.vanId));
  const vanOpportunity = lowUtilVans.size;

  return { needingReplenishment, stockoutRisky, expiryRisky, creditCapped, vanOpportunity };
}
