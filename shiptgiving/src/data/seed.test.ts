import { describe, expect, it } from "vitest";
import { catalog, COLD_KIT_ITEM_IDS, HEAT_KIT_ITEM_IDS, needs, partners } from "@/data";

const unique = (ids: string[]) => new Set(ids).size === ids.length;

describe("seed data", () => {
  it("meets the demo minimums", () => {
    expect(partners.length).toBeGreaterThanOrEqual(8);
    expect(needs.length).toBeGreaterThanOrEqual(25);
    expect(catalog.length).toBeGreaterThanOrEqual(40);
  });

  it("has unique ids", () => {
    expect(unique(partners.map((p) => p.id))).toBe(true);
    expect(unique(catalog.map((c) => c.id))).toBe(true);
    expect(unique(needs.map((n) => n.id))).toBe(true);
  });

  it("links every need to a real partner and catalog item", () => {
    const partnerIds = new Set(partners.map((p) => p.id));
    const itemIds = new Set(catalog.map((c) => c.id));
    for (const n of needs) {
      expect(partnerIds.has(n.partnerId), n.id).toBe(true);
      expect(itemIds.has(n.itemId), n.id).toBe(true);
      expect(n.qtyReceived).toBeLessThanOrEqual(n.qtyPledged);
      expect(n.qtyPledged).toBeLessThan(n.qtyNeeded);
    }
    for (const id of [...COLD_KIT_ITEM_IDS, ...HEAT_KIT_ITEM_IDS]) expect(itemIds.has(id), id).toBe(true);
  });

  it("only sends perishables to partners that accept them", () => {
    const byId = new Map(partners.map((p) => [p.id, p]));
    const items = new Map(catalog.map((c) => [c.id, c]));
    for (const n of needs) {
      if (items.get(n.itemId)?.perishable) expect(byId.get(n.partnerId)?.accepts.perishables, n.id).toBe(true);
    }
  });

  it("gives confidential partners a drop point and keeps coordinates in Birmingham", () => {
    for (const p of partners) {
      if (p.features.includes("confidential")) expect(p.dropPoint, p.id).toBeDefined();
      expect(p.location.lat).toBeGreaterThan(33.4);
      expect(p.location.lat).toBeLessThan(33.6);
      expect(p.location.lng).toBeGreaterThan(-86.9);
      expect(p.location.lng).toBeLessThan(-86.7);
      expect(p.receiving.length).toBeGreaterThan(0);
    }
  });
});
