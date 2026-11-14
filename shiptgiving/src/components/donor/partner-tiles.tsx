import Link from "next/link";
import { VerifiedBadge } from "@/components/partner/verified-badge";
import type { Need, Partner } from "@/lib/types";

const initials = (name: string) =>
  name.replace(/^The /, "").split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("") ||
  name.charAt(0).toUpperCase();

/** Nonprofits with open needs, most urgent first. Each row opens the partner page. */
export function PartnerTiles({ partners, needs }: { partners: Partner[]; needs: Need[] }) {
  const rows = partners
    .map((p) => {
      const open = needs.filter((n) => n.partnerId === p.id && n.qtyPledged < n.qtyNeeded);
      return { p, open: open.length, urgent: open.some((n) => n.urgency === "urgent") };
    })
    .filter((r) => r.open > 0)
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.open - a.open);

  // One compact row per nonprofit: a single scrolling line on phones, a grid from 640px up.
  return (
    <ul aria-label="Shelters and nonprofits" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
      {rows.map(({ p, open, urgent }) => (
        <li key={p.id} className="w-72 shrink-0 sm:w-auto">
          <Link href={`/p/${p.id}`} className="flex h-full min-h-16 items-center gap-3 rounded-2xl border border-hairline bg-white p-3 hover:border-primary">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-totemeal text-sm font-extrabold tracking-tight" aria-hidden>
              {initials(p.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{p.name}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-secondary">
                {open} open {open === 1 ? "need" : "needs"}
                <VerifiedBadge partnerId={p.id} />
              </span>
            </span>
            {urgent && <span className="shrink-0 rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">Tonight</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
