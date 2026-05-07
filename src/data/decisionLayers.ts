import type { DecisionConfidence, DecisionLayerProps, DecisionStatus } from "@/components/DecisionLayer";
import { actions } from "@/data/demo";

function confidenceFromScore(n: number): DecisionConfidence {
  if (n >= 80) return "High";
  if (n >= 68) return "Medium";
  return "Low";
}

function statusFromIndex(i: number): DecisionStatus {
  const cycle: DecisionStatus[] = ["Open", "In Progress", "Closed"];
  return cycle[i % cycle.length] ?? "Open";
}

const accentCycle = ["electric", "watchlist", "risk"] as const;

/**
 * Primary orchestration scenarios for the main dashboard / command center.
 * Covers stockout, expiry, strike, routing, customer replenishment, van utilization, and forecast confidence.
 */
export const orchestrationDashboardDecisions: DecisionLayerProps[] = [
  {
    signal:
      "Route R-07 is flashing stockout risk: fast-moving SKUs (notably cola and core beverages) are repeatedly underloaded versus validated demand for the next dispatch window.",
    diagnosis:
      "Fill discipline at the warehouse is trailing the forecast lane — the van manifest reflects conservative picking while outlet velocity and promo pull-through imply a higher service level target.",
    recommendedAction:
      "Increase R-07 fast-mover allocation before gate-out, with controller sign-off on SKU-204 and a manifest reconciliation against the AI pick list.",
    expectedImpact: "Reduced lost sales on priority outlets · stronger in-stock on high-velocity SKUs (synthetic)",
    owner: "Supply Controller",
    status: "Open",
    confidence: "High",
    accent: "risk",
  },
  {
    signal:
      "SKU-118 (juice 1L) is carrying expiry risk: inventory is elevated on low-velocity routes while turns remain healthy only on a subset of premium outlets.",
    diagnosis:
      "Overstock in slow lanes is aging the batch profile — replenishment policy is not sufficiently differentiated between high-turn and long-tail customers.",
    recommendedAction:
      "Redirect surplus from low-velocity routes, cap discretionary replenishment on lagging outlets, and prioritize FIFO pick faces for dated stock.",
    expectedImpact: "Lower write-off exposure on chilled juice · improved working capital turn (synthetic)",
    owner: "Warehouse",
    status: "Open",
    confidence: "Medium",
    accent: "risk",
  },
  {
    signal:
      "Salesman S-04 shows a low strike rate (61%) despite strong route revenue potential on R-07 — conversion leakage rather than territory weakness.",
    diagnosis:
      "Must-sell execution and basket expansion are underperforming versus peers; missed visits to high-potential outlets correlate with replenishment uncertainty.",
    recommendedAction:
      "Supervisor-led coaching with ride-alongs, enforced must-sell checklist on top outlets, and pre-call replenishment visibility for S-04.",
    expectedImpact: "Higher strike and order quality on R-07 within 30 days (synthetic)",
    owner: "Sales Supervisor",
    status: "In Progress",
    confidence: "Medium",
    accent: "watchlist",
  },
  {
    signal:
      "Route R-12 can reduce travel time through better sequencing — high-value customers are currently served late in the day versus priority and SLA assumptions.",
    diagnosis:
      "Static stop order creates backtracking and compresses selling windows; optimized sequence places premium baskets earlier with lower drive time.",
    recommendedAction:
      "Approve the optimized R-12 sequence for next-week rollout, brief the driver, and confirm van stock aligns with the new call order.",
    expectedImpact: "~14% travel-time reduction · improved strike on priority calls (synthetic)",
    owner: "Route Planner",
    status: "In Progress",
    confidence: "High",
    accent: "electric",
  },
  {
    signal:
      "Customer C-184 (Al Noor Mini Market) is showing demand growth but below-normal replenishment versus the recommended lane — a service gap on a rising account.",
    diagnosis:
      "The account is trending up on cases while actual loads trail AI suggestion — risk of stockout during a growth phase if not corrected before the next cycle.",
    recommendedAction:
      "Align replenishment to the elevated demand signal for C-184 on R-07 and validate credit and route capacity before dispatch.",
    expectedImpact: "Protect growth trajectory and outlet satisfaction on a strategic customer (synthetic)",
    owner: "Supply Controller",
    status: "Open",
    confidence: "High",
    accent: "watchlist",
  },
  {
    signal:
      "Van V-09 exhibits poor load utilization: cube and weight utilization trail fleet average while high-priority SKUs remain constrained on linked routes.",
    diagnosis:
      "Mixed SKU stack and late picks leave usable capacity unused — the vehicle departs under-filled relative to route demand intensity.",
    recommendedAction:
      "Re-run load building for V-09 with utilization targets, consolidate compatible SKUs, and tie release time to pick-wave completion.",
    expectedImpact: "Higher cases per kilometer · fewer second trips and emergency transfers (synthetic)",
    owner: "Warehouse Supervisor",
    status: "In Progress",
    confidence: "Medium",
    accent: "risk",
  },
  {
    signal:
      "Forecast confidence has dropped for chilled SKUs on Route R-03 — model disagreement and volatile actuals are widening the exception band.",
    diagnosis:
      "Low-turn dairy and temperature-sensitive items are noisy on R-03; replenishment feedback loops may be biasing short-horizon forecasts.",
    recommendedAction:
      "Route R-03 chilled SKUs through exception review, refresh training windows with fill-corrected history, and tighten human sign-off before auto-replenishment.",
    expectedImpact: "Stabilized forecast band · fewer surprise stockouts on chilled in R-03 (synthetic)",
    owner: "Demand Planning Lead",
    status: "Open",
    confidence: "Low",
    accent: "watchlist",
  },
];

