"use client";
import { useState } from "react";
import type { Pledge, PledgeStatus, RoutePlan } from "@/lib/types";
import { formatEta, formatMinutes, isLate, numberStops, sendJson } from "./format";
import { SizeBadge } from "./size-badge";

type Props = {
  route: RoutePlan;
  color: string;
  pledges: Pledge[];
  onChange: () => Promise<void>;
};

const ORDER: PledgeStatus[] = ["pledged", "batched", "picked_up", "delivered", "received"];
const before = (s: PledgeStatus, target: PledgeStatus) => ORDER.indexOf(s) < ORDER.indexOf(target);

export function RouteCard({ route, color, pledges, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ids = [...new Set(route.stops.flatMap((s) => s.pledgeIds))];
  const mine = pledges.filter((p) => ids.includes(p.id));
  const nums = numberStops(route.stops);
  const pct = route.capacity ? Math.min(100, Math.round((route.load / route.capacity) * 100)) : 0;
  const canPickUp = mine.some((p) => before(p.status, "picked_up"));
  const canDeliver = mine.some((p) => before(p.status, "delivered"));

  async function mark(status: PledgeStatus) {
    setBusy(true);
    setError(null);
    try {
      // Only move pledges forward; never undo a partner's "received".
      const targets = mine.filter((p) => before(p.status, status));
      await Promise.all(targets.map((p) => sendJson(`/api/pledges/${p.id}`, "PATCH", { status })));
      await onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the pledges");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      aria-labelledby={`route-${route.driverId}`}
      className="overflow-hidden rounded-2xl border border-hairline bg-white"
      style={{ borderTop: `6px solid ${color}` }}
    >
      <header className="flex items-center gap-3 p-4 pb-2">
        <SizeBadge size={route.size} />
        <div className="min-w-0 flex-1">
          <h3 id={`route-${route.driverId}`} className="truncate font-bold">
            {route.driverName}
          </h3>
          <p className="text-xs text-secondary">
            {route.stops.filter((s) => s.kind !== "start").length} stops, {formatMinutes(route.minutes)},{" "}
            {route.miles.toFixed(1)} mi
            {route.lateStops > 0 && <span className="font-semibold text-sale">, {route.lateStops} late</span>}
          </p>
        </div>
      </header>

      <div className="px-4">
        <div className="flex justify-between text-xs text-secondary">
          <span>Load</span>
          <span>
            {route.load} of {route.capacity} items
          </span>
        </div>
        <div
          role="meter"
          aria-label={`Load for ${route.driverName}`}
          aria-valuemin={0}
          aria-valuemax={route.capacity}
          aria-valuenow={route.load}
          className="mt-1 h-2 overflow-hidden rounded-full bg-surface-muted"
        >
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>

      <ol className="mt-3 divide-y divide-hairline border-t border-hairline">
        {route.stops.map((s, i) => (
          <li key={s.id} className="flex gap-3 px-4 py-2.5">
            <span
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center text-xs font-bold text-white"
              style={{ background: color, borderRadius: s.kind === "start" ? 6 : 999 }}
              aria-hidden
            >
              {s.kind === "start" ? "S" : nums[i]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                <span className="sr-only">{s.kind === "start" ? "Start" : `Stop ${nums[i]}`}: </span>
                <span aria-hidden>{s.kind === "pickup" ? "⬆ " : s.kind === "dropoff" ? "⬇ " : ""}</span>
                {s.kind === "pickup" ? "Pick up at " : s.kind === "dropoff" ? "Drop off at " : ""}
                {s.label}
              </p>
              <p className="mt-0.5 text-xs text-secondary">
                {[
                  s.window && `Receiving ${s.window.open}–${s.window.close}`,
                  s.pledgeIds.length > 0 && `${s.pledgeIds.length} ${s.pledgeIds.length === 1 ? "pledge" : "pledges"}`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            {s.eta && (
              <span
                className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
                  isLate(s) ? "bg-sale text-white" : "bg-express text-express"
                }`}
              >
                {isLate(s) ? "Late, " : ""}
                {formatEta(s.eta)}
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-2 gap-2 border-t border-hairline p-4">
        <button
          type="button"
          onClick={() => mark("picked_up")}
          disabled={busy || !canPickUp}
          className="min-h-11 rounded-full border border-primary bg-white px-4 text-sm font-semibold text-primary hover:bg-surface-muted disabled:opacity-40"
        >
          {canPickUp ? "Mark picked up" : "Picked up"}
        </button>
        <button
          type="button"
          onClick={() => mark("delivered")}
          disabled={busy || !canDeliver}
          className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-40"
        >
          {canDeliver ? "Mark delivered" : "Delivered"}
        </button>
        {error && (
          <p role="alert" className="col-span-2 text-sm font-semibold">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
