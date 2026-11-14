// Fleet routing entry point. Owner: rmaytr.
import type { AppState, RoutePlan, RouteSummary } from "@/lib/types";

export type FleetPlan = { routes: RoutePlan[]; unrouted: string[]; summary: RouteSummary };

/** Pledges a driver picks up: Shipt orders and porch pickups that are still open. Volunteers drive themselves. */
export function routablePledgeIds(state: AppState): string[] {
  return state.pledges
    .filter((p) => (p.fulfillment === "shipt" || p.fulfillment === "porch") && (p.status === "pledged" || p.status === "batched"))
    .map((p) => p.id);
}

// shortcut: contract stub so the driver view can build against it; the greedy planner replaces this.
export async function planFleet(state: AppState): Promise<FleetPlan> {
  const unrouted = routablePledgeIds(state);
  return { routes: [], unrouted, summary: { routes: 0, items: 0, minutes: 0, naiveMinutes: 0, label: "No routes" } };
}
