"use client";

import { useMemo } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { dataIssuesQueue, executiveReadiness, readinessMatrix } from "@/data/dataLayerSeed";
import { objectsToCsvRows, type CsvPrimitive } from "@/lib/download";

function buildFullExportRows(): Record<string, CsvPrimitive>[] {
  const kpiRows: Record<string, CsvPrimitive>[] = [
    { csv_section: "Executive KPIs", metric: "readinessScore", value: String(executiveReadiness.readinessScore) },
    { csv_section: "Executive KPIs", metric: "mandatoryUploaded", value: executiveReadiness.mandatoryUploaded },
    { csv_section: "Executive KPIs", metric: "recordsProcessed", value: executiveReadiness.recordsProcessed },
    { csv_section: "Executive KPIs", metric: "validationIssues", value: String(executiveReadiness.validationIssues) },
    { csv_section: "Executive KPIs", metric: "lastRefresh", value: executiveReadiness.lastRefresh },
    { csv_section: "Executive KPIs", metric: "orchestrationStatus", value: executiveReadiness.orchestrationStatus },
  ];
  const matrix = objectsToCsvRows(
    readinessMatrix.map((r) => ({ ...r, csv_section: "Data readiness matrix" as const })),
  );
  const issues = objectsToCsvRows(dataIssuesQueue.map((r) => ({ ...r, csv_section: "Data issues queue" as const })));
  return [...kpiRows, ...matrix, ...issues];
}

export function DataLayerDownloadBar() {
  const fullRows = useMemo(() => buildFullExportRows(), []);
  const issueRows = useMemo(() => objectsToCsvRows(dataIssuesQueue.map((r) => ({ ...r, csv_section: "Data issues queue" }))), []);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
      <DownloadButton label="Download Current View" filename="gtc-gold-data-readiness.csv" rows={fullRows} />
      <DownloadButton label="Export Table" filename="gtc-data-issues-queue.csv" rows={issueRows} variant="ghost" />
    </div>
  );
}
