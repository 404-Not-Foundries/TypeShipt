import { describe, expect, it } from "vitest";
import { toShiptOrder, toShiptRecipient } from "@/lib/shipt-platform";
import type { AppState, Partner, Pledge } from "@/lib/types";

const partner: Partner = {
  id: "partner", name: "Birmingham partner", mission: "Help neighbors", neighborhood: "Downtown",
  address: "Receiving desk, Birmingham", location: { lat: 33.5186, lng: -86.8104 },
  receiving: [{ days: [6], open: "09:00", close: "17:00", assumed: true }],
  accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: [] }, features: [],
};
const pledge: Pledge = {
  id: "pledge-1", needId: "need", partnerId: "partner", donorName: "Sam", qty: 3,
  fulfillment: "shipt", status: "pledged", createdAt: "2026-11-14T18:00:00Z",
  cost: { items: 29.97, deliveryShare: 9.99, service: 1.5, total: 41.46 },
};
function fixture(): AppState {
  return structuredClone({
    partners: [partner],
    stores: [
      { id: "far", name: "Far store", brand: "Far", address: "Far address", location: { lat: 33.6, lng: -86.7 }, source: "osm-snapshot" },
      { id: "near", name: "Nearby store", brand: "Nearby", address: "Nearby address", location: { lat: 33.519, lng: -86.811 }, source: "osm-snapshot" },
    ],
    catalog: [{ id: "socks", name: "New socks", category: "Clothing", price: 9.99, storeIds: [] }],
    needs: [{ id: "need", partnerId: "partner", itemId: "socks", title: "Socks", qtyNeeded: 40, qtyPledged: 3, qtyReceived: 0, urgency: "urgent", createdAt: pledge.createdAt }],
    pledges: [pledge], weather: { lowF: 55, alerts: [], surge: false, simulated: false },
    drivers: [], routes: [], unrouted: [], routeSummary: null,
  });
}

describe("toShiptOrder", () => {
  it("formats a gift order and uses the nearest store when no store was selected", () => {
    const order = toShiptOrder(pledge, fixture());
    expect(order).toMatchObject({
      external_order_id: pledge.id, order_type: "gift", tags: ["community", "shiptgiving"],
      retailer: { store_id: "near", name: "Nearby store", address: "Nearby address" },
      recipient: { name: partner.name, address: partner.address, location: partner.location },
      delivery_window: { open: "09:00", close: "17:00", assumed: true },
      fulfillment: "shipt", pricing: pledge.cost,
      note: "Donation via ShiptGiving. Deliver to receiving desk.",
    });
    expect(order?.pickup_location).toBeUndefined();
  });

  it("keeps an explicitly selected retailer, even when another is closer", () => {
    expect(toShiptOrder({ ...pledge, storeId: "far" }, fixture())?.retailer.store_id).toBe("far");
  });

  it("never exposes confidential addresses or private coordinates", () => {
    const state = fixture();
    state.partners[0] = {
      ...state.partners[0], features: ["confidential"], address: "SECRET SHELTER ADDRESS",
      location: { lat: 31.123, lng: -80.456 },
      dropPoint: { address: "Public receiving office", location: partner.location },
    };
    const order = toShiptOrder(pledge, state);
    expect(order?.recipient).toEqual({ name: partner.name, address: "Public receiving office", location: partner.location });
    expect(JSON.stringify(order)).not.toContain("SECRET");
    expect(JSON.stringify(order)).not.toContain("31.123");
    expect(order?.retailer.store_id).toBe("near");
    delete state.partners[0].dropPoint;
    expect(toShiptOrder(pledge, state)).toBeNull();
    expect(toShiptRecipient(state.partners[0])).toBeNull();
  });

  it("returns null for a volunteer", () => {
    expect(toShiptOrder({ ...pledge, fulfillment: "volunteer" }, fixture())).toBeNull();
  });

  it("makes porch pledges pickup orders with a copied pickup location", () => {
    const porch = { lat: 33.52, lng: -86.81 };
    const order = toShiptOrder({ ...pledge, fulfillment: "porch", porch }, fixture());
    expect(order).toMatchObject({ order_type: "pickup", fulfillment: "porch", pickup_location: porch });
    expect(order?.pickup_location).not.toBe(porch);
    expect(toShiptOrder({ ...pledge, fulfillment: "porch" }, fixture())).toBeNull();
  });

  it("matches line-item totals to the pledged goods value, even after a catalog price change", () => {
    const state = fixture();
    state.catalog[0].price = 14.99;
    const order = toShiptOrder(pledge, state)!;
    expect(order.line_items[0]).toMatchObject({ sku: "socks", name: "New socks", quantity: 3 });
    expect(order.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)).toBeCloseTo(pledge.cost.items, 8);
  });

  it("uses the Birmingham order day, including UTC dates after local midnight boundaries", () => {
    expect(toShiptOrder({ ...pledge, createdAt: "2026-11-15T02:00:00Z" }, fixture())?.delivery_window).not.toBeNull();
    expect(toShiptOrder({ ...pledge, createdAt: "2026-11-15T08:00:00Z" }, fixture())?.delivery_window).toBeNull();
    expect(toShiptOrder({ ...pledge, createdAt: "invalid" }, fixture())?.delivery_window).toBeNull();
    const state = fixture();
    state.partners[0].receiving[0].assumed = false;
    expect(toShiptOrder(pledge, state)?.delivery_window?.assumed).toBe(false);
  });

  it("is repeatable, leaves its inputs unchanged, and returns independent nested objects", () => {
    const state = fixture();
    const before = structuredClone(state);
    const input = structuredClone(pledge);
    const order = toShiptOrder(input, state)!;
    expect(toShiptOrder(input, state)).toEqual(order);
    order.pricing.items = 0;
    order.recipient.location.lat = 0;
    expect(state).toEqual(before);
    expect(input).toEqual(pledge);
  });

  it("does not manufacture orders with missing catalog, partner, or retailer data", () => {
    for (const field of ["partners", "catalog", "needs", "stores"] as const) {
      const state = fixture();
      state[field] = [];
      expect(toShiptOrder(pledge, state)).toBeNull();
    }
  });
});
