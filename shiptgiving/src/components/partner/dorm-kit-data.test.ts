import { describe, expect, it } from "vitest";
import type { CatalogItem, Need } from "@/lib/types";
import { kitNeedItems, kitPrice, kitsCovered, resolveDormKit } from "./dorm-kit-data";

const item = (id: string, name: string, price: number, category = "Dorm"): CatalogItem => ({
  id,
  name,
  category,
  price,
  storeIds: [],
});

const catalog = [
  item("socks-mens", "Men's crew socks, 6-pack (L/XL)", 9.99, "Clothing"),
  item("blanket-fleece", "Fleece throw blanket", 12.99, "Bedding"),
  item("towel-bath", "Bath towel", 6, "Bath"),
  item("notebooks", "Spiral notebooks, 5-pack", 5, "School supplies"),
];

const need = (itemId: string, qtyPledged: number, partnerId = "promise"): Need => ({
  id: `n-${itemId}-${partnerId}`,
  partnerId,
  itemId,
  title: itemId,
  qtyNeeded: 10,
  qtyPledged,
  qtyReceived: 0,
  urgency: "normal",
  createdAt: "2026-11-14T12:00:00-06:00",
});

describe("dorm kit", () => {
  it("uses only catalog items and skips slots the catalog cannot fill", () => {
    const lines = resolveDormKit(catalog);
    expect(lines.map((l) => l.item.id)).toEqual(["blanket-fleece", "towel-bath", "notebooks"]);
    expect(kitPrice(lines)).toBe(29.99);
  });

  it("never uses a bundled move-in kit as a towel line", () => {
    const withBundle = [item("dorm-kit", "Dorm move-in kit (sheets, towels, hamper, desk lamp)", 89.99), ...catalog];
    expect(resolveDormKit(withBundle).map((l) => l.item.id)).not.toContain("dorm-kit");
  });

  it("scales quantities by the number of scholars", () => {
    const items = kitNeedItems(resolveDormKit(catalog), 3);
    expect(items.find((i) => i.itemId === "towel-bath")?.qty).toBe(6);
    expect(items.every((i) => i.title.startsWith("Dorm Kit: "))).toBe(true);
  });

  it("counts a kit as covered only when every line is covered for this partner", () => {
    const lines = resolveDormKit(catalog);
    const needs = [need("blanket-fleece", 3), need("towel-bath", 4), need("notebooks", 5), need("notebooks", 9, "edfarm")];
    expect(kitsCovered(lines, needs, "promise", "qtyPledged")).toBe(2);
    expect(kitsCovered(lines, needs, "promise", "qtyReceived")).toBe(0);
    expect(kitsCovered([], needs, "promise", "qtyPledged")).toBe(0);
  });
});
