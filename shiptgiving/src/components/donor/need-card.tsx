// Product card for one need: photo, who it is for, progress, and one obvious action. Owner: mulimangila.
import Link from "next/link";
import { formatUsd } from "@/lib/fees";
import type { Need, Partner } from "@/lib/types";
import { CheckIcon } from "@/components/partner/verified-badge";
import { getVerification } from "@/components/partner/verification";
import { type Helpers, helpersLine, isLastFew } from "./community";
import { ItemPhoto } from "./item-photo";

type Props = {
  need: Need;
  partner?: Partner;
  category?: string;
  price?: number;
  helpers?: Helpers;
  onFill: (need: Need) => void;
  className?: string;
  /** Tile label for weather-surged needs, e.g. "Cold night" or "Heat alert". */
  surgeLabel?: string;
  /** Road miles to the drop-off, shown when the feed is sorted by distance. */
  miles?: number;
};

const PILL = "rounded-full px-2.5 py-1 text-xs font-semibold";

function TilePill({ need, surgeLabel }: { need: Need; surgeLabel: string }) {
  const remaining = need.qtyNeeded - need.qtyPledged;
  if (remaining <= 0) return <span className={`${PILL} bg-express text-express`}>Filled together</span>;
  if (isLastFew(need)) return <span className={`${PILL} bg-primary text-white`}>Only {remaining} left</span>;
  if (need.urgency === "urgent") return <span className={`${PILL} bg-sale text-white`}>{need.surgeReason ? surgeLabel : "Urgent"}</span>;
  if (need.urgency === "high") return <span className={`${PILL} bg-white text-primary`}>High need</span>;
  return null;
}

export function NeedCard({ need, partner, category, price, helpers, onFill, className = "", surgeLabel = "Weather alert", miles }: Props) {
  const remaining = Math.max(0, need.qtyNeeded - need.qtyPledged);
  const closed = remaining === 0;
  const pct = need.qtyNeeded > 0 ? Math.min(100, Math.round((need.qtyPledged / need.qtyNeeded) * 100)) : 0;
  const who = helpersLine(helpers);

  return (
    <li className={`flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white ${className}`}>
      {/* Pointer shortcut only; keyboard and screen-reader users get the Fill button below. */}
      <div className={`relative ${closed ? "" : "cursor-pointer"}`} onClick={closed ? undefined : () => onFill(need)}>
        <ItemPhoto itemId={need.itemId} category={category} alt="" className={`aspect-[4/3] w-full ${closed ? "opacity-60" : ""}`} />
        <span className="absolute left-2 top-2">
          <TilePill need={need} surgeLabel={surgeLabel} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-snug">{need.title}</h3>
        {partner && (
          <Link href={`/p/${partner.id}`} className="-my-1.5 flex min-h-11 items-center gap-1 text-[13px] text-secondary hover:text-primary hover:underline">
            <span className="truncate">{partner.name}</span>
            {getVerification(partner.id).verified && (
              <span className="shrink-0 text-express" title="Verified nonprofit (IRS records)">
                <CheckIcon />
                <span className="sr-only">, verified nonprofit</span>
              </span>
            )}
            {miles !== undefined && <span className="shrink-0">· {miles.toFixed(1)} mi</span>}
          </Link>
        )}
        <div className="mt-1" aria-label={`${need.qtyPledged} of ${need.qtyNeeded} pledged`}>
          <span className="block h-1.5 overflow-hidden rounded-full bg-hairline">
            <span className="block h-full rounded-full bg-[var(--accent-express-text)]" style={{ width: `${pct}%` }} />
          </span>
          <span className="mt-1 flex justify-between gap-2 text-xs">
            <span className="font-semibold">{closed ? "Fully pledged" : `${remaining} left`}</span>
            <span className="text-secondary tabular-nums">
              {need.qtyPledged} of {need.qtyNeeded}
            </span>
          </span>
        </div>
        <p className="mt-1 min-h-4 truncate text-xs text-secondary">{who ? `${who} ${closed ? "filled this" : "helping"}` : ""}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-sm">
            {price !== undefined && (
              <>
                <span className="font-bold tabular-nums">{formatUsd(price)}</span> <span className="text-secondary">each</span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => onFill(need)}
            disabled={closed}
            aria-label={closed ? `${need.title}: filled` : `Fill ${need.title}${partner ? ` for ${partner.name}` : ""}, ${remaining} left`}
            className="press min-h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-black disabled:bg-surface-muted disabled:text-secondary"
          >
            {closed ? "Filled" : "Fill"}
          </button>
        </div>
      </div>
    </li>
  );
}
