import { Suspense } from "react";
import { OrderTracking } from "@/components/shipt/order-tracking";

type Props = { params: Promise<{ id: string }> };

async function TrackingRoute({ params }: Props) {
  const { id } = await params;
  return <OrderTracking pledgeId={id} />;
}

export default function ShiptOrderPage({ params }: Props) {
  return (
    <Suspense fallback={<p role="status" className="text-secondary">Loading your order…</p>}>
      <TrackingRoute params={params} />
    </Suspense>
  );
}
