import { cn } from "@/lib/utils";
import { DataTable, PageTitle, Panel } from "@/components/Cards";
import { ProductivityChart } from "@/components/Charts";
import { salesman } from "@/data/demo";

const executionPulse = [
  { label: "Salesmen Needing Coaching", value: "3", status: "High", cue: "Supervisor action required", tone: "danger" },
  { label: "Missed High-Value Customers", value: "23", status: "Open", cue: "Recover this week", tone: "amber" },
  { label: "Average Strike Rate", value: "72.5%", status: "Stable", cue: "Lift conversion on 2 routes", tone: "electric" },
  { label: "Must-Sell SKU Gap", value: "19%", status: "Gap", cue: "Correct checklist adherence", tone: "amber" },
  { label: "Recovery Opportunity", value: "SAR 527K", status: "High", cue: "Protect this cycle", tone: "danger" },
] as const;

const supervisorActions = [
  {
    priority: "High",
    area: "Salesman Coaching",
    subject: "S-04 Ahmed / R-07",
    issue: "Low strike rate despite completed calls",
    action: "Coach on priority customer conversion and must-sell pitch",
    owner: "Sales Supervisor",
    impact: "+6–10 pp strike rate",
    status: "In Progress",
  },
  {
    priority: "High",
    area: "Customer Recovery",
    subject: "C-184 Al Noor Market",
    issue: "High-value customer missed 3 times",
    action: "Schedule protected recovery visit",
    owner: "Sales Supervisor",
    impact: "Recover SAR 55K",
    status: "Open",
  },
  {
    priority: "High",
    area: "Coverage Discipline",
    subject: "S-09 Faisal / R-12",
    issue: "6 high-value customers missed",
    action: "Move priority customers to morning route plan",
    owner: "Sales Supervisor",
    impact: "Recover 3–6 visits weekly",
    status: "Approval Required",
  },
  {
    priority: "Medium",
    area: "SKU Execution",
    subject: "S-11 Omar / R-03",
    issue: "Must-sell adoption below benchmark",
    action: "Push SKU-102 and SKU-204 checklist",
    owner: "Sales Supervisor",
    impact: "+12 pts adoption",
    status: "Ready",
  },
  {
    priority: "Medium",
    area: "Supply Constraint",
    subject: "S-03 Karim / R-05",
    issue: "Missed sales due to stockout and van load mismatch",
    action: "Do not penalize salesman; fix supply alignment",
    owner: "Supply Controller",
    impact: "Recover availability-led sales",
    status: "In Progress",
  },
  {
    priority: "Low",
    area: "Recognition",
    subject: "S-02 Nasser / R-02",
    issue: "Above-benchmark strike and must-sell adoption",
    action: "Recognize and replicate playbook",
    owner: "Sales Supervisor",
    impact: "Best-practice transfer",
    status: "Closed",
  },
] as const;

const riskMap = [
  { title: "Coaching Required", summary: "3 salesmen · conversion and coverage gaps", next: "Schedule supervisor ride-alongs" },
  { title: "Customer Recovery", summary: "5 missed customers · SAR 441K opportunity", next: "Protect recovery visits" },
  { title: "SKU Execution", summary: "6 must-sell gaps · 19% gap", next: "Enforce SKU checklist" },
  { title: "Supply / Credit Constraints", summary: "2 supply-led gaps · 1 credit-blocked route", next: "Escalate to supply or finance" },
] as const;

const salesmanFocus = [
  { salesman: "S-04 Ahmed", route: "R-07", strike: "42%", cause: "Conversion", action: "Ride-along + must-sell coaching", status: "High Risk" },
  { salesman: "S-09 Faisal", route: "R-12", strike: "58%", cause: "Coverage discipline", action: "Priority customer morning plan", status: "High Risk" },
  { salesman: "S-11 Omar", route: "R-03", strike: "79%", cause: "Must-sell gap", action: "SKU checklist", status: "On Track" },
  { salesman: "S-03 Karim", route: "R-05", strike: "55%", cause: "Supply constraint", action: "Fix van load, no penalty", status: "Supply Issue" },
  { salesman: "S-02 Nasser", route: "R-02", strike: "88%", cause: "Strong execution", action: "Replicate playbook", status: "Recognized" },
] as const;

