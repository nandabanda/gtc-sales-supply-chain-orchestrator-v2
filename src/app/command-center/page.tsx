import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/Cards";
import { CommandCenterDownloadBar } from "@/components/CommandCenterDownloadBar";
import { criticalActions, funnel, operatingPulse, riskMap, topActions } from "@/data/commandCenterSeed";

export default function CommandCenter() {
  return (
    <>
      <PageTitle
        eyebrow="Daily Operations"
        title="Command Center"
        subtitle="Today’s operating view across demand, inventory, routes, vans, customers, and field execution."
      />

      <CommandCenterDownloadBar />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Operating Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {operatingPulse.map((k) => (
            <PulseCard key={k.label} {...k} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Today&apos;s Critical Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {criticalActions.map((x) => (
            <ActionCard key={x.issue} {...x} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Operating Risk Map</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {riskMap.map((x) => (
            <div key={x.area} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <p className="text-sm font-semibold text-ivory">{x.area}</p>
              <p className="mt-2 text-sm text-ivory/85">{x.count}</p>
              <p className="mt-1 text-xs text-ivory/65">{x.value}</p>
              <p className="mt-3 text-xs font-medium text-electric">{x.next}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Execution Funnel</h3>
        <div className="grid gap-3 md:grid-cols-5">
          {funnel.map((x) => (
            <div key={x.stage} className="glass rounded-2xl px-4 py-5 text-center ring-1 ring-ivory/[0.05]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/55">{x.stage}</p>
              <p className="mt-2 text-3xl font-semibold text-ivory">{x.count}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Top AI Actions</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  <th className="px-3 py-3 font-medium">Action</th>
                  <th className="px-3 py-3 font-medium">Impact</th>
                  <th className="px-3 py-3 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {topActions.map((x) => (
                  <tr key={x.action} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 text-ink/90">{x.action}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{x.impact}</td>
                    <td className="px-3 py-3 text-ink/85">{x.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
    danger: "border-danger/45 bg-danger/10 text-danger",
    amber: "border-amber/50 bg-amber/10 text-amber",
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

function ActionCard({
  priority,
  issue,
  action,
  owner,
  impact,
  status,
}: {
  priority: string;
  issue: string;
  action: string;
  owner: string;
  impact: string;
  status: string;
}) {
  const statusTone =
    status === "Approval Required"
      ? "border-amber/50 bg-amber/12 text-ink"
      : status === "In Progress" || status === "Ready"
        ? "border-electric/45 bg-electric/12 text-ink"
        : "border-emerald/45 bg-emerald/12 text-ink";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ivory p-5 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04]">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-electric via-electric/80 to-electric/30" aria-hidden />
      <p className="pl-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/55">Priority</p>
      <p className={cn("pl-2 text-sm font-semibold", priority === "High" ? "text-danger" : "text-amber")}>{priority}</p>
      <p className="mt-3 pl-2 text-sm font-semibold text-ink">{issue}</p>
      <p className="mt-1 pl-2 text-sm text-ink/85">{action}</p>
      <p className="mt-3 pl-2 text-xs text-ink/75">
        <span className="font-semibold text-ink/90">Owner:</span> {owner}
      </p>
      <p className="mt-1 pl-2 text-xs text-ink/75">
        <span className="font-semibold text-ink/90">Impact:</span> {impact}
      </p>
      <div className="mt-3 pl-2">
        <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", statusTone)}>{status}</span>
      </div>
    </div>
  );
}
