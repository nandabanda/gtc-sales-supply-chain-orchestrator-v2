import { actions, demandTrend, kpis, replenishment, routeRisk, salesman } from "@/data/demo";

export type IntelligenceBundle = {
  headline: string;
  context: string;
  insights: string[];
  signals: { label: string; value: string }[];
};

const topRoutesAtRisk = routeRisk.filter((r) => r.risk === "High").map((r) => r.route).join(" · ");
const worstFill = [...routeRisk].sort((a, b) => a.fill - b.fill)[0];
const stockoutRow = replenishment.find((r) => r.risk === "Stockout");
const expiryRow = replenishment.find((r) => r.risk === "Expiry");
const underperforming = salesman.filter((s) => s.productivity < 70);

export function intelligenceForPath(path: string): IntelligenceBundle {
  const baseSignals = [
    { label: "Revenue upside", value: kpis[0]?.value ?? "—" },
    { label: "Forecast accuracy", value: kpis[1]?.value ?? "—" },
    { label: "Stockout risk", value: kpis[2]?.value ?? "—" },
  ];

  switch (path) {
    case "/command-center":
      return {
        headline: "Executive control tower",
        context:
          "The operating picture is improving, but value is still concentrated in a handful of routes where demand strength is not matched by supply execution.",
        insights: [
          `Routes ${topRoutesAtRisk || "—"} are the primary drag on service levels: demand is elevated while fill accuracy trails the network average.`,
          `The top-ranked decision is to ${actions[0]?.title.toLowerCase() ?? "rebalance constrained routes"} — confidence is ${actions[0]?.confidence ?? "—"}% with material revenue impact.`,
          "Use this view to align supply, routing, and sales leadership on one narrative before weekly dispatch and review.",
        ],
        signals: [
          ...baseSignals,
          { label: "Top AI action", value: actions[0]?.impact ?? "—" },
          { label: "Expiry exposure", value: kpis[3]?.value ?? "—" },
        ],
      };
    case "/demand-intelligence":
      return {
        headline: "Demand sensing and foresight",
        context:
          "Forward demand is strengthening week over week; the priority is separating stable forecast lanes from exceptions that require human judgment.",
        insights: [
          `Route ${worstFill?.route ?? "—"} shows the widest demand-versus-fill gap (${worstFill?.demand ?? "—"} demand score vs ${worstFill?.fill ?? "—"} fill), signaling a planning exception before the next cycle.`,
          "Rising forecast confidence is a green light to tighten safety stock targets on high-velocity SKUs while reserving buffer for promotional volatility.",
          "Pair forecast outputs with replenishment holds so credit and expiry policy do not unintentionally starve high-potential outlets.",
        ],
        signals: [
          { label: "Confidence (latest)", value: `${latestConfidence()}%` },
          { label: "High-risk routes", value: String(routeRisk.filter((r) => r.risk === "High").length) },
          { label: "Weakest fill route", value: worstFill ? `${worstFill.route} (${worstFill.fill})` : "—" },
        ],
      };
    case "/replenishment-orchestrator":
      return {
        headline: "Supply recommendations in business terms",
        context:
          "Replenishment is where stockout cost, expiry write-offs, and customer credit posture meet; the agent prioritizes actions that protect margin and service together.",
        insights: [
          stockoutRow
            ? `${stockoutRow.customer.split(" | ")[1] ?? stockoutRow.customer} on ${stockoutRow.route} needs a deliberate load increase — ${stockoutRow.action.toLowerCase()}.`
            : "Prioritize outlets with repeated stockout patterns before tightening inventory elsewhere.",
          expiryRow
            ? `${expiryRow.sku} at ${expiryRow.customer.split(" | ")[1] ?? expiryRow.customer}: ${expiryRow.action.toLowerCase()} until velocity recovers.`
            : "Review slow movers with rising age before they convert into write-offs.",
          "Credit-aware holds should be communicated to field teams so customer conversations stay consistent with supply policy.",
        ],
        signals: [
          { label: "Stockout pattern", value: stockoutRow?.sku ?? "—" },
          { label: "Restrict candidate", value: expiryRow?.sku ?? "—" },
          { label: "AI load accuracy", value: "84%" },
        ],
      };
    case "/route-intelligence":
      return {
        headline: "Movement and service design",
        context:
          "Small sequencing changes on dense routes unlock time savings and protect high-value customers without increasing fleet capacity.",
        insights: [
          "Resequencing R-12 remains the clearest win: high-priority customers can be served earlier with measurable travel-time reduction.",
          "Align optimized stop times with replenishment cutoffs so vans depart with the SKUs the sequence assumes are on board.",
          "Pair route changes with salesman coaching where strike rate is soft, so route productivity shows up as revenue, not just efficiency.",
        ],
        signals: [
          { label: "Travel time saving", value: "14%" },
          { label: "SLA watchlist", value: "7 customers" },
          { label: "Top stop value", value: "SAR 9.1K" },
        ],
      };
    case "/execution-intelligence":
      return {
        headline: "Field performance and coaching",
        context:
          "Productivity variance across sales routes is explainable: the agent highlights who to coach, who to study, and where basket execution is leaking.",
        insights: [
          underperforming.length
            ? `${underperforming.map((s) => s.name).join(" and ")} need structured supervisor intervention — conversion and must-sell execution are below peer benchmarks.`
            : "Continue weekly huddles to sustain strike-rate gains across the route portfolio.",
          `${salesman.find((s) => s.productivity >= 90)?.name ?? "Top performer"} demonstrates best-in-class discipline; use that playbook as the standard for underperforming routes.`,
          "Tie salesman actions to replenishment reality so coaching recommendations do not conflict with what the van can actually fulfill.",
        ],
        signals: [
          { label: "Avg strike rate", value: "72.5%" },
          { label: "Van productivity", value: "86.1" },
          { label: "Coaching focus", value: underperforming.length ? `${underperforming.length} reps` : "Stable" },
        ],
      };
    case "/ai-action-board":
      return {
        headline: "Governance for AI-led operations",
        context:
          "Trust grows when recommendations have owners, impact estimates, and a visible audit trail from detection through adoption.",
        insights: [
          `The board currently surfaces ${actions.length} prioritized decisions; the first item alone frames ${actions[0]?.impact ?? "material"} upside with ${actions[0]?.confidence ?? "strong"}% model confidence.`,
          "Track accepted versus challenged recommendations weekly — divergence signals either data drift or organizational friction worth resolving.",
          "Use reason codes on rejection to retrain priorities: recurring declines often reveal missing constraints the model should respect.",
        ],
        signals: [
          { label: "Queue depth", value: "24 open" },
          { label: "Projected impact", value: "SAR 312K" },
          { label: "Adoption", value: "67%" },
        ],
      };
    default:
      return {
        headline: "Welcome to the operating layer",
        context:
          "SYDIAI sits above your transactional systems — sensing demand, recommending supply, sequencing routes, and governing actions for Olayan Group / GTC.",
        insights: [
          "Start with routes R-07 and R-12: they combine elevated demand with weaker fill accuracy and deserve a joint supply-and-routing review before dispatch.",
          "Close the loop in replenishment first — reducing stockout and expiry exposure compounds gains from route optimization and field execution.",
          "Use the AI Action Board as the single leadership surface for weekly controller and supervisor cadence.",
        ],
        signals: baseSignals,
      };
  }
}

function latestConfidence(): string {
  const last = demandTrend[demandTrend.length - 1];
  return last ? String(last.confidence) : "—";
}
