import type { AppState } from "@/lib/types";

export function PartnerProgress({ state }: { state: AppState }) {
  return (
    <section aria-labelledby="partner-progress-title" className="rounded-2xl border border-hairline bg-white p-4 sm:p-6">
      <h2 id="partner-progress-title" className="text-xl font-bold">Progress across Birmingham</h2>
      <ul aria-label="Progress legend" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-secondary">
        <li className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-(--accent-express-text)" />Received</li>
        <li className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-(--accent-express-text)/40" />Pledged, awaiting receipt</li>
        <li className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm bg-surface-muted ring-1 ring-hairline" />Still needed</li>
      </ul>
      {state.partners.length === 0 ? (
        <p className="mt-6 text-secondary">No partners yet. Partner progress will appear here when needs are posted.</p>
      ) : (
        <ul className="mt-5 divide-y divide-hairline">
          {state.partners.map((partner) => {
            const needs = state.needs.filter((need) => need.partnerId === partner.id);
            const needed = needs.reduce((sum, need) => sum + need.qtyNeeded, 0);
            const pledged = needs.reduce((sum, need) => sum + need.qtyPledged, 0);
            const received = needs.reduce((sum, need) => sum + need.qtyReceived, 0);
            const receivedPercent = needed > 0 ? Math.min(100, received / needed * 100) : 0;
            const pendingPercent = needed > 0 ? Math.max(0, Math.min(100, pledged / needed * 100) - receivedPercent) : 0;
            return (
              <li key={partner.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold">{partner.name}</h3>
                  <p className="text-sm text-secondary tabular-nums">{received} received / {pledged} pledged / {needed} needed</p>
                </div>
                {needed > 0 ? (
                  <div role="img" aria-label={`${partner.name}: ${received} received, ${pledged} pledged in total, ${needed} needed.`}
                    className="mt-2 flex h-3 overflow-hidden rounded-full bg-surface-muted">
                    <span className="h-full bg-(--accent-express-text)" style={{ width: `${receivedPercent}%` }} />
                    <span className="h-full bg-(--accent-express-text)/40" style={{ width: `${pendingPercent}%` }} />
                  </div>
                ) : <p className="mt-2 text-sm text-secondary">No needs posted yet.</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
