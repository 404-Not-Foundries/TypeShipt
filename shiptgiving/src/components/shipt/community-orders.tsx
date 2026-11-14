import Link from "next/link";
import type { AppState } from "@/lib/types";

export function CommunityOrders({ state }: { state: AppState }) {
  const pledges = state.pledges.slice(-6).reverse();
  return (
    <section aria-labelledby="community-orders-title" className="rounded-2xl border border-hairline bg-totemeal p-5 sm:p-6">
      <h2 id="community-orders-title" className="text-2xl font-bold">Your community orders</h2>
      <p className="mt-2 text-sm text-secondary">Recent community pledges in this shared concept preview.</p>
      {pledges.length === 0 ? (
        <div className="mt-4">
          <p className="text-sm text-secondary">No community orders yet. Fill a need to follow its journey here.</p>
          <Link href="/" className="mt-3 inline-flex min-h-11 items-center rounded-full border border-primary bg-white px-5 text-sm font-semibold">Browse needs</Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-hairline">
          {pledges.map((pledge) => {
            const need = state.needs.find((entry) => entry.id === pledge.needId);
            const partner = state.partners.find((entry) => entry.id === pledge.partnerId);
            return (
              <li key={pledge.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold">{pledge.qty} × {need?.title ?? "Requested item"}</p>
                  <p className="mt-1 text-sm text-secondary">{pledge.donorName} for {partner?.name ?? "a community partner"}</p>
                  <p className="mt-1 text-xs text-secondary">{pledge.fulfillment === "shipt" ? "Shipt gift delivery" : pledge.fulfillment === "porch" ? "Porch pickup" : "Volunteer delivery"}</p>
                </div>
                <Link href={`/shipt/order/${encodeURIComponent(pledge.id)}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-primary bg-white px-5 text-sm font-semibold"
                  aria-label={`Track order for ${need?.title ?? "your pledge"} to ${partner?.name ?? "this partner"}`}>Track order</Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
