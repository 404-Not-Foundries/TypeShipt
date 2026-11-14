// Cache Components: the route id is read in a client leaf (useParams), as on /p/[id], so this page never
// streams a pending Suspense boundary. React reveals those with requestAnimationFrame, which does not fire
// in a background tab, so a direct load there stayed on the fallback.
import { Suspense } from "react";
import { OrderTracking } from "@/components/shipt/order-tracking";

export default function ShiptOrderPage() {
  return (
    <Suspense fallback={<p role="status" className="text-secondary">Loading your order…</p>}>
      <OrderTracking />
    </Suspense>
  );
}
