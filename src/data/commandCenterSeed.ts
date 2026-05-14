/** Demo data for Command Center — shared with page UI and CSV export. */

export const operatingPulse = [
  { label: "Revenue at Risk", value: "SAR 1.24M", status: "High", cue: "9 open actions", tone: "danger" as const },
  { label: "Stockout Risk", value: "14 customers", status: "Active", cue: "Prioritize R-07", tone: "amber" as const },
  { label: "Expiry Exposure", value: "SAR 210K", status: "High", cue: "Rebalance pending", tone: "danger" as const },
  { label: "Route Productivity", value: "3 routes below benchmark", status: "Watch", cue: "R-12 ready", tone: "amber" as const },
  { label: "Open Actions", value: "9 actions", status: "Open", cue: "4 approvals pending", tone: "electric" as const },
];

export const criticalActions = [
  {
    priority: "High",
    issue: "R-07 stockout risk",
    action: "Increase fast-moving SKU load before dispatch",
    owner: "Supply Controller",
    impact: "Protect SAR 95K",
    status: "Open",
  },
  {
    priority: "High",
    issue: "SKU-118 expiry exposure",
    action: "Rebalance stock from R-03 to R-12",
    owner: "Inventory Controller",
    impact: "Avoid SAR 210K loss",
    status: "Approval Required",
  },
  {
    priority: "Medium",
    issue: "S-04 low strike rate",
    action: "Coach on priority customer conversion",
    owner: "Sales Supervisor",
    impact: "+7.5% strike rate",
    status: "In Progress",
  },
  {
    priority: "Medium",
    issue: "R-12 inefficient sequence",
    action: "Approve optimized route sequence",
    owner: "Route Planner",
    impact: "-14% travel time",
    status: "Ready",
  },
  {
    priority: "High",
    issue: "C-184 under-replenished",
    action: "Increase replenishment before next cycle",
    owner: "Supply Controller",
    impact: "Growth account protected",
    status: "Open",
  },
];

export const riskMap = [
  { area: "Demand", count: "6 forecast exceptions", value: "SAR 320K at risk", next: "Review top SKU lanes" },
  { area: "Inventory", count: "5 SKU exposures", value: "SAR 210K expiry", next: "Rebalance SKU-118" },
  { area: "Routes", count: "3 routes below target", value: "14% time gain open", next: "Approve R-12 sequence" },
  { area: "Vans", count: "2 underloaded vans", value: "Utilization below plan", next: "Correct pre-dispatch loads" },
  { area: "Customers", count: "14 at risk", value: "SAR 95K near-term", next: "Prioritize replenishment" },
  { area: "Salesmen", count: "2 coaching gaps", value: "+7.5% strike upside", next: "Run conversion coaching" },
];

export const funnel = [
  { stage: "Detected", count: 18 },
  { stage: "Assigned", count: 12 },
  { stage: "In Progress", count: 7 },
  { stage: "Approval", count: 4 },
  { stage: "Closed", count: 3 },
];

export const topActions = [
  { action: "Rebalance van load for R-07", impact: "SAR 142K", owner: "Supply Controller" },
  { action: "Prioritize missed high-value customers", impact: "SAR 96K", owner: "Sales Supervisor" },
  { action: "Restrict SKU-330 replenishment", impact: "SAR 41K", owner: "Warehouse" },
  { action: "Resequence Route R-12", impact: "14% time saving", owner: "Route Planner" },
];
