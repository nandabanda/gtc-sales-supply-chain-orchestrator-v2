function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export type SourceModule =
  | "Demand Forecasting"
  | "Replenishment Orchestrator"
  | "Van Loading Intelligence"
  | "Route Optimization Intelligence"
  | "Salesman Coaching Intelligence"
  | "Customer Opportunity Intelligence"
  | "Expiry & Overstock Risk Intelligence";

export type ActionType =
  | "Forecast Review"
  | "Urgent Replenishment"
  | "Van Load Correction"
  | "Route Resequencing"
  | "Salesman Coaching"
  | "Customer Recovery"
  | "SKU Liquidation"
  | "Stock Rebalance"
  | "Credit Approval"
  | "Supervisor Approval"
  | "Expiry Risk Escalation"
  | "Execution Follow-up";

export type ActionUrgency = "High" | "Medium" | "Low";
export type ImpactType = "Revenue Protection" | "Cost Avoidance" | "Service Uplift" | "Productivity" | "Working Capital";
export type GovernanceStatus = "Open" | "In Progress" | "Approval Pending" | "Closed" | "Review Required";
export type Approver = "Finance Controller" | "Sales Supervisor" | "Inventory Controller" | "Supply Controller" | "Area Sales Manager" | "None";
export type Owner =
  | "Supply Controller"
  | "Dispatch Controller"
  | "Sales Supervisor"
  | "Area Sales Manager"
  | "Inventory Controller"
  | "Finance Controller";

export type GovernanceAction = {
  actionId: string;
  actionType: ActionType;
  sourceModule: SourceModule;
  signal: string;
  diagnosis: string;
  recommendedAction: string;
  owner: Owner;
  approver: Approver;
  urgency: ActionUrgency;
  priorityScore: number;
  expectedImpact: string;
  impactType: ImpactType;
  valueAtStake: number;
  valueCaptured: number;
  approvalRequired: boolean;
  approvalReason: string;
  dueDate: string;
  daysOpen: number;
  overdueFlag: boolean;
  status: GovernanceStatus;
  confidenceScore: number;
  nextStep: string;
  governanceReason: string;
};

type ActionSeed = Omit<
  GovernanceAction,
  | "priorityScore"
  | "urgency"
  | "approvalRequired"
  | "approvalReason"
  | "dueDate"
  | "overdueFlag"
  | "governanceReason"
>;

function formatDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function deriveApproval(seed: ActionSeed): { required: boolean; approver: Approver; reason: string } {
  const highValue = seed.valueAtStake >= 120;
  if (seed.actionType === "Credit Approval" || /credit/i.test(seed.signal)) {
    return { required: true, approver: "Finance Controller", reason: "High credit risk requires finance decision." };
  }
  if (seed.actionType === "Route Resequencing" && /3[0-9]%|4[0-9]%|sequence/i.test(seed.signal)) {
    return { required: true, approver: "Sales Supervisor", reason: "Route sequence change exceeds supervisor threshold." };
  }
  if ((seed.actionType === "Expiry Risk Escalation" || seed.actionType === "SKU Liquidation") && seed.valueAtStake >= 100) {
    return { required: true, approver: "Inventory Controller", reason: "Expiry loss above SAR 100K needs inventory approval." };
  }
  if (highValue && seed.actionType === "Customer Recovery") {
    return { required: true, approver: "Area Sales Manager", reason: "High-value customer recovery needs escalation oversight." };
  }
  if (highValue && (seed.actionType === "Urgent Replenishment" || seed.actionType === "Stock Rebalance")) {
    return { required: true, approver: "Supply Controller", reason: "High-value supply movement requires supply approval." };
  }
  return { required: false, approver: seed.approver, reason: "No additional approval gate required." };
}

