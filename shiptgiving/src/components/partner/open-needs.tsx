import type { Need, Urgency } from "@/lib/types";
import { CARD, HEADING, PILL_EXPRESS, PILL_MUTED, PILL_URGENT } from "./styles";

const URGENCY_STYLES: Record<Urgency, string> = {
  normal: PILL_MUTED,
  high: "inline-flex items-center rounded-full border border-primary bg-white px-2.5 py-0.5 text-xs font-semibold text-primary",
  urgent: PILL_URGENT,
};

export function OpenNeeds({ needs }: { needs: Need[] }) {
  return (
    <section className={CARD} aria-labelledby="open-needs-heading">
      <h2 id="open-needs-heading" className={HEADING}>
        Your needs on the feed
      </h2>
      {needs.length === 0 ? (
        <p className="mt-2 text-sm text-secondary">Nothing posted yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {needs.map((n) => {
            const pledgedPct = Math.min(100, (n.qtyPledged / n.qtyNeeded) * 100);
            const receivedPct = Math.min(100, (n.qtyReceived / n.qtyNeeded) * 100);
            return (
              <li key={n.id} className="text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-primary">{n.title}</span>
                  <span className={URGENCY_STYLES[n.urgency]}>{n.urgency}</span>
                </div>
                {n.surgeReason && <p className={`mt-1 ${PILL_EXPRESS}`}>{n.surgeReason}</p>}
                <div
                  className="relative mt-2 h-2 overflow-hidden rounded-full bg-surface-muted"
                  role="img"
                  aria-label={`${n.qtyPledged} of ${n.qtyNeeded} pledged, ${n.qtyReceived} received`}
                >
                  <div className="absolute inset-y-0 left-0 bg-express" style={{ width: `${pledgedPct}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-[var(--accent-express-text)]" style={{ width: `${receivedPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-secondary">
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
