"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Activity, ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const liveSignals = [
  { label: "14 customers at stockout risk", chip: "Replenish" },
  { label: "5 SKUs with expiry exposure — chilled & short-life", chip: "Expiry" },
  { label: "11 credit-capped supply recommendations", chip: "Credit" },
  { label: "Van load utilization gap: V-09 at 58% vs 72% target", chip: "Utilization" },
  { label: "Must-load SKUs flagged on R-07 / R-12 for tomorrow", chip: "Must-load" },
  { label: "Near-expiry liquidation queue — SKU-118 rebalance R-03→R-12", chip: "Liquidate" },
  { label: "Dispatch-ready cube review — manifest mismatch V-07 vs AI pick", chip: "Dispatch" },
  { label: "SLA-critical stops — C-310 / C-392 window before 11:00", chip: "SLA" },
  { label: "Sequence change >30% on R-09 — supervisor approval queue", chip: "Approval" },
  { label: "Revenue at risk on R-07 pull-forward — cola & energy lanes", chip: "Revenue" },
  { label: "Missed-call prevention: 3 outlets flagged on R-07 / R-03", chip: "Coverage" },
  { label: "14% time savings opportunity on R-12 after re-sequence", chip: "Time" },
  { label: "3 routes below productivity benchmark", chip: "Routes" },
  { label: "Coaching queue: multiple salesmen flagged for supervisor 1:1 or ride-along", chip: "Coaching" },
  { label: "Low strike-rate routes: R-07, R-16, R-05 under 60% — conversion risk", chip: "Strike" },
  { label: "Missed high-value customers: 23 aggregate visits — discipline review", chip: "HV miss" },
  { label: "Must-sell SKU gaps on R-03 / R-07 — basket coaching drills", chip: "Must-sell" },
  { label: "Van load mismatch V-05 vs plan — treat misses as supply-led, not salesman fault", chip: "Load" },
  { label: "Credit approval friction R-16 — unblock priority outlets with finance", chip: "Credit+" },
  { label: "Customer opportunity queue — missed visits & revenue gap on C-184 / C-145", chip: "Customers" },
  { label: "High-potential low-service — C-184 / C-145 flagged for protected coverage slots", chip: "Whitespace" },
  { label: "Churn watchlist — frequency downgrades tracked across General Trade", chip: "Churn" },
  { label: "Aggregate revenue gap opportunity — supervisor review vs category potential", chip: "Gap" },
  { label: "SKU expansion targets — basket depth below benchmark on C-091 / lanes", chip: "SKU+" },
  { label: "Visit frequency upgrades — stockout-sensitive outlets need tighter cadence", chip: "Cadence" },
  { label: "Credit-blocked demand — C-220 wholesale orders pending finance release", chip: "Blocked" },
  { label: "Expiry risk cluster — SKU-118 / chilled lanes flagged across R-03 & R-05", chip: "Expiry+" },
  { label: "Overstock cover alert — SKU-330 slow velocity vs high days cover on R-07", chip: "Overstock" },
  { label: "Stock value at risk SAR 700K+ — rebalance & liquidation queues merged", chip: "VaR" },
  { label: "Avoidable expiry loss — prioritized rotations before write-off window", chip: "Loss" },
  { label: "Rebalance opportunity — transfer-fit SKUs toward high-velocity R-12 corridor", chip: "Transfer" },
  { label: "Liquidation actions — S-09 push ladder on near-expiry SKUs with spare cube", chip: "Liq+" },
  { label: "Salesman push queue — chilled bundles SKU-117 → Metro corridor playbook", chip: "Push" },
  { label: "Action board: 9 open actions with 4 urgent requiring same-day closure", chip: "Open" },
  { label: "Approval queue: route resequence + expiry transfer + credit release pending", chip: "ApproveQ" },
  { label: "Overdue governance lane: ACT-009 exceeded target window and needs escalation", chip: "Overdue" },
  { label: "Value at stake SAR 1,040K across active actions in supervisor queue", chip: "Stake" },
  { label: "Value captured SAR 24K from closed execution follow-up this cycle", chip: "Captured" },
  { label: "Next best supervisory action: approve R-12 resequence before evening dispatch", chip: "Next" },
] as const;

