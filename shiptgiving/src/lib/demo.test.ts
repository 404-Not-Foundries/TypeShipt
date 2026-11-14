import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/demo/route";
import { loadColdNight, seedDemoPledges } from "@/lib/demo";
import { pledgeCost } from "@/lib/fees";
import { planRoutes } from "@/lib/routing";
import { addPledge, getState, resetState } from "@/lib/store";
import type { Pledge } from "@/lib/types";
import { refreshWeather } from "@/lib/weather";

const choices = (pledges: Pledge[]) => pledges.map((pledge) => ({
  needId: pledge.needId, partnerId: pledge.partnerId, qty: pledge.qty,
  donorName: pledge.donorName, fulfillment: pledge.fulfillment,
  storeId: pledge.storeId, porch: pledge.porch, cost: pledge.cost, status: pledge.status,
}));

// Keep the suite offline: the reset action asks for the live forecast, which falls back when the fetch fails.
vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));

beforeEach(() => { resetState(); });

describe("seedDemoPledges", () => {
  it("records ten pledges with valid quantities and existing store prices", () => {
    const created = seedDemoPledges();
    expect(created).toHaveLength(10);
    expect(getState().pledges).toEqual(created);
    expect(created.filter((pledge) => pledge.fulfillment === "shipt")).toHaveLength(7);
    expect(created.filter((pledge) => pledge.fulfillment === "porch")).toHaveLength(2);
    expect(created.filter((pledge) => pledge.fulfillment === "volunteer")).toHaveLength(1);
    created.forEach((pledge) => {
      expect(pledge.qty).toBeGreaterThanOrEqual(2);
      expect(pledge.qty).toBeLessThanOrEqual(8);
      const state = getState();
      const need = state.needs.find((entry) => entry.id === pledge.needId);
      const item = state.catalog.find((entry) => entry.id === need?.itemId);
      expect(pledge.cost.items).toBe(pledgeCost(item?.price ?? 0, pledge.qty, pledge.fulfillment, 1).items);
    });
  });

  it("never over-pledges, even across repeated loads, and stops when full", () => {
    seedDemoPledges(10000);
    seedDemoPledges(10000);
    getState().needs.forEach((need) => {
      expect(need.qtyPledged).toBeLessThanOrEqual(need.qtyNeeded);
    });
    expect(seedDemoPledges()).toEqual([]);
  });

  it("caps a pledge at the last remaining item and skips filled needs", () => {
    getState().needs.forEach((need) => {
      const qty = need.qtyNeeded - need.qtyPledged - 1;
      if (qty > 0) addPledge({ needId: need.id, qty, fulfillment: "volunteer" });
    });
    const created = seedDemoPledges(10000);
    expect(created.length).toBeGreaterThan(0);
    expect(created.every((pledge) => pledge.qty === 1)).toBe(true);
    expect(seedDemoPledges()).toEqual([]);
  });

  it("repeats the same choices after reset, leaving IDs and timestamps to the store", () => {
    const first = choices(seedDemoPledges());
    resetState();
    expect(choices(seedDemoPledges())).toEqual(first);
  });

  it("visits each partner with open needs before returning to the first", () => {
    const state = getState();
    const eligible = state.partners.filter((partner) => state.needs.some(
      (need) => need.partnerId === partner.id && need.qtyNeeded > need.qtyPledged,
    ));
    const created = seedDemoPledges(eligible.length);
    expect(new Set(created.map((pledge) => pledge.partnerId)).size).toBe(eligible.length);
    if (eligible.length > 1) expect(new Set(created.map((pledge) => pledge.partnerId)).size).toBeGreaterThan(1);
  });

  it("uses nearby stores, downtown porches, and permitted fulfillment", () => {
    const created = seedDemoPledges(30);
    expect(created.some((pledge) => pledge.fulfillment === "shipt")).toBe(true);
    expect(created.some((pledge) => pledge.fulfillment === "porch")).toBe(true);
    expect(created.some((pledge) => pledge.fulfillment === "volunteer")).toBe(true);
    created.forEach((pledge) => {
      const state = getState();
      const partner = state.partners.find((entry) => entry.id === pledge.partnerId)!;
      if (pledge.fulfillment === "shipt") {
        // Independent spherical distance: ranking by angular distance is sufficient.
        const origin = partner.dropPoint?.location ?? partner.location;
        const rad = (n: number) => n * Math.PI / 180;
        const distance = (point: { lat: number; lng: number }) => Math.acos(Math.min(1,
          Math.sin(rad(origin.lat)) * Math.sin(rad(point.lat))
          + Math.cos(rad(origin.lat)) * Math.cos(rad(point.lat)) * Math.cos(rad(point.lng - origin.lng))));
        const selected = state.stores.find((store) => store.id === pledge.storeId)!;
        expect(selected).toBeDefined();
        expect(distance(selected.location)).toBeCloseTo(Math.min(...state.stores.map((store) => distance(store.location))), 8);
      }
      if (pledge.fulfillment === "porch") {
        expect(partner.accepts.porchPickup).toBe(true);
        expect(pledge.porch).toBeDefined();
        const northKm = (pledge.porch!.lat - 33.5186) * 111.32;
        const eastKm = (pledge.porch!.lng + 86.8104) * 111.32 * Math.cos(33.5186 * Math.PI / 180);
        expect(Math.hypot(northKm, eastKm)).toBeLessThan(3);
      }
      const need = state.needs.find((entry) => entry.id === pledge.needId);
      if (state.catalog.find((item) => item.id === need?.itemId)?.perishable) {
        expect(pledge.fulfillment).toBe("shipt");
      }
    });
  });

  it("does nothing for zero and rejects invalid counts before creating pledges", () => {
    expect(seedDemoPledges(0)).toEqual([]);
    for (const count of [-1, 1.5, Infinity, NaN]) expect(() => seedDemoPledges(count)).toThrow(RangeError);
    expect(getState().pledges).toHaveLength(0);
  });
});

