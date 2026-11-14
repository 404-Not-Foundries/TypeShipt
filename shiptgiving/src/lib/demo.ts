import { haversineMiles } from "@/lib/routing/geo";
import { addPledge, DOWNTOWN, getState, resetState } from "@/lib/store";
import type { Fulfillment, LatLng, Pledge } from "@/lib/types";
import { refreshWeather } from "@/lib/weather";

const NAMES = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie"];
const radians = (degrees: number) => degrees * Math.PI / 180;

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
      !best || haversineMiles(location, store.location) < haversineMiles(location, best.location) ? store : best, undefined);
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

type ScenarioPledge = { needId: string; qty: number; fulfillment: Fulfillment; donorName: string; porch?: LatLng };

// A cold snap is forecast, so neighbors and local groups answer the Weather Surge overnight.
// Sized for tomorrow's seeded drivers: the driver-routed items fill 2 school buses and spill into the convertible.
const COLD_NIGHT: ScenarioPledge[] = [
  { needId: "n-fh-socks", qty: 40, fulfillment: "shipt", donorName: "Homewood neighbors" },
  { needId: "n-fh-blankets", qty: 20, fulfillment: "shipt", donorName: "Crestwood book club" },
  { needId: "n-fh-warmers", qty: 30, fulfillment: "shipt", donorName: "Southside run club" },
  { needId: "n-fh-deodorant", qty: 6, fulfillment: "volunteer", donorName: "Maya" },
  { needId: "n-jh-hats", qty: 25, fulfillment: "porch", donorName: "Avondale knitting circle", porch: { lat: 33.5245, lng: -86.7735 } },
  { needId: "n-jh-gloves", qty: 35, fulfillment: "shipt", donorName: "Forest Park PTA" },
  { needId: "n-jh-blankets", qty: 8, fulfillment: "shipt", donorName: "Glen Iris choir" },
  { needId: "n-bb-razors", qty: 12, fulfillment: "shipt", donorName: "Five Points coworkers" },
  { needId: "n-bb-coffee", qty: 4, fulfillment: "shipt", donorName: "Jordan" },
  { needId: "n-pw-pajamas", qty: 18, fulfillment: "shipt", donorName: "Lakeview parents" },
  { needId: "n-pw-diapers", qty: 9, fulfillment: "porch", donorName: "Riley", porch: { lat: 33.5105, lng: -86.7905 } },
  { needId: "n-fb-peanut-butter", qty: 62, fulfillment: "shipt", donorName: "Highland Park neighbors" },
  { needId: "n-fb-vegetables", qty: 45, fulfillment: "shipt", donorName: "Norwood garden club" },
];

/** One-click demo: fresh state (seeded drivers included), a simulated cold-weather surge, and a night of pledges. */
export async function loadColdNight(): Promise<Pledge[]> {
  resetState();
  await refreshWeather("cold");
  return COLD_NIGHT.map((pledge) => addPledge(pledge));
}
