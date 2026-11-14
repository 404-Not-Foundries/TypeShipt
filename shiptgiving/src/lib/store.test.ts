import { beforeEach, describe, expect, it } from "vitest";
import { addPledge, getState, resetState, setPledgeStatus, StoreError } from "@/lib/store";

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
