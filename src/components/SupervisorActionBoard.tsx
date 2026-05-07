"use client";

import { useMemo, useState } from "react";
import { CheckSquare, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  actionBoardKpis,
  buildGovernanceActions,
  type ActionType,
  type GovernanceAction,
  type GovernanceStatus,
  type Owner,
  type SourceModule,
} from "@/lib/actionGovernance";

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

function StatusBadge({ status }: { status: GovernanceStatus }) {
  const tone: Record<GovernanceStatus, string> = {
    Open: "border-electric/45 bg-electric/12 text-ink",
    "In Progress": "border-electric/45 bg-electric/10 text-ink",
    "Approval Pending": "border-amber/50 bg-amber/14 text-ink",
    Closed: "border-emerald/45 bg-emerald/14 text-ink",
    "Review Required": "border-amber/50 bg-amber/14 text-ink",
  };
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", tone[status])}>{status}</span>;
}

const statuses: GovernanceStatus[] = ["Open", "In Progress", "Approval Pending", "Closed", "Review Required"];

export function SupervisorActionBoard() {
  const [rows, setRows] = useState<GovernanceAction[]>(() => buildGovernanceActions());
  const kpis = useMemo(() => actionBoardKpis(rows), [rows]);

  const sourceModules = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.sourceModule))).sort()], [rows]);
  const actionTypes = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.actionType))).sort()], [rows]);
  const owners = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.owner))).sort()], [rows]);
  const urgencies = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.urgency))).sort()], [rows]);
  const statusOptions = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.status))).sort()], [rows]);

  const [sourceFilter, setSourceFilter] = useState<SourceModule | "All">("All");
  const [typeFilter, setTypeFilter] = useState<ActionType | "All">("All");
  const [ownerFilter, setOwnerFilter] = useState<Owner | "All">("All");
  const [urgencyFilter, setUrgencyFilter] = useState<"High" | "Medium" | "Low" | "All">("All");
  const [approvalFilter, setApprovalFilter] = useState<"All" | "Yes" | "No">("All");
  const [statusFilter, setStatusFilter] = useState<GovernanceStatus | "All">("All");
  const [confidenceFilter, setConfidenceFilter] = useState<"All" | "High (>=75)" | "Medium (55-74)" | "Low (<55)">("All");

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (sourceFilter !== "All" && r.sourceModule !== sourceFilter) return false;
      if (typeFilter !== "All" && r.actionType !== typeFilter) return false;
      if (ownerFilter !== "All" && r.owner !== ownerFilter) return false;
      if (urgencyFilter !== "All" && r.urgency !== urgencyFilter) return false;
      if (approvalFilter === "Yes" && !r.approvalRequired) return false;
      if (approvalFilter === "No" && r.approvalRequired) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (confidenceFilter === "High (>=75)" && r.confidenceScore < 75) return false;
      if (confidenceFilter === "Medium (55-74)" && (r.confidenceScore < 55 || r.confidenceScore >= 75)) return false;
      if (confidenceFilter === "Low (<55)" && r.confidenceScore >= 55) return false;
      return true;
    });
  }, [rows, sourceFilter, typeFilter, ownerFilter, urgencyFilter, approvalFilter, statusFilter, confidenceFilter]);

  function updateStatus(actionId: string, nextStatus: GovernanceStatus) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.actionId !== actionId) return r;
        let valueCaptured = r.valueCaptured;
        if (nextStatus === "Closed" && valueCaptured <= 0) {
          valueCaptured = Math.round(r.valueAtStake * (0.35 + r.confidenceScore / 260));
        }
        return {
          ...r,
          status: nextStatus,
          valueCaptured,
          overdueFlag: nextStatus === "Closed" ? false : r.overdueFlag,
          nextStep: nextStatus === "Closed" ? "Closed in local queue." : r.nextStep,
        };
      }),
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-electric" strokeWidth={1.75} />
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">Supervisor action board & governance workflow</h3>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Unified daily queue across demand, replenishment, van loading, routing, coaching, customer opportunity, and expiry governance.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          <SummaryCard label="Open actions" value={kpis.openActions} tone="electric" />
          <SummaryCard label="Urgent actions" value={kpis.urgentActions} tone="danger" />
          <SummaryCard label="Approvals required" value={kpis.approvalsRequired} tone="amber" />
          <SummaryCard label="Overdue actions" value={kpis.overdueActions} tone="danger" />
          <SummaryCard label="Value at stake" value={kpis.valueAtStakeLabel} tone="danger" />
          <SummaryCard label="Value captured" value={kpis.valueCapturedLabel} tone="emerald" />
          <SummaryCard label="Closed actions" value={kpis.closedActions} tone="emerald" />
          <SummaryCard label="Average confidence" value={`${kpis.avgConfidence}%`} tone="electric" />
        </div>
      </section>

      <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5 ring-1 ring-ivory/[0.06]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-ivory/70">
            <Filter className="h-4 w-4 text-electric" strokeWidth={1.75} />
            <h4 className="text-sm font-semibold text-ivory">Filters</h4>
          </div>
          <p className="text-xs text-ivory/45">
            {filteredRows.length} of {rows.length} actions
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          <SelectFilter label="Source Module" value={sourceFilter} onChange={setSourceFilter} options={sourceModules} />
          <SelectFilter label="Action Type" value={typeFilter} onChange={setTypeFilter} options={actionTypes} />
          <SelectFilter label="Owner" value={ownerFilter} onChange={setOwnerFilter} options={owners} />
          <SelectFilter label="Urgency" value={urgencyFilter} onChange={setUrgencyFilter} options={["All", ...urgencies.filter((u) => u !== "All")]} />
          <SelectFilter label="Approval Required" value={approvalFilter} onChange={setApprovalFilter} options={["All", "Yes", "No"]} />
          <SelectFilter label="Status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
          <SelectFilter
            label="Confidence"
            value={confidenceFilter}
            onChange={setConfidenceFilter}
            options={["All", "High (>=75)", "Medium (55-74)", "Low (<55)"]}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
        <div className="border-b border-ink/10 bg-ivory px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-electric to-electric/30" aria-hidden />
            <h4 className="text-sm font-semibold text-ink">AI Supervisor Action Queue</h4>
          </div>
        </div>
        <div className="max-h-[62vh] overflow-auto">
          <table className="w-full min-w-[1800px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
              <tr>
                {[
                  "Action ID",
                  "Source Module",
                  "Action Type",
                  "Signal",
                  "Recommended Action",
                  "Owner",
                  "Approver",
                  "Urgency",
                  "Expected Impact",
                  "Value at Stake",
                  "Value Captured",
                  "Approval Required",
                  "Due Date",
                  "Days Open",
                  "Status",
                  "Confidence",
                  "Next Step",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-2 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.actionId} className={cn("border-t border-ink/[0.07] align-top hover:bg-ink/[0.02]", r.overdueFlag && "bg-danger/[0.05]")}>
                  <td className="whitespace-nowrap px-2 py-3 font-semibold">{r.actionId}</td>
                  <td className="max-w-[170px] px-2 py-3 text-xs">{r.sourceModule}</td>
                  <td className="whitespace-nowrap px-2 py-3">{r.actionType}</td>
                  <td className="max-w-[200px] px-2 py-3 text-xs">{r.signal}</td>
                  <td className="max-w-[240px] px-2 py-3 text-xs">
                    <p className="font-medium">{r.recommendedAction}</p>
                    <p className="mt-1 text-[11px] text-ink/55">{r.governanceReason}</p>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3">{r.owner}</td>
                  <td className="whitespace-nowrap px-2 py-3">{r.approver}</td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        r.urgency === "High"
                          ? "border-danger/45 bg-danger/12"
                          : r.urgency === "Medium"
                            ? "border-amber/50 bg-amber/12"
                            : "border-emerald/45 bg-emerald/12",
                      )}
                    >
                      {r.urgency}
                    </span>
                  </td>
                  <td className="max-w-[180px] px-2 py-3 text-xs">{r.expectedImpact}</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold">SAR {r.valueAtStake}K</td>
                  <td className="whitespace-nowrap px-2 py-3 tabular-nums text-emerald">SAR {r.valueCaptured}K</td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        r.approvalRequired ? "border-amber/50 bg-amber/12" : "border-emerald/45 bg-emerald/12",
                      )}
                    >
                      {r.approvalRequired ? "Yes" : "No"}
                    </span>
                    {r.approvalRequired && <p className="mt-1 max-w-[170px] text-[10px] text-ink/55">{r.approvalReason}</p>}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-xs">{r.dueDate}</td>
                  <td className={cn("whitespace-nowrap px-2 py-3 tabular-nums", r.overdueFlag && "font-semibold text-danger")}>
                    {r.daysOpen}
                    {r.overdueFlag ? " · Overdue" : ""}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <StatusBadge status={r.status} />
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.actionId, e.target.value as GovernanceStatus)}
                      className="mt-1.5 block w-full rounded-lg border border-ink/15 bg-white px-2 py-1 text-[11px] outline-none focus:border-electric/40"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        r.confidenceScore < 55 ? "border-amber/50 bg-amber/15" : "border-emerald/40 bg-emerald/12",
                      )}
                    >
                      {r.confidenceScore}%
                    </span>
                  </td>
                  <td className="max-w-[210px] px-2 py-3 text-xs">{r.nextStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SelectFilter<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: string[];
}) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/45">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="mt-1.5 w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3 py-2.5 text-sm text-ivory outline-none ring-1 ring-black/20 focus:border-electric/40"
      >
        {options.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}