const recommendedActions = [
  "Increase van load for fast-moving SKUs on Route R-07 — engine shows elevated stockout risk",
  "Approve optimized visit sequence on R-12 — protect SAR uplift and SLA windows",
  "Rebalance near-expiry SKU-118 from low-velocity R-03 toward R-12",
  "Fill Van V-09 cube with SKU-204 / SKU-102 to close utilization gap vs depot target",
  "Route R-09: supervisor sign-off on major sequence change before dispatch",
  "Apply credit-capped replenishment for high-risk accounts before uplift",
  "Publish must-load list to warehouse before second pick wave",
  "Coach Salesman S-04 on priority customer conversion — planned calls high, strike 42%",
  "Supervisor action: ride-along on R-12 for missed high-value coverage before reprimand",
  "Escalate credit holds on R-16 with finance — approval friction blocking conversion",
  "Recover Customer C-184 — supervisor-approved revisit after missed visits & revenue gap",
  "Push SKU-102 / SKU-204 depth at C-091 before funding incremental visit frequency",
  "Expiry council: rebalance SKU-118 off R-03 before chilled window collapses",
  "Freeze incremental SKU-330 loads on R-07 until sell-through improves — reduce dispatch risk",
  "Approve ACT-003 route resequence and ACT-006 stock rebalance in same governance cycle",
  "Close validated actions quickly to convert value-at-stake into captured value this week",
] as const;

const impactChips = [
  "+SAR 420K revenue opportunity",
  "-18% expiry risk",
  "+7.5% strike rate improvement",
  "+11% route productivity",
  "SAR 1.04M governed value at stake",
  "SAR 24K value captured",
] as const;

const suggestedQuestions = [
  "Which route needs action today?",
  "What should we load tomorrow?",
  "Which salesman needs coaching?",
] as const;

const diagnosisText =
  "Route optimization intelligence ranks visits by SLA risk, revenue-at-risk, replenishment readiness, and strike-rate uplift — linking cube decisions to actual execution order. Salesman coaching intelligence layers conversion, basket size, must-sell adoption, missed high-value coverage, van-load alignment, stockout-driven misses, and credit friction so supervisors separate discipline issues from supply constraints. Customer opportunity intelligence adds outlet-level strike, purchase-frequency drift, churn signals, service gaps vs plan, and SKU basket depth — surfacing missed customers, high-potential low-service accounts, credit-blocked demand, and visit-frequency upgrades before revenue leaks. Expiry & overstock intelligence folds shelf-life pressure, days cover, velocity by route and customer, promotion fit, van spare capacity, and forecast confidence — distinguishing rebalance transfers toward faster corridors from liquidation pushes and disciplined load reductions where velocity cannot absorb stock. Supervisor Action Board governance then consolidates all recommendations into one owner-routed queue with urgency, approvals, due dates, overdue flags, and value capture tracking so leadership can close the loop daily.";

function IvoryCard({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-ink/10 bg-ivory text-ink shadow-[0_12px_40px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.04]",
        className,
      )}
    >
      <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-electric via-electric/80 to-electric/30" aria-hidden />
      <div className={cn("relative py-4 pl-4 pr-4 sm:pl-5", contentClassName)}>{children}</div>
    </div>
  );
}