function deriveOwner(seed: ActionSeed): Owner {
  if (seed.actionType === "Urgent Replenishment") return "Supply Controller";
  if (seed.actionType === "Van Load Correction") return "Dispatch Controller";
  if (seed.actionType === "Salesman Coaching") return "Sales Supervisor";
  if (seed.actionType === "Customer Recovery" && seed.valueAtStake >= 100) return "Area Sales Manager";
  if (seed.actionType === "Credit Approval") return "Finance Controller";
  if (seed.actionType === "Expiry Risk Escalation") return "Inventory Controller";
  return seed.owner;
}

function deriveUrgency(valueAtStake: number, confidence: number, status: GovernanceStatus): ActionUrgency {
  if (status === "Closed") return "Low";
  if (valueAtStake >= 120 && confidence >= 74) return "High";
  if (valueAtStake >= 75 || confidence >= 68) return "Medium";
  return "Low";
}

function dueDateFromUrgency(urgency: ActionUrgency, status: GovernanceStatus): string {
  if (status === "Closed") return formatDate(-1);
  if (urgency === "High") return formatDate(1);
  if (urgency === "Medium") return formatDate(3);
  return formatDate(5);
}

function isOverdue(status: GovernanceStatus, daysOpen: number, urgency: ActionUrgency) {
  if (status === "Closed") return false;
  if (urgency === "High") return daysOpen > 2;
  if (urgency === "Medium") return daysOpen > 4;
  return daysOpen > 6;
}

function finalizeAction(seed: ActionSeed): GovernanceAction {
  const owner = deriveOwner(seed);
  const derivedApproval = deriveApproval({ ...seed, owner });
  const approvalRequired = derivedApproval.required;
  const approver = derivedApproval.approver;
  let status = seed.status;
  if (seed.confidenceScore < 50 && status !== "Closed") status = "Review Required";
  if (approvalRequired && status === "Open") status = "Approval Pending";

  const urgency = deriveUrgency(seed.valueAtStake, seed.confidenceScore, status);
  const dueDate = dueDateFromUrgency(urgency, status);
  const overdueFlag = isOverdue(status, seed.daysOpen, urgency);
  const priorityScore = clamp(
    Math.round(seed.valueAtStake * 0.42 + seed.confidenceScore * 0.33 + (urgency === "High" ? 22 : urgency === "Medium" ? 12 : 5)),
    18,
    99,
  );

  let valueCaptured = seed.valueCaptured;
  if (status === "Closed" && valueCaptured <= 0) {
    valueCaptured = Math.round(seed.valueAtStake * (0.35 + seed.confidenceScore / 250));
  }

  const governanceReason = overdueFlag
    ? "Action exceeded expected closure window and needs supervisor escalation."
    : approvalRequired
      ? derivedApproval.reason
      : status === "Review Required"
        ? "Confidence is below governance threshold; manual review required."
        : "Action follows normal execution governance lane.";

  return {
    ...seed,
    owner,
    approver,
    urgency,
    priorityScore,
    approvalRequired,
    approvalReason: derivedApproval.reason,
    dueDate,
    overdueFlag,
    valueCaptured,
    status,
    governanceReason,
  };
}

