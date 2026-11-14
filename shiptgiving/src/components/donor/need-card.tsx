import Link from "next/link";
import type { Need, Partner } from "@/lib/types";
import { type Helpers, helpersLine, isLastFew } from "./community";
import { ProgressMeter } from "./progress-meter";
import { UrgencyBadge } from "./urgency-badge";

const formatDeadline = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

type Props = { need: Need; partner?: Partner; category?: string; helpers?: Helpers; onFill: (need: Need) => void };

export function NeedCard({ need, partner, category, helpers, onFill }: Props) {
  const remaining = Math.max(0, need.qtyNeeded - need.qtyPledged);
  const closed = remaining === 0;
  const lastFew = isLastFew(need);
  const who = helpersLine(helpers);
  const label = closed ? "Filled together — thank you!" : who ? `Join them (${remaining} left)` : `Fill this need (${remaining} left)`;
  return (
    <li className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 ${lastFew ? "border-2 border-primary" : "border-hairline"}`}>
      {lastFew && (
        <p className="-mx-4 -mt-4 rounded-t-2xl bg-primary px-4 py-2 text-sm font-semibold text-white">
          Only {remaining} left. Finish it together 🤝
        </p>
      )}
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
      {who && (
        <p className="flex items-center gap-2 text-sm">
          <span aria-hidden className="flex -space-x-1.5">
            {(helpers?.names.length ? helpers.names : ["?"]).slice(0, 3).map((n) => (
              <span key={n} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-totemeal text-[11px] font-bold">
                {n[0]?.toUpperCase()}
              </span>
            ))}
          </span>
          <span>
            <strong className="font-semibold">{who}</strong> {closed ? "filled this together" : (helpers?.people ?? 0) === 1 ? "is filling this" : "are filling this"}
          </span>
        </p>
      )}
      {need.deadline && <p className="text-xs text-secondary">Needed by {formatDeadline(need.deadline)}</p>}
      <button
        type="button"
        disabled={closed}
        onClick={() => onFill(need)}
        className="mt-auto rounded-full bg-primary px-4 py-2.5 font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-hairline disabled:text-secondary"
      >
        {label}
      </button>
    </li>
  );
}