describe("POST /api/demo", () => {
  const request = (body: unknown) => new Request("http://localhost/api/demo", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });

  it("seeds and resets the shared state", async () => {
    const initialNeeds = structuredClone(getState().needs);
    const seeded = await POST(request({ action: "seed" }));
    expect(seeded.status).toBe(200);
    expect(await seeded.json()).toEqual({ created: 10 });
    expect(getState().pledges).toHaveLength(10);
    const reset = await POST(request({ action: "reset" }));
    expect(await reset.json()).toEqual({ ok: true });
    expect(getState().pledges).toHaveLength(0);
    expect(getState().needs).toEqual(initialNeeds);
  });

  it.each([{}, null, [], "seed", { action: "delete" }, { action: 1 }])("rejects invalid action %j", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(getState().pledges).toHaveLength(0);
  });

  it("rejects malformed JSON", async () => {
    expect((await POST(new Request("http://localhost/api/demo", { method: "POST", body: "{" }))).status).toBe(400);
  });
});

describe("loadColdNight", () => {
  it("starts fresh with the cold surge on and the seeded drivers", async () => {
    addPledge({ needId: "n-fh-water", qty: 1, fulfillment: "shipt" });
    const created = await loadColdNight();
    const state = getState();
    expect(state.pledges).toEqual(created);
    expect(created.length).toBeGreaterThanOrEqual(10);
    expect(new Set(created.map((pledge) => pledge.fulfillment))).toEqual(new Set(["shipt", "porch", "volunteer"]));
    expect(state.weather).toMatchObject({ surge: true, simulated: true });
    expect(state.needs.find((need) => need.id === "n-fh-socks")?.surgeReason).toBeTruthy();
    expect(state.drivers.map((driver) => driver.size)).toEqual(["XL", "XL", "S"]);
  });

  it("routes every driver-carried pledge: 2 XL routes + 1 S route, on time, on any day of the week", async () => {
    const created = await loadColdNight();
    const carried = created.filter((pledge) => pledge.fulfillment !== "volunteer");
    for (let day = 0; day < 7; day++) {
      const plan = planRoutes(getState(), day);
      expect(plan.unrouted).toEqual([]);
      expect(plan.summary.label).toBe("2 XL routes + 1 S route");
      expect(plan.summary.items).toBe(carried.reduce((sum, pledge) => sum + pledge.qty, 0));
      expect(plan.routes.every((route) => route.lateStops === 0 && route.load <= route.capacity)).toBe(true);
      expect(plan.summary.minutes).toBeLessThan(plan.summary.naiveMinutes * 0.75);
    }
  });

  it("is undone by the reset action, simulated weather included", async () => {
    await loadColdNight();
    const response = await POST(new Request("http://localhost/api/demo", { method: "POST", body: JSON.stringify({ action: "reset" }) }));
    expect(response.status).toBe(200);
    await refreshWeather(); // what the donor feed does on load
    expect(getState().pledges).toEqual([]);
    expect(getState().weather.surge).toBe(false);
    expect(getState().needs.some((need) => need.surgeReason)).toBe(false);
  });

  it("is available as POST /api/demo cold-night", async () => {
    const response = await POST(new Request("http://localhost/api/demo", { method: "POST", body: JSON.stringify({ action: "cold-night" }) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ created: getState().pledges.length });
  });
});
