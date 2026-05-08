"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Activity, ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();

  const isCommandCenter = pathname === "/command-center";
  const isDemandIntelligence = pathname === "/demand-intelligence";
  const isReplenishment = pathname === "/replenishment-orchestrator";
  const isRouteIntelligence = pathname === "/route-intelligence";
  const isExecutionIntelligence = pathname === "/execution-intelligence";

  const liveSignals = useMemo(
    () =>
      isCommandCenter
        ? [
            { label: "R-07 stockout risk", chip: "Stockout" },
            { label: "SKU-118 expiry exposure", chip: "Expiry" },
            { label: "R-12 route resequence ready", chip: "Route" },
            { label: "S-04 coaching required", chip: "Coaching" },
            { label: "4 approvals pending", chip: "Approvals" },
          ]
        : isDemandIntelligence
          ? [
              { label: "R-07 demand is rising faster than fill readiness", chip: "R-07" },
              { label: "R-12 juice 1L is repeatedly under-forecast", chip: "R-12" },
              { label: "C-184 buying frequency is increasing", chip: "C-184" },
              { label: "R-03 chilled demand has low confidence", chip: "R-03" },
              { label: "6 planning actions are open", chip: "Open" },
            ]
          : isReplenishment
            ? [
                { label: "64 customers need supply", chip: "Supply" },
                { label: "14 customers at stockout risk", chip: "Stockout" },
                { label: "SKU-118 needs rebalance approval", chip: "Rebalance" },
                { label: "11 credit holds need review", chip: "Credit" },
                { label: "2 vans need load correction", chip: "Vans" },
              ]
          : isRouteIntelligence
            ? [
                { label: "R-12 sequence ready for approval", chip: "R-12" },
                { label: "C-392 should move to first stop", chip: "C-392" },
                { label: "C-184 has stockout risk on R-07", chip: "C-184" },
                { label: "4 route changes need approval", chip: "Approvals" },
                { label: "7 SLA-risk customers need protection", chip: "SLA" },
              ]
            : isExecutionIntelligence
              ? [
                  { label: "S-04 needs conversion coaching", chip: "S-04" },
                  { label: "C-184 requires recovery visit", chip: "C-184" },
                  { label: "S-09 missed 6 high-value customers", chip: "S-09" },
                  { label: "S-03 issue is supply-led, not salesman-led", chip: "Supply" },
                  { label: "6 must-sell SKU gaps need correction", chip: "SKU" },
                ]
        : [
            { label: "14 customers at stockout risk", chip: "Stockout" },
            { label: "5 SKUs with expiry exposure", chip: "Expiry" },
            { label: "3 routes below productivity benchmark", chip: "Routes" },
            { label: "2 vans underloaded before dispatch", chip: "Vans" },
            { label: "9 open actions need closure", chip: "Actions" },
          ],
    [isCommandCenter, isDemandIntelligence, isReplenishment, isRouteIntelligence, isExecutionIntelligence],
  );

  const diagnosisText = isCommandCenter
    ? "The biggest risk today is lost sales from underloaded fast-moving SKUs and expiry exposure on slow-moving inventory. Close replenishment and rebalance actions before dispatch."
    : isDemandIntelligence
      ? "Demand risk is concentrated in R-07, R-12, and C-184. The forecast should be adjusted before replenishment and van loading decisions are finalized."
      : isReplenishment
        ? "Supply risk is concentrated in R-07, R-12, and SKU-118. Correct the load plan, approve stock rebalance, and clear credit holds before dispatch."
        : isRouteIntelligence
          ? "Route risk is concentrated in R-12 and R-07. Move high-value and SLA-risk customers earlier, confirm van load readiness, and approve sequence changes before dispatch."
          : isExecutionIntelligence
            ? "Execution risk is concentrated in S-04, S-09, and missed high-value customers. Separate true coaching issues from supply constraints before taking action."
      : "GTC has three immediate risks: stockouts on high-demand routes, expiry exposure on slow-moving SKUs, and execution gaps in selected routes. The system recommends correcting van loads, rebalancing stock, and closing supervisor actions before dispatch.";

  const recommendedNextAction = isCommandCenter
    ? "Approve R-07 load correction and SKU-118 rebalance before dispatch."
    : isDemandIntelligence
      ? "Update R-07 fast-mover demand and send the must-load list to replenishment before dispatch."
      : isReplenishment
        ? "Approve SKU-118 rebalance and update R-07 fast-moving SKU load plan."
        : isRouteIntelligence
          ? "Approve R-12 sequence and move C-392 and C-310 before 10:00 AM."
          : isExecutionIntelligence
            ? "Schedule S-04 ride-along, protect C-184 recovery visit, and correct supply mismatch for S-03."
      : "Close urgent supervisor actions today.";

  const impactChips = isDemandIntelligence
    ? ([
        "SAR 420K revenue protected",
        "14 stockout-risk customers reduced",
        "Better van loading accuracy",
        "Fewer manual forecast overrides",
      ] as const)
    : isReplenishment
      ? ([
          "SAR 420K revenue protected",
          "SAR 210K expiry loss avoided",
          "2 van loads corrected",
          "11 credit decisions controlled",
        ] as const)
      : isRouteIntelligence
        ? ([
            "SAR 371K revenue protected on R-12",
            "SAR 232K protected on C-184",
            "14% travel time reduction",
            "7 SLA-risk customers protected",
          ] as const)
        : isExecutionIntelligence
          ? ([
              "SAR 527K recovery opportunity",
              "23 missed high-value visits addressed",
              "+6–10 pp strike improvement for S-04",
              "6 must-sell gaps corrected",
            ] as const)
    : ([
        "SAR 420K revenue protected",
        "SAR 210K expiry loss avoided",
        "14% travel time reduction",
        "7.5% strike rate improvement",
      ] as const);

  const suggestedQuestions = useMemo(
    () =>
      isCommandCenter
        ? ["Which route needs action today?", "What should we load tomorrow?", "Which approval is pending?"]
        : isDemandIntelligence
          ? ["Which route demand is rising?", "Which SKU needs review?", "What should replenishment prepare?"]
          : isReplenishment
            ? ["What should we supply today?", "Which SKU should be restricted?", "Which van load needs correction?"]
            : isRouteIntelligence
              ? ["Which route needs resequencing?", "Which customer should be visited first?", "Which approval is pending?"]
              : isExecutionIntelligence
                ? ["Which salesman needs coaching?", "Which customer needs recovery?", "Which issue is supply-led?"]
          : ["Which route needs action today?", "What should we load tomorrow?", "Which customer is at risk?"],
    [isCommandCenter, isDemandIntelligence, isReplenishment, isRouteIntelligence, isExecutionIntelligence],
  );

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
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/35">
              <Sparkles className="h-5 w-5 text-electric" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight tracking-tight text-ivory">SYDIAI Intelligence Agent</h2>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-ivory/55">
                {isCommandCenter
                  ? "What needs action today"
                  : isDemandIntelligence
                    ? "Demand actions for today"
                    : isReplenishment
                      ? "Supply decisions before dispatch"
                      : isRouteIntelligence
                        ? "Route actions before dispatch"
                        : isExecutionIntelligence
                          ? "Execution actions for supervisors"
                      : "What needs attention today"}
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

          {/* C. Recommended Next Action */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-ivory/55">Recommended next action</h3>
            <IvoryCard contentClassName="py-3.5">
              <p className="text-sm font-medium leading-snug text-ink/90">{recommendedNextAction}</p>
            </IvoryCard>
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
          </section>
        </div>

        <footer className="mt-auto border-t border-ivory/10 px-5 py-4 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ivory/40">Daily Operating Flow:</p>
          <p className="mt-1 text-xs font-medium text-ivory/55">Sense → Recommend → Load → Route → Execute → Govern</p>
        </footer>
      </div>
    </aside>
  );
}
