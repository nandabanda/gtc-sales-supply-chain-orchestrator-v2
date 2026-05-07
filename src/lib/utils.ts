export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function badgeTone(value: string) {
  if (["High", "Stockout", "Expiry", "High velocity", "Demand spike"].includes(value)) return "border-danger/40 bg-danger/10 text-rose-100";
  if (["Medium", "Low strike"].includes(value)) return "border-amber/40 bg-amber/10 text-amber-100";
  return "border-emerald/40 bg-emerald/10 text-emerald-100";
}