const customerRecovery = [
  { customer: "C-184 Al Noor Market", route: "R-07", issue: "Missed visits", action: "Recovery visit", impact: "SAR 55K", status: "Open" },
  { customer: "C-145 Oasis MiniMart", route: "R-09", issue: "Service gap", action: "Protected coverage slot", impact: "SAR 55K", status: "Review" },
  { customer: "C-310 City Express", route: "R-12", issue: "Stockout risk", action: "Replenishment-led visit", impact: "SAR 40K", status: "In Progress" },
  { customer: "C-220 Harbor Wholesale", route: "R-16", issue: "Credit blocked", action: "Joint finance visit", impact: "SAR 70K", status: "Approval Required" },
  { customer: "C-301 Metro Fresh", route: "R-02", issue: "Healthy account", action: "Recognize and maintain", impact: "Stable", status: "Closed" },
] as const;

export default function ExecutionIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Supervisor View"
        title="Execution Intelligence"
        subtitle="Identify salesmen, customers, and SKU gaps that need supervisor action today."
      />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Execution Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {executionPulse.map((x) => (
            <PulseCard key={x.label} {...x} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Today&apos;s Supervisor Actions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Priority", "Area", "Subject", "Issue", "Action", "Owner", "Impact", "Status"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supervisorActions.map((r) => (
                  <tr key={`${r.subject}-${r.area}`} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", r.priority === "High" ? "border-danger/45 bg-danger/12 text-ink" : r.priority === "Medium" ? "border-amber/50 bg-amber/12 text-ink" : "border-emerald/45 bg-emerald/12 text-ink")}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/90">{r.area}</td>
                    <td className="px-3 py-3 text-ink/85">{r.subject}</td>
                    <td className="px-3 py-3 text-ink/85">{r.issue}</td>
                    <td className="px-3 py-3 text-ink/90">{r.action}</td>
                    <td className="px-3 py-3 text-ink/85">{r.owner}</td>
                    <td className="px-3 py-3 font-medium text-ink">{r.impact}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", r.status === "Approval Required" ? "border-amber/50 bg-amber/14 text-ink" : r.status === "In Progress" ? "border-electric/45 bg-electric/10 text-ink" : r.status === "Ready" ? "border-amber/45 bg-amber/10 text-ink" : r.status === "Closed" ? "border-emerald/45 bg-emerald/12 text-ink" : "border-ink/20 bg-ink/[0.05] text-ink/80")}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Execution Risk Map</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {riskMap.map((x) => (
            <div key={x.title} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <p className="text-sm font-semibold text-ivory">{x.title}</p>
              <p className="mt-2 text-sm text-ivory/85">{x.summary}</p>
              <p className="mt-3 text-xs font-medium text-electric">Next action: {x.next}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Panel title="Salesman Focus List">
          <DataTable columns={["salesman", "route", "strike", "cause", "action", "status"]} rows={salesmanFocus as any} />
        </Panel>
      </section>

      <section className="mt-10">
        <Panel title="Customer Recovery List">
          <DataTable columns={["customer", "route", "issue", "action", "impact", "status"]} rows={customerRecovery as any} />
        </Panel>
      </section>

      <section className="mt-10">
        <Panel title="Salesman Productivity Score" subtitle="Shows who needs coaching and who can be used as a benchmark.">
          <ProductivityChart data={salesman} />
        </Panel>
      </section>
    </>
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
  tone: "danger" | "amber" | "electric";
}) {
  const map = {
    danger: "border-danger/45 bg-danger/12 text-danger",
    amber: "border-amber/50 bg-amber/12 text-amber",
    electric: "border-electric/45 bg-electric/10 text-electric",
  };
  return (
    <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ivory">{value}</p>
      <p className={cn("mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", map[tone])}>
        {status} · {cue}
      </p>
    </div>
  );
}
