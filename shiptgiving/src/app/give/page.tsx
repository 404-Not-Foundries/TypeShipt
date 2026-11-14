"use client";
// Donor needs feed. Owner: mulimangila.
import { useEffect, useMemo, useState } from "react";
import { helpersByNeed } from "@/components/donor/community";
import { useDonorLocation } from "@/components/donor/donor-location";
import { FeedSkeleton } from "@/components/donor/feed-skeleton";
import { FilledCelebration } from "@/components/donor/filled-celebration";
import { FillSheet } from "@/components/donor/fill-sheet";
import { FilterBar } from "@/components/donor/filter-bar";
import { dropOff, roadMiles } from "@/components/donor/geo";
import { PhotoCredits } from "@/components/donor/item-photo";
import { LiveStrip } from "@/components/donor/live-strip";
import { MyPledges } from "@/components/donor/my-pledges";
import { NeedCard } from "@/components/donor/need-card";
import { PartnerTiles } from "@/components/donor/partner-tiles";
import { useMyPledgeIds } from "@/components/donor/pledge-history";
import { type SortMode, sortNeedsBy } from "@/components/donor/sort-needs";
import { PageHeader } from "@/components/ui/page-header";
import { useAppState } from "@/lib/use-app-state";
import type { AppState, Need } from "@/lib/types";

const isOpen = (n: Need) => n.qtyPledged < n.qtyNeeded;
const left = (needs: Need[]) => needs.reduce((s, n) => s + Math.max(0, n.qtyNeeded - n.qtyPledged), 0);
const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

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
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {aside && <span className="shrink-0 text-sm text-secondary">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

export default function GivePage() {
  const { state, error, refresh } = useAppState();
  const [selected, setSelected] = useState<string[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("urgent");
  const [query, setQuery] = useState("");
  const [fillingId, setFillingId] = useState<string | null>(null);
  const [myIds, addMyId] = useMyPledgeIds();
  const donor = useDonorLocation();

  // Check the NWS forecast once on load so the Weather Surge shows even before the partner portal is opened.
  useEffect(() => {
    fetch("/api/weather", { cache: "no-store" })
      .then(() => refresh())
      .catch(() => {});
  }, [refresh]);

  const categoryOf = useMemo(() => new Map(state?.catalog.map((c) => [c.id, c.category]) ?? []), [state?.catalog]);
  const priceOf = useMemo(() => new Map(state?.catalog.map((c) => [c.id, c.price]) ?? []), [state?.catalog]);
  const helpers = useMemo(() => helpersByNeed(state?.pledges ?? []), [state?.pledges]);
  const partnerById = useMemo(() => new Map(state?.partners.map((p) => [p.id, p]) ?? []), [state?.partners]);

  if (!state) return error ? <p role="alert" className="text-sale">{error}</p> : <FeedSkeleton />;

  const partnerOf = (n: Need) => partnerById.get(n.partnerId);
  const milesOf = (n: Need) => {
    const p = partnerOf(n);
    return p ? roadMiles(donor.point, dropOff(p).location) : Number.MAX_VALUE;
  };
  const sorted = sortNeedsBy(state.needs, sort, milesOf);
  const q = query.trim().toLowerCase();
  const filtering = q !== "" || selected.length > 0 || partnerId !== null;
  const results = sorted.filter(
    (n) =>
      (!partnerId || n.partnerId === partnerId) &&
      (selected.length === 0 || selected.includes(categoryOf.get(n.itemId) ?? "")) &&
      (!q || [n.title, partnerOf(n)?.name, categoryOf.get(n.itemId)].some((s) => s?.toLowerCase().includes(q))),
  );
  const urgent = sorted.filter((n) => isOpen(n) && n.urgency === "urgent");
  const rest = sorted.filter((n) => !(isOpen(n) && n.urgency === "urgent"));
  // The urgent band only makes sense in the default order; any filter or other sort shows one flat list.
  const sectioned = !filtering && sort === "urgent" && urgent.length > 0;

  const count = (key: (n: Need) => string | undefined) => {
    const m = new Map<string, number>();
    state.needs.forEach((n) => {
      const k = key(n);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    });
    return m;
  };
  const categories = [...count((n) => categoryOf.get(n.itemId)).entries()].sort((a, b) => b[1] - a[1]).map(([name, c]) => ({ id: name, name, count: c }));
  const partnerCounts = count((n) => n.partnerId);
  const partners = state.partners.filter((p) => partnerCounts.has(p.id)).map((p) => ({ id: p.id, name: p.name, count: partnerCounts.get(p.id) ?? 0 }));

  const filling = state.needs.find((n) => n.id === fillingId);
  const cold = state.weather.lowF < 40;
  const card = (n: Need) => (
    <NeedCard
      key={n.id}
      need={n}
      partner={partnerOf(n)}
      category={categoryOf.get(n.itemId)}
      price={priceOf.get(n.itemId)}
      helpers={helpers.get(n.id)}
      onFill={(need) => setFillingId(need.id)}
      surgeLabel={cold ? "Cold night" : "Heat alert"}
      miles={sort === "closest" ? milesOf(n) : undefined}
    />
  );
  const clear = () => {
    setQuery("");
    setSelected([]);
    setPartnerId(null);
  };

  return (
    <div className="space-y-6 text-primary">
      <PageHeader title={headline(state, urgent)} sub="Pick something, choose how it gets there, and Shipt handles the rest." />
      {error && <p role="alert" className="text-sm text-secondary">{error}</p>}
      <LiveStrip state={state} />

      <FilterBar
        query={query}
        onQuery={setQuery}
        partners={partners}
        partnerId={partnerId}
        onPartner={setPartnerId}
        categories={categories}
        selected={selected}
        onToggleCategory={(c) => setSelected(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c])}
        sort={sort}
        onSort={setSort}
        shown={filtering ? results.length : state.needs.length}
        total={state.needs.length}
        onClear={clear}
      />

      <MyPledges ids={myIds} state={state} />

      {sectioned ? (
        <>
          <section className="gap-5 space-y-3 rounded-2xl bg-hero-sage p-3 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:space-y-0">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">{state.weather.surge ? (cold ? "Before tonight's freeze" : "Before the heat sets in") : "Needed most right now"}</h2>
              <p className="mt-1 text-sm lg:mt-4">
                <span className="font-extrabold tabular-nums lg:block lg:text-6xl lg:leading-none">{left(urgent)}</span> items still to go across{" "}
                {urgent.length} urgent {urgent.length === 1 ? "need" : "needs"}.
              </p>
              {state.weather.surge && state.weather.reason && <p className="mt-2 hidden text-sm lg:block">{state.weather.reason}</p>}
            </div>
            <ul className={`grid grid-cols-2 gap-3 sm:gap-4 ${urgent.length > 2 ? "sm:grid-cols-3" : ""}`}>{urgent.map(card)}</ul>
          </section>
          <Section title="Shelters and nonprofits">
            <PartnerTiles partners={state.partners} needs={state.needs} />
          </Section>
          <Section title="Everything else" aside={`${rest.filter(isOpen).length} open`}>
            <ul className={GRID}>{rest.map(card)}</ul>
          </Section>
        </>
      ) : results.length === 0 ? (
        <div className="rounded-2xl bg-surface-muted p-8 text-center">
          <p className="font-semibold">No needs match those filters.</p>
          <button type="button" onClick={clear} className="press mt-3 min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className={GRID}>{results.map(card)}</ul>
      )}

      <PhotoCredits />
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
