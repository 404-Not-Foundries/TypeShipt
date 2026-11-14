import Link from "next/link";
import type { Need, Partner } from "@/lib/types";
import { ProgressMeter } from "./progress-meter";
import { UrgencyBadge } from "./urgency-badge";

const formatDeadline = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

type Props = { need: Need; partner?: Partner; category?: string; onFill: (need: Need) => void };

export function NeedCard({ need, partner, category, onFill }: Props) {
  const remaining = Math.max(0, need.qtyNeeded - need.qtyPledged);
  const closed = remaining === 0;
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{need.title}</h3>
          {partner && (
            <Link href={`/p/${partner.id}`} className="text-sm text-primary hover:underline">
              {partner.name}
            </Link>
          )}
          {category && <span className="text-sm text-secondary"> · {category}</span>}
        </div>
        <UrgencyBadge urgency={need.urgency} />
      </div>
      {need.surgeReason && <p className="rounded-xl bg-hero-sage px-3 py-2 text-sm font-medium text-primary">{need.surgeReason}</p>}
      <ProgressMeter pledged={need.qtyPledged} needed={need.qtyNeeded} received={need.qtyReceived} />
      {need.deadline && <p className="text-xs text-secondary">Needed by {formatDeadline(need.deadline)}</p>}
      <button
        type="button"
        disabled={closed}
        onClick={() => onFill(need)}
        className="mt-auto rounded-full bg-primary px-4 py-2.5 font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-hairline disabled:text-secondary"
      >
        {closed ? "Fully pledged — thank you!" : `Fill this need (${remaining} left)`}
      </button>
    </li>
  );
}
