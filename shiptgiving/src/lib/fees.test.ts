import { describe, expect, it } from "vitest";
import { pledgeCost } from "@/lib/fees";

describe("pledgeCost", () => {
  it("charges items, full delivery fee and service for a solo Shipt pledge", () => {
    expect(pledgeCost(9.99, 10, "shipt", 1)).toEqual({ items: 99.9, deliveryShare: 9.99, service: 5, total: 114.89 });
  });

  it("splits the delivery fee across donors in the batch", () => {
    expect(pledgeCost(5, 1, "shipt", 2).deliveryShare).toBe(5);
    expect(pledgeCost(5, 1, "shipt", 3).deliveryShare).toBe(3.33);
  });

  it("charges porch pickups the delivery share but no service fee", () => {
    expect(pledgeCost(4, 2, "porch", 1)).toEqual({ items: 8, deliveryShare: 9.99, service: 0, total: 17.99 });
  });

  it("charges volunteers for items only", () => {
    expect(pledgeCost(4, 2, "volunteer", 5)).toEqual({ items: 8, deliveryShare: 0, service: 0, total: 8 });
  });

  it("treats a missing or zero batch size as a solo donor", () => {
    expect(pledgeCost(1, 1, "shipt", 0).deliveryShare).toBe(9.99);
    expect(pledgeCost(1, 1, "shipt", Number.NaN).deliveryShare).toBe(9.99);
  });
});
