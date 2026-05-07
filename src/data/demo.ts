export const kpis = [
  { label: "Revenue Opportunity", value: "SAR 1.24M", delta: "+8.7%", tone: "emerald" },
  { label: "Forecast Accuracy", value: "78.4%", delta: "+6.2 pp", tone: "emerald" },
  { label: "Stockout Risk", value: "11.8%", delta: "-4.1 pp", tone: "amber" },
  { label: "Expiry Exposure", value: "SAR 186K", delta: "-9.3%", tone: "danger" },
  { label: "Route Productivity", value: "86.1", delta: "+12.4%", tone: "emerald" },
  { label: "Strike Rate", value: "72.5%", delta: "+5.8 pp", tone: "emerald" },
];

export const demandTrend = [
  { week: "W1", actual: 840, forecast: 810, confidence: 72 },
  { week: "W2", actual: 910, forecast: 895, confidence: 75 },
  { week: "W3", actual: 870, forecast: 900, confidence: 70 },
  { week: "W4", actual: 980, forecast: 955, confidence: 78 },
  { week: "W5", actual: 1030, forecast: 1015, confidence: 81 },
  { week: "W6", actual: 1080, forecast: 1105, confidence: 84 },
  { week: "W7", actual: 1160, forecast: 1140, confidence: 86 },
  { week: "W8", actual: 1210, forecast: 1235, confidence: 88 },
];

export const routeRisk = [
  { route: "R-07", demand: 92, fill: 74, risk: "High" },
  { route: "R-12", demand: 88, fill: 79, risk: "High" },
  { route: "R-03", demand: 76, fill: 83, risk: "Medium" },
  { route: "R-18", demand: 71, fill: 86, risk: "Medium" },
  { route: "R-22", demand: 64, fill: 91, risk: "Low" },
];

export const replenishment = [
  { customer: "C-184 | Al Noor Mini Market", route: "R-07", credit: "Medium", sku: "SKU-204 Cola 250ml", suggested: 18, risk: "Stockout", action: "Increase load by 22%" },
  { customer: "C-392 | Riyadh Grocery", route: "R-12", credit: "Low", sku: "SKU-118 Juice 1L", suggested: 12, risk: "High velocity", action: "Prioritize early delivery" },
  { customer: "C-081 | City Convenience", route: "R-03", credit: "High", sku: "SKU-330 Dairy 500ml", suggested: 4, risk: "Expiry", action: "Restrict replenishment" },
  { customer: "C-455 | Express Mart", route: "R-18", credit: "Low", sku: "SKU-090 Water 600ml", suggested: 28, risk: "Demand spike", action: "Add promo bundle" },
  { customer: "C-216 | Family Store", route: "R-07", credit: "Medium", sku: "SKU-155 Snack Pack", suggested: 9, risk: "Low strike", action: "Salesman intervention" },
];

export const routePlan = [
  { stop: 1, customer: "Al Noor Mini Market", priority: "High", planned: "09:10", optimized: "08:45", value: "SAR 8.4K" },
  { stop: 2, customer: "Family Store", priority: "High", planned: "10:40", optimized: "09:25", value: "SAR 6.7K" },
  { stop: 3, customer: "City Convenience", priority: "Medium", planned: "09:50", optimized: "10:05", value: "SAR 4.2K" },
  { stop: 4, customer: "Riyadh Grocery", priority: "High", planned: "11:30", optimized: "10:55", value: "SAR 9.1K" },
  { stop: 5, customer: "Express Mart", priority: "Medium", planned: "12:30", optimized: "11:45", value: "SAR 5.6K" },
];

export const salesman = [
  { name: "S-04 Ahmed", route: "R-07", revenue: 82, strike: 61, productivity: 68, action: "Fix conversion gap" },
  { name: "S-09 Faisal", route: "R-12", revenue: 74, strike: 58, productivity: 63, action: "Push must-sell SKUs" },
  { name: "S-11 Omar", route: "R-03", revenue: 91, strike: 79, productivity: 86, action: "Replicate playbook" },
  { name: "S-15 Khalid", route: "R-18", revenue: 77, strike: 67, productivity: 72, action: "Improve route discipline" },
  { name: "S-20 Yousuf", route: "R-22", revenue: 96, strike: 84, productivity: 91, action: "Best-in-class" },
];

export const actions = [
  { rank: 1, title: "Rebalance van load for Route R-07", impact: "SAR 142K", confidence: 87, owner: "Supply Controller", reason: "High forecast demand, low fill accuracy, repeated stockout pattern." },
  { rank: 2, title: "Prioritize 12 missed high-value customers", impact: "SAR 96K", confidence: 82, owner: "Sales Supervisor", reason: "Low strike rate customers with strong historical order potential." },
  { rank: 3, title: "Restrict slow-moving SKU-330 replenishment", impact: "SAR 41K", confidence: 79, owner: "Warehouse", reason: "Expiry exposure rising and customer velocity below threshold." },
  { rank: 4, title: "Resequence Route R-12", impact: "14% time saving", confidence: 75, owner: "Route Planner", reason: "High-priority customers can be serviced earlier with lower travel time." },
];
