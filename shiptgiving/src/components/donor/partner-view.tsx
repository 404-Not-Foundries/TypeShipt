"use client";
// Partner profile body (reads the route id). Owner: mulimangila.
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FeedSkeleton } from "@/components/donor/feed-skeleton";
import { FillSheet } from "@/components/donor/fill-sheet";
import { helpersByNeed } from "@/components/donor/community";
import { FilledCelebration } from "@/components/donor/filled-celebration";
import { NeedCard } from "@/components/donor/need-card";
import { NeighborWall } from "@/components/donor/neighbor-wall";
import { PartnerFacts } from "@/components/donor/partner-facts";
import { useMyPledgeIds } from "@/components/donor/pledge-history";
import { sortNeeds } from "@/components/donor/sort-needs";
import { useAppState } from "@/lib/use-app-state";

export function PartnerView() {
  const { id } = useParams<{ id: string }>();
  const { state, error, refresh } = useAppState();
  const [fillingId, setFillingId] = useState<string | null>(null);
  const [, addMyId] = useMyPledgeIds();

  if (!state) return error ? <p role="alert" className="text-sale">{error}</p> : <FeedSkeleton />;
  const partner = state.partners.find((p) => p.id === id);
  if (!partner) {
    return (
      <div className="space-y-3 text-primary">
        <h1 className="text-2xl font-bold">Partner not found</h1>
        <Link href="/give" className="text-primary underline">Back to all needs</Link>
      </div>
    );
  }

  const needs = state.needs.filter((n) => n.partnerId === partner.id);
  const open = sortNeeds(needs.filter((n) => n.qtyPledged < n.qtyNeeded));
  const categoryOf = new Map(state.catalog.map((c) => [c.id, c.category]));
  const helpers = helpersByNeed(state.pledges);
  const filling = state.needs.find((n) => n.id === fillingId);

  return (
    <article className="space-y-6 text-primary">
      <Link href="/give" className="inline-flex min-h-11 items-center text-sm text-primary hover:underline">← All needs</Link>
      <PartnerFacts partner={partner} needs={needs} />
      <NeighborWall state={state} partner={partner} />
      <section aria-labelledby="open-needs" className="space-y-3">
        <h2 id="open-needs" className="text-lg font-semibold">Open needs ({open.length})</h2>
        {open.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hairline p-8 text-center text-secondary">Every need here is fully pledged. Thank you, Birmingham!</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {open.map((n) => (
              <NeedCard key={n.id} need={n} category={categoryOf.get(n.itemId)} price={state.catalog.find((c) => c.id === n.itemId)?.price} surgeLabel={state.weather.lowF < 40 ? "Cold night" : "Heat alert"} helpers={helpers.get(n.id)} onFill={(need) => setFillingId(need.id)} />
            ))}
          </ul>
        )}
      </section>
      <FilledCelebration state={state} />
      {filling && (
        <FillSheet
          need={filling}
          state={state}
          onClose={() => setFillingId(null)}
          onPledged={(p) => {
            addMyId(p.id);
            refresh();
          }}
        />
      )}
    </article>
  );
}
