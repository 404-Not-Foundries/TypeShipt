// Step 1 of planning: which driver carries which pledges. Greedy, biggest vehicle first. Owner: rmaytr.
import type { AppState, Driver, LatLng, Partner, Pledge } from "@/lib/types";
import { roadMiles } from "@/lib/routing/geo";

export type Assignment = { driver: Driver; pledges: Pledge[]; load: number };

/** Pledges a driver picks up: Shipt orders and porch pickups that are still open. Volunteers drive themselves. */
export const isRoutable = (p: Pledge) =>
  (p.fulfillment === "shipt" || p.fulfillment === "porch") && (p.status === "pledged" || p.status === "batched");

const isConfidential = (partner: Partner) => partner.features.includes("confidential");

/** A confidential partner with no public drop point is never routed: its address must not reach a driver. */
const hasSafeDrop = (partner: Partner) => !isConfidential(partner) || Boolean(partner.dropPoint);

/** Where a driver drops off: confidential partners use their public drop point. */
export function dropLocation(partner: Partner): LatLng {
  return isConfidential(partner) && partner.dropPoint ? partner.dropPoint.location : partner.location;
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * The partner's receiving hours on `day` (0 = Sunday).
 * shortcut: a partner closed that day gets the hours of its next open day; model real dates to schedule across days.
 */
export function windowFor(partner: Partner, day: number): { open: string; close: string } | undefined {
  for (let offset = 0; offset < 7; offset++) {
    const w = partner.receiving.find((r) => r.days.includes((day + offset) % 7));
    if (w) return { open: w.open, close: w.close };
  }
  return undefined;
}

/** An oversized pledge becomes same-id chunks no bigger than the biggest vehicle, so it can ride in several. */
export function splitPledge(p: Pledge, maxCap: number): Pledge[] {
  if (maxCap <= 0 || p.qty <= maxCap) return [p];
  const chunks: Pledge[] = [];
  for (let left = p.qty; left > 0; left -= maxCap) chunks.push({ ...p, qty: Math.min(left, maxCap) });
  return chunks;
}

/** Items the whole fleet can carry in one trip each. Donor UI uses it for a soft hint. */
export const fleetCapacity = (drivers: Driver[]) => drivers.reduce((n, d) => n + d.capacity, 0);

/**
 * Sorts drivers biggest first. Each driver takes partner groups in order of earliest closing time, then distance
 * from the driver's start, loading whole pledges while they fit. Pledges that fit no vehicle come back as unrouted.
 */
export function assignPledges(state: AppState, day: number): { assignments: Assignment[]; unrouted: string[] } {
  const partnerById = new Map(state.partners.filter(hasSafeDrop).map((p) => [p.id, p]));
  const open = state.pledges.filter(isRoutable);
  // A pledge with no partner to deliver to (gone, or no safe drop point) is never loaded.
  const undeliverable = open.filter((p) => !partnerById.has(p.partnerId));
  const taken = new Set<Pledge>(undeliverable);
  const maxCap = Math.max(0, ...state.drivers.map((d) => d.capacity));

  const groups = [...new Set(open.map((p) => p.partnerId))]
    .filter((id) => partnerById.has(id))
    .map((id) => {
      const partner = partnerById.get(id)!;
      const w = windowFor(partner, day);
      return {
        drop: dropLocation(partner),
        closes: w ? toMinutes(w.close) : Infinity,
        pledges: open.filter((p) => p.partnerId === id).flatMap((p) => splitPledge(p, maxCap)).sort((a, b) => b.qty - a.qty),
      };
    });

  const drivers = [...state.drivers].sort((a, b) => b.capacity - a.capacity);
  const assignments = drivers.map((driver): Assignment => {
    const ordered = [...groups].sort(
      (a, b) => a.closes - b.closes || roadMiles(driver.start, a.drop) - roadMiles(driver.start, b.drop),
    );
    let load = 0;
    const pledges: Pledge[] = [];
    for (const group of ordered) {
      for (const p of group.pledges) {
        if (taken.has(p) || load + p.qty > driver.capacity) continue;
        taken.add(p);
        pledges.push(p);
        load += p.qty;
      }
    }
    return { driver, pledges, load };
  });

  return {
    assignments: assignments.filter((a) => a.pledges.length > 0),
    unrouted: [...new Set([...undeliverable, ...groups.flatMap((g) => g.pledges).filter((p) => !taken.has(p))].map((p) => p.id))],
  };
}
