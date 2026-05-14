"use client";

import { downloadCsv, type CsvPrimitive } from "@/lib/download";
import { cn } from "@/lib/utils";

export type DownloadButtonProps = {
  label: string;
  filename: string;
  rows: Record<string, CsvPrimitive>[];
  variant?: "solid" | "ghost";
  className?: string;
  disabled?: boolean;
};

export function DownloadButton({
  label,
  filename,
  rows,
  variant = "solid",
  className,
  disabled: disabledProp,
}: DownloadButtonProps) {
  const disabled = disabledProp ?? rows.length === 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => downloadCsv(filename, rows)}
      className={cn(
        "shrink-0 rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        variant === "solid"
          ? "border-electric/40 bg-electric/15 text-ivory hover:border-electric/55 hover:bg-electric/20"
          : "border-ivory/15 bg-ivory/[0.04] text-ivory/85 hover:border-ivory/25 hover:bg-ivory/[0.08]",
        className,
      )}
    >
      {label}
    </button>
  );
}
