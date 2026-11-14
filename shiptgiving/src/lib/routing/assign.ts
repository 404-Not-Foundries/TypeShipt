// Step 1 of planning: which driver carries which pledges. Greedy, biggest vehicle first. Owner: rmaytr.
import type { AppState, Driver, LatLng, Partner, Pledge } from "@/lib/types";
import { roadMiles } from "@/lib/routing/geo";

export type Assignment = { driver: Driver; pledges: Pledge[]; load: number };

/** Pledges a driver picks up: Shipt orders and porch pickups that are still open. Volunteers drive themselves. */
export const isRoutable = (p: Pledge) =>
  (p.fulfillment === "shipt" || p.fulfillment === "porch") && (p.status === "pledged" || p.status === "batched");

/** Where a driver drops off: confidential partners use their public drop point. */
export function dropLocation(partner: Partner): LatLng {
  return partner.features.includes("confidential") && partner.dropPoint ? partner.dropPoint.location : partner.location;
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

/**
 * Sorts drivers biggest first. Each driver takes partner groups in order of earliest closing time, then distance
 * from the driver's start, loading whole pledges while they fit. Pledges that fit no vehicle come back as unrouted.
 */
export function assignPledges(state: AppState, day: number): { assignments: Assignment[]; unrouted: string[] } {
  const partnerById = new Map(state.partners.map((p) => [p.id, p]));
  const open = state.pledges.filter(isRoutable);
  // A pledge whose partner is gone can't be delivered, so it is never loaded.
  const taken = new Set(open.filter((p) => !partnerById.has(p.partnerId)).map((p) => p.id));
  const undeliverable = [...taken];

  const groups = [...new Set(open.map((p) => p.partnerId))]
    .filter((id) => partnerById.has(id))
    .map((id) => {
      const partner = partnerById.get(id)!;
      const w = windowFor(partner, day);
      return {
        drop: dropLocation(partner),
        closes: w ? toMinutes(w.close) : Infinity,
        pledges: open.filter((p) => p.partnerId === id).sort((a, b) => b.qty - a.qty),
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
        if (taken.has(p.id) || load + p.qty > driver.capacity) continue;
        taken.add(p.id);
        pledges.push(p);
        load += p.qty;
      }
    }
    return { driver, pledges, load };
  });

  return {
    assignments: assignments.filter((a) => a.pledges.length > 0),
    unrouted: [...undeliverable, ...open.filter((p) => !taken.has(p.id)).map((p) => p.id)],
  };
}
