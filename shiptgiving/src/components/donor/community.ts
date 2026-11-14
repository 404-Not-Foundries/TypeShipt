// "Fill it together": who is helping with what, derived from pledges. Owner: mulimangila.
import type { AppState, Need, Pledge } from "@/lib/types";

/** names: distinct named helpers; people: distinct helpers (each anonymous pledge counts once); count: pledges. */
export type Helpers = { names: string[]; people: number; count: number };

const ANON = "A neighbor";
const shortName = (n: string) => (n.length > 24 ? `${n.slice(0, 23)}…` : n);

/** Needs at 80%+ pledged but not full: the "finish it together" moment. */
export const isLastFew = (n: Need) => n.qtyPledged < n.qtyNeeded && n.qtyPledged / n.qtyNeeded >= 0.8;

/** Per need: distinct helpers (newest first) and how many pledges came in. */
export function helpersByNeed(pledges: Pledge[]): Map<string, Helpers> {
  const out = new Map<string, Helpers>();
  for (const p of [...pledges].reverse()) {
    const h = out.get(p.needId) ?? { names: [], people: 0, count: 0 };
    h.count += 1;
    const name = shortName(p.donorName.trim());
    if (!name || name === ANON) h.people += 1;
    else if (!h.names.includes(name)) {
      h.names.push(name);
      h.people += 1;
    }
    out.set(p.needId, h);
  }
  return out;
}

/** "Maya, Jordan and 4 neighbors". Null when nobody has pledged yet. */
export function helpersLine(h: Helpers | undefined, shown = 2): string | null {
  if (!h || h.people === 0) return null;
  const names = h.names.slice(0, shown);
  const others = h.people - names.length;
  if (names.length === 0) return `${h.people} ${h.people === 1 ? "neighbor" : "neighbors"}`;
  if (others <= 0) return names.length === 2 ? `${names[0]} and ${names[1]}` : names[0];
  return `${names.join(", ")} and ${others} ${others === 1 ? "neighbor" : "neighbors"}`;
}

export type Activity = { id: string; who: string; qty: number; item: string; partner: string; at: number };

/** Newest pledges first, with display names resolved. */
export function recentActivity(state: AppState, limit = 6): Activity[] {
  return [...state.pledges]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      who: shortName(p.donorName.trim() || ANON),
      qty: p.qty,
      item: state.needs.find((n) => n.id === p.needId)?.title ?? "items",
      partner: state.partners.find((x) => x.id === p.partnerId)?.name ?? "a partner",
      at: Date.parse(p.createdAt),
    }));
}

export function timeAgo(at: number, now: number): string {
  const mins = Math.max(0, Math.round((now - at) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return `${h} hr ago`;
}
