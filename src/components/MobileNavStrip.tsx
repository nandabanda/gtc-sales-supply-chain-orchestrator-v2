import Link from "next/link";

const links = [
  { href: "/", label: "Overview" },
  { href: "/command-center", label: "Command" },
  { href: "/demand-intelligence", label: "Demand" },
  { href: "/replenishment-orchestrator", label: "Replenish" },
  { href: "/route-intelligence", label: "Routes" },
  { href: "/execution-intelligence", label: "Execution" },
  { href: "/ai-action-board", label: "Actions" },
];

export function MobileNavStrip() {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 flex gap-2 overflow-x-auto border-b border-ivory/[0.08] bg-ink/92 px-4 py-2.5 backdrop-blur-xl lg:hidden"
    >
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="shrink-0 rounded-full border border-ivory/10 bg-ivory/[0.05] px-3 py-1.5 text-xs font-medium text-ivory/90 transition hover:border-electric/35 hover:bg-electric/10"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
