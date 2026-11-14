// Shipt-style product card for one need. Owner: mulimangila.
import Link from "next/link";
import { formatUsd } from "@/lib/fees";
import type { Need, Partner } from "@/lib/types";
import { CheckIcon } from "@/components/partner/verified-badge";
import { getVerification } from "@/components/partner/verification";
import { CategoryArt } from "./category-art";
import { type Helpers, helpersLine, isLastFew } from "./community";

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
};

function TilePill({ need, surgeLabel }: { need: Need; surgeLabel: string }) {
  const remaining = need.qtyNeeded - need.qtyPledged;
  if (remaining <= 0) return <span className="rounded-full bg-express px-2.5 py-1 text-xs font-semibold text-express">Filled together</span>;
  if (isLastFew(need)) return <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">Only {remaining} left</span>;
  if (need.urgency === "urgent") return <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">{need.surgeReason ? surgeLabel : "Urgent"}</span>;
  if (need.urgency === "high") return <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary">High need</span>;
  return null;
}

export function NeedCard({ need, partner, category, price, helpers, onFill, className = "", surgeLabel = "Weather alert" }: Props) {
  const remaining = Math.max(0, need.qtyNeeded - need.qtyPledged);
  const closed = remaining === 0;
  const pct = need.qtyNeeded > 0 ? Math.min(100, Math.round((need.qtyPledged / need.qtyNeeded) * 100)) : 0;
  const who = helpersLine(helpers);

  return (
    <li className={`flex flex-col ${className}`}>
      <button
        type="button"
        onClick={() => onFill(need)}
        disabled={closed}
        aria-label={closed ? `${need.title}: filled` : `Fill ${need.title} for ${partner?.name ?? "this partner"}, ${remaining} left`}
        className="group relative block overflow-hidden rounded-2xl text-left disabled:cursor-default"
      >
        <CategoryArt category={category} className="aspect-[4/3] w-full transition-transform group-enabled:group-hover:scale-[1.03]" />
        <span className="absolute left-2.5 top-2.5">
          <TilePill need={need} surgeLabel={surgeLabel} />
        </span>
        {!closed && (
          <span className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-white text-2xl leading-none shadow-float group-hover:bg-primary group-hover:text-white">
            +
          </span>
        )}
      </button>
      <div className="mt-2 space-y-1 px-0.5">
        {price !== undefined && <p className="font-bold">about {formatUsd(price)} each</p>}
        <h3 className="line-clamp-2 text-[15px] leading-snug">{need.title}</h3>
        {partner && (
          <Link href={`/p/${partner.id}`} className="-my-3 flex min-h-11 items-center gap-1 text-[13px] text-secondary hover:text-primary hover:underline">
            <span className="truncate">{partner.name}</span>
            {getVerification(partner.id).verified && (
              <span className="shrink-0 text-express" title="Verified nonprofit (IRS records)">
                <CheckIcon />
                <span className="sr-only">, verified nonprofit</span>
              </span>
            )}
          </Link>
        )}
        <div className="flex items-center gap-2 pt-0.5" aria-label={`${need.qtyPledged} of ${need.qtyNeeded} pledged`}>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-hairline">
            <span className="block h-full rounded-full bg-[var(--accent-express-text)]" style={{ width: `${pct}%` }} />
          </span>
          <span className="shrink-0 text-xs text-secondary">
            {need.qtyPledged}/{need.qtyNeeded}
          </span>
        </div>
        {who && <p className="truncate text-xs text-secondary">{who} {closed ? "filled this" : "helping"}</p>}
      </div>
    </li>
  );
}
