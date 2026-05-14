export type CsvPrimitive = string | number | boolean | null | undefined;

/** Normalize any JSON-friendly value for CSV cells. */
export function normalizeToCsvPrimitive(value: unknown): CsvPrimitive {
  if (value === undefined) return "";
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** RFC 4180–style field escaping. */
export function escapeCsvCell(value: CsvPrimitive): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function convertRowsToCsv(rows: Record<string, CsvPrimitive>[]): string {
  if (rows.length === 0) return "";
  const keySet = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) keySet.add(k);
  }
  const keys = Array.from(keySet);
  const lines = [
    keys.map((k) => escapeCsvCell(k)).join(","),
    ...rows.map((row) => keys.map((k) => escapeCsvCell(row[k])).join(",")),
  ];
  return lines.join("\r\n");
}

export function objectsToCsvRows<T extends object>(items: T[]): Record<string, CsvPrimitive>[] {
  return items.map((item) => {
    const row: Record<string, CsvPrimitive> = {};
    for (const [k, v] of Object.entries(item)) {
      row[k] = normalizeToCsvPrimitive(v);
    }
    return row;
  });
}

export function downloadCsv(filename: string, rows: Record<string, CsvPrimitive>[]) {
  const csv = convertRowsToCsv(rows);
  const bom = "\uFEFF";
  const blob = new Blob([bom + (csv.length ? csv : "message,no_data")], { type: "text/csv;charset=utf-8;" });
  const name = filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
