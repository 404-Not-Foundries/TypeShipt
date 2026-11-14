"use client";
// The id is read on the client (as /p/[id] does). Awaiting `params` in a server component here left
// the tracking view unhydrated on a hard load, so it sat on "Loading your order…" forever.
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { OrderTracking } from "@/components/shipt/order-tracking";

function TrackingRoute() {
  const { id } = useParams<{ id: string }>();
  return <OrderTracking pledgeId={id} />;
}

export default function ShiptOrderPage() {
  return (
    <Suspense fallback={<p role="status" className="text-secondary">Loading your order…</p>}>
      <TrackingRoute />
    </Suspense>
  );
}
