import { cn } from "@/lib/utils";
import { PageTitle, Panel } from "@/components/Cards";
import { ConfidenceChart, ForecastChart } from "@/components/Charts";

const demandPulse = [
  { label: "Next Week Demand", value: "12.4K cases", status: "+9.1% vs last week", cue: "R-07 and R-12 rising", tone: "emerald" },
  { label: "Forecast Confidence", value: "88%", status: "Stable", cue: "2 routes need review", tone: "electric" },
  { label: "Demand Growth Routes", value: "2", status: "R-07 / R-12", cue: "Raise planning baseline", tone: "amber" },
  { label: "Stockout Risk Customers", value: "14", status: "High", cue: "Align replenishment early", tone: "danger" },
  { label: "Planning Actions", value: "6 open", status: "Pending", cue: "Close before dispatch", tone: "amber" },
] as const;

const hotspots = [
  {
    route: "Route R-07",
    sku: "Fast-moving beverages",
    signal: "+18% expected uplift",
    risk: "Stockout risk",
    action: "Increase forecast and share must-load list with replenishment",
    owner: "Demand Planning Lead",
  },
  {
    route: "Route R-12",
    sku: "Juice 1L / chilled",
    signal: "Repeated under-forecast",
    risk: "Forecast confidence gap",
    action: "Use fill-corrected history and review promo uplift",
    owner: "Demand Planning Lead",
  },
  {
    route: "Customer C-184",
    sku: "Core beverages",
    signal: "Buying frequency rising",
    risk: "Under-replenished account",
    action: "Raise next-cycle demand and flag to Supply Controller",
    owner: "Planner",
  },
  {
    route: "Route R-03",
    sku: "Chilled SKUs",
    signal: "Volatile actuals",
    risk: "Low confidence",
    action: "Send to exception review before auto-replenishment",
    owner: "Demand Planning Lead",
  },
] as const;

const forecastTrend = [
  { week: "W1", actual: 840, forecast: 810, confidence: 72 },
  { week: "W2", actual: 910, forecast: 895, confidence: 75 },
  { week: "W3", actual: 870, forecast: 900, confidence: 70 },
  { week: "W4", actual: 980, forecast: 955, confidence: 78 },
  { week: "W5", actual: 1030, forecast: 1015, confidence: 81 },
  { week: "W6", actual: 1080, forecast: 1105, confidence: 84 },
  { week: "W7", actual: 1160, forecast: 1140, confidence: 86 },
  { week: "W8", actual: 1210, forecast: 1235, confidence: 88 },
];

const routeExceptions = [
  { route: "R-07", demand: 92, fill: 74, risk: "High", action: "Increase load plan", owner: "Supply Controller" },
  { route: "R-12", demand: 88, fill: 79, risk: "High", action: "Review promo uplift", owner: "Demand Planning Lead" },
  { route: "R-03", demand: 76, fill: 83, risk: "Medium", action: "Exception review", owner: "Planner" },
  { route: "R-18", demand: 71, fill: 86, risk: "Medium", action: "Monitor", owner: "Planner" },
  { route: "R-22", demand: 64, fill: 91, risk: "Low", action: "No action", owner: "Planner" },
] as const;

const planningActions = [
  {
    priority: "High",
    action: "Increase R-07 fast-mover forecast before dispatch",
    owner: "Demand Planning Lead",
    impact: "Protect service on growth route",
    status: "Open",
  },
  {
    priority: "High",
    action: "Review R-12 juice 1L uplift using fill-corrected history",
    owner: "Demand Planning Lead",
    impact: "Reduce under-forecast risk",
    status: "Open",
  },
  {
    priority: "Medium",
    action: "Flag C-184 for higher replenishment next cycle",
    owner: "Planner",
    impact: "Protect high-frequency account",
    status: "In Progress",
  },
  {
    priority: "Medium",
    action: "Send R-03 chilled SKUs to exception review",
    owner: "Demand Planning Lead",
    impact: "Reduce low-confidence replenishment",
    status: "Ready",
  },
  {
    priority: "High",
    action: "Share must-load SKU list with van loading team",
    owner: "Planner",
    impact: "Improve loading accuracy",
    status: "Open",
  },
] as const;

