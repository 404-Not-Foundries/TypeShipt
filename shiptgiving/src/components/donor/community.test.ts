import { describe, expect, it } from "vitest";
import type { Pledge } from "@/lib/types";
import { helpersByNeed, helpersLine, isLastFew } from "./community";

const pledge = (donorName: string, i: number): Pledge => ({
  id: `p${i}`, needId: "n1", partnerId: "x", donorName, qty: 1, fulfillment: "shipt",
  cost: { items: 1, deliveryShare: 0, service: 0, total: 1 }, status: "pledged", createdAt: `2026-11-14T12:0${i}:00Z`,
});

describe("fill it together", () => {
  it("counts people, not pledges", () => {
    const h = helpersByNeed([pledge("Maya", 1), pledge("Maya", 2)]).get("n1");
    expect(helpersLine(h)).toBe("Maya");
  });

  it("names the newest helpers and counts anonymous neighbors separately", () => {
    const h = helpersByNeed([pledge("Maya", 1), pledge("A neighbor", 2), pledge("Jordan", 3), pledge("Ana", 4)]).get("n1");
    expect(helpersLine(h)).toBe("Ana, Jordan and 2 neighbors");
  });

  it("flags the last few at 80%", () => {
    const base = { id: "n", partnerId: "x", itemId: "i", title: "t", qtyReceived: 0, urgency: "normal" as const, createdAt: "" };
    expect(isLastFew({ ...base, qtyNeeded: 10, qtyPledged: 8 })).toBe(true);
    expect(isLastFew({ ...base, qtyNeeded: 10, qtyPledged: 10 })).toBe(false);
  });
});
