"use client";
import { useState } from "react";
import { sendJson } from "./format";
import { SizeBadge } from "./size-badge";
import { VEHICLES, type Driver, type VehicleType } from "@/lib/types";

type Props = {
  drivers: Driver[];
  openPledges: number;
  onChange: () => Promise<void>;
};

const TYPES = Object.keys(VEHICLES) as VehicleType[];

export function DriversPanel({ drivers, openPledges, onChange }: Props) {
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>("bus");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(key: string, task: () => Promise<unknown>): Promise<boolean> {
    setBusy(key);
    setError(null);
    try {
      await task();
      await onChange();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setBusy(null);
    }
  }

  function addDriver(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter the driver's name.");
    run("add", () => sendJson("/api/drivers", "POST", { name: trimmed, vehicle })).then((ok) => ok && setName(""));
  }

  const capacity = drivers.reduce((sum, d) => sum + d.capacity, 0);

  return (
    <section aria-labelledby="drivers-heading" className="rounded-2xl border border-black/10 bg-white p-4 text-neutral-900 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="drivers-heading" className="text-lg font-bold">
          Tomorrow&rsquo;s drivers
        </h2>
        <p className="text-sm text-neutral-600">
          {drivers.length} {drivers.length === 1 ? "vehicle" : "vehicles"}, room for {capacity} items
        </p>
      </div>

      {drivers.length === 0 ? (
        <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
          No drivers yet. Add who&rsquo;s driving tomorrow and we&rsquo;ll size a route to each vehicle.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-black/5">
          {drivers.map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-2">
              <SizeBadge size={d.size} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.name}</p>
                <p className="text-xs text-neutral-600">
                  {VEHICLES[d.vehicle]?.label ?? d.vehicle}, carries {d.capacity} items
                  {d.kind === "volunteer" ? ", volunteer" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => run(d.id, () => sendJson(`/api/drivers/${d.id}`, "DELETE"))}
                disabled={busy !== null}
                aria-label={`Remove ${d.name}`}
                className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addDriver} className="mt-4 space-y-3 border-t border-black/5 pt-4">
        <label className="block text-sm font-medium">
          Driver name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ms. Carter"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-emerald-700"
          />
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Vehicle</legend>
          <p className="text-xs text-neutral-600">Stands in for the VIN lookup: the vehicle sets the route size.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <label
                key={t}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-emerald-700 ${
                  vehicle === t ? "border-emerald-700 bg-emerald-50" : "border-black/10"
                }`}
              >
                <input
                  type="radio"
                  name="vehicle"
                  value={t}
                  checked={vehicle === t}
                  onChange={() => setVehicle(t)}
                  className="sr-only"
                />
                <SizeBadge size={VEHICLES[t].size} />
                <span>
                  {VEHICLES[t].label}
                  <span className="block text-xs text-neutral-600">{VEHICLES[t].capacity} items</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={busy !== null}
          className="w-full rounded-lg border border-emerald-700 px-3 py-2 font-medium text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50"
        >
          {busy === "add" ? "Adding…" : "Add driver"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => run("plan", () => sendJson("/api/route-plan", "POST", {}))}
        disabled={busy !== null || drivers.length === 0 || openPledges === 0}
        className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-4 text-lg font-bold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {busy === "plan" ? "Generating routes…" : "Generate routes"}
      </button>
      {drivers.length > 0 && openPledges === 0 && (
        <p className="mt-2 text-center text-xs text-neutral-600">No open pledges to route.</p>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