export default function DemandIntelligence() {
  return (
    <>
      <PageTitle
        eyebrow="Planning"
        title="Demand Intelligence"
        subtitle="Forecast SKU, customer, and route demand so replenishment teams know what to prepare before dispatch."
      />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Demand Pulse</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {demandPulse.map((k) => (
            <PulseCard key={k.label} {...k} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Demand Hotspots</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Route", "SKU / Category", "Demand Signal", "Risk", "Recommended Planning Action", "Owner"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotspots.map((x) => (
                  <tr key={`${x.route}-${x.sku}`} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 font-semibold text-ink/90">{x.route}</td>
                    <td className="px-3 py-3 text-ink/85">{x.sku}</td>
                    <td className="px-3 py-3 text-ink/85">{x.signal}</td>
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", x.risk.includes("Stockout") ? "border-danger/45 bg-danger/12 text-ink" : x.risk.includes("Low") ? "border-amber/50 bg-amber/12 text-ink" : "border-electric/45 bg-electric/10 text-ink")}>
                        {x.risk}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink/85">{x.action}</td>
                    <td className="px-3 py-3 text-ink/85">{x.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-2">
        <Panel title="Forecast vs Actual" subtitle="Shows where demand is moving away from the plan.">
          <ForecastChart data={forecastTrend} />
        </Panel>
        <Panel title="Forecast Confidence" subtitle="Shows where the model is reliable and where human review is needed.">
          <ConfidenceChart data={forecastTrend} />
        </Panel>
      </section>

      <section className="mt-10">
        <Panel title="Route Forecast Exceptions">
          <div className="overflow-hidden rounded-xl border border-ivory/10 ring-1 ring-ivory/[0.04]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-ivory/[0.06] text-[11px] font-semibold uppercase tracking-wider text-muted">
                <tr>
                  {["Route", "Forecast Demand", "Fill Readiness", "Risk Level", "Required Action", "Owner"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routeExceptions.map((r) => (
                  <tr key={r.route} className="border-t border-ivory/[0.06] transition hover:bg-ivory/[0.03]">
                    <td className="px-4 py-3 text-ivory/90">{r.route}</td>
                    <td className="px-4 py-3 text-ivory/90">{r.demand}</td>
                    <td className="px-4 py-3 text-ivory/90">{r.fill}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold", r.risk === "High" ? "border-danger/45 bg-danger/12 text-ivory" : r.risk === "Medium" ? "border-amber/50 bg-amber/12 text-ivory" : "border-emerald/40 bg-emerald/12 text-ivory")}>
                        {r.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ivory/90">{r.action}</td>
                    <td className="px-4 py-3 text-ivory/90">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Planning Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {planningActions.map((a) => (
            <PlanningActionCard key={a.action} {...a} />
          ))}
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
  tone: "emerald" | "electric" | "amber" | "danger";
}) {
  const map = {
    emerald: "border-emerald/45 bg-emerald/12 text-emerald",
    electric: "border-electric/45 bg-electric/10 text-electric",
    amber: "border-amber/50 bg-amber/12 text-amber",
    danger: "border-danger/45 bg-danger/12 text-danger",
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

function PlanningActionCard({
  priority,
  action,
  owner,
  impact,
  status,
}: {
  priority: string;
  action: string;
  owner: string;
  impact: string;
  status: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-ivory p-5 text-ink shadow-[0_12px_40px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04]">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-electric via-electric/80 to-electric/30" aria-hidden />
      <p className="pl-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/55">Priority</p>
      <p className={cn("pl-2 text-sm font-semibold", priority === "High" ? "text-danger" : "text-amber")}>{priority}</p>
      <p className="mt-3 pl-2 text-sm font-semibold text-ink">{action}</p>
      <p className="mt-2 pl-2 text-xs text-ink/75">
        <span className="font-semibold text-ink/90">Owner:</span> {owner}
      </p>
      <p className="mt-1 pl-2 text-xs text-ink/75">
        <span className="font-semibold text-ink/90">Impact:</span> {impact}
      </p>
      <div className="mt-3 pl-2">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
            status === "In Progress"
              ? "border-electric/45 bg-electric/10 text-ink"
              : status === "Ready"
                ? "border-amber/50 bg-amber/12 text-ink"
                : "border-emerald/45 bg-emerald/12 text-ink",
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
