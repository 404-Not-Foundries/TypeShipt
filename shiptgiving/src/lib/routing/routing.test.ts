import { describe, expect, it } from "vitest";
import { planRoutes } from "@/lib/routing";
import { minutesFor, pathMiles } from "@/lib/routing/geo";
import { VEHICLES } from "@/lib/types";
import type { AppState, Driver, Fulfillment, Partner, Pledge, Store, VehicleType } from "@/lib/types";

const DAY = 1; // Monday

const partner = (id: string, lat: number, lng: number, close = "18:00", extra: Partial<Partner> = {}): Partner => ({
  id, name: id, mission: "", neighborhood: "", address: "", location: { lat, lng },
  receiving: [{ days: [0, 1, 2, 3, 4, 5, 6], open: "08:00", close }],
  accepts: { newOnly: false, perishables: false, porchPickup: true, refuses: [] },
  features: [],
  ...extra,
});

const store = (id: string, lat: number, lng: number): Store => ({
  id, name: id, brand: "", address: "", location: { lat, lng }, source: "osm-snapshot",
});

const driver = (id: string, vehicle: VehicleType): Driver => ({
  id, name: id, vehicle, ...VEHICLES[vehicle], start: { lat: 33.5186, lng: -86.8104 }, kind: "shipt",
});

let seq = 0;
const pledge = (partnerId: string, qty: number, extra: Partial<Pledge> = {}): Pledge => ({
  id: `pl-${++seq}`, needId: "n", partnerId, donorName: "Sam", qty, fulfillment: "shipt" as Fulfillment,
  cost: { items: 0, deliveryShare: 0, service: 0, total: 0 }, status: "pledged", createdAt: "",
  ...extra,
});

const state = (drivers: Driver[], pledges: Pledge[], partners?: Partner[]): AppState => ({
  partners: partners ?? [partner("north", 33.56, -86.8), partner("south", 33.47, -86.82), partner("east", 33.52, -86.74)],
  stores: [store("s-a", 33.53, -86.8), store("s-b", 33.49, -86.81), store("s-c", 33.52, -86.76)],
  catalog: [], needs: [], pledges, drivers, routes: [], unrouted: [], routeSummary: null,
  weather: { lowF: 55, alerts: [], surge: false, simulated: false },
});

