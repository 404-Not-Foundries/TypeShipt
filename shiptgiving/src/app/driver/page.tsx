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
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tomorrow&rsquo;s routes</h1>
        <p className="mt-1 max-w-prose text-secondary">
          Tell us who&rsquo;s driving and what they drive. Each vehicle gets one route sized to what it can carry.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl bg-surface-muted p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {state && pledges.length === 0 && (
        <p className="rounded-2xl bg-totemeal p-4 text-sm">
          No pledges yet. Load demo pledges from{" "}
          <Link href="/impact" className="font-semibold underline">
            Impact
          </Link>
          , or pledge an item on the Give page.
        </p>
      )}

      {state?.routeSummary && routes.length > 0 && <RouteSummaryBanner summary={state.routeSummary} />}

      {unrouted > 0 && (
        <p role="status" className="rounded-xl bg-totemeal p-3 text-sm font-semibold">
          {unrouted} {unrouted === 1 ? "pledge doesn't" : "pledges don't"} fit tomorrow&rsquo;s vehicles. Add a driver
          or a bigger vehicle, then generate routes again.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        {state ? (
          <DriversPanel drivers={drivers} openPledges={open} onChange={refresh} />
        ) : (
          <p role="status" className="rounded-2xl border border-hairline bg-surface-muted p-5 text-secondary">
            Loading tomorrow&rsquo;s drivers…
          </p>
        )}
        <section
          aria-label="Route map"
          className="relative isolate order-first h-[20rem] overflow-hidden rounded-2xl border border-hairline bg-surface-muted lg:order-none lg:h-auto lg:min-h-[32rem]"
        >
          <div className="absolute inset-0">
            <RouteMap routes={routes} />
          </div>
        </section>
      </div>

      {routes.length > 0 ? (
        <section aria-labelledby="routes-heading">
          <h2 id="routes-heading" className="text-2xl font-bold">
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
          <p className="text-sm text-secondary">
            No routes yet. Add tomorrow&rsquo;s drivers, then choose Generate routes.
          </p>
        )
      )}
    </div>
  );
}
