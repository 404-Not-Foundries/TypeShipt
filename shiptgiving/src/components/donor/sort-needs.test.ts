import { describe, expect, it } from "vitest";
import type { Need } from "@/lib/types";
import { sortNeedsBy } from "./sort-needs";

const need = (id: string, qtyPledged: number, extra: Partial<Need> = {}): Need =>
  ({ id, partnerId: "p", itemId: "i", title: id, qtyNeeded: 10, qtyPledged, urgency: "normal", createdAt: "2026-11-14T00:00:00Z", ...extra }) as Need;

describe("sortNeedsBy", () => {
  const needs = [need("far", 1), need("near", 2), need("full", 10), need("almost", 9)];
  const miles = (n: Need) => ({ far: 9, near: 1, full: 0, almost: 5 })[n.id] ?? 0;

  it("puts the closest open need first and filled needs last", () => {
    expect(sortNeedsBy(needs, "closest", miles).map((n) => n.id)).toEqual(["near", "almost", "far", "full"]);
  });

  it("ranks open needs by how close they are to filled", () => {
    expect(sortNeedsBy(needs, "filled", miles).map((n) => n.id)).toEqual(["almost", "near", "far", "full"]);
  });
});
