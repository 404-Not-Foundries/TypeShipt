import Link from "next/link";
import type { AppState } from "@/lib/types";

export function CommunityBanner({ state, query }: { state: AppState; query: string }) {
  const urgent = state.needs.filter((need) => need.urgency === "urgent" && need.qtyPledged < need.qtyNeeded);
  const matches = urgent.filter((need) => {
    const partner = state.partners.find((entry) => entry.id === need.partnerId);
    return (need.title + " " + (partner?.name ?? "")).toLowerCase().includes(query.toLowerCase().trim());
  }).slice(0, 3);
  return (
    <section aria-labelledby="community-banner-title" className="rounded-2xl border border-hairline bg-hero-sage p-5 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-10">
        <div>
          <p className="text-sm font-semibold">ShiptGiving in your community</p>
          <h1 id="community-banner-title" className="mt-3 max-w-md text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">Birmingham needs you tonight</h1>
          <p className="mt-4 text-base">
            <strong className={urgent.length > 0 ? "text-sale" : ""}>{urgent.length} urgent {urgent.length === 1 ? "need" : "needs"}</strong> from local nonprofits.
            {" "}Send a gift to a receiving desk, with every item chosen by the people who need it.
          </p>
          {state.weather.surge && (
            <p className="mt-4 rounded-xl bg-white p-3 text-sm">
              <span className="font-semibold">Weather surge: </span>{state.weather.reason ?? "Weather conditions have raised local needs."}
            </p>
          )}
          <Link href="/give" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90">Give now</Link>
        </div>
        <div>
          <h2 className="text-lg font-bold">Urgent needs near you</h2>
          {matches.length === 0 ? (
            <p className="mt-3 rounded-xl border border-hairline bg-white p-5 text-sm text-secondary">
              {urgent.length === 0 ? "No urgent needs right now. Browse all needs to help a nonprofit plan ahead." : "No urgent needs match your search. Clear it to see what is needed tonight."}
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {matches.map((need) => {
                const partner = state.partners.find((entry) => entry.id === need.partnerId);
                return (
                  <li key={need.id} className="rounded-xl border border-hairline bg-white p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-bold">{need.title}</h3>
                      <span className="text-xs font-semibold text-sale">Urgent</span>
                    </div>
                    <p className="mt-1 text-sm text-secondary">{partner?.name ?? "Community partner"}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3">
                      <p className="text-sm">{need.qtyNeeded - need.qtyPledged} still needed</p>
                      <Link href={partner ? `/p/${encodeURIComponent(partner.id)}` : "/give"}
                        className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
                        aria-label={`View ${need.title} for ${partner?.name ?? "this partner"}`}>View need</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
