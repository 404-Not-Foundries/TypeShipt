import type { Urgency } from "@/lib/types";

const STYLE: Record<Urgency, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-amber-100 text-amber-800",
  normal: "bg-neutral-100 text-neutral-700",
};
const LABEL: Record<Urgency, string> = { urgent: "Urgent", high: "High", normal: "Open" };

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLE[urgency]}`}>{LABEL[urgency]}</span>;
}
