"use client";
// Donor needs feed. Owner: mulimangila.
import { useEffect, useMemo, useState } from "react";
import { Carousel } from "@/components/donor/carousel";
import { helpersByNeed } from "@/components/donor/community";
import { FeedSkeleton } from "@/components/donor/feed-skeleton";
import { FilledCelebration } from "@/components/donor/filled-celebration";
import { FillSheet } from "@/components/donor/fill-sheet";
import { FilterBar } from "@/components/donor/filter-bar";
import { LiveStrip } from "@/components/donor/live-strip";
import { MyPledges } from "@/components/donor/my-pledges";
import { NeedCard } from "@/components/donor/need-card";
import { PartnerTiles } from "@/components/donor/partner-tiles";
import { useMyPledgeIds } from "@/components/donor/pledge-history";
import { sortNeeds } from "@/components/donor/sort-needs";
import { useAppState } from "@/lib/use-app-state";
import type { AppState, Need } from "@/lib/types";

const isOpen = (n: Need) => n.qtyPledged < n.qtyNeeded;
const left = (needs: Need[]) => needs.reduce((s, n) => s + Math.max(0, n.qtyNeeded - n.qtyPledged), 0);

function headline(state: AppState, urgent: Need[]): string {
  const { weather } = state;
  if (weather.surge && urgent.length > 0) {
    const when = weather.lowF < 40 ? "before tonight's freeze" : "before the heat sets in";
    return `Birmingham shelters need ${left(urgent)} items ${when}`;
  }
  return `Birmingham nonprofits need ${left(state.needs.filter(isOpen))} items this week`;
}

function Section({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[22px] font-bold sm:text-[26px]">{title}</h2>
        {aside && <span className="text-sm text-secondary">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

export default function GivePage() {
  const { state, error, refresh } = useAppState();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fillingId, setFillingId] = useState<string | null>(null);
  const [myIds, addMyId] = useMyPledgeIds();

  // Check the NWS forecast once on load so the Weather Surge shows even before the partner portal is opened.
  useEffect(() => {
    fetch("/api/weather", { cache: "no-store" })
      .then(() => refresh())
      .catch(() => {});
  }, [refresh]);

  const categoryOf = useMemo(() => new Map(state?.catalog.map((c) => [c.id, c.category]) ?? []), [state?.catalog]);
  const priceOf = useMemo(() => new Map(state?.catalog.map((c) => [c.id, c.price]) ?? []), [state?.catalog]);
  const helpers = useMemo(() => helpersByNeed(state?.pledges ?? []), [state?.pledges]);
  const sorted = useMemo(() => sortNeeds(state?.needs ?? []), [state?.needs]);

  if (!state) return error ? <p role="alert" className="text-sale">{error}</p> : <FeedSkeleton />;

  const partnerOf = (n: Need) => state.partners.find((p) => p.id === n.partnerId);
  const q = query.trim().toLowerCase();
  const filtering = q !== "" || category !== null;
  const results = sorted.filter(
    (n) =>
      (!category || categoryOf.get(n.itemId) === category) &&
      (!q || [n.title, partnerOf(n)?.name, categoryOf.get(n.itemId)].some((s) => s?.toLowerCase().includes(q))),
  );
  const urgent = sorted.filter((n) => isOpen(n) && n.urgency === "urgent");
  const rest = sorted.filter((n) => !(isOpen(n) && n.urgency === "urgent"));
  const counts = new Map<string, number>();
  state.needs.forEach((n) => {
    const c = categoryOf.get(n.itemId);
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
  });
  const categories = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  const filling = state.needs.find((n) => n.id === fillingId);
  const cold = state.weather.lowF < 40;

  const card = (n: Need, className?: string) => (
    <NeedCard
      key={n.id}
      need={n}
      partner={partnerOf(n)}
      category={categoryOf.get(n.itemId)}
      price={priceOf.get(n.itemId)}
      helpers={helpers.get(n.id)}
      onFill={(need) => setFillingId(need.id)}
      className={className}
      surgeLabel={cold ? "Cold night" : "Heat alert"}
    />
  );
  const grid = "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className="space-y-8 text-primary">
      <header className="space-y-4">
        <div>
          <h1 className="max-w-3xl text-[30px] font-extrabold leading-[1.15] sm:text-[42px]">{headline(state, urgent)}</h1>
          <p className="mt-2 text-secondary">Pick something, choose how it gets there, and Shipt handles the rest.</p>
        </div>
        {error && <p role="alert" className="text-sm text-secondary">{error}</p>}
        <LiveStrip state={state} />
        <FilterBar query={query} onQuery={setQuery} categories={categories} value={category} onChange={setCategory} />
      </header>

      <MyPledges ids={myIds} state={state} />

      {filtering ? (
        <Section title={category ?? "Results"} aside={`${results.length} ${results.length === 1 ? "need" : "needs"}`}>
          {results.length === 0 ? (
            <p className="rounded-2xl bg-surface-muted p-8 text-center text-secondary">Nothing matches yet. Try another word or category.</p>
          ) : (
            <ul className={grid}>{results.map((n) => card(n))}</ul>
          )}
        </Section>
      ) : (
        <>
          {urgent.length > 0 && (
            <Section title={state.weather.surge ? (cold ? "Before tonight's freeze" : "Before the heat sets in") : "Needed most right now"} aside={`${urgent.length} urgent`}>
              <Carousel label="Urgent needs" count={urgent.length}>{urgent.map((n) => card(n, "w-[44vw] shrink-0 snap-start sm:w-56"))}</Carousel>
            </Section>
          )}
          <Section title="Shelters and nonprofits">
            <PartnerTiles partners={state.partners} needs={state.needs} />
          </Section>
          <Section title="All needs" aside={`${rest.filter(isOpen).length} open`}>
            <ul className={grid}>{rest.map((n) => card(n))}</ul>
          </Section>
        </>
      )}

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
    </div>
  );
}
