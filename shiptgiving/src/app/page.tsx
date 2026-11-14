"use client";
// Donor needs feed. Owner: mulimangila.
import { useEffect, useMemo, useState } from "react";
import { FeedSkeleton } from "@/components/donor/feed-skeleton";
import { FillSheet } from "@/components/donor/fill-sheet";
import { FilterChips } from "@/components/donor/filter-chips";
import { MyPledges } from "@/components/donor/my-pledges";
import { NeedCard } from "@/components/donor/need-card";
import { useMyPledgeIds } from "@/components/donor/pledge-history";
import { sortNeeds } from "@/components/donor/sort-needs";
import { WeatherBanner } from "@/components/donor/weather-banner";
import { useAppState } from "@/lib/use-app-state";

export default function GivePage() {
  const { state, error, refresh } = useAppState();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [fillingId, setFillingId] = useState<string | null>(null);
  const [myIds, addMyId] = useMyPledgeIds();

  // Check the NWS forecast once on load so the Weather Surge shows even before the partner portal is opened.
  useEffect(() => {
    fetch("/api/weather", { cache: "no-store" })
      .then(() => refresh())
      .catch(() => {});
  }, [refresh]);

  const categoryOf = useMemo(() => new Map(state?.catalog.map((c) => [c.id, c.category]) ?? []), [state?.catalog]);
  const visible = useMemo(() => {
    if (!state) return [];
    return sortNeeds(
      state.needs.filter((n) => (!partnerId || n.partnerId === partnerId) && (!category || categoryOf.get(n.itemId) === category)),
    );
  }, [state, partnerId, category, categoryOf]);

  if (!state) return error ? <p role="alert" className="text-red-700">{error}</p> : <FeedSkeleton />;

  const partnersWithNeeds = state.partners.filter((p) => state.needs.some((n) => n.partnerId === p.id));
  const categories = [...new Set(state.needs.map((n) => categoryOf.get(n.itemId)).filter((c): c is string => !!c))].sort();
  const filling = state.needs.find((n) => n.id === fillingId);

  return (
    <section className="space-y-5 text-neutral-900">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">What Birmingham needs today</h1>
        <p className="mt-1 text-neutral-600">Fill a real need in a few taps: Shipt delivers, you drive it, or we pick it up from your porch.</p>
      </header>
      {error && <p role="alert" className="text-sm text-amber-700">{error}</p>}
      <WeatherBanner weather={state.weather} />
      <MyPledges ids={myIds} state={state} />
      <div className="space-y-2">
        <FilterChips label="Partners" value={partnerId} onChange={setPartnerId} options={partnersWithNeeds.map((p) => ({ value: p.id, label: p.name }))} />
        <FilterChips label="Categories" value={category} onChange={setCategory} options={categories.map((c) => ({ value: c, label: c }))} />
      </div>
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-neutral-500">No needs match these filters right now.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((n) => (
            <NeedCard key={n.id} need={n} partner={state.partners.find((p) => p.id === n.partnerId)} category={categoryOf.get(n.itemId)} onFill={(need) => setFillingId(need.id)} />
          ))}
        </ul>
      )}
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
    </section>
  );
}
