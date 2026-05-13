"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Brain, ClipboardList, Database, LayoutDashboard, MapPinned, Route, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/data-layer", label: "Data Layer", icon: Database },
  { href: "/command-center", label: "Command Center", icon: LayoutDashboard },
  { href: "/demand-intelligence", label: "Demand Intelligence", icon: Brain },
  { href: "/replenishment-orchestrator", label: "Replenishment Orchestrator", icon: Boxes },
  { href: "/route-intelligence", label: "Route Intelligence", icon: Route },
  { href: "/execution-intelligence", label: "Execution Intelligence", icon: MapPinned },
  { href: "/ai-action-board", label: "AI Action Board", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-ivory/[0.08] bg-navy-deep/95 p-5 backdrop-blur-2xl lg:flex">
      <Link
        href="/"
        className="block rounded-2xl border border-electric/25 bg-gradient-to-br from-electric/15 to-electric/[0.06] p-4 shadow-glow ring-1 ring-ivory/[0.06] transition hover:border-electric/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-electric/20 ring-1 ring-electric/35">
            <Sparkles className="h-6 w-6 text-electric" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-electric">Olayan · GTC</p>
            <h1 className="text-base font-semibold leading-tight text-ivory">Sales &amp; Supply Orchestrator</h1>
          </div>
        </div>
      </Link>

      <p className="mt-8 px-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">Navigation</p>
      <nav className="mt-3 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition",
                active
                  ? "border-electric/35 bg-electric/10 text-ivory shadow-[0_0_24px_rgba(26,159,255,0.12)]"
                  : "border-transparent text-muted hover:border-ivory/[0.08] hover:bg-ivory/[0.05] hover:text-ivory",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition",
                  active ? "text-electric" : "text-electric/70 group-hover:text-electric",
                )}
                strokeWidth={1.75}
              />
              <span className="leading-snug">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-ivory/[0.08] bg-ink/80 p-4 ring-1 ring-ivory/[0.04]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Operating loop</p>
        <p className="mt-2 text-sm font-semibold leading-snug text-ivory">Sense → Recommend → Route → Execute → Govern</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">SYDIAI as the decision layer above ERP, WMS, and field systems.</p>
      </div>
    </aside>
  );
}
