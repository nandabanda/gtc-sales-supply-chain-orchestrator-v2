export type UploadStatus = "Uploaded" | "Missing" | "Needs Review";
export type ValidationPill = "pass" | "warn" | "fail";

export type DatasetCard = {
  name: string;
  purpose: string;
  requiredFields: string;
  uploadStatus: UploadStatus;
  validationStatus: string;
  recordCount: string;
  lastUploaded: string;
};

export const executiveReadiness = {
  readinessScore: 82,
  mandatoryUploaded: "6 / 8",
  recordsProcessed: "128,400",
  validationIssues: 14,
  lastRefresh: "Today",
  orchestrationStatus: "Partial Ready",
} as const;

export const mandatoryDatasets: DatasetCard[] = [
  {
    name: "SKU Master",
    purpose: "Canonical SKU attributes, pack, shelf life, MOQ for planning and replenishment.",
    requiredFields: "sku_code, name, brand, category, UOM, shelf_life_days, moq_cases",
    uploadStatus: "Uploaded",
    validationStatus: "Clean",
    recordCount: "4,820",
    lastUploaded: "Today · 06:12",
  },
  {
    name: "Customer / Outlet Master",
    purpose: "Outlet hierarchy, credit tier, geography for route and execution.",
    requiredFields: "customer_id, name, route_id, lat, lon, channel, priority",
    uploadStatus: "Uploaded",
    validationStatus: "8 unmapped salesman refs",
    recordCount: "12,640",
    lastUploaded: "Today · 05:48",
  },
  {
    name: "Route Master",
    purpose: "Route codes, van assignment, sequence windows for routing engine.",
    requiredFields: "route_id, van_id, depot, weekday, start_time",
    uploadStatus: "Needs Review",
    validationStatus: "3 routes missing van capacity",
    recordCount: "186",
    lastUploaded: "Yesterday",
  },
  {
    name: "Sales History",
    purpose: "Shipment and invoice history for ADS, trend, and forecast calibration.",
    requiredFields: "date, customer_id, sku_code, qty_cases, value_sar",
    uploadStatus: "Uploaded",
    validationStatus: "OK (112d window)",
    recordCount: "86,200",
    lastUploaded: "Today · 04:30",
  },
  {
    name: "Current Inventory",
    purpose: "On-hand and reserved stock by depot and outlet for ROP and cover.",
    requiredFields: "sku_code, location_id, qty_cases, batch_id optional",
    uploadStatus: "Uploaded",
    validationStatus: "2 negative rows flagged",
    recordCount: "18,900",
    lastUploaded: "Today · 06:00",
  },
  {
    name: "Open Orders",
    purpose: "Open SO and allocation for net-available and pending commitment.",
    requiredFields: "order_id, customer_id, sku_code, qty_open, promise_date",
    uploadStatus: "Uploaded",
    validationStatus: "Clean",
    recordCount: "3,410",
    lastUploaded: "Today · 05:15",
  },
  {
    name: "In-Transit Stock",
    purpose: "ASN and transfer in-flight for pipeline in replenishment.",
    requiredFields: "asn_id, sku_code, qty_cases, eta_date, from_loc, to_loc",
    uploadStatus: "Missing",
    validationStatus: "Not loaded",
    recordCount: "—",
    lastUploaded: "—",
  },
  {
    name: "Credit / Outstanding Data",
    purpose: "AR aging and limits for credit-aware supply and governance.",
    requiredFields: "customer_id, limit_sar, outstanding_sar, hold_flag",
    uploadStatus: "Needs Review",
    validationStatus: "5 key accounts missing outstanding",
    recordCount: "11,020",
    lastUploaded: "2 days ago",
  },
];

