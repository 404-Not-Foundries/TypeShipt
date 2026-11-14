"use client";
// Owner: rmaytr. Route map and stop list come next (src/lib/routing).
import { useAppState } from "@/lib/use-app-state";

export default function DriverPage() {
  const { state } = useAppState();
  const open = state?.pledges.filter((p) => p.status !== "received" && p.fulfillment !== "volunteer") ?? [];
  return (
    <section>
      <h1 className="text-2xl font-bold">Driver route</h1>
      <p className="mt-2 text-neutral-600">{open.length} pledges waiting for a batched route.</p>
    </section>
  );
}