/** @deprecated Use orchestrationDashboardDecisions — kept as alias for imports */
export const commandCenterDecisions = orchestrationDashboardDecisions;

/** Demand Intelligence */
export const demandDecisions: DecisionLayerProps[] = [
  {
    signal:
      "Forecast confidence dipped in the short horizon while actuals diverged from baseline ahead of a localized promo window on R-12.",
    diagnosis:
      "Volatility is route-led: stable SKU families mask exception customers where visit frequency and promotional lifts disagree with the prior baseline.",
    recommendedAction:
      "Lock baseline forecasts for stable families; run R-12 through an exception lane with explicit promo uplift assumptions and controller visibility.",
    expectedImpact: "Fewer manual overrides · tighter handoff to replenishment cut-offs (synthetic)",
    owner: "Demand Planning Lead",
    status: "In Progress",
    confidence: "Medium",
    accent: "watchlist",
  },
  {
    signal:
      "High-potential cluster on R-12 shows repeated under-forecast on juice 1L while ambient categories remain stable.",
    diagnosis:
      "Demand sensing trails velocity on SKU-118 because fill noise feeds back into the model as false weakness.",
    recommendedAction:
      "Refresh the short-horizon lane for SKU-118 with fill-corrected history; flag dependent SKUs for joint supply review.",
    expectedImpact: "Better service on chilled beverages · reduced false-negative demand (synthetic)",
    owner: "Demand Planning Lead",
    status: "Open",
    confidence: "Medium",
    accent: "electric",
  },
];

/** Replenishment Orchestrator */
export const replenishmentDecisions: DecisionLayerProps[] = [
  {
    signal:
      "Van loading for R-12 closed below the AI pick list for SKU-118 despite high velocity and favorable credit on priority customers.",
    diagnosis:
      "Late pick-wave release and pick-face constraints created a manifest mismatch — an execution gap at the dock, not a demand miss.",
    recommendedAction:
      "Release a prioritized pick wave for SKU-118 and reconcile manifest vs recommendation before second dispatch.",
    expectedImpact: "Service recovery on priority customers · fewer SLA breaches (synthetic)",
    owner: "Warehouse Supervisor",
    status: "In Progress",
    confidence: "High",
    accent: "electric",
  },
  {
    signal:
      "SKU-330 at City Convenience carries expiry risk with conservative suggested quantity; offtake remains weak relative to shelf holding.",
    diagnosis:
      "Unrestricted replenishment would increase write-off probability without revenue lift — age bands are widening on slow movers.",
    recommendedAction:
      "Hold to expiry-aware caps; redirect surplus capacity to spike lanes where demand is surging.",
    expectedImpact: "Margin protection on chilled · lower write-off path (synthetic)",
    owner: "Supply Controller",
    status: "Open",
    confidence: "High",
    accent: "risk",
  },
];

/** Route Intelligence */
export const routeDecisions: DecisionLayerProps[] = [
  {
    signal:
      "R-12 productivity trails peers: fewer productive stops per hour with high-value windows slipping past midday.",
    diagnosis:
      "Static sequencing leaves Riyadh Grocery deep in the day despite High priority and strong basket value.",
    recommendedAction:
      "Approve optimized sequence with premium calls before 11:00; confirm replenishment alignment before departure.",
    expectedImpact: "Travel-time savings · higher strike on priority outlets (synthetic)",
    owner: "Route Planner",
    status: "Closed",
    confidence: "High",
    accent: "electric",
  },
  {
    signal:
      "R-07 fill accuracy trails demand intensity; on-truck substitutions break the planned call rhythm.",
    diagnosis:
      "Route productivity is capped when loading mismatch forces rework — assumed SKUs are not physically available at gate-out.",
    recommendedAction:
      "Pair resequencing review with manifest reconciliation between warehouse release and van departure.",
    expectedImpact: "Improved stops-per-hour · less on-route friction (synthetic)",
    owner: "Route Planner",
    status: "In Progress",
    confidence: "Medium",
    accent: "watchlist",
  },
];

/** Execution Intelligence */
export const executionDecisions: DecisionLayerProps[] = [
  {
    signal:
      "S-04 Ahmed: strike 61% vs network 72.5% on R-07 with healthy revenue index — conversion gap, not territory weakness.",
    diagnosis:
      "Low strike clusters on must-sell SKUs and missed high-potential outlets where availability was uncertain.",
    recommendedAction:
      "Ride-alongs with best-in-class peer and a 30-day must-sell discipline program on top outlets.",
    expectedImpact: "Strike-rate uplift and basket quality on R-07 (synthetic)",
    owner: "Sales Supervisor",
    status: "In Progress",
    confidence: "Medium",
    accent: "watchlist",
  },
  {
    signal:
      "S-09 Faisal on R-12: productivity and strike trail benchmarks during compressed afternoon selling windows.",
    diagnosis:
      "High-value calls occur after optimal hours; must-sell conversion is soft on prioritized SKUs.",
    recommendedAction:
      "Align resequencing with morning coverage for High-priority customers and reinforce SKU discipline.",
    expectedImpact: "Revenue per hour improvement · fewer missed premium visits (synthetic)",
    owner: "Sales Supervisor",
    status: "Open",
    confidence: "Medium",
    accent: "electric",
  },
];

/** AI Action Board — derived from demo actions */
export const actionBoardDecisions: DecisionLayerProps[] = actions.map((a, i) => ({
  signal: a.reason,
  diagnosis: `Queue position #${a.rank}: recommendation competes across supply, routing, and field priorities; impact and confidence justify leadership review.`,
  recommendedAction: a.title,
  expectedImpact: `${a.impact} (synthetic scenario)`,
  owner: a.owner,
  status: statusFromIndex(i),
  confidence: confidenceFromScore(a.confidence),
  accent: accentCycle[i % accentCycle.length],
}));
