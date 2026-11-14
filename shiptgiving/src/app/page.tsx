"use client";
// Owner: rmaytr. Home hub: what ShiptGiving is, what is needed tonight, and the story in three steps.
import Link from "next/link";
import { useEffect } from "react";
import { ItemPhoto } from "@/components/donor/item-photo";
import { sortNeeds } from "@/components/donor/sort-needs";
import { useAppState } from "@/lib/use-app-state";

// In story order: a nonprofit asks, a neighbor fills it, a driver brings it.
const STORY = [
  { href: "/partner", title: "Nonprofits post", text: "A shelter types what it needs in plain words. Weather alerts raise what matters tonight.", cta: "Open the portal" },
  { href: "/give", title: "Neighbors fill", text: "Pick an item and how it gets there: Shipt delivers, you drive it, or porch pickup.", cta: "Fill a need" },
  { href: "/driver", title: "Drivers deliver", text: "Pledges batch into one route per vehicle, sized to what it can carry.", cta: "See the routes" },
];

const MORE = [
  { href: "/impact", title: "Impact", text: "What the city has given so far." },
  { href: "/shipt", title: "Inside the Shipt app", text: "A concept of ShiptGiving as a Shipt section." },
  { href: "/demo", title: "Presenter view", text: "The demo script with every view side by side." },
  { href: "/how-it-works", title: "How it works", text: "The idea, architecture and code, in a minute." },
];

// The whole card is the link target; the heading stays the accessible name.
const STRETCH = "after:absolute after:inset-0 after:rounded-2xl";
const BTN = "press inline-flex min-h-11 items-center rounded-full px-6 text-sm font-semibold";

export default function HomePage() {
  const { state, error, refresh } = useAppState();

  // Ask for the forecast once so an active Weather Surge shows here before any other page is opened.
  useEffect(() => {
    fetch("/api/weather", { cache: "no-store" })
      .then(() => refresh())
      .catch(() => {});
  }, [refresh]);

  const open = state ? sortNeeds(state.needs).filter((n) => n.qtyPledged < n.qtyNeeded) : [];
  const tonight = open.slice(0, 3);
  const stats = [
    { label: "urgent needs", value: state ? open.filter((n) => n.urgency === "urgent").length : undefined },
    { label: "items pledged", value: state?.needs.reduce((sum, n) => sum + n.qtyPledged, 0) },
    { label: "nonprofit partners", value: state?.partners.length },
  ];

  return (
    <div className="space-y-6 text-primary">
      <section className="grid gap-6 rounded-2xl bg-hero-sage p-5 sm:p-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
        <div>
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight sm:text-[56px]">ShiptGiving</h1>
          <p className="mt-3 max-w-xl text-lg">
            Birmingham nonprofits post what they need tonight. Neighbors fill it through Shipt, by driving, or by porch
            pickup.
          </p>
          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/give" className={`${BTN} bg-primary text-white hover:bg-black`}>
              Fill a need
            </Link>
            <Link href="/demo" className={`${BTN} border border-primary hover:bg-white`}>
              Presenter view
            </Link>
          </div>
          <dl aria-label="Right now in Birmingham" aria-busy={!state} className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-sm">{s.label}</dt>
                <dd className="text-3xl font-extrabold tabular-nums">{s.value?.toLocaleString() ?? "–"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold">Needed tonight</h2>
            {state?.weather.surge && <span className="text-sm text-secondary">{Math.round(state.weather.lowF)}°F low</span>}
          </div>
          <ul className="mt-2 divide-y divide-hairline">
            {tonight.map((n) => {
              const item = state?.catalog.find((c) => c.id === n.itemId);
              const partner = state?.partners.find((p) => p.id === n.partnerId);
              const pct = Math.round((n.qtyPledged / Math.max(1, n.qtyNeeded)) * 100);
              return (
                <li key={n.id} className="relative flex items-center gap-3 py-2.5">
                  <ItemPhoto itemId={n.itemId} category={item?.category} alt="" className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <Link href="/give" className="block truncate font-semibold after:absolute after:inset-0">
                      {n.title}
                    </Link>
                    <p className="truncate text-sm text-secondary">{partner?.name}</p>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-hairline">
                      <span className="block h-full rounded-full bg-[var(--accent-express-text)]" style={{ width: `${pct}%` }} />
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{n.qtyNeeded - n.qtyPledged} left</span>
                </li>
              );
            })}
            {!state && <li className="py-6 text-sm text-secondary">Loading tonight&rsquo;s needs…</li>}
            {state && tonight.length === 0 && <li className="py-6 text-sm text-secondary">Every need is pledged. Thank you, Birmingham.</li>}
          </ul>
        </div>
      </section>

      <ol className="grid gap-4 md:grid-cols-3">
        {STORY.map((r, i) => (
          <li key={r.href} className="relative flex flex-col rounded-2xl border border-hairline bg-white p-5 hover:border-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-sm font-bold tabular-nums" aria-hidden>
              {i + 1}
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-tight">{r.title}</h2>
            <p className="mb-5 mt-2 text-secondary">{r.text}</p>
            <Link href={r.href} className={`${BTN} mt-auto self-start bg-primary text-white ${STRETCH}`}>
              {r.cta}
            </Link>
          </li>
        ))}
      </ol>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MORE.map((m) => (
          <li key={m.href} className="relative rounded-2xl bg-totemeal p-4 hover:bg-surface-muted">
            <h2 className="font-bold">
              <Link href={m.href} className={`underline ${STRETCH}`}>
                {m.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-secondary">{m.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
