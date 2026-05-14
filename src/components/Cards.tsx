import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageTitle({
  eyebrow,
  title,
  subtitle,
  aside,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
}) {
  return (
    <section className="relative py-8">
      <div className="absolute left-0 top-10 h-12 w-1 rounded-full bg-gradient-to-b from-electric to-electric/20" aria-hidden />
      <div className={cn("pl-6", aside ? "flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12" : undefined)}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-electric">{eyebrow}</p>
          <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-tight text-ivory md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{subtitle}</p>
        </div>
        {aside}
      </div>
    </section>
  );
}

export function KPICard({ label, value, delta, tone = "cyan" }: { label: string; value: string; delta: string; tone?: string }) {
  const toneMap: Record<string, string> = {
    emerald: "text-emerald border-emerald/35 bg-emerald/10",
    amber: "text-amber border-amber/35 bg-amber/10",
    danger: "text-danger border-danger/35 bg-danger/10",
    cyan: "text-electric border-electric/35 bg-electric/10",
  };
  return (
    <div className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.04]">
      <p className="text-sm text-muted">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight text-ivory">{value}</p>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", toneMap[tone] ?? toneMap.cyan)}>{delta}</span>
      </div>
    </div>
  );
}

export function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.04]">
      <div className="mb-5 flex flex-col gap-1 border-b border-ivory/[0.06] pb-4">
        <h3 className="text-lg font-semibold text-ivory">{title}</h3>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: Array<Record<string, string | number>> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ivory/10 ring-1 ring-ivory/[0.04]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ivory/[0.06] text-[11px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-ivory/[0.06] transition hover:bg-ivory/[0.03]">
              {columns.map((c) => (
                <td key={c} className="px-4 py-3 text-ivory/90">
                  {r[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
