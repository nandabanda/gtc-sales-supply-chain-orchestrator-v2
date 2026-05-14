/** Demo data for AI Action Board — shared with page UI and CSV export. */

export const actionPulse = [
  { label: "Open Actions", value: "9", status: "Open", cue: "Close today", tone: "amber" as const },
  { label: "Urgent Actions", value: "3", status: "High", cue: "Resolve first", tone: "danger" as const },
  { label: "Approvals Required", value: "4", status: "Pending", cue: "Manager review needed", tone: "amber" as const },
  { label: "Overdue Actions", value: "2", status: "Late", cue: "Escalate now", tone: "danger" as const },
  { label: "Value at Stake", value: "SAR 1.04M", status: "Active", cue: "Active queue", tone: "electric" as const },
  { label: "Value Captured", value: "SAR 30K", status: "Closed", cue: "Track closure daily", tone: "emerald" as const },
];

export const actionQueue = [
  {
    priority: "High",
    id: "ACT-006",
    area: "Stock Rebalance",
    action: "Rebalance SKU-118 from R-03 to R-12",
    owner: "Supply Controller",
    approval: "Required",
    value: "SAR 210K",
    status: "Approval Pending",
    next: "Approve transfer note",
  },
  {
    priority: "High",
    id: "ACT-003",
    area: "Route Resequencing",
    action: "Approve R-12 optimized route sequence",
    owner: "Sales Supervisor",
    approval: "Required",
    value: "SAR 180K",
    status: "Approval Pending",
    next: "Push revised route to driver",
  },
  {
    priority: "High",
    id: "ACT-009",
    area: "Expiry Risk",
    action: "Stop loading SKU-330 on R-07",
    owner: "Inventory Controller",
    approval: "Required",
    value: "SAR 128K",
    status: "Overdue",
    next: "Approve load freeze",
  },
  {
    priority: "High",
    id: "ACT-001",
    area: "Replenishment",
    action: "Release urgent supply for C-184 on R-07",
    owner: "Supply Controller",
    approval: "No",
    value: "SAR 95K",
    status: "Open",
    next: "Publish updated pick list",
  },
  {
    priority: "Medium",
    id: "ACT-007",
    area: "Credit Approval",
    action: "Escalate C-220 temporary credit release",
    owner: "Finance Controller",
    approval: "Required",
    value: "SAR 88K",
    status: "Approval Pending",
    next: "Finance decision today",
  },
  {
    priority: "Medium",
    id: "ACT-004",
    area: "Salesman Coaching",
    action: "Coach S-04 on conversion",
    owner: "Sales Supervisor",
    approval: "No",
    value: "SAR 72K",
    status: "In Progress",
    next: "Schedule ride-along",
  },
  {
    priority: "Medium",
    id: "ACT-002",
    area: "Van Load Correction",
    action: "Add SKU-204 to V-09 load",
    owner: "Dispatch Controller",
    approval: "No",
    value: "SAR 54K",
    status: "In Progress",
    next: "Update wave-2 manifest",
  },
  {
    priority: "Low",
    id: "ACT-010",
    area: "Execution Follow-up",
    action: "Publish S-02 best-practice note",
    owner: "Sales Supervisor",
    approval: "No",
    value: "SAR 30K captured",
    status: "Closed",
    next: "Share coaching template",
  },
];

export const businessCaseCoverage = [
  {
    requirement: "Demand forecasting accuracy",
    capability: "Demand Intelligence forecasts SKU, customer, and route demand with confidence scoring.",
    coverage: "Covered",
    impact: "Forecast accuracy 78.4% -> target 85%+",
  },
  {
    requirement: "Customer-level replenishment",
    capability: "Replenishment Orchestrator recommends what to supply, restrict, rebalance, and approve before dispatch.",
    coverage: "Covered",
    impact: "64 customers prioritized before dispatch",
  },
  {
    requirement: "Overstock and expiry reduction",
    capability: "Expiry and overstock logic identifies slow-moving SKUs, rebalance moves, and avoidable loss.",
    coverage: "Covered",
    impact: "SAR 210K expiry loss avoidance",
  },
  {
    requirement: "Credit-aware sales",
    capability: "Credit holds are routed to Finance Controller before supply release.",
    coverage: "Covered",
    impact: "11 credit decisions controlled",
  },
  {
    requirement: "Route optimization",
    capability: "Route Intelligence prioritizes customer sequence by value, SLA risk, stockout risk, and travel time.",
    coverage: "Covered",
    impact: "14% travel-time reduction opportunity",
  },
  {
    requirement: "Van productivity",
    capability: "Van loading intelligence flags underloaded vans and SKU load corrections before dispatch.",
    coverage: "Covered",
    impact: "2 vans require load correction",
  },
  {
    requirement: "Salesman productivity",
    capability: "Execution Intelligence separates coaching issues from supply and credit constraints.",
    coverage: "Covered",
    impact: "3 salesmen need coaching",
  },
  {
    requirement: "Customer strike rate and recovery",
    capability: "Execution Intelligence identifies missed customers, churn risk, and recovery actions.",
    coverage: "Covered",
    impact: "23 missed high-value visits addressed",
  },
  {
    requirement: "Actionable insights for controllers",
    capability: "AI Action Board converts signals into owned actions with status, approvals, and value at stake.",
    coverage: "Covered",
    impact: "9 open actions · SAR 1.04M value at stake",
  },
  {
    requirement: "Success metrics tracking",
    capability: "Action Board tracks open actions, closure, value captured, adoption, and operating performance.",
    coverage: "Partially Covered",
    impact: "Add next: success metrics tracker",
  },
];

export const approvalQueue = [
  { title: "SKU-118 rebalance", owner: "Supply Controller", value: "SAR 210K", decision: "Approve transfer" },
  { title: "R-12 route sequence", owner: "Sales Supervisor", value: "SAR 180K", decision: "Approve route" },
  { title: "SKU-330 load freeze", owner: "Inventory Controller", value: "SAR 128K", decision: "Stop loading" },
  { title: "C-220 credit release", owner: "Finance Controller", value: "SAR 88K", decision: "Approve or reject credit" },
];

export const funnel = [
  { stage: "Detected", count: 18 },
  { stage: "Assigned", count: 12 },
  { stage: "In Progress", count: 7 },
  { stage: "Approval", count: 4 },
  { stage: "Closed", count: 3 },
];

export const valueByArea = [
  { area: "Replenishment", value: "SAR 95K" },
  { area: "Route", value: "SAR 180K" },
  { area: "Inventory", value: "SAR 338K" },
  { area: "Credit", value: "SAR 88K" },
  { area: "Sales Execution", value: "SAR 102K" },
  { area: "Van Loading", value: "SAR 54K" },
];

export const closedActions = [
  { action: "ACT-010: S-02 best-practice note published", owner: "Sales Supervisor", value: "SAR 30K captured", learning: "Playbook shared to two routes" },
  { action: "ACT-011: R-18 delivery window protected", owner: "Route Planner", value: "SAR 18K captured", learning: "Morning SLA window preserved" },
  { action: "ACT-012: SKU-301 maintained on healthy route", owner: "Supply Controller", value: "SAR 12K protected", learning: "No corrective load required" },
];
