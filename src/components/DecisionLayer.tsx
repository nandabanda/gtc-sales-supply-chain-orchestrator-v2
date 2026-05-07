import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Workflow state shown to leadership */
export type DecisionStatus = "Open" | "In Progress" | "Closed";

/** Model / evidence strength for the recommendation */
export type DecisionConfidence = "High" | "Medium" | "Low";

/** Accent for the signal rail — electric default, amber watchlist, red risk */
export type DecisionAccent = "electric" | "watchlist" | "risk";

export type DecisionLayerProps = {
  signal: string;
  diagnosis: string;
  recommendedAction: string;
  expectedImpact: string;
  owner: string;
  status: DecisionStatus;
  confidence: DecisionConfidence;
  accent?: DecisionAccent;
  className?: string;
};

const statusStyles: Record<DecisionStatus, string> = {
  Open: "border-electric/45 bg-electric/12 text-ink",
  "In Progress": "border-amber/55 bg-amber/18 text-ink",
  Closed: "border-emerald/45 bg-emerald/14 text-ink",
};

const confidenceStyles: Record<DecisionConfidence, string> = {
  High: "border-emerald/45 bg-emerald/12 text-ink",
  Medium: "border-amber/50 bg-amber/15 text-ink",
  Low: "border-danger/45 bg-danger/12 text-ink",
};

const accentBar: Record<DecisionAccent, string> = {
  electric: "from-electric via-electric/70 to-electric/25",
  watchlist: "from-amber via-amber/70 to-amber/25",
  risk: "from-danger via-danger/75 to-danger/30",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/50">{label}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-ink/92">{children}</p>
    </div>
  );
}

export function DecisionLayer({
  signal,
  diagnosis,
  recommendedAction,
  expectedImpact,
  owner,
  status,
  confidence,
  accent = "electric",
  className,
}: DecisionLayerProps) {
  return (
    <article
      className={cn(
        "rounded-2xl bg-ink p-px shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-ivory/[0.06]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[15px] bg-ivory text-ink">
        <div
          className={cn("absolute left-0 top-0 h-full w-1 bg-gradient-to-b", accentBar[accent])}
          aria-hidden
        />
        <div className="relative pl-6 pr-5 py-5 sm:pl-7 sm:pr-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">AI decision orchestration</p>
              <p className="mt-1 text-xs text-ink/55">Synthetic GTC scenario — boardroom-ready layout</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide",
                  statusStyles[status],
                )}
              >
                {status}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide",
                  confidenceStyles[confidence],
                )}
              >
                Confidence · {confidence}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-5 border-t border-ink/10 pt-5">
            <Field label="Signal">{signal}</Field>
            <Field label="Diagnosis">{diagnosis}</Field>
            <Field label="Recommended action">{recommendedAction}</Field>

            <div className="rounded-xl border border-emerald/30 bg-emerald/[0.08] px-4 py-3.5 ring-1 ring-emerald/15">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald/90">Expected impact</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-ink">{expectedImpact}</p>
            </div>

            <div className="flex flex-col gap-2 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">Owner</p>
                <p className="mt-1 text-sm font-semibold text-ink">{owner}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {accent === "risk" && (
                  <span className="rounded-md border border-danger/35 bg-danger/10 px-2.5 py-1 font-medium text-ink">Risk flagged</span>
                )}
                {accent === "watchlist" && (
                  <span className="rounded-md border border-amber/40 bg-amber/12 px-2.5 py-1 font-medium text-ink">Watchlist</span>
                )}
                {status === "Open" && (
                  <span className="rounded-md border border-electric/35 bg-electric/10 px-2.5 py-1 font-medium text-ink">Awaiting decision</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DecisionLayers({
  items,
  className,
}: {
  items: DecisionLayerProps[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      {items.map((item, i) => (
        <DecisionLayer key={i} {...item} />
      ))}
    </div>
  );
}
