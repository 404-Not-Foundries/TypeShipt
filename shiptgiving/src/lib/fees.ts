// Donor pricing for a pledge. Owner: mulimangila.
import type { Fulfillment, PledgeCost } from "@/lib/types";

/** Community-batch delivery fee, split across every donor in the same batch. */
export const BATCH_DELIVERY_FEE = 9.99;
/** Service fee on Shipt-delivered items. */
export const SERVICE_RATE = 0.05;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Cost breakdown for one pledge.
 * - shipt: items + shared delivery fee + service fee
 * - porch: items + shared delivery fee (a batched driver picks it up), no service fee
 * - volunteer: items only (the donor drives it)
 */
export function pledgeCost(price: number, qty: number, fulfillment: Fulfillment, donorsInBatch: number): PledgeCost {
  const items = round2(price * qty);
  const donors = Math.max(1, Math.floor(donorsInBatch) || 1);
  const deliveryShare = fulfillment === "volunteer" ? 0 : round2(BATCH_DELIVERY_FEE / donors);
  const service = fulfillment === "shipt" ? round2(items * SERVICE_RATE) : 0;
  return { items, deliveryShare, service, total: round2(items + deliveryShare + service) };
}

/** 2026 IRS charitable mileage rate for volunteer drivers (Notice 2026-10). */
export const CHARITY_MILE_RATE = 0.14;

/** Round-trip mileage value for a volunteer drive. Only itemizers can deduct it; the UI never promises that. */
export function mileageValue(oneWayMiles: number): number {
  return round2(Math.max(0, oneWayMiles) * 2 * CHARITY_MILE_RATE);
}

export const formatUsd = (n: number) => `$${n.toFixed(2)}`;
