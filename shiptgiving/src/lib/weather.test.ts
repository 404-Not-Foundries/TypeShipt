import { describe, expect, it } from "vitest";
import type { CatalogItem, Need, Partner, Urgency } from "@/lib/types";
import { surgeReasons, surgeUpdater, toWeather } from "@/lib/weather";

const partner = (id: string, weatherSurge: boolean): Partner => ({
  id,
  name: id,
  mission: "",
  neighborhood: "",
  address: "",
  location: { lat: 0, lng: 0 },
  receiving: [],
  accepts: { newOnly: false, perishables: false, porchPickup: true, refuses: [] },
  features: weatherSurge ? ["weatherSurge"] : [],
});

const item = (id: string, name: string, category: string): CatalogItem => ({ id, name, category, price: 1, storeIds: [] });

const need = (id: string, partnerId: string, itemId: string, urgency: Urgency = "normal"): Need => ({
  id,
  partnerId,
  itemId,
  title: itemId,
  qtyNeeded: 10,
  qtyPledged: 0,
  qtyReceived: 0,
  urgency,
  createdAt: "2026-11-14T12:00:00-06:00",
});

const state = {
  partners: [partner("firehouse", true), partner("jimmiehale", true), partner("ywca", false)],
  catalog: [
    item("socks-mens", "Men's crew socks", "Clothing"),
    item("blanket-fleece", "Fleece throw blanket", "Bedding"),
    item("water-24", "Bottled water, 24-pack", "Heat relief"),
    item("breakfast-bars", "Breakfast bars", "Food"),
  ],
};

const needs = [
  need("n-fh-socks", "firehouse", "socks-mens", "high"),
  need("n-fh-blankets", "firehouse", "blanket-fleece"),
  need("n-fh-water", "firehouse", "water-24"),
  need("n-jh-bars", "jimmiehale", "breakfast-bars"),
  need("n-yw-socks", "ywca", "socks-mens"),
];
const byId = (list: Need[], id: string) => list.find((n) => n.id === id)!;

describe("surge rule", () => {
  it("surges when the low is under 40°F, but not at 40", () => {
    expect(toWeather({ lowF: 39, alerts: [] }, false)).toMatchObject({ surge: true, reason: "Tonight's low: 39°F" });
    expect(toWeather({ lowF: 40, alerts: [] }, false)).toMatchObject({ surge: false, reason: undefined });
  });

  it("surges on a heat alert and ignores other alerts", () => {
    expect(surgeReasons({ lowF: 78, alerts: ["Heat Advisory"] }).heat).toBe("Heat Advisory in effect");
    expect(toWeather({ lowF: 60, alerts: ["Flood Watch"] }, false).surge).toBe(false);
  });
});

describe("surgeUpdater", () => {
  it("raises cold-weather needs at weatherSurge partners only", () => {
    const out = needs.map(surgeUpdater(state, { lowF: 34, alerts: [] }));
    expect(byId(out, "n-fh-socks")).toMatchObject({ urgency: "urgent", surgeReason: "Tonight's low: 34°F" });
    expect(byId(out, "n-fh-blankets").urgency).toBe("urgent");
    expect(byId(out, "n-fh-water")).toEqual(byId(needs, "n-fh-water"));
    expect(byId(out, "n-jh-bars").urgency).toBe("normal");
    expect(byId(out, "n-yw-socks").surgeReason).toBeUndefined();
  });

  it("raises heat-relief needs on a heat advisory", () => {
    const out = needs.map(surgeUpdater(state, { lowF: 78, alerts: ["Heat Advisory"] }));
    expect(byId(out, "n-fh-water")).toMatchObject({ urgency: "urgent", surgeReason: "Heat Advisory in effect" });
    expect(byId(out, "n-fh-socks").urgency).toBe("high");
  });

  it("restores the earlier urgency when the surge ends", () => {
    const base = new Map<string, Urgency>();
    const surged = needs.map(surgeUpdater(state, { lowF: 34, alerts: [] }, base));
    const again = surged.map(surgeUpdater(state, { lowF: 30, alerts: [] }, base));
    expect(byId(again, "n-fh-socks").surgeReason).toBe("Tonight's low: 30°F");
    const calm = again.map(surgeUpdater(state, { lowF: 55, alerts: [] }, base));
    expect(calm).toEqual(needs);
    expect(base.size).toBe(0);
  });
});
