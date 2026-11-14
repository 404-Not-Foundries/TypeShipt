"use client";
// Placeholder from the scaffold. Owner: mulimangila (donor feed) — replace freely.
import { useAppState } from "@/lib/use-app-state";

export default function GivePage() {
  const { state, error } = useAppState();
  if (error) return <p role="alert">{error}</p>;
  if (!state) return <p>Loading needs…</p>;
  return (
    <section>
      <h1 className="text-2xl font-bold">What Birmingham needs today</h1>
      <ul className="mt-4 space-y-2">
        {state.needs.map((n) => (
          <li key={n.id} className="rounded-lg border border-black/10 bg-white p-3">
            <span className="font-medium">{n.title}</span> · {state.partners.find((p) => p.id === n.partnerId)?.name} ·{" "}
            {n.qtyPledged}/{n.qtyNeeded} pledged
          </li>
        ))}
      </ul>
    </section>
  );
}
