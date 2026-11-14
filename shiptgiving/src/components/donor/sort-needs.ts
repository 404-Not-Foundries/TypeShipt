import type { Need, Urgency } from "@/lib/types";

const RANK: Record<Urgency, number> = { urgent: 0, high: 1, normal: 2 };
const isOpen = (n: Need) => n.qtyPledged < n.qtyNeeded;

/** Open needs before filled ones, then urgent first, weather-surged first, then newest. */
export function sortNeeds(needs: Need[]): Need[] {
  return [...needs].sort(
    (a, b) =>
      Number(isOpen(b)) - Number(isOpen(a)) ||
      RANK[a.urgency] - RANK[b.urgency] ||
      Number(!!b.surgeReason) - Number(!!a.surgeReason) ||
      b.createdAt.localeCompare(a.createdAt),
  );
}
