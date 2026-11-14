// Code map (collapsible folder tree) and key code cards for /how-it-works. Owner: rmaytr.
import { EXCERPTS } from "./excerpts";

type Entry = { name: string; owner: string; text: string };
type Folder = { name: string; text: string; entries: Entry[] };

const TREE: Folder[] = [
  {
    name: "app/",
    text: "Pages. Each folder is a route (Next.js App Router).",
    entries: [
      { name: "page.tsx", owner: "rmaytr", text: "Home hub: tonight's numbers and a door for each role" },
      { name: "give/, p/[id]/", owner: "mulimangila", text: "Donor feed and partner pages" },
      { name: "partner/", owner: "Viral-W", text: "Nonprofit portal; actions.ts runs the live IRS check" },
      { name: "driver/", owner: "rmaytr", text: "Tomorrow's drivers, route map and route cards" },
      { name: "impact/, demo/", owner: "rmaytr", text: "Impact stats and the presenter split view" },
      { name: "shipt/", owner: "rmaytr", text: "Concept: ShiptGiving inside the Shipt app, order tracking" },
      { name: "how-it-works/", owner: "rmaytr", text: "This page" },
    ],
  },
  {
    name: "app/api/",
    text: "Route handlers: validate the body, call lib/, return JSON or a clean error.",
    entries: [
      { name: "state, pledges, drivers, route-plan, demo", owner: "rmaytr", text: "Core state, pledges, fleet and routing" },
      { name: "stores, products, shipt/orders", owner: "rmaytr", text: "OSM stores, Open Food Facts, gift-order mock" },
      { name: "needs, parse-need, weather", owner: "Viral-W", text: "Publish needs, AI parse, Weather Surge" },
    ],
  },
  {
    name: "lib/",
    text: "Server logic. Pure functions where possible, so they are unit-tested.",
    entries: [
      { name: "types.ts, store.ts, http.ts", owner: "rmaytr", text: "Data contract, in-memory store, error responses" },
      { name: "use-app-state.ts", owner: "rmaytr", text: "Client hook: polls /api/state every 2 s" },
      { name: "routing/", owner: "rmaytr", text: "assign.ts (who carries what), order.ts (stop order), geo.ts" },
      { name: "stores/", owner: "rmaytr", text: "OSM Overpass + snapshot, Open Food Facts, Kroger" },
      { name: "shipt-platform.ts, demo.ts", owner: "rmaytr", text: "Pledge → gift order; the cold-night scenario" },
      { name: "item-images.ts", owner: "rmaytr", text: "Freely licensed photo for every catalog item; a test checks none is missing" },
      { name: "fees.ts", owner: "mulimangila", text: "pledgeCost, amount charged, volunteer mileage" },
      { name: "ai.ts, weather.ts", owner: "Viral-W", text: "Claude + keyword parser; NWS and the surge rule" },
    ],
  },
  {
    name: "components/",
    text: "UI pieces, one folder per area.",
    entries: [
      { name: "donor/", owner: "mulimangila", text: "Feed, need cards, fill-a-need sheet, receipt, fill it together" },
      { name: "partner/", owner: "Viral-W", text: "Post a need, incoming board, surge panel, verification" },
      { name: "driver/, impact/, shipt/, nav/", owner: "rmaytr", text: "Fleet panel, map, route cards, impact, Shipt concept, header" },
      { name: "explain/", owner: "rmaytr", text: "This page: diagrams, code map, excerpts, the App | How it works toggle" },
      { name: "ui/", owner: "rmaytr", text: "Shared page header" },
    ],
  },
  {
    name: "data/",
    text: "Seed data: 11 real Birmingham partners, the catalog, needs and IRS records.",
    entries: [{ name: "partners.ts, catalog.ts, needs.ts, verification.ts", owner: "Viral-W", text: "Real addresses, receiving hours, accept rules" }],
  },
  {
    name: "instrumentation.ts",
    text: "Runs once at server start and loads the cold-night demo state, so the app never opens empty.",
    entries: [],
  },
];

export function CodeMap() {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-2 font-mono text-sm">
      <p className="px-3 py-2 font-bold">shiptgiving/src/</p>
      {TREE.map((folder) => (
        <details key={folder.name} className="group rounded-xl px-3 open:bg-totemeal">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2 [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="inline-block w-3 transition-transform group-open:rotate-90">›</span>
            <span className="font-bold">{folder.name}</span>
            <span className="hidden font-sans text-secondary sm:inline">— {folder.text}</span>
          </summary>
          <p className="pb-2 pl-5 font-sans text-secondary sm:hidden">{folder.text}</p>
          {folder.entries.length > 0 && (
            <ul className="space-y-2 pb-3 pl-5">
              {folder.entries.map((e) => (
                <li key={e.name} className="border-l border-hairline pl-3">
                  <span className="font-semibold">{e.name}</span>{" "}
                  <span className="rounded-full bg-express px-2 font-sans text-xs font-semibold text-express">{e.owner}</span>
                  <p className="font-sans text-secondary">{e.text}</p>
                </li>
              ))}
            </ul>
          )}
        </details>
      ))}
    </div>
  );
}

export function KeyCode() {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {EXCERPTS.map((e) => (
        <li key={e.title} className="min-w-0 rounded-2xl border border-hairline bg-white p-5">
          <h3 className="font-bold">{e.title}</h3>
          <p className="mt-1 text-sm text-secondary">{e.why}</p>
          <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span>{e.path}</span>
            <span className="rounded-full bg-express px-2 font-sans font-semibold text-express">{e.owner}</span>
          </p>
          <pre
            tabIndex={0}
            role="region"
            aria-label={`Code from ${e.path}`}
            className="mt-2 overflow-x-auto rounded-xl bg-dark-band p-4 text-[12px] leading-relaxed text-white"
          >
            <code>{e.code}</code>
          </pre>
        </li>
      ))}
    </ul>
  );
}
