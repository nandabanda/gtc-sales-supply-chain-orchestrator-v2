"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Activity, ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const liveSignals = [
  { label: "14 customers at stockout risk", chip: "Stockout" },
  { label: "5 SKUs with expiry exposure", chip: "Expiry" },
  { label: "3 routes below productivity benchmark", chip: "Routes" },
  { label: "2 vans underloaded before dispatch", chip: "Vans" },
  { label: "9 open actions need closure", chip: "Actions" },
] as const;

const recommendedActions = [
  "Increase fast-moving SKU load on R-07",
  "Rebalance SKU-118 from R-03 to R-12",
  "Approve R-12 route sequence",
  "Coach S-04 on priority customer conversion",
  "Close urgent supervisor actions today",
] as const;

const impactChips = [
  "SAR 420K revenue protected",
  "SAR 210K expiry loss avoided",
  "14% travel time reduction",
  "7.5% strike rate improvement",
] as const;

const suggestedQuestions = [
  "Which route needs action today?",
  "What should we load tomorrow?",
  "Which customer is at risk?",
] as const;

const diagnosisText =
  "GTC has three immediate risks: stockouts on high-demand routes, expiry exposure on slow-moving SKUs, and execution gaps in selected routes. The system recommends correcting van loads, rebalancing stock, and closing supervisor actions before dispatch.";

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
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/35">
              <Sparkles className="h-5 w-5 text-electric" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight tracking-tight text-ivory">SYDIAI Intelligence Agent</h2>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-ivory/55">
                What needs attention today
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
