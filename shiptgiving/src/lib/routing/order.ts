// Step 2 of planning: the stop order for one driver. Shop first, then deliver. Owner: rmaytr.
import type { AppState, Driver, LatLng, Partner, Pledge, RoutePlan, Stop, Store } from "@/lib/types";
import { dropLocation, toMinutes, windowFor } from "@/lib/routing/assign";
import { minutesFor, pathMiles, roadMiles } from "@/lib/routing/geo";

export const START_MINUTES = 9 * 60; // routes leave at 9:00 AM

type Place = { key: string; label: string; location: LatLng };

const nearest = <T extends { location: LatLng }>(from: LatLng, items: T[]): T | undefined =>
  items.reduce<T | undefined>(
    (best, it) => (!best || roadMiles(from, it.location) < roadMiles(from, best.location) ? it : best),
    undefined,
  );

/** Where the driver collects a pledge: the donor's porch, the chosen store, or the store nearest the partner. */
function pickupFor(pledge: Pledge, partner: Partner, stores: Store[]): Place | undefined {
  if (pledge.fulfillment === "porch" && pledge.porch) {
    const { lat, lng } = pledge.porch;
    return { key: `porch-${lat.toFixed(5)}-${lng.toFixed(5)}`, label: `Porch pickup: ${pledge.donorName}`, location: pledge.porch };
  }
  const store = stores.find((s) => s.id === pledge.storeId) ?? nearest(dropLocation(partner), stores);
  return store && { key: store.id, label: store.name, location: store.location };
}

/** Nearest neighbor from `origin`, then 2-opt: reverse any stretch of the path that makes it shorter. */
export function orderStops(origin: LatLng, stops: Stop[]): Stop[] {
  const length = (path: Stop[]) => pathMiles([origin, ...path.map((s) => s.location)]);
  let path: Stop[] = [];
  let left = stops;
  let at = origin;
  while (left.length > 0) {
    const next = nearest(at, left)!;
    path = [...path, next];
    left = left.filter((s) => s !== next);
    at = next.location;
  }
  for (let improved = true; improved; ) {
    improved = false;
    for (let i = 0; i < path.length - 1; i++) {
      for (let j = i + 1; j < path.length; j++) {
        const candidate = [...path.slice(0, i), ...path.slice(i, j + 1).reverse(), ...path.slice(j + 1)];
        if (length(candidate) < length(path) - 1e-9) {
          path = candidate;
          improved = true;
        }
      }
    }
  }
  return path;
}

const clock = (minutes: number) => {
  const m = Math.round(minutes) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Builds one driver's route: start, every pickup, then every drop-off, with ETAs ("HH:MM") from a 9:00 AM start. */
export function buildRoute(driver: Driver, pledges: Pledge[], state: AppState, day: number): RoutePlan {
  const partnerById = new Map(state.partners.map((p) => [p.id, p]));
  const pickups = new Map<string, Stop>();
  const dropoffs = new Map<string, Stop>();
  let naiveMiles = 0;

  for (const pledge of pledges) {
    const partner = partnerById.get(pledge.partnerId);
    if (!partner) continue; // assignPledges never hands these over
    const drop = dropLocation(partner);
    const pickup = pickupFor(pledge, partner, state.stores);
    if (pickup) {
      pickups.set(pickup.key, {
        id: `${driver.id}-pickup-${pickup.key}`, kind: "pickup", label: pickup.label, location: pickup.location,
        pledgeIds: [...(pickups.get(pickup.key)?.pledgeIds ?? []), pledge.id],
      });
    }
    dropoffs.set(partner.id, {
      id: `${driver.id}-dropoff-${partner.id}`, kind: "dropoff", label: partner.name, location: drop,
      pledgeIds: [...(dropoffs.get(partner.id)?.pledgeIds ?? []), pledge.id], window: windowFor(partner, day),
    });
    // Baseline: this pledge driven on its own, start -> pickup -> drop-off.
    naiveMiles += pathMiles([driver.start, ...(pickup ? [pickup.location] : []), drop]);
  }

  const shop = orderStops(driver.start, [...pickups.values()]);
  const deliver = orderStops(shop.at(-1)?.location ?? driver.start, [...dropoffs.values()]);
  const start: Stop = { id: `${driver.id}-start`, kind: "start", label: `${driver.name} start`, location: driver.start, pledgeIds: [] };

  let miles = 0;
  let lateStops = 0;
  const stops = [start, ...shop, ...deliver].map((stop, i, all): Stop => {
    if (i > 0) miles += roadMiles(all[i - 1].location, stop.location);
    const arrives = START_MINUTES + minutesFor(miles);
    if (stop.kind === "dropoff") {
      const w = stop.window;
      if (!w || arrives < toMinutes(w.open) || arrives > toMinutes(w.close)) lateStops += 1;
    }
    return { ...stop, eta: clock(arrives) };
  });

  return {
    driverId: driver.id, driverName: driver.name, size: driver.size, capacity: driver.capacity,
    load: pledges.reduce((sum, p) => sum + p.qty, 0),
    stops, minutes: Math.round(minutesFor(miles)), miles: round1(miles),
    naiveMinutes: Math.round(minutesFor(naiveMiles)), naiveMiles: round1(naiveMiles), lateStops,
  };
}