export const advancedDatasets: DatasetCard[] = [
  {
    name: "Supplier Master",
    purpose: "Supplier codes, payment terms, default MOQ for PO suggestions.",
    requiredFields: "supplier_id, name, lead_time_default, moq_default",
    uploadStatus: "Uploaded",
    validationStatus: "Clean",
    recordCount: "240",
    lastUploaded: "Last week",
  },
  {
    name: "Lead Time Master",
    purpose: "SKU-supplier lead times for ROP and safety stock.",
    requiredFields: "sku_code, supplier_id, lead_time_days",
    uploadStatus: "Needs Review",
    validationStatus: "11 SKUs missing lead time",
    recordCount: "3,980",
    lastUploaded: "Yesterday",
  },
  {
    name: "Promotion Calendar",
    purpose: "Promo windows and uplift drivers for demand intelligence.",
    requiredFields: "sku_code, start_date, end_date, uplift_pct",
    uploadStatus: "Missing",
    validationStatus: "Next month empty",
    recordCount: "—",
    lastUploaded: "—",
  },
  {
    name: "Scheme Calendar",
    purpose: "Trade schemes and rebates affecting net demand.",
    requiredFields: "scheme_id, sku_set, route_set, effective_dates",
    uploadStatus: "Uploaded",
    validationStatus: "Clean",
    recordCount: "64",
    lastUploaded: "3 days ago",
  },
  {
    name: "Expiry / Batch Data",
    purpose: "Batch-level expiry for chilled and short-life SKUs.",
    requiredFields: "batch_id, sku_code, mfg_date, expiry_date, qty_cases",
    uploadStatus: "Uploaded",
    validationStatus: "3 batches date format",
    recordCount: "9,200",
    lastUploaded: "Today · 03:40",
  },
  {
    name: "Van Capacity Data",
    purpose: "Cube and weight limits per van for route intelligence.",
    requiredFields: "van_id, max_cases, max_kg, pallet_positions",
    uploadStatus: "Needs Review",
    validationStatus: "3 routes missing van capacity link",
    recordCount: "88",
    lastUploaded: "Yesterday",
  },
  {
    name: "Service Level Targets",
    purpose: "Target fill and OTIF by channel for governance thresholds.",
    requiredFields: "channel, sku_group, target_fill_pct",
    uploadStatus: "Uploaded",
    validationStatus: "Clean",
    recordCount: "120",
    lastUploaded: "Last week",
  },
  {
    name: "Salesman Master",
    purpose: "Field rep to route mapping for execution intelligence.",
    requiredFields: "salesman_id, name, route_id, active_flag",
    uploadStatus: "Uploaded",
    validationStatus: "8 customers unmapped",
    recordCount: "420",
    lastUploaded: "Today · 05:50",
  },
];

export type ReadinessMatrixRow = {
  domain: string;
  dataset: string;
  requiredFor: string;
  status: string;
  completeness: number;
  qualityScore: number;
  issues: string;
  owner: string;
};

export const readinessMatrix: ReadinessMatrixRow[] = [
  {
    domain: "Demand Planning",
    dataset: "Sales History + SKU + Promo",
    requiredFor: "Forecast, uplift, confidence",
    status: "Partial",
    completeness: 78,
    qualityScore: 81,
    issues: "Promo calendar gap next month",
    owner: "Demand Planning Lead",
  },
  {
    domain: "Replenishment",
    dataset: "Inventory + Sales + Lead Time",
    requiredFor: "ROP, MOQ, PO draft",
    status: "Partial",
    completeness: 74,
    qualityScore: 76,
    issues: "11 SKUs missing lead time",
    owner: "Supply Controller",
  },
  {
    domain: "Route Intelligence",
    dataset: "Route + Customer geo + Van capacity",
    requiredFor: "Sequence, SLA, cube",
    status: "Partial",
    completeness: 81,
    qualityScore: 79,
    issues: "3 routes missing van capacity",
    owner: "Route Planner",
  },
  {
    domain: "Execution Intelligence",
    dataset: "Visits + Orders + Outlet master",
    requiredFor: "Strike, coverage, coaching",
    status: "Ready",
    completeness: 88,
    qualityScore: 84,
    issues: "8 customers unmapped to salesman",
    owner: "Sales Supervisor",
  },
  {
    domain: "Finance / Credit",
    dataset: "Credit outstanding + limits",
    requiredFor: "Credit-aware supply",
    status: "Partial",
    completeness: 69,
    qualityScore: 72,
    issues: "5 key accounts missing outstanding",
    owner: "Finance Controller",
  },
  {
    domain: "Governance",
    dataset: "Certified exception outputs",
    requiredFor: "AI Action Board",
    status: "Blocked",
    completeness: 58,
    qualityScore: 80,
    issues: "In-transit file missing",
    owner: "Data Office",
  },
];

