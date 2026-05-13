"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { aiReplenishmentDecisions, replenishmentEngineSeed } from "@/data/replenishmentEngineSeed";
import { buildReplenishmentRows, type ReplenishmentRowView, type RiskLevel } from "@/lib/replenishment";
import { cn } from "@/lib/utils";

function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, string> = {
    High: "border-danger/45 bg-danger/15 text-ivory",
    Medium: "border-amber/50 bg-amber/18 text-ivory",
    Low: "border-emerald/45 bg-emerald/14 text-ivory",
  };
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[level])}>{level}</span>;
}

function PctRisk({ value }: { value: number }) {
  let tone = "text-emerald";
  if (value >= 66) tone = "text-danger";
  else if (value >= 38) tone = "text-amber";
  return <span className={cn("tabular-nums font-semibold", tone)}>{value}%</span>;
}

function SummaryCard({ label, value, hint, tone = "electric" }: { label: string; value: string | number; hint?: string; tone?: "electric" | "amber" | "danger" | "emerald" }) {
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

function fmt(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function ReplenishmentEngine() {
  const allRows = useMemo(() => buildReplenishmentRows(replenishmentEngineSeed), []);
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
      if (skuFilter.trim() && !r.sku.toLowerCase().includes(skuFilter.toLowerCase().trim())) return false;
      return true;
    });
  }, [allRows, routeFilter, customerFilter, skuFilter, riskFilter]);

  const kpis = useMemo(() => computeKpis(filteredRows), [filteredRows]);
  const supplierPlan = useMemo(() => buildSupplierPlan(filteredRows), [filteredRows]);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">ROP replenishment engine</h3>
        <p className="mt-2 max-w-4xl text-sm text-muted">
          Customer-level recommendations using ADS, lead-time demand, safety stock, ROP, net stock, MOQ, shelf-life, credit and van readiness.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Rows below ROP" value={kpis.belowRop} hint="Net stock ≤ reorder point" tone="danger" />
          <SummaryCard label="MOQ-adjusted supply" value={`${kpis.suggestedCases} cases`} hint="Recommended issue quantity" tone="electric" />
          <SummaryCard label="PO suggestion" value={`${kpis.poCases} cases`} hint="Supplier-level release" tone="emerald" />
          <SummaryCard label="Stockout risk" value={kpis.stockoutRisky} hint="Risk ≥ 55%" tone="danger" />
          <SummaryCard label="Expiry / overstock risk" value={kpis.expiryRisky} hint="FEFO and transfer review" tone="amber" />
          <SummaryCard label="Review required" value={kpis.reviewRequired} hint="Credit / high risk / confidence" tone="amber" />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Planning filters</h4>
          </div>
          <p className="text-xs text-ivory/45">{filteredRows.length} of {allRows.length} SKU/customer rows</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Route
            <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40">
              {routes.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Customer
            <input value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} placeholder="Contains…" className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/35 outline-none ring-1 ring-black/20 focus:border-electric/40" />
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            SKU
            <input value={skuFilter} onChange={(e) => setSkuFilter(e.target.value)} placeholder="Contains…" className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/35 outline-none ring-1 ring-black/20 focus:border-electric/40" />
          </label>
          <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
            Risk level
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")} className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40">
              {riskLevels.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
        <div className="border-b border-ink/10 bg-ivory px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
            <h4 className="text-sm font-semibold text-ink">SKU × customer replenishment recommendations</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1760px] border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {["Customer", "Route", "SKU", "ADS", "Net stock", "Days cover", "Lead time", "Safety stock", "ROP", "MOQ", "Suggested", "Supplier PO", "Stockout", "Expiry", "Credit", "Risk", "Action", "Confidence"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <tr key={`${r.customerDisplay}-${r.sku}-${idx}`} className="border-t border-ink/[0.07] hover:bg-ink/[0.02]">
                  <td className="max-w-[210px] px-3 py-3 font-medium text-ink/90">{r.customerDisplay}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-ink/85">{r.route}</td>
                  <td className="max-w-[170px] px-3 py-3 text-ink/85">{r.sku}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums">{fmt(r.adjustedAds)}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums">{fmt(r.netAvailableStock)}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums">{fmt(r.daysCover)}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums">{r.leadTimeDays}d</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums">{fmt(r.safetyStock)}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums font-semibold text-ink">{fmt(r.reorderPoint)}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums">{r.moqCases}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums font-semibold text-ink">{r.suggestedQty}</td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums font-semibold text-ink">{r.supplierPoQty}</td>
                  <td className="whitespace-nowrap px-3 py-3"><PctRisk value={r.stockoutRisk} /></td>
                  <td className="whitespace-nowrap px-3 py-3"><PctRisk value={r.expiryRisk} /></td>
                  <td className="whitespace-nowrap px-3 py-3"><PctRisk value={r.creditRiskScore} /></td>
                  <td className="px-3 py-3"><RiskBadge level={r.riskLevel} /></td>
                  <td className="max-w-[300px] px-3 py-3 text-xs leading-snug text-ink/85">{r.actionRecommendation}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold", r.reviewRequired ? "border-amber/50 bg-amber/15 text-ink" : "border-emerald/40 bg-emerald/12 text-ink")}>{r.confidenceScore}%{r.reviewRequired ? " · Review" : ""}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink/55">No rows match the current filters.</p>}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="border-b border-ink/10 px-5 py-3">
            <h4 className="text-sm font-semibold text-ink">Supplier PO suggestions</h4>
            <p className="mt-1 text-xs text-ink/55">Aggregated from MOQ-adjusted recommendations and EOQ guardrails.</p>
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>{["Supplier", "SKUs", "PO cases", "Expected arrival", "Priority"].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {supplierPlan.map((s) => (
                <tr key={s.supplierName} className="border-t border-ink/[0.07]">
                  <td className="px-3 py-3 font-semibold text-ink/90">{s.supplierName}</td>
                  <td className="px-3 py-3 text-ink/80">{s.skus}</td>
                  <td className="px-3 py-3 font-semibold tabular-nums text-ink">{s.poCases}</td>
                  <td className="px-3 py-3 text-ink/80">D+{s.arrivalDays}</td>
                  <td className="px-3 py-3"><RiskBadge level={s.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-ivory/10 bg-[#0a121c] p-5 ring-1 ring-ivory/[0.05]">
          <h4 className="text-lg font-semibold text-ivory">AI replenishment explanation</h4>
          <p className="mt-2 text-sm text-muted">The engine is no longer a static list. It shows why supply is increased, capped, held or transferred.</p>
          <ul className="mt-4 space-y-3">
            {aiReplenishmentDecisions.map((line) => (
              <li key={line} className="relative rounded-xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3 pl-5 text-sm leading-snug text-ivory/82">
                <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-electric via-electric/75 to-electric/25" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function computeKpis(rows: ReplenishmentRowView[]) {
  const belowRop = rows.filter((r) => r.netAvailableStock <= r.reorderPoint).length;
  const suggestedCases = rows.reduce((sum, r) => sum + r.suggestedQty, 0);
  const poCases = rows.reduce((sum, r) => sum + r.supplierPoQty, 0);
  const stockoutRisky = rows.filter((r) => r.stockoutRisk >= 55).length;
  const expiryRisky = rows.filter((r) => r.expiryRisk >= 55 || r.overstockRisk >= 55).length;
  const reviewRequired = rows.filter((r) => r.reviewRequired).length;
  return { belowRop, suggestedCases, poCases, stockoutRisky, expiryRisky, reviewRequired };
}

function buildSupplierPlan(rows: ReplenishmentRowView[]) {
  return Array.from(
    rows.reduce((map, r) => {
      const current = map.get(r.supplierName) ?? { supplierName: r.supplierName, poCases: 0, skus: new Set<string>(), arrivalDays: 0, maxRisk: 0 };
      current.poCases += r.supplierPoQty;
      if (r.supplierPoQty > 0) current.skus.add(r.skuCode);
      current.arrivalDays = Math.max(current.arrivalDays, r.leadTimeDays);
      current.maxRisk = Math.max(current.maxRisk, r.stockoutRisk, r.creditRiskScore, r.expiryRisk);
      map.set(r.supplierName, current);
      return map;
    }, new Map<string, { supplierName: string; poCases: number; skus: Set<string>; arrivalDays: number; maxRisk: number }>()),
  ).map(([, v]) => ({
    supplierName: v.supplierName,
    poCases: v.poCases,
    skus: Array.from(v.skus).join(", ") || "No release",
    arrivalDays: v.arrivalDays,
    priority: (v.maxRisk >= 66 ? "High" : v.maxRisk >= 38 ? "Medium" : "Low") as RiskLevel,
  })).filter((v) => v.poCases > 0);
}
