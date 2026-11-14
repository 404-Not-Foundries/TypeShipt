"use client";
import type { AppState, Partner } from "@/lib/types";
import { recentActivity, timeAgo } from "./community";
import { useNow } from "./use-now";

/** "Neighbors who showed up": recent helpers for one partner, as a thank-you wall. */
export function NeighborWall({ state, partner }: { state: AppState; partner: Partner }) {
  const now = useNow();
  const scoped = { ...state, pledges: state.pledges.filter((p) => p.partnerId === partner.id) };
  const items = recentActivity(scoped, 12);
  if (items.length === 0) {
    return (
      <section className="rounded-2xl bg-totemeal p-4 text-sm">
        <h2 className="font-semibold">Neighbors who showed up</h2>
        <p className="mt-1 text-secondary">Be the first neighbor to help {partner.name} today.</p>
      </section>
    );
  }
  const itemsTotal = scoped.pledges.reduce((s, p) => s + p.qty, 0);
  return (
    <section aria-labelledby="wall-title" className="rounded-2xl bg-totemeal p-4">
      <h2 id="wall-title" className="font-semibold">Neighbors who showed up</h2>
      <p className="text-sm text-secondary">
        {scoped.pledges.length} {scoped.pledges.length === 1 ? "pledge" : "pledges"} · {itemsTotal} items from the community
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((a) => (
          <li key={a.id} className="rounded-full border border-hairline bg-white px-3 py-1.5 text-sm">
            <span className="font-semibold">Thank you, {a.who}!</span>{" "}
            <span className="text-secondary">{a.qty} × {a.item} · {timeAgo(a.at, now)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
