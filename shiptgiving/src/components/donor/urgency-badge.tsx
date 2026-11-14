import type { Urgency } from "@/lib/types";

const STYLE: Record<Urgency, string> = {
  urgent: "bg-sale text-white",
  high: "bg-primary text-white",
  normal: "border border-hairline bg-white text-secondary",
};
const LABEL: Record<Urgency, string> = { urgent: "Urgent", high: "High", normal: "Open" };

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLE[urgency]}`}>{LABEL[urgency]}</span>;
}
