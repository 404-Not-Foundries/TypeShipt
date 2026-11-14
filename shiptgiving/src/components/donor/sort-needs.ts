import type { Need, Urgency } from "@/lib/types";
import { isLastFew } from "./community";

const RANK: Record<Urgency, number> = { urgent: 0, high: 1, normal: 2 };
const isOpen = (n: Need) => n.qtyPledged < n.qtyNeeded;

/** Open needs before filled ones, then urgent first, almost-filled ("last few") first, weather-surged first, then newest. */
export function sortNeeds(needs: Need[]): Need[] {
  return [...needs].sort(
    (a, b) =>
      Number(isOpen(b)) - Number(isOpen(a)) ||
      RANK[a.urgency] - RANK[b.urgency] ||
      Number(isLastFew(b)) - Number(isLastFew(a)) ||
      Number(!!b.surgeReason) - Number(!!a.surgeReason) ||
      b.createdAt.localeCompare(a.createdAt),
  );
}

export type SortMode = "urgent" | "closest" | "filled";

/** "urgent" is sortNeeds; the other modes re-rank open needs by distance or by how close they are to filled. */
export function sortNeedsBy(needs: Need[], mode: SortMode, miles: (n: Need) => number): Need[] {
  const base = sortNeeds(needs);
  if (mode === "urgent") return base;
  const key = mode === "closest" ? miles : (n: Need) => -n.qtyPledged / Math.max(1, n.qtyNeeded);
  // Array.sort is stable, so ties keep the urgency order.
  return base.sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || key(a) - key(b));
}
