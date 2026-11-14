// Fleet routing entry point: assign pledges to tomorrow's drivers, then order each driver's stops. Owner: rmaytr.
import type { AppState, RoutePlan, RouteSummary, VehicleSize } from "@/lib/types";
import { assignPledges } from "@/lib/routing/assign";
import { buildRoute } from "@/lib/routing/order";
import { roadPolyline } from "@/lib/routing/polyline";

export type FleetPlan = { routes: RoutePlan[]; unrouted: string[]; summary: RouteSummary };

const SIZES: VehicleSize[] = ["XL", "L", "M", "S"];

export function summarize(routes: RoutePlan[]): RouteSummary {
  const label = SIZES.map((size) => ({ size, n: routes.filter((r) => r.size === size).length }))
    .filter(({ n }) => n > 0)
    .map(({ size, n }) => `${n} ${size} route${n === 1 ? "" : "s"}`)
    .join(" + ");
  const sum = (pick: (r: RoutePlan) => number) => routes.reduce((total, r) => total + pick(r), 0);
  return {
    routes: routes.length,
    items: sum((r) => r.load),
    minutes: sum((r) => r.minutes),
    naiveMinutes: sum((r) => r.naiveMinutes),
    label: label || "No routes",
  };
}

const tomorrow = () => (new Date().getDay() + 1) % 7;

/** Pure planner: one route per driver that has something to carry. `day` is the weekday of the run (0 = Sunday). */
export function planRoutes(state: AppState, day: number = tomorrow()): FleetPlan {
  const { assignments, unrouted } = assignPledges(state, day);
  const routes = assignments.map((a) => buildRoute(a.driver, a.pledges, state, day));
  return { routes, unrouted, summary: summarize(routes) };
}

/** planRoutes plus a road polyline per route for the map. */
export async function planFleet(state: AppState, day?: number): Promise<FleetPlan> {
  const plan = planRoutes(state, day);
  const routes = await Promise.all(
    plan.routes.map(async (r) => ({ ...r, polyline: await roadPolyline(r.stops.map((s) => s.location)) })),
  );
  return { ...plan, routes };
}
