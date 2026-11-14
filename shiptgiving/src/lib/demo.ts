import { addPledge, getState } from "@/lib/store";
import type { Fulfillment, LatLng, Pledge } from "@/lib/types";

const NAMES = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie"];
const DOWNTOWN: LatLng = { lat: 33.5186, lng: -86.8104 };
const radians = (degrees: number) => degrees * Math.PI / 180;

function haversine(a: LatLng, b: LatLng): number {
  const h = Math.sin(radians(b.lat - a.lat) / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(radians(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

function randomGenerator() {
  let seed = 404;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function porchLocation(random: () => number): LatLng {
  const radius = 2.8 * Math.sqrt(random());
  const angle = random() * 2 * Math.PI;
  return {
    lat: DOWNTOWN.lat + radius * Math.cos(angle) / 111.32,
    lng: DOWNTOWN.lng + radius * Math.sin(angle) / (111.32 * Math.cos(radians(DOWNTOWN.lat))),
  };
}

/** Repeatable pledge choices; the store still assigns live IDs and creation times. */
export function seedDemoPledges(count = 10): Pledge[] {
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError("Count must be a nonnegative integer");
  const state = getState();
  const random = randomGenerator();
  const groups = state.partners.map((partner) => ({
    partner,
    needs: state.needs.filter((need) => need.partnerId === partner.id
      && need.qtyNeeded > need.qtyPledged
      && state.catalog.some((item) => item.id === need.itemId && (!item.perishable || state.stores.length > 0))),
  })).filter((group) => group.needs.length > 0);
  const remaining = new Map(state.needs.map((need) => [need.id, need.qtyNeeded - need.qtyPledged]));
  const created: Pledge[] = [];
  let cursor = 0;

  while (created.length < count && groups.length > 0) {
    const index = cursor % groups.length;
    const group = groups[index];
    const need = group.needs.shift();
    if (!need) {
      groups.splice(index, 1);
      continue;
    }
    const item = state.catalog.find((entry) => entry.id === need.itemId);
    const slot = created.length % 10;
    let fulfillment: Fulfillment = slot === 6 ? "volunteer" : slot === 7 || slot === 8 ? "porch" : "shipt";
    if (item?.perishable || (fulfillment === "porch" && !group.partner.accepts.porchPickup)) fulfillment = "shipt";
    const location = group.partner.dropPoint?.location ?? group.partner.location;
    const nearest = state.stores.reduce<(typeof state.stores)[number] | undefined>((best, store) =>
      !best || haversine(location, store.location) < haversine(location, best.location) ? store : best, undefined);
    if (fulfillment === "shipt" && !nearest) fulfillment = "volunteer";
    const qty = Math.min(2 + Math.floor(random() * 7), remaining.get(need.id) ?? 0);

    created.push(addPledge({
      needId: need.id,
      qty,
      fulfillment,
      donorName: NAMES[Math.floor(random() * NAMES.length)],
      storeId: fulfillment === "shipt" ? nearest?.id : undefined,
      porch: fulfillment === "porch" ? porchLocation(random) : undefined,
    }));
    remaining.set(need.id, (remaining.get(need.id) ?? 0) - qty);
    if ((remaining.get(need.id) ?? 0) > 0) group.needs.push(need);
    if (group.needs.length === 0) {
      groups.splice(index, 1);
      cursor = index;
    } else {
      cursor = index + 1;
    }
  }
  return created;
}
