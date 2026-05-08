"use client";

import { usePathname } from "next/navigation";
import { Activity, Sparkles } from "lucide-react";
import { intelligenceForPath } from "@/data/intelligence";

export function IntelligenceAgent() {
  const pathname = usePathname() || "/";
  const bundle = intelligenceForPath(pathname);

  return (
    <aside className="relative hidden w-[min(100%,380px)] shrink-0 border-l border-ivory/[0.08] bg-navy-deep/90 backdrop-blur-xl xl:flex xl:flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(30,155,255,0.12),transparent_55%)]" aria-hidden />
      <div className="relative flex flex-1 flex-col">
        <div className="border-b border-ivory/[0.08] px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-electric" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">Live intelligence</p>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-electric/15 ring-1 ring-electric/35">
              <Sparkles className="h-5 w-5 text-electric" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-snug text-ivory">SYDIAI Intelligence Agent</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">Guidance for leadership based on current operating signals.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <section>
            <div className="flex items-center gap-2 text-muted">
              <Activity className="h-4 w-4 text-electric/90" strokeWidth={1.75} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">Operating context</p>
            </div>
            <h3 className="mt-3 text-base font-semibold text-ivory">{bundle.headline}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{bundle.context}</p>
          </section>

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Signals</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {bundle.signals.map((s) => (
                <li
                  key={s.label}
                  className="rounded-xl border border-electric/20 bg-electric/[0.07] px-3 py-2 text-xs text-ivory/95"
                >
                  <span className="text-muted">{s.label}</span>
                  <span className="mt-0.5 block font-semibold text-ivory">{s.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Executive narrative</p>
            <ol className="mt-4 space-y-3">
              {bundle.insights.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-ivory/[0.06] text-[11px] font-bold text-electric ring-1 ring-ivory/[0.1]">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-6 text-ivory/90">{line}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="border-t border-ivory/[0.08] px-6 py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">AI operating layer</p>
          <p className="mt-1 text-xs leading-5 text-ivory/80">Sense → Recommend → Route → Execute → Govern</p>
        </div>
      </div>
    </aside>
  );
}