export function AgentPanel() {
  const [query, setQuery] = useState("");

  return (
    <aside
      className={cn(
        "relative flex w-full flex-col border-ivory/10 bg-[#050a12] shadow-[inset_1px_0_0_rgba(244,240,232,0.06)]",
        "xl:sticky xl:top-0 xl:h-screen xl:max-h-screen xl:w-[min(100%,420px)] xl:shrink-0 xl:overflow-y-auto xl:border-l xl:border-t-0",
        "border-t",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_100%_0%,rgba(26,159,255,0.08),transparent_50%)]"
        aria-hidden
      />

      <div className="relative flex flex-col">
        {/* Header */}
        <header className="border-b border-ivory/10 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric opacity-35" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-electric" />
            </span>
            <span className="rounded-full border border-electric/35 bg-electric/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-electric">
              Live
            </span>
            <span className="rounded-full border border-ivory/15 bg-ivory/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory/70">
              Demo
            </span>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/35">
              <Sparkles className="h-5 w-5 text-electric" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight tracking-tight text-ivory">SYDIAI Intelligence Agent</h2>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-ivory/55">
                AI-guided decisions for demand, replenishment, routing and field execution
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          {/* A. Live Signals */}
          <section>
            <div className="mb-3 flex items-center gap-2 text-ivory/45">
              <Activity className="h-4 w-4 text-electric" strokeWidth={1.75} />
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-ivory/55">Live signals</h3>
            </div>
            <IvoryCard className="space-y-3">
              <ul className="space-y-2.5">
                {liveSignals.map((s) => (
                  <li key={s.label} className="flex items-start justify-between gap-2 border-b border-ink/[0.06] pb-2.5 last:border-0 last:pb-0">
                    <span className="text-sm font-medium leading-snug text-ink/90">{s.label}</span>
                    <span className="shrink-0 rounded-md border border-electric/30 bg-electric/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
                      {s.chip}
                    </span>
                  </li>
                ))}
              </ul>
            </IvoryCard>
          </section>

          {/* B. AI Diagnosis */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-ivory/55">AI diagnosis</h3>
            <IvoryCard>
              <p className="text-sm font-medium leading-relaxed text-ink/88">{diagnosisText}</p>
            </IvoryCard>
          </section>

          {/* C. Recommended Actions */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-ivory/55">Recommended actions</h3>
            <div className="space-y-2.5">
              {recommendedActions.map((action, i) => (
                <IvoryCard key={action} contentClassName="py-3.5">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-electric/15 text-xs font-bold text-electric ring-1 ring-electric/25">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium leading-snug text-ink/90">{action}</p>
                  </div>
                </IvoryCard>
              ))}
            </div>
          </section>

          {/* D. Expected Impact */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-ivory/55">Expected impact</h3>
            <div className="flex flex-wrap gap-2">
              {impactChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-emerald/35 bg-emerald/12 px-3 py-1.5 text-xs font-semibold text-ink shadow-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </section>

          {/* E. Ask the Agent */}
          <section className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-4 ring-1 ring-ivory/[0.06]">
            <div className="mb-3 flex items-center gap-2 text-ivory/55">
              <MessageSquareText className="h-4 w-4 text-electric" strokeWidth={1.75} />
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-ivory/70">Ask the agent</h3>
            </div>
            <label htmlFor="agent-ask" className="sr-only">
              Ask the SYDIAI agent
            </label>
            <input
              id="agent-ask"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about route, customer, SKU, replenishment or salesman performance…"
              className="w-full rounded-xl border border-ivory/15 bg-[#0a121c] px-3.5 py-3 text-sm text-ivory placeholder:text-ivory/35 shadow-inner outline-none ring-1 ring-black/20 transition focus:border-electric/40 focus:ring-2 focus:ring-electric/25"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ivory/12 bg-ivory/[0.06] px-3 py-1.5 text-left text-xs font-medium text-ivory/85 transition hover:border-electric/35 hover:bg-electric/10 hover:text-ivory"
                >
                  <ArrowRight className="h-3 w-3 shrink-0 text-electric opacity-80" />
                  {q}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-ivory/40">Static demo — no backend; chips fill the field for storytelling.</p>
          </section>
        </div>

        <footer className="mt-auto border-t border-ivory/10 px-5 py-4 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/40">AI operating layer</p>
          <p className="mt-1 text-xs font-medium text-ivory/55">Sense → Recommend → Route → Execute → Govern</p>
        </footer>
      </div>
    </aside>
  );
}
