import { PageTitle } from "@/components/Cards";
import { DataLayerDownloadBar } from "@/components/DataLayerDownloadBar";
import { cn } from "@/lib/utils";
import {
  advancedDatasets,
  certificationStages,
  dataIssuesQueue,
  executiveReadiness,
  mandatoryDatasets,
  moduleImpacts,
  readinessMatrix,
  validationRules,
  type DatasetCard,
  type ValidationPill,
} from "@/data/dataLayerSeed";

type ModuleImpactRow = (typeof moduleImpacts)[number];
type DataIssueRow = (typeof dataIssuesQueue)[number];

export default function DataLayerPage() {
  return (
    <>
      <PageTitle
        eyebrow="Data foundation"
        title="Gold Data Layer"
        subtitle="Certify the operational data foundation before activating demand, replenishment, route, execution and governance intelligence."
      />

      <DataLayerDownloadBar />

      <section>
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Executive Readiness</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <ReadinessKpi label="Data Readiness Score" value={`${executiveReadiness.readinessScore}%`} status="Target 90%+" cue="Certify gaps" tone="amber" />
          <ReadinessKpi label="Mandatory Files" value={executiveReadiness.mandatoryUploaded} status="Upload" cue="2 remaining" tone="amber" />
          <ReadinessKpi label="Records Processed" value={executiveReadiness.recordsProcessed} status="Pipeline" cue="Last run clean" tone="electric" />
          <ReadinessKpi label="Validation Issues" value={String(executiveReadiness.validationIssues)} status="Queue" cue="See steward" tone="danger" />
          <ReadinessKpi label="Last Refresh" value={executiveReadiness.lastRefresh} status="Schedule" cue="06:12 AST" tone="emerald" />
          <ReadinessKpi label="Orchestration Status" value={executiveReadiness.orchestrationStatus} status="Gates" cue="Gold partial" tone="amber" />
        </div>
        <div className="mt-4 glass rounded-2xl p-4 ring-1 ring-ivory/[0.05]">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>Readiness score</span>
            <span className="font-semibold text-ivory">{executiveReadiness.readinessScore}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ivory/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric via-electric to-emerald/90"
              style={{ width: `${executiveReadiness.readinessScore}%` }}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Required Data Upload Console</h3>
        <p className="mb-4 max-w-3xl text-sm text-muted">Upload staging only — files are validated locally in this release; ERP/WMS connectors follow.</p>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ivory/50">Mandatory</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mandatoryDatasets.map((d) => (
            <UploadCard key={d.name} dataset={d} />
          ))}
        </div>
        <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-ivory/50">Advanced</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {advancedDatasets.map((d) => (
            <UploadCard key={d.name} dataset={d} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Data Readiness Matrix</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Data Domain", "Dataset", "Required For", "Status", "Completeness", "Quality", "Issues", "Owner"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {readinessMatrix.map((r) => (
                  <tr key={r.domain} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 font-semibold text-ink/90">{r.domain}</td>
                    <td className="max-w-[200px] px-3 py-3 text-ink/85">{r.dataset}</td>
                    <td className="max-w-[220px] px-3 py-3 text-xs text-ink/75">{r.requiredFor}</td>
                    <td className="px-3 py-3">
                      <MatrixStatus status={r.status} />
                    </td>
                    <td className="px-3 py-3">
                      <CompletenessBar value={r.completeness} />
                    </td>
                    <td className="px-3 py-3 tabular-nums font-medium">{r.qualityScore}%</td>
                    <td className="max-w-[200px] px-3 py-3 text-xs text-ink/80">{r.issues}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink/85">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Validation Rules</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {validationRules.map((v) => (
            <div key={v.rule} className="flex items-center justify-between gap-3 rounded-2xl border border-ivory/10 bg-ivory/[0.04] px-4 py-3 ring-1 ring-ivory/[0.06]">
              <p className="text-sm font-medium text-ivory/90">{v.rule}</p>
              <ValidationPillTag pill={v.pill} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Gold Layer Certification</h3>
        <div className="glass rounded-2xl p-6 ring-1 ring-ivory/[0.05]">
          <div className="grid gap-6 md:grid-cols-4">
            {certificationStages.map((s, i) => (
              <div key={s.id} className="relative">
                {i < certificationStages.length - 1 && (
                  <div className="absolute left-[calc(50%+1.5rem)] top-5 hidden h-0.5 w-[calc(100%-3rem)] bg-ivory/10 md:block" aria-hidden />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold",
                      s.pct >= 90 ? "border-emerald/50 bg-emerald/15 text-emerald" : s.pct >= 70 ? "border-electric/45 bg-electric/12 text-electric" : "border-amber/50 bg-amber/12 text-amber",
                    )}
                  >
                    {s.pct}%
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ivory">{s.label}</p>
                  <p className="mt-1 text-xs text-muted">{s.description}</p>
                  <div className="mt-3 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-ivory/[0.08]">
                    <div className="h-full rounded-full bg-electric/80" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Impact on Modules</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {moduleImpacts.map((m) => (
            <div key={m.module} className="glass rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ivory">{m.module}</p>
                <ModuleStatusBadge status={m.status} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">Needs: {m.needs}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">Data Issues Queue</h3>
        <div className="overflow-hidden rounded-2xl border border-ivory/10 bg-ivory text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
              <thead className="bg-ink/[0.04] text-[10px] font-semibold uppercase tracking-wider text-ink/55">
                <tr>
                  {["Issue", "Dataset", "Severity", "Business Impact", "Owner", "Recommended Fix", "Status"].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataIssuesQueue.map((row) => (
                  <tr key={row.issue} className="border-t border-ink/[0.07]">
                    <td className="px-3 py-3 font-medium text-ink/90">{row.issue}</td>
                    <td className="px-3 py-3 text-ink/85">{row.dataset}</td>
                    <td className="px-3 py-3">
                      <SeverityPill severity={row.severity} />
                    </td>
                    <td className="max-w-[220px] px-3 py-3 text-xs text-ink/80">{row.impact}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink/85">{row.owner}</td>
                    <td className="max-w-[240px] px-3 py-3 text-xs text-ink/80">{row.fix}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full border border-ink/15 bg-ink/[0.04] px-2.5 py-0.5 text-[10px] font-semibold text-ink/80">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10 xl:hidden">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-electric">SYDIAI Data Steward</h3>
        <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.04] p-5 ring-1 ring-ivory/[0.06]">
          <DataStewardNarrative />
        </div>
        <p className="mt-2 text-xs text-muted">On desktop, the steward appears in the right panel.</p>
      </section>
    </>
  );
}

function DataStewardNarrative() {
  return (
    <p className="text-sm font-medium leading-relaxed text-ivory/90">
      Replenishment is partially ready. SKU master, sales history and inventory are available, but lead time and MOQ are incomplete for 11 SKUs. This may reduce reorder accuracy and supplier PO confidence. Route intelligence is waiting on van capacity for three routes. Close lead time and capacity gaps before marking the gold layer certified for orchestration.
    </p>
  );
}

function ReadinessKpi({
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
      <p className="mt-2 text-xl font-semibold tabular-nums text-ivory sm:text-2xl">{value}</p>
      <p className={cn("mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", map[tone])}>
        {status} · {cue}
      </p>
    </div>
  );
}

function UploadCard({ dataset: d }: { dataset: DatasetCard }) {
  return (
    <div className="glass flex flex-col rounded-2xl p-5 ring-1 ring-ivory/[0.05]">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug text-ivory">{d.name}</h4>
        <UploadStatusPill status={d.uploadStatus} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{d.purpose}</p>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/45">Required fields</p>
      <p className="mt-1 font-mono text-[11px] leading-snug text-electric/90">{d.requiredFields}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-ivory/65">
        <span>
          Validation: <span className="text-ivory/90">{d.validationStatus}</span>
        </span>
        <span className="text-ivory/35">|</span>
        <span>
          Records: <span className="tabular-nums text-ivory">{d.recordCount}</span>
        </span>
        <span className="text-ivory/35">|</span>
        <span>Last: {d.lastUploaded}</span>
      </div>
      <div className="mt-4">
        <label className="inline-flex cursor-not-allowed">
          <input type="file" className="sr-only" disabled aria-disabled tabIndex={-1} />
          <span className="rounded-xl border border-ivory/15 bg-ivory/[0.06] px-4 py-2.5 text-xs font-semibold text-ivory/50 ring-1 ring-black/20">
            Upload (staging)
          </span>
        </label>
      </div>
    </div>
  );
}

function UploadStatusPill({ status }: { status: DatasetCard["uploadStatus"] }) {
  const cls =
    status === "Uploaded"
      ? "border-emerald/45 bg-emerald/12 text-emerald"
      : status === "Missing"
        ? "border-danger/45 bg-danger/12 text-danger"
        : "border-amber/50 bg-amber/14 text-amber";
  return <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", cls)}>{status}</span>;
}

function MatrixStatus({ status }: { status: string }) {
  const tone = status === "Ready" ? "ok" : status === "Blocked" ? "bad" : "warn";
  const cls =
    tone === "ok" ? "border-emerald/45 bg-emerald/12 text-emerald" : tone === "bad" ? "border-danger/45 bg-danger/12 text-danger" : "border-amber/50 bg-amber/14 text-amber";
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", cls)}>{status}</span>;
}

function CompletenessBar({ value }: { value: number }) {
  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.08]">
        <div className={cn("h-full rounded-full", value >= 85 ? "bg-emerald/80" : value >= 70 ? "bg-electric/80" : "bg-amber/80")} style={{ width: `${value}%` }} />
      </div>
      <span className="tabular-nums text-xs font-semibold text-ink/80">{value}%</span>
    </div>
  );
}

function ValidationPillTag({ pill }: { pill: ValidationPill }) {
  const cls =
    pill === "pass"
      ? "border-emerald/45 bg-emerald/12 text-emerald"
      : pill === "warn"
        ? "border-amber/50 bg-amber/14 text-amber"
        : "border-danger/45 bg-danger/12 text-danger";
  const label = pill === "pass" ? "Pass" : pill === "warn" ? "Review" : "Fail";
  return <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", cls)}>{label}</span>;
}

function ModuleStatusBadge({ status }: { status: ModuleImpactRow["status"] }) {
  const cls =
    status === "Ready"
      ? "border-emerald/45 bg-emerald/12 text-emerald"
      : status === "Blocked"
        ? "border-danger/45 bg-danger/12 text-danger"
        : "border-amber/50 bg-amber/14 text-amber";
  return <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", cls)}>{status}</span>;
}

function SeverityPill({ severity }: { severity: DataIssueRow["severity"] }) {
  const cls =
    severity === "High" ? "border-danger/45 bg-danger/12 text-danger" : severity === "Medium" ? "border-amber/50 bg-amber/14 text-amber" : "border-ivory/20 bg-ivory/[0.06] text-ivory/80";
  return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", cls)}>{severity}</span>;
}
