"use client";
// Owner: rmaytr. Tomorrow's drivers, the generated routes, and the map.
import Link from "next/link";
import { DriversPanel } from "@/components/driver/drivers-panel";
import { routeColor } from "@/components/driver/format";
import { RouteCard } from "@/components/driver/route-card";
import { RouteMap } from "@/components/driver/route-map-loader";
import { RouteSummaryBanner } from "@/components/driver/route-summary";
import { useAppState } from "@/lib/use-app-state";

export default function DriverPage() {
  const { state, error, refresh } = useAppState();
  const drivers = state?.drivers ?? [];
  const routes = state?.routes ?? [];
  const unrouted = state?.unrouted.length ?? 0;
  const pledges = state?.pledges ?? [];
  // Same rule as routablePledgeIds in @/lib/routing: volunteers drive their own pledges.
  const open = pledges.filter(
    (p) => p.fulfillment !== "volunteer" && (p.status === "pledged" || p.status === "batched"),
  ).length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Tomorrow&rsquo;s routes</h1>
        <p className="mt-1 max-w-prose opacity-70">
          Tell us who&rsquo;s driving and what they drive. Each vehicle gets one route sized to what it can carry.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {state && pledges.length === 0 && (
        <p className="rounded-lg border border-dashed border-black/20 bg-white p-4 text-sm text-neutral-900">
          No pledges yet. Load demo pledges from{" "}
          <Link href="/impact" className="font-medium text-emerald-800 underline">
            Impact
          </Link>
          , or pledge an item on the Give page.
        </p>
      )}

      {state?.routeSummary && routes.length > 0 && <RouteSummaryBanner summary={state.routeSummary} />}

      {unrouted > 0 && (
        <p role="status" className="rounded-lg bg-amber-100 p-3 text-sm font-medium text-amber-900">
          {unrouted} {unrouted === 1 ? "pledge doesn't" : "pledges don't"} fit tomorrow&rsquo;s vehicles. Add a driver
          or a bigger vehicle, then generate routes again.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <DriversPanel drivers={drivers} openPledges={open} onChange={refresh} />
        <section
          aria-label="Route map"
          className="relative isolate h-[22rem] overflow-hidden rounded-2xl border border-black/10 bg-white text-neutral-900 lg:h-auto lg:min-h-[32rem]"
        >
          <div className="absolute inset-0">
            <RouteMap routes={routes} />
          </div>
        </section>
      </div>

      {routes.length > 0 ? (
        <section aria-labelledby="routes-heading">
          <h2 id="routes-heading" className="text-lg font-bold">
            Routes
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((r, i) => (
              <RouteCard key={r.driverId} route={r} color={routeColor(i)} pledges={pledges} onChange={refresh} />
            ))}
          </div>
        </section>
      ) : (
        state && (
          <p className="text-sm opacity-70">
            No routes yet. Add tomorrow&rsquo;s drivers, then choose Generate routes.
          </p>
        )
      )}
    </div>
  );
}