export function buildGovernanceActions(): GovernanceAction[] {
  const seeds: ActionSeed[] = [
    {
      actionId: "ACT-001",
      sourceModule: "Replenishment Orchestrator",
      actionType: "Urgent Replenishment",
      signal: "Stockout risk alert for Customer C-184 on Route R-07.",
      diagnosis: "On-hand and in-transit stock cannot cover next two selling windows.",
      recommendedAction: "Approve urgent replenishment for Customer C-184 on Route R-07.",
      owner: "Supply Controller",
      approver: "Supply Controller",
      expectedImpact: "Prevent stockout and protect SAR 95K revenue.",
      impactType: "Revenue Protection",
      valueAtStake: 95,
      valueCaptured: 0,
      daysOpen: 1,
      status: "Open",
      confidenceScore: 82,
      nextStep: "Release replenishment and publish updated pick list by 18:00.",
    },
    {
      actionId: "ACT-002",
      sourceModule: "Van Loading Intelligence",
      actionType: "Van Load Correction",
      signal: "Van V-09 utilization is 68% with demand gaps in SKU-204.",
      diagnosis: "Manifest underloads fast-moving SKU while route has open cube.",
      recommendedAction: "Correct Van V-09 load by adding SKU-204 to improve utilization to 84%.",
      owner: "Dispatch Controller",
      approver: "None",
      expectedImpact: "Improve route sell-through and reduce emergency replenishments.",
      impactType: "Productivity",
      valueAtStake: 54,
      valueCaptured: 0,
      daysOpen: 2,
      status: "In Progress",
      confidenceScore: 79,
      nextStep: "Warehouse to update dispatch wave-2 manifest.",
    },
    {
      actionId: "ACT-003",
      sourceModule: "Route Optimization Intelligence",
      actionType: "Route Resequencing",
      signal: "Route R-12 sequence change at 34% with SLA gain.",
      diagnosis: "Resequence reduces deadhead and protects high-value stop windows.",
      recommendedAction: "Approve Route R-12 resequence to reduce travel time by 14%.",
      owner: "Sales Supervisor",
      approver: "Sales Supervisor",
      expectedImpact: "Protect SAR 180K revenue and increase on-time coverage.",
      impactType: "Revenue Protection",
      valueAtStake: 180,
      valueCaptured: 0,
      daysOpen: 1,
      status: "Open",
      confidenceScore: 84,
      nextStep: "Supervisor sign-off then push revised route to drivers.",
    },
    {
      actionId: "ACT-004",
      sourceModule: "Salesman Coaching Intelligence",
      actionType: "Salesman Coaching",
      signal: "Salesman S-04 strike rate at 42% despite high call completion.",
      diagnosis: "Coverage is adequate; conversion discipline is the performance gap.",
      recommendedAction: "Coach Salesman S-04 on conversion and objection handling this week.",
      owner: "Sales Supervisor",
      approver: "None",
      expectedImpact: "Lift strike by 6-10 pp within 30 days.",
      impactType: "Service Uplift",
      valueAtStake: 72,
      valueCaptured: 0,
      daysOpen: 3,
      status: "In Progress",
      confidenceScore: 73,
      nextStep: "Schedule two ride-alongs and review conversion funnel daily.",
    },
    {
      actionId: "ACT-005",
      sourceModule: "Customer Opportunity Intelligence",
      actionType: "Customer Recovery",
      signal: "Customer C-184 missed 3 visits and revenue is 28% below expected.",
      diagnosis: "High-potential account is under-serviced with widening frequency gap.",
      recommendedAction: "Recover Customer C-184 with protected visit slots and SKU expansion.",
      owner: "Area Sales Manager",
      approver: "Area Sales Manager",
      expectedImpact: "Recover SAR 110K annualized opportunity.",
      impactType: "Revenue Protection",
      valueAtStake: 110,
      valueCaptured: 0,
      daysOpen: 5,
      status: "Open",
      confidenceScore: 69,
      nextStep: "Approve recovery plan and assign weekly check-ins.",
    },
    {
      actionId: "ACT-006",
      sourceModule: "Expiry & Overstock Risk Intelligence",
      actionType: "Stock Rebalance",
      signal: "SKU-118 has high days cover on R-03 with faster pull on R-12.",
      diagnosis: "Near-expiry stock can be consumed on destination route before write-off.",
      recommendedAction: "Rebalance SKU-118 from Route R-03 to R-12.",
      owner: "Supply Controller",
      approver: "Inventory Controller",
      expectedImpact: "Avoid SAR 210K expiry loss.",
      impactType: "Cost Avoidance",
      valueAtStake: 210,
      valueCaptured: 0,
      daysOpen: 2,
      status: "Approval Pending",
      confidenceScore: 81,
      nextStep: "Inventory controller approval then execute transfer note.",
    },
    {
      actionId: "ACT-007",
      sourceModule: "Customer Opportunity Intelligence",
      actionType: "Credit Approval",
      signal: "Customer C-220 has active credit hold despite strong demand.",
      diagnosis: "Credit friction blocks conversion on a high-value wholesale account.",
      recommendedAction: "Escalate C-220 to Finance Controller for temporary credit release.",
      owner: "Finance Controller",
      approver: "Finance Controller",
      expectedImpact: "Unlock SAR 88K constrained orders this cycle.",
      impactType: "Revenue Protection",
      valueAtStake: 88,
      valueCaptured: 0,
      daysOpen: 4,
      status: "Approval Pending",
      confidenceScore: 76,
      nextStep: "Finance decision by end of day and notify field team.",
    },
    {
      actionId: "ACT-008",
      sourceModule: "Demand Forecasting",
      actionType: "Forecast Review",
      signal: "Chilled SKU forecast confidence on Route R-03 dropped below threshold.",
      diagnosis: "Model divergence versus actual sell-through increases overstock risk.",
      recommendedAction: "Review chilled forecast inputs for Route R-03 before next dispatch.",
      owner: "Supply Controller",
      approver: "None",
      expectedImpact: "Reduce over-forecast bias and avoid excess load.",
      impactType: "Working Capital",
      valueAtStake: 64,
      valueCaptured: 0,
      daysOpen: 2,
      status: "Open",
      confidenceScore: 44,
      nextStep: "Planner to validate demand drivers and rerun scenario.",
    },
    {
      actionId: "ACT-009",
      sourceModule: "Expiry & Overstock Risk Intelligence",
      actionType: "Expiry Risk Escalation",
      signal: "SKU-330 on R-07 has high days cover and low velocity.",
      diagnosis: "Continuing load policy will increase avoidable expiry exposure.",
      recommendedAction: "Stop loading SKU-330 on Route R-07 and reduce future dispatch.",
      owner: "Inventory Controller",
      approver: "Inventory Controller",
      expectedImpact: "Prevent avoidable write-off and release working capital.",
      impactType: "Cost Avoidance",
      valueAtStake: 128,
      valueCaptured: 0,
      daysOpen: 6,
      status: "Open",
      confidenceScore: 77,
      nextStep: "Approve load freeze and notify dispatch controller.",
    },
    {
      actionId: "ACT-010",
      sourceModule: "Salesman Coaching Intelligence",
      actionType: "Execution Follow-up",
      signal: "Salesman S-02 sustained high strike and must-sell adoption.",
      diagnosis: "Coaching intervention delivered stable performance improvement.",
      recommendedAction: "Close recognition loop and publish best-practice note for peers.",
      owner: "Sales Supervisor",
      approver: "None",
      expectedImpact: "Replicate playbook across top-priority routes.",
      impactType: "Productivity",
      valueAtStake: 42,
      valueCaptured: 0,
      daysOpen: 1,
      status: "Closed",
      confidenceScore: 91,
      nextStep: "Record closure and circulate coaching template.",
    },
  ];

  return seeds.map(finalizeAction);
}

export function actionBoardKpis(rows: GovernanceAction[]) {
  const openActions = rows.filter((r) => r.status !== "Closed").length;
  const urgentActions = rows.filter((r) => r.urgency === "High").length;
  const approvalsRequired = rows.filter((r) => r.approvalRequired).length;
  const overdueActions = rows.filter((r) => r.overdueFlag).length;
  const valueAtStake = rows.reduce((s, r) => s + r.valueAtStake, 0);
  const valueCaptured = rows.reduce((s, r) => s + r.valueCaptured, 0);
  const closedActions = rows.filter((r) => r.status === "Closed").length;
  const avgConfidence = rows.length ? Math.round(rows.reduce((s, r) => s + r.confidenceScore, 0) / rows.length) : 0;

  return {
    openActions,
    urgentActions,
    approvalsRequired,
    overdueActions,
    valueAtStakeLabel: `SAR ${Math.round(valueAtStake)}K`,
    valueCapturedLabel: `SAR ${Math.round(valueCaptured)}K`,
    closedActions,
    avgConfidence,
  };
}
