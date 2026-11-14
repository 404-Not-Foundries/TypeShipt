import { formatUsd } from "@/lib/fees";
import type { AppState } from "@/lib/types";

export function ImpactStats({ state }: { state: AppState }) {
  const stats = [
    { label: "Items pledged", value: state.needs.reduce((sum, need) => sum + need.qtyPledged, 0).toLocaleString() },
    { label: "Items delivered", value: state.needs.reduce((sum, need) => sum + need.qtyReceived, 0).toLocaleString() },
    { label: "Partners helped", value: new Set(state.pledges.map((pledge) => pledge.partnerId)).size.toLocaleString() },
    { label: "Donors", value: new Set(state.pledges.map((pledge) => pledge.donorName)).size.toLocaleString() },
    { label: "Value of goods", value: formatUsd(state.pledges.reduce((sum, pledge) => sum + pledge.cost.items, 0)) },
  ];
  const routes = state.routes;
  const routed = new Set(routes.flatMap((route) => route.stops.flatMap((stop) => stop.pledgeIds)));
  const summary = state.routeSummary;
  return (
    <section aria-label="Community impact" className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-4 last:col-span-2 sm:last:col-span-1">
            <dt className="text-sm text-neutral-600">{stat.label}</dt>
            <dd className="mt-2 break-words text-3xl font-bold tracking-tight text-emerald-800 tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-neutral-600">Delivered items are confirmed received by a partner. Goods value excludes delivery and service fees.</p>
      {routes.length > 0 && (
        <div className="rounded-2xl bg-emerald-800 p-5 text-white">
          <h2 className="text-lg font-semibold">More giving, fewer trips</h2>
          <dl className="mt-3 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="text-sm text-emerald-100">Trips saved</dt>
              <dd className="text-3xl font-bold tabular-nums">{Math.max(0, routed.size - routes.length)}</dd>
            </div>
            {summary && (
              <>
                <div>
                  <dt className="text-sm text-emerald-100">Minutes saved</dt>
                  <dd className="text-3xl font-bold tabular-nums">{Math.max(0, summary.naiveMinutes - summary.minutes).toLocaleString(undefined, { maximumFractionDigits: 1 })}</dd>
                </div>
                <div>
                  <dt className="text-sm text-emerald-100">Miles saved</dt>
                  <dd className="text-3xl font-bold tabular-nums">{Math.max(0, summary.naiveMiles - summary.miles).toLocaleString(undefined, { maximumFractionDigits: 0 })}</dd>
                </div>
              </>
            )}
          </dl>
          <p className="mt-3 text-sm text-emerald-100">Compared with each donation driven as its own round trip, the way in-kind donations work today.</p>
        </div>
      )}
    </section>
  );
}
