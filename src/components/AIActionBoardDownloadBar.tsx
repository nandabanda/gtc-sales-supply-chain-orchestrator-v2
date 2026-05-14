"use client";

import { useMemo } from "react";
import { DownloadButton } from "@/components/DownloadButton";
import { actionQueue, businessCaseCoverage } from "@/data/aiActionBoardSeed";
import { objectsToCsvRows } from "@/lib/download";

export function AIActionBoardDownloadBar() {
  const fullRows = useMemo(() => {
    const actions = objectsToCsvRows(actionQueue.map((r) => ({ ...r, csv_section: "Governance action" })));
    const coverage = objectsToCsvRows(businessCaseCoverage.map((r) => ({ ...r, csv_section: "Business case coverage" })));
    return [...actions, ...coverage];
  }, []);

  const actionOnly = useMemo(() => objectsToCsvRows(actionQueue.map((r) => ({ ...r, csv_section: "Governance action" }))), []);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
      <DownloadButton label="Download Current View" filename="gtc-ai-action-board.csv" rows={fullRows} />
      <DownloadButton label="Export Table" filename="gtc-ai-action-queue.csv" rows={actionOnly} variant="ghost" />
    </div>
  );
}
