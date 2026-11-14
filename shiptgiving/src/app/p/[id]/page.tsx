// Partner profile for donors. Owner: mulimangila.
// Cache Components: the route id is read in a client leaf, so it sits inside <Suspense>.
import { Suspense } from "react";
import { FeedSkeleton } from "@/components/donor/feed-skeleton";
import { PartnerView } from "@/components/donor/partner-view";

export default function PartnerPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <PartnerView />
    </Suspense>
  );
}