describe("fleet routing", () => {
  it("never loads a vehicle past its capacity and keeps pledges whole", () => {
    const pledges = Array.from({ length: 30 }, (_, i) => pledge(["north", "south", "east"][i % 3], 7));
    const plan = planRoutes(state([driver("bus", "bus"), driver("suv", "suv"), driver("car", "compact")], pledges), DAY);
    for (const r of plan.routes) expect(r.load).toBeLessThanOrEqual(r.capacity);
    const routed = plan.routes.flatMap((r) => r.stops.filter((s) => s.kind === "dropoff").flatMap((s) => s.pledgeIds));
    expect(new Set(routed).size).toBe(routed.length);
    expect(routed.length + plan.unrouted.length).toBe(pledges.length);
    expect(plan.summary.items).toBe(routed.length * 7);
  });

  it("fills the biggest vehicle first", () => {
    const plan = planRoutes(state([driver("car", "compact"), driver("bus", "bus")], [pledge("north", 5), pledge("south", 4)]), DAY);
    expect(plan.routes.map((r) => r.driverId)).toEqual(["bus"]);
    expect(plan.summary.label).toBe("1 XL route");
  });

  it("spills over to smaller vehicles and labels the mix", () => {
    const pledges = [...Array.from({ length: 6 }, () => pledge("north", 50)), pledge("south", 8)];
    const plan = planRoutes(state([driver("car", "compact"), driver("bus1", "bus"), driver("bus2", "bus")], pledges), DAY);
    expect(plan.summary.label).toBe("2 XL routes + 1 S route");
    expect(plan.unrouted).toEqual([]);
  });

  it("reports pledges that fit no vehicle as unrouted", () => {
    const big = pledge("north", 11);
    const plan = planRoutes(state([driver("car", "compact")], [big, pledge("south", 3)]), DAY);
    expect(plan.unrouted).toEqual([big.id]);
    expect(plan.routes[0].load).toBe(3);
  });

  it("skips volunteers and pledges already picked up", () => {
    const pledges = [pledge("north", 1, { fulfillment: "volunteer" }), pledge("north", 1, { status: "picked_up" })];
    const plan = planRoutes(state([driver("bus", "bus")], pledges), DAY);
    expect(plan).toMatchObject({ routes: [], unrouted: [], summary: { label: "No routes" } });
  });

  it("visits every pickup before any drop-off and merges shared stops", () => {
    const pledges = [
      pledge("north", 2, { storeId: "s-a" }), pledge("south", 2, { storeId: "s-a" }), pledge("east", 2, { storeId: "s-c" }),
      pledge("north", 1, { fulfillment: "porch", porch: { lat: 33.5, lng: -86.79 } }),
    ];
    const [route] = planRoutes(state([driver("bus", "bus")], pledges), DAY).routes;
    const kinds = route.stops.map((s) => s.kind);
    expect(kinds[0]).toBe("start");
    expect(kinds.lastIndexOf("pickup")).toBeLessThan(kinds.indexOf("dropoff"));
    expect(kinds.filter((k) => k === "pickup")).toHaveLength(3); // s-a (merged), s-c, porch
    expect(kinds.filter((k) => k === "dropoff")).toHaveLength(3);
    expect(route.stops[0].eta).toBe("09:00");
    for (const id of pledges.map((p) => p.id)) {
      const pickupAt = route.stops.findIndex((s) => s.kind === "pickup" && s.pledgeIds.includes(id));
      const dropAt = route.stops.findIndex((s) => s.kind === "dropoff" && s.pledgeIds.includes(id));
      expect(pickupAt).toBeGreaterThan(0);
      expect(dropAt).toBeGreaterThan(pickupAt);
    }
  });

  it("beats each donation driven as its own round trip, in minutes and miles", () => {
    const pledges = Array.from({ length: 12 }, (_, i) => pledge(["north", "south", "east"][i % 3], 3));
    const plan = planRoutes(state([driver("bus", "bus")], pledges), DAY);
    expect(plan.routes[0].naiveMiles).toBeGreaterThanOrEqual(plan.routes[0].miles);
    expect(plan.routes[0].naiveMinutes).toBeGreaterThanOrEqual(plan.routes[0].minutes);
    expect(plan.summary.naiveMinutes).toBeGreaterThan(plan.summary.minutes);
    expect(plan.summary.naiveMiles).toBeGreaterThan(plan.summary.miles);
  });

  it("counts the drive back and 5 minutes per stop, for the route and the baseline", () => {
    const start = { lat: 33.5186, lng: -86.8104 };
    const partners = [partner("north", 33.56, -86.8)];
    const shipt = planRoutes(state([driver("bus", "bus")], [pledge("north", 1, { storeId: "s-a" })], partners), DAY).routes[0];
    const loop = pathMiles([start, { lat: 33.53, lng: -86.8 }, { lat: 33.56, lng: -86.8 }, start]);
    // One pledge: the route is exactly the solo round trip start -> store -> nonprofit -> start, with 2 stops.
    expect(shipt.miles).toBeCloseTo(loop, 1);
    expect(shipt.minutes).toBe(Math.round(minutesFor(loop) + 10));
    expect([shipt.naiveMiles, shipt.naiveMinutes]).toEqual([shipt.miles, shipt.minutes]);
    // The drop-off ETA is the drive so far plus the 5 minutes spent at the store.
    const arrives = Math.round(9 * 60 + minutesFor(pathMiles([start, { lat: 33.53, lng: -86.8 }, { lat: 33.56, lng: -86.8 }])) + 5);
    expect(shipt.stops.at(-1)?.eta).toBe(`09:${String(arrives - 9 * 60).padStart(2, "0")}`);

    // A porch donor's own trip is home -> nonprofit -> home, with 1 stop.
    const porch = { lat: 33.55, lng: -86.8 };
    const own = planRoutes(state([driver("bus", "bus")], [pledge("north", 1, { fulfillment: "porch", porch })], partners), DAY).routes[0];
    const there = pathMiles([porch, { lat: 33.56, lng: -86.8 }]);
    expect(own.naiveMiles).toBeCloseTo(2 * there, 1);
    expect(own.naiveMinutes).toBe(Math.round(minutesFor(2 * there) + 5));
  });

  it("counts drop-offs outside the receiving window as late", () => {
    const partners = [partner("early", 33.56, -86.8, "08:30"), partner("open", 33.47, -86.82)];
    const [route] = planRoutes(state([driver("bus", "bus")], [pledge("early", 1), pledge("open", 1)], partners), DAY).routes;
    expect(route.lateStops).toBe(1);
  });

  it("drops off at the public drop point for confidential partners", () => {
    const dropPoint = { address: "", location: { lat: 33.51, lng: -86.8 } };
    const partners = [partner("safe", 33.6, -86.9, "18:00", { features: ["confidential"], dropPoint })];
    const [route] = planRoutes(state([driver("bus", "bus")], [pledge("safe", 1)], partners), DAY).routes;
    expect(route.stops.at(-1)?.location).toEqual(dropPoint.location);
  });

  it("never routes a confidential partner that has no public drop point", () => {
    const hidden = partner("hidden", 33.6, -86.9, "18:00", { features: ["confidential"] });
    const unsafe = pledge("hidden", 1);
    const plan = planRoutes(state([driver("bus", "bus")], [unsafe, pledge("open", 1)], [hidden, partner("open", 33.47, -86.82)]), DAY);
    expect(plan.unrouted).toEqual([unsafe.id]);
    expect(JSON.stringify(plan.routes)).not.toContain(JSON.stringify(hidden.location));
  });
});
