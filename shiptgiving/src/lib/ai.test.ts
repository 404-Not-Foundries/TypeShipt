import { describe, expect, it } from "vitest";
import { keywordParse } from "@/lib/ai";
import { catalog } from "@/lib/seed-stub";

describe("keywordParse", () => {
  it("matches the demo sentence to catalog items with quantities", () => {
    const items = keywordParse("cold front tonight, need 40 pairs of men's socks L/XL and 20 blankets", catalog);
    expect(items).toEqual([
      { itemId: "socks-mens", title: expect.any(String), qty: 40, urgency: "urgent" },
      { itemId: "blanket-fleece", title: expect.any(String), qty: 20, urgency: "urgent" },
    ]);
  });

  it("only returns ids that exist in the catalog", () => {
    const ids = new Set(catalog.map((c) => c.id));
    const items = keywordParse("12 hand warmers, 3 unicorns, a dozen cases of water", catalog);
    expect(items.map((i) => i.itemId)).toEqual(["hand-warmers", "water-24"]);
    expect(items.every((i) => ids.has(i.itemId))).toBe(true);
    expect(items[1].qty).toBe(12);
  });

  it("uses a default quantity and normal urgency when none is given", () => {
    expect(keywordParse("breakfast bars", catalog)).toEqual([
      { itemId: "breakfast-bars", title: expect.any(String), qty: 10, urgency: "normal" },
    ]);
  });

  it("returns nothing when no catalog item fits", () => {
    expect(keywordParse("we need 5 pianos", catalog)).toEqual([]);
  });
});
