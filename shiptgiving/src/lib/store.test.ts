import { beforeEach, describe, expect, it } from "vitest";
import { addDriver, addPledge, getState, removeDriver, resetState, setPledgeStatus, setRoutes, StoreError } from "@/lib/store";
import type { RoutePlan } from "@/lib/types";

describe("store pledges", () => {
  beforeEach(() => {
    resetState();
  });

  it("records a pledge and bumps qtyPledged", () => {
    const p = addPledge({ needId: "n-fh-socks", qty: 10, fulfillment: "shipt", donorName: "Sam" });
    expect(p.cost.items).toBe(99.9);
    expect(p.cost.deliveryShare).toBe(9.99);
    expect(getState().needs.find((n) => n.id === "n-fh-socks")?.qtyPledged).toBe(10);
  });

  it("splits the batch delivery fee across donors to the same partner", () => {
    addPledge({ needId: "n-fh-socks", qty: 1, fulfillment: "shipt" });
    const second = addPledge({ needId: "n-fh-blankets", qty: 1, fulfillment: "shipt" });
    expect(second.cost.deliveryShare).toBe(5);
  });

  it("charges volunteers no delivery or service fee", () => {
    const p = addPledge({ needId: "n-fh-socks", qty: 2, fulfillment: "volunteer" });
    expect(p.cost.total).toBe(p.cost.items);
  });

  it("refuses more than what is still needed", () => {
    expect(() => addPledge({ needId: "n-fh-socks", qty: 41, fulfillment: "shipt" })).toThrow(StoreError);
  });

  it("rejects bad input", () => {
    expect(() => addPledge({ needId: "n-fh-socks", qty: 1.5, fulfillment: "shipt" })).toThrow(StoreError);
    expect(() => addPledge({ needId: "n-fh-socks", qty: 1, fulfillment: "teleport" })).toThrow(StoreError);
    expect(() => addPledge({ needId: "n-fh-socks", qty: 1, fulfillment: "porch" })).toThrow(StoreError);
  });

  it("counts received items only once", () => {
    const p = addPledge({ needId: "n-fh-socks", qty: 5, fulfillment: "shipt" });
    setPledgeStatus(p.id, "received");
    setPledgeStatus(p.id, "received");
    expect(getState().needs.find((n) => n.id === "n-fh-socks")?.qtyReceived).toBe(5);
  });
});

describe("store drivers and routes", () => {
  beforeEach(() => {
    resetState();
  });

  it("seeds 2 buses and a convertible", () => {
    expect(getState().drivers.map((d) => d.size)).toEqual(["XL", "XL", "S"]);
  });

  it("adds a driver sized from the vehicle type, and removes it", () => {
    const d = addDriver("  Van  ", "suv");
    expect(d).toMatchObject({ name: "Van", size: "L", capacity: 50, kind: "shipt" });
    removeDriver(d.id);
    expect(getState().drivers.some((x) => x.id === d.id)).toBe(false);
  });

  it("rejects bad driver input", () => {
    expect(() => addDriver("", "bus")).toThrow(StoreError);
    expect(() => addDriver("x".repeat(41), "bus")).toThrow(StoreError);
    expect(() => addDriver("Ok", "rocket")).toThrow(StoreError);
    expect(() => addDriver("Ok", "toString")).toThrow(StoreError);
    expect(() => addDriver("Ok", "bus", { lat: "a" })).toThrow(StoreError);
    expect(() => removeDriver("nope")).toThrow(StoreError);
  });

  it("marks routed pledges batched and reverts ones dropped from every route", () => {
    const a = addPledge({ needId: "n-fh-socks", qty: 1, fulfillment: "shipt" });
    const route = { driverId: "d-bus-1", stops: [{ id: "s", kind: "dropoff", label: "", location: { lat: 0, lng: 0 }, pledgeIds: [a.id] }] } as RoutePlan;
    setRoutes([route], [], null);
    expect(getState().pledges[0].status).toBe("batched");
    setRoutes([], [a.id], null);
    expect(getState().pledges[0].status).toBe("pledged");
  });

  it("removing a driver drops its route, frees its pledges and keeps the summary in step", () => {
    const a = addPledge({ needId: "n-fh-socks", qty: 1, fulfillment: "shipt" });
    const b = addPledge({ needId: "n-fh-blankets", qty: 2, fulfillment: "shipt" });
    const route = (driverId: string, pledgeId: string, load: number) => ({
      driverId, size: "XL", load, minutes: 10, naiveMinutes: 20,
      stops: [{ id: driverId, kind: "dropoff", label: "", location: { lat: 0, lng: 0 }, pledgeIds: [pledgeId] }],
    }) as RoutePlan;
    setRoutes([route("d-bus-1", a.id, 1), route("d-bus-2", b.id, 2)], [], { routes: 2, items: 3, minutes: 20, naiveMinutes: 40, label: "2 XL routes" });
    removeDriver("d-bus-1");
    expect(getState().routes.map((r) => r.driverId)).toEqual(["d-bus-2"]);
    expect(getState().routeSummary).toMatchObject({ routes: 1, items: 2, label: "1 XL route" });
    expect(getState().pledges.map((p) => p.status)).toEqual(["pledged", "batched"]);
    removeDriver("d-bus-2");
    expect(getState().routeSummary).toBeNull();
  });
});
