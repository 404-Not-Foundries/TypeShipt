"use client";

import { useRef, useState } from "react";

type Action = "seed" | "cold-night" | "reset";

export function DemoControls({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [pending, setPending] = useState<Action | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  async function run(action: Action) {
    if (inFlight.current) return;
    if (action === "reset" && !window.confirm("Reset all pledges, deliveries, and routes to the starting demo state? This affects every open view.")) return;
    inFlight.current = true;
    setPending(action);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const detail = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error : "Could not update the demo. Try again.";
        throw new Error(detail);
      }
      await onRefresh();
      const created = typeof result === "object" && result !== null && "created" in result && typeof result.created === "number" ? result.created : 0;
      setMessage(action === "reset" ? "Demo reset to the starting state."
        : action === "cold-night" ? `Cold night loaded: weather surge on, ${created} pledges in. Generate routes on the Driver page.`
        : created === 0 ? "All needs are already pledged. Reset the demo to start again."
          : `Loaded ${created} demo pledges.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reach the server. Try again.");
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  const buttonClass = "min-h-11 rounded-xl px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60";
  return (
    <section aria-label="Demo controls" className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">Explore a giving day</h2>
          <p className="mt-1 text-sm text-neutral-600">The app opens on a cold night: a simulated weather surge and a night of pledges for tomorrow&apos;s drivers. Add more sample pledges, or reset every view to that starting state.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" disabled={pending !== null} onClick={() => run("seed")}
            className={`${buttonClass} bg-emerald-700 text-white hover:bg-emerald-800`}>
            {pending === "seed" ? "Loading pledges…" : "Load demo pledges"}
          </button>
          <button type="button" disabled={pending !== null} onClick={() => run("cold-night")}
            className={`${buttonClass} bg-sky-800 text-white hover:bg-sky-900`}>
            {pending === "cold-night" ? "Loading cold night…" : "Cold night demo"}
          </button>
          <button type="button" disabled={pending !== null} onClick={() => run("reset")}
            className={`${buttonClass} border border-neutral-300 text-neutral-700 hover:bg-neutral-100`}>
            {pending === "reset" ? "Resetting…" : "Reset demo"}
          </button>
        </div>
      </div>
      <p role="status" className="mt-2 text-sm text-emerald-800">{message}</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </section>
  );
}
