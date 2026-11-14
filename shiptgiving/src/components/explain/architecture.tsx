// Architecture diagram for /how-it-works: four stacked layers joined by SVG connectors. Owner: rmaytr.
// HTML layers (not one big SVG) so the text stays readable at 375px.

type Layer = { title: string; where: string; chips: string[]; tone: string };

const LAYERS: Layer[] = [
  {
    title: "Browser pages",
    where: "src/app/*/page.tsx · client components",
    chips: ["Home", "Give", "Nonprofits", "Drivers", "Impact", "Shipt concept", "Presenter", "How it works"],
    tone: "bg-hero-sage",
  },
  {
    title: "Next.js API routes",
    where: "src/app/api/ · validate input, return JSON",
    chips: ["/api/state", "/api/pledges", "/api/needs", "/api/parse-need", "/api/weather", "/api/drivers", "/api/route-plan", "/api/stores", "/api/products", "/api/shipt/orders", "/api/demo"],
    tone: "bg-white",
  },
  {
    title: "Server logic and the in-memory store",
    where: "src/lib/ · one Node process, state kept on globalThis",
    chips: ["store.ts", "routing/", "ai.ts", "weather.ts", "fees.ts", "shipt-platform.ts", "stores/", "demo.ts"],
    tone: "bg-totemeal",
  },
  {
    title: "Public APIs (each with a fallback)",
    where: "fetch with a timeout, then fall back",
    chips: ["OSM Overpass → snapshot", "Open Food Facts", "Kroger (optional)", "OSRM → straight line", "NWS weather → last reading", "Claude → keywords", "ProPublica IRS data → seed record"],
    tone: "bg-white",
  },
];

const LINKS = [
  "useAppState() polls GET /api/state every 2 s · POST / PATCH on each action",
  "plain function calls · every write returns a new state object",
  "server-side fetch only · no keys except Claude (optional)",
];

function Connector({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1 pl-6">
      <svg viewBox="0 0 16 40" className="h-10 w-4 shrink-0 text-primary" aria-hidden="true" focusable="false">
        <path d="M8 4v32" stroke="currentColor" strokeWidth="2" />
        <path d="M3 9l5-6 5 6M3 31l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <p className="text-sm text-secondary">{label}</p>
    </div>
  );
}

export function Architecture() {
  return (
    <figure className="mx-auto max-w-4xl" aria-label="Architecture: browser pages, API routes, server logic and store, public APIs">
      {LAYERS.map((layer, i) => (
        <div key={layer.title}>
          <div className={`rounded-2xl border border-hairline p-4 ${layer.tone}`}>
            <h3 className="font-bold">{layer.title}</h3>
            <p className="text-xs text-secondary">{layer.where}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {layer.chips.map((c) => (
                <li key={c} className="rounded-full border border-hairline bg-white px-3 py-1 text-xs font-semibold">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          {i < LINKS.length && <Connector label={LINKS[i]} />}
        </div>
      ))}
      <figcaption className="mt-3 text-sm text-secondary">
        Every view reads the same state, so a pledge made in one window shows up in the others within 2 seconds.
      </figcaption>
    </figure>
  );
}