export type ValidationRule = {
  rule: string;
  pill: ValidationPill;
};

export const validationRules: ValidationRule[] = [
  { rule: "SKU codes must be unique", pill: "pass" },
  { rule: "Customer IDs must map to route IDs", pill: "warn" },
  { rule: "Sales history must have minimum 90 days of data", pill: "warn" },
  { rule: "Inventory stock cannot be negative", pill: "fail" },
  { rule: "Lead time must be available for replenishment SKUs", pill: "fail" },
  { rule: "Credit exposure must map to customer master", pill: "warn" },
  { rule: "Route capacity must map to van master", pill: "fail" },
  { rule: "Expiry dates must be valid for batch-sensitive SKUs", pill: "pass" },
];

export type CertificationStage = {
  id: string;
  label: string;
  description: string;
  pct: number;
};

export const certificationStages: CertificationStage[] = [
  { id: "bronze", label: "Bronze", description: "Raw uploads received", pct: 100 },
  { id: "silver", label: "Silver", description: "Cleaned and standardized", pct: 88 },
  { id: "gold", label: "Gold", description: "Business-ready certified layer", pct: 72 },
  { id: "ai", label: "AI Ready", description: "Approved for decision recommendations", pct: 58 },
];

export type ModuleImpact = {
  module: string;
  needs: string;
  status: "Ready" | "Partial" | "Blocked";
};

export const moduleImpacts: ModuleImpact[] = [
  {
    module: "Command Center",
    needs: "Sales, inventory, route, credit",
    status: "Partial",
  },
  {
    module: "Demand Intelligence",
    needs: "Sales history, SKU, customer, promo",
    status: "Partial",
  },
  {
    module: "Replenishment",
    needs: "Inventory, sales, lead time, MOQ, supplier",
    status: "Partial",
  },
  {
    module: "Route Intelligence",
    needs: "Route master, customer location, van capacity",
    status: "Partial",
  },
  {
    module: "Execution Intelligence",
    needs: "Visit compliance, order, delivery, outlet data",
    status: "Ready",
  },
  {
    module: "AI Action Board",
    needs: "All certified exception outputs",
    status: "Blocked",
  },
];

export type DataIssueRow = {
  issue: string;
  dataset: string;
  severity: "High" | "Medium" | "Low";
  impact: string;
  owner: string;
  fix: string;
  status: string;
};

export const dataIssuesQueue: DataIssueRow[] = [
  {
    issue: "11 SKUs missing lead time",
    dataset: "Lead Time Master",
    severity: "High",
    impact: "ROP and supplier PO confidence reduced",
    owner: "Supply Controller",
    fix: "Complete supplier-SKU LT matrix",
    status: "Open",
  },
  {
    issue: "3 routes missing van capacity",
    dataset: "Van Capacity / Route Master",
    severity: "High",
    impact: "Route cube checks incomplete",
    owner: "Route Planner",
    fix: "Link van_id to capacity file",
    status: "Open",
  },
  {
    issue: "8 customers unmapped to salesman",
    dataset: "Customer / Salesman Master",
    severity: "Medium",
    impact: "Execution coverage metrics skewed",
    owner: "Sales Supervisor",
    fix: "Assign salesman_id per outlet",
    status: "In Progress",
  },
  {
    issue: "2 inventory records showing negative stock",
    dataset: "Current Inventory",
    severity: "High",
    impact: "Net available and ROP invalid for lanes",
    owner: "Inventory Controller",
    fix: "Correct backdated adjustments",
    status: "Open",
  },
  {
    issue: "Promotion calendar missing for next month",
    dataset: "Promotion Calendar",
    severity: "Medium",
    impact: "Demand uplift understated on promo SKUs",
    owner: "Demand Planning Lead",
    fix: "Upload approved promo file",
    status: "Open",
  },
  {
    issue: "Credit outstanding missing for 5 key accounts",
    dataset: "Credit / Outstanding",
    severity: "Medium",
    impact: "Credit-aware supply rules incomplete",
    owner: "Finance Controller",
    fix: "Refresh AR extract from ERP",
    status: "Needs Review",
  },
];
