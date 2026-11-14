import Link from "next/link";
import type { Need, Partner } from "@/lib/types";

const initials = (name: string) =>
  name.replace(/^The /, "").split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("") ||
  name.charAt(0).toUpperCase();

/** "Shelters near you": Shipt store-tile pattern, one tile per partner with open needs. */
export function PartnerTiles({ partners, needs }: { partners: Partner[]; needs: Need[] }) {
  const rows = partners
    .map((p) => {
      const open = needs.filter((n) => n.partnerId === p.id && n.qtyPledged < n.qtyNeeded);
      return { p, open: open.length, urgent: open.some((n) => n.urgency === "urgent") };
    })
    .filter((r) => r.open > 0)
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.open - a.open);

  return (
    <ul aria-label="Shelters and nonprofits" className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
      {rows.map(({ p, open, urgent }) => (
        <li key={p.id} className="w-36 shrink-0">
          <Link href={`/p/${p.id}`} className="group block">
            <span className="flex aspect-square items-center justify-center rounded-2xl border border-hairline bg-totemeal text-2xl font-extrabold tracking-tight group-hover:border-primary">
              {initials(p.name)}
            </span>
            <span className="mt-2 block truncate text-sm font-semibold">{p.name}</span>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${urgent ? "bg-express text-express" : "text-secondary"}`}>
              {urgent ? "Needs help tonight" : `${open} open ${open === 1 ? "need" : "needs"}`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
