import type { AppState, Fulfillment, PledgeStatus } from "@/lib/types";

const FULFILLMENT: Record<Fulfillment, string> = {
  shipt: "Shipt delivers", porch: "Porch pickup", volunteer: "I'll drive it",
};
const STATUS: Record<PledgeStatus, string> = {
  pledged: "Pledged", batched: "Batched", picked_up: "Picked up", delivered: "Delivered", received: "Received",
};

export function RecentActivity({ state }: { state: AppState }) {
  const recent = state.pledges.slice(-8).reverse();
  return (
    <section aria-labelledby="recent-activity-title" className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
      <h2 id="recent-activity-title" className="text-xl font-bold">Recent activity</h2>
      {recent.length === 0 ? (
        <p className="mt-4 text-neutral-600">No pledges yet. Fill a need or load demo pledges to see neighbors giving.</p>
      ) : (
        <ol className="mt-4 divide-y divide-neutral-100">
          {recent.map((pledge) => {
            const need = state.needs.find((entry) => entry.id === pledge.needId);
            const partner = state.partners.find((entry) => entry.id === pledge.partnerId);
            return (
              <li key={pledge.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{pledge.donorName}</p>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">{STATUS[pledge.status]}</span>
                </div>
                <p className="mt-1 text-sm">{pledge.qty} × {need?.title ?? "Requested item"}</p>
                <p className="mt-1 text-sm text-neutral-600">{partner?.name ?? "Community partner"}</p>
                <p className="mt-1 text-xs text-neutral-600">{FULFILLMENT[pledge.fulfillment]}</p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
