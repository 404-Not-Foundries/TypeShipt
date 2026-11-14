import type { Need, Urgency } from "@/lib/types";

const URGENCY_STYLES: Record<Urgency, string> = {
  normal: "bg-neutral-100 text-neutral-700",
  high: "bg-amber-100 text-amber-900",
  urgent: "bg-red-100 text-red-800",
};

export function OpenNeeds({ needs }: { needs: Need[] }) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-4" aria-labelledby="open-needs-heading">
      <h2 id="open-needs-heading" className="text-lg font-semibold text-neutral-900">
        Your needs on the feed
      </h2>
      {needs.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">Nothing posted yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {needs.map((n) => {
            const pledgedPct = Math.min(100, (n.qtyPledged / n.qtyNeeded) * 100);
            const receivedPct = Math.min(100, (n.qtyReceived / n.qtyNeeded) * 100);
            return (
              <li key={n.id} className="text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-neutral-900">{n.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${URGENCY_STYLES[n.urgency]}`}>{n.urgency}</span>
                </div>
                {n.surgeReason && <p className="text-xs text-orange-800">{n.surgeReason}</p>}
                <div
                  className="relative mt-1 h-2 overflow-hidden rounded-full bg-neutral-200"
                  role="img"
                  aria-label={`${n.qtyPledged} of ${n.qtyNeeded} pledged, ${n.qtyReceived} received`}
                >
                  <div className="absolute inset-y-0 left-0 bg-emerald-300" style={{ width: `${pledgedPct}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-emerald-700" style={{ width: `${receivedPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-neutral-600">
                  {n.qtyPledged} of {n.qtyNeeded} pledged · {n.qtyReceived} received
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
