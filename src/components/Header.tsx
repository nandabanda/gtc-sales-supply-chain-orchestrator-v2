export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ivory/[0.08] bg-ink/75 px-5 py-4 backdrop-blur-xl lg:px-8">
      <div className="pulse-bar absolute bottom-0 left-0 right-0 h-px opacity-70" aria-hidden />
      <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-electric">GTC Sales &amp; Supply Chain Orchestrator</p>
          <h2 className="mt-2 max-w-3xl text-xl font-semibold tracking-tight text-ivory md:text-2xl">
            One operating layer for demand, replenishment, routing, execution, and governance.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Built for <span className="text-ivory/90">Olayan Group / GTC</span> operations.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald/35 bg-emerald/10 px-3 py-1.5 text-[11px] font-medium text-emerald">Models active</span>
          <span className="rounded-full border border-ivory/15 bg-ivory/[0.06] px-3 py-1.5 text-[11px] font-medium text-ivory/85">Live reasoning panel →</span>
        </div>
      </div>
    </header>
  );
}
