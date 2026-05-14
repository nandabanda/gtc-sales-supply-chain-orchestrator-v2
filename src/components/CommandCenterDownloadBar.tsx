"use client";

import { useMemo } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { criticalActions, funnel, operatingPulse, riskMap, topActions } from "@/data/commandCenterSeed";
import { objectsToCsvRows, type CsvPrimitive } from "@/lib/download";

export function CommandCenterDownloadBar() {
  const fullRows = useMemo(() => {
    const pulse: Record<string, CsvPrimitive>[] = operatingPulse.map((p) => ({
      csv_section: "Executive KPI pulse",
      label: p.label,
      value: p.value,
      status: p.status,
      cue: p.cue,
    }));
    const crit = objectsToCsvRows(criticalActions.map((r) => ({ ...r, csv_section: "Critical action" })));
    const risks = objectsToCsvRows(riskMap.map((r) => ({ ...r, csv_section: "Risk opportunity" })));
    const fun = objectsToCsvRows(funnel.map((r) => ({ ...r, csv_section: "Execution funnel" })));
    const top = objectsToCsvRows(topActions.map((r) => ({ ...r, csv_section: "Top AI action" })));
    return [...pulse, ...crit, ...risks, ...fun, ...top];
  }, []);

  const riskOnly = useMemo(() => objectsToCsvRows(riskMap.map((r) => ({ ...r, csv_section: "Risk opportunity" }))), []);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
      <DownloadButton label="Download Current View" filename="gtc-command-center-summary.csv" rows={fullRows} />
      <DownloadButton label="Export Table" filename="gtc-command-center-risk-queue.csv" rows={riskOnly} variant="ghost" />
    </div>
  );
}
