# Project brief: ShiptGiving

> Source of truth for every agent and teammate. If this conflicts with `AGENTS.md`, this file wins.
> Locked 2026-11-14, 11:15 AM CT. Build window ends 2:59 PM CT.

## One sentence
**ShiptGiving** lets Birmingham nonprofits post what they need (an Amazon-style wishlist), and lets anyone fill a need in a few taps: Shipt delivers it as an ordinary gift order addressed to the nonprofit, a volunteer drives it, or a driver picks it up from the donor's porch. A route optimizer batches every pledge into the fewest, shortest trips.

## The problem (Birmingham, with sources)
- **Firehouse Ministries** shelters 215+ men every night (29,509 shelter nights in 2025). It "depends on in-kind donations" for clothing and toiletries through a static Amazon wish list, and opens its day shelter on any day under 40°F or with a heat advisory. Public money is 67–72% of its budget; its goal is 50/50 public/private. ([home](https://firehouseshelter.com/), [FAQ](https://firehouseshelter.com/who-we-are/faq/))
- **Jones Valley Teaching Farm** gives away everything it grows, mostly at one walk-up stand in a narrow weekly window, while the city counts about **146,000 residents in food deserts** (~70% of residents live where fresh food is scarce). ([Bham Now 2024](https://bhamnow.com/2024/11/14/how-to-find-healthy-food-in-birminghams-food-insecure-neighborhoods/))
- **Birmingham Promise** is scaling internships from 50 to ~100 per semester plus 400 job shadowers, and its scholarship doesn't cover housing, meals or transportation. ([news](https://birminghampromise.org/?p=476), [FAQ](https://birminghampromise.org/about/faq/))
- **Ed Farm** runs Student Fellows, who research a local issue and build a tech response. ([GovTech](https://www.govtech.com/education/k-12/alabama-nonprofit-forges-strong-inclusive-path-to-stem))
- Giving in-kind today is high-friction: buy online or in a store, find the drop-off hours, drive downtown, hope it's still needed. Nonprofits get 60 of one thing and 0 of what they actually need.

## Why this works for Shipt (and costs it nothing)
- **Shipt already does this.** It supports gift orders to an address other than your own; the recipient gets a tracking text ([help](https://help.shipt.com/how-do-i-send-a-gift-delivery)). A ShiptGiving order is a gift order pre-addressed to a verified nonprofit, with a `community` tag. No new order type and no changes to checkout or dispatch.
- **It's revenue-positive.** Donors pay the normal item price, delivery fee and service fee. Shipt earns on every order and gains new customers (non-members can donate too).
- **No new labor.** Shoppers do a normal delivery. Batching means more drops per trip.
- **No money handling.** Each donor pays for their own share through Shipt's existing checkout. Shipt never holds pooled or charity money.
- **No support burden.** The nonprofit confirms receipt in its portal, and the donor sees the status. "Did my donation arrive?" is answered by the platform, not Shipt support.
- **No legal exposure:** Shipt does not advertise "your purchase benefits a charity". The donor buys a gift and the nonprofit-run platform does the asking, which keeps Shipt out of Alabama commercial co-venturer rules ([AL AG](https://www.alabamaag.gov/licensing-registration/professional-fundraiser-or-commercial-co-venturer-and-professional-solicitors/)).
- **Who runs it:** the community. It's open source with nonprofit self-service, on free-tier hosting, and could be maintained by Ed Farm Student Fellows. Shipt's part is a link or button.
- **Brand:** it turns Shipt's existing hometown giving (grants, volunteer days, its $1M Birmingham Promise pledge, $37K to JVTF in 2024) into an always-on feature of the product.

## Tax and incentives (2026 rules, stated honestly)
- **Donors** who buy goods for a 501(c)(3) are making a noncash gift, deductible at cost **only if they itemize**. The 2026 deduction for non-itemizers ($1,000 single / $2,000 joint) covers **cash only**, so in-kind gifts don't qualify ([IRS](https://www.irs.gov/newsroom/irs-reminder-permanent-charitable-contribution-deduction-begins-for-returns-filed-next-year-for-taxpayers-who-do-not-itemize)). Itemizers deduct only the part above 0.5% of AGI from 2026. Noncash gifts over $500 a year need Form 8283 ([Pub 526](https://www.irs.gov/publications/p526)). The app gives every donor a written acknowledgment and an annual summary, and never promises a deduction.
- **Volunteer drivers:** 14¢/mile plus parking and tolls (itemizers), with an automatic mileage log ([IRS](https://www.irs.gov/pub/irs-drop/n-26-10.pdf)).
- **Shipt:** a waived delivery fee is donated service, which is generally *not* deductible. So Shipt's benefit is the revenue on each order plus the brand, not a write-off. An optional, Shipt-controlled promo (for example, free community delivery on Weather Surge nights) is a marketing choice, not a requirement.

## Users and surfaces (one web app, three views; a role switcher in the header for the demo)
1. **Donor** (public website, also embeddable as a "Community" section in the Shipt app). No login required to browse.
2. **Partner portal** (nonprofit staff): post needs, set receiving windows and accept rules, confirm receipt.
3. **Driver** (Shipt shopper or volunteer): an optimized batch route with stops, a map and windows.

## Features

### Donor
- **Needs feed:** urgent needs first, then by distance. Filter by partner or category. Each card shows the partner, item, progress meter (e.g., 12 of 40 pledged), urgency badge and deadline.
- **Partner page:** mission, location, receiving hours, what they accept or refuse, all open needs, impact so far.
- **Fill a need (bottom sheet):** pick a quantity (chip in any amount up to what's still open), then pick how it gets there:
  - **Shipt delivers**: buy from a nearby partner store. Price = items + shared delivery fee + service fee. Becomes a gift order to the partner.
  - **I'll drive it**: volunteer. Bring new items you own, or buy them yourself. No fee. You get a route, the receiving window, and a mileage log (14¢/mile charitable rate, 2026 ([IRS](https://www.irs.gov/pub/irs-drop/n-26-10.pdf))).
  - **Porch pickup**: you have new or sealed items at home; a driver picks them up on a batched route. Hidden for partners that don't accept home pickups or need perishables.
- **Shared cart, kept simple:** every pledge is its own small order and its own payment. Pledges for the same partner and the same receiving window are **batched into one trip**. The delivery fee is shared: a $9.99 community-batch fee split across contributors, captured at checkout as an authorization and settled when the batch closes (Shipt already authorizes then adjusts the final charge for weighed items and substitutions).
- **Quantity hold:** units are reserved for 15 minutes in the cart, so a need can't be over-filled. The need closes at 100%.
- **Receipt and acknowledgment:** when the partner confirms receipt, the donor gets a written acknowledgment (charity name, item description, "no goods or services were provided in return"), which is what the IRS requires for $250+ gifts ([IRS](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments)). The UI says "consult a tax professional" and promises no deduction.

### Partner portal
- **Post a need in plain English:** "cold front tonight, need 40 pairs of men's socks L/XL and 20 blankets." AI (Claude) returns structured items matched to catalog items, with quantity, category and estimated price. Staff confirm or edit, then publish. A keyword fallback works offline.
- **Receiving windows and rules:** days and hours, dock or front desk, new-only, perishables yes or no, refused items. Checkout only offers delivery slots inside a window.
- **Incoming board:** pledged, on the way (ETA), delivered. **Confirm receipt** with counts in one tap, which updates the meters and sends acknowledgments.
- **Partner-specific modules:**
  - *Firehouse: Weather Surge.* The NWS forecast for Birmingham ([api.weather.gov](https://api.weather.gov), free, no key). A low under 40°F or a heat advisory automatically raises cold-weather or heat kits (blankets, socks, hand warmers / water, electrolytes, sunscreen) to **urgent**, with the reason shown on the donor feed.
  - *Food partners (JVTF, food bank): Perishables.* Shipt same-day delivery only, no porch pickup, delivered inside the window.
  - *Birmingham Promise: Dorm Kits.* Bundle needs (a move-in kit for one scholar) that donors can fund as a whole.
  - *Ed Farm: Classroom.* Electronics accepted new only, with teacher wishlists.
  - *Women's and family shelters: Confidential address.* The shelter's real address is never shown. Drivers deliver to a public drop point or admin office.
- **Verification:** partners are approved after an EIN check against the IRS Tax-Exempt Organization Search (manual for the hackathon).

### Driver and route optimization (the technical core)
- Input: the driver's start location plus open pledges. Each pledge has a pickup point (a store or a donor's porch) and a drop-off (the partner, or its drop point) with a receiving window.
- **Batching:** group pledges by receiving window and area into batches (one per driver).
- **Routing:** pickup-and-delivery TSP with time windows. Every pickup must come before its drop-off. Cheapest insertion, then 2-opt / relocate improvement, respecting precedence and windows. Small n (under 20 stops) runs in milliseconds.
- **Travel times:** an OSRM `/table` duration matrix from the public demo server (`router.project-osrm.org`, free, demo use). Fallback: straight-line distance × 1.3 at 25 mph. OSRM `/route` draws the polyline.
- **Shows the win:** minutes and miles for the optimized batch versus "one separate trip per donation". This is the headline number for the nonprofit and for Shipt.
- **Driver view:** ordered stop list, map with the route, current stop. "Picked up" and "Delivered" buttons update every view live. Volunteers get a mileage log.

## Partner seed data (real Birmingham nonprofits)
Coordinates come from OpenStreetMap Nominatim. Hours marked † were not published, so the windows are **demo assumptions**; label them that way in the UI ("call to confirm"). Viraj turns this table into `src/data/partners.ts`.

| id | Partner | Address (area) | lat, lng | Receiving | Rules and module |
|---|---|---|---|---|---|
| `firehouse` | Firehouse Ministries (men's shelter) | 626 2nd Ave N (downtown) | 33.5065, -86.8251 | Daily 7am–6pm, side loading dock, call first | New or gently used men's clothing, toiletries, food. **weatherSurge** |
| `jvtf` | Jones Valley Teaching Farm | 701 25th St N (downtown / Smithfield edge) | 33.5238, -86.8028 | † Mon–Fri 9–4 | Garden and kitchen supplies (seeds, tools, aprons). **perishables** |
| `edfarm` | Ed Farm | 1914 4th Ave N, Forbes Building (downtown) ⚠ verify | 33.5167, -86.8087 | † Mon–Fri 9–5 | New electronics only, wipe-data checklist. **classroom** |
| `promise` | Birmingham Promise | 1500 1st Ave N, Innovation Depot (downtown) | 33.5121, -86.8126 | † Mon–Fri 9–5, front desk | "Suit up a student" career clothes (sizes); dorm move-in kits. **dormKits** |
| `foodbank` | Community Food Bank of Central Alabama | 107 Walter Davis Dr (Finley / Avondale industrial) | 33.4727, -86.8380 | Mon–Fri 7:30am–4pm, shelf-stable at the lobby | Shelf-stable food; perishables same-day only. **perishables** |
| `jimmiehale` | Jimmie Hale Mission (men's center) | 3420 2nd Ave N (Woodlawn) | 33.5250, -86.7863 | † Daily 8–6 | Twin washable blankets, hats, gloves, fruit, breakfast bars. **weatherSurge** |
| `pathways` | Pathways (women and children) | public drop point only (downtown) | 33.5184, -86.8064 | † Mon–Fri 9–4 | Toiletries, children's items. **confidential** (driver sees the drop point only) |
| `ywca` | YWCA Central Alabama | 309 23rd St N (downtown) ⚠ verify | 33.5186, -86.8028 | † Mon–Fri 9–4 | Feminine hygiene, soap, shampoo, deodorant, razors, toothbrushes. **confidential** |
| `csm` | Christian Service Mission | 3600 3rd Ave S (Southside / Woodlawn) | 33.5205, -86.7806 | Mon–Thu 8–4 | Pantry food, clothing |
| `brotherbryan` | Brother Bryan Mission | 1616 2nd Ave N (downtown) ⚠ entrance | 33.5134, -86.8108 | † Daily 9–5 | Meal bundles ("feed 40 men tonight") |
| `lovelady` | The Lovelady Center (women's recovery) | 7916 2nd Ave S (Eastwood, ~10 mi east) | 33.5640, -86.7232 | † Mon–Sat 9–5 | Hygiene kits |

**Route clusters, for the routing demo:**
- *Downtown core* (Firehouse, Brother Bryan, Pathways, Ed Farm, Promise, YWCA, JVTF): all within about 1.5 miles, so one route covers them in about 15 minutes.
- *East* (Jimmie Hale, Christian Service Mission): about 3 miles out, 10–12 minutes.
- *Outliers:* the Food Bank (~5 mi, 12 min) and Lovelady (~10 mi, 20 min).

The demo scenario is a cold night: 6 pledges across Firehouse, Brother Bryan, Jimmie Hale and Pathways, picked up from 2 stores and 1 porch. One optimized route versus 6 separate trips.
**Stores:** real Birmingham grocery and pharmacy locations from OpenStreetMap: Publix Southside, three Piggly Wigglys, Target Brookwood, Walmart Montclair, two ALDIs, CVS, Walgreens, Winn-Dixie, Whole Foods. They're already in `src/lib/stores/snapshot.ts` (lead), with a live Overpass lookup at `GET /api/stores`.

## Scope
**Must have (the demo breaks without it):**
1. Seed data: 8+ partners with real coordinates, 25+ needs, a catalog of ~40 items, 3 stores.
2. Donor feed, partner page, and fill-a-need sheet with the 3 options, chip-in quantity, fee split and mock checkout.
3. Partner portal: post a need in plain text (AI + fallback), incoming board, confirm receipt.
4. Weather Surge for Firehouse (live NWS plus a "simulate cold night" toggle for the demo).
5. Driver route: optimized stops on a Leaflet map plus the "saved X minutes vs separate trips" stat.
6. Live sync across windows: in-memory server store plus 2-second polling.

**Nice to have:** confidential drop point; acknowledgment receipt page; volunteer mileage log; Dorm Kit bundles; impact page (items delivered, trips saved); OSRM polylines; mobile polish.

**Out of scope:** real payments (the checkout is a mock; in production it's Shipt's own checkout), auth, a real Shipt API (Shipt's developer APIs are partner-gated, so we mock a "Send via Shipt" handoff), SMS or push, a database, multi-driver VRP with more than 2 drivers, native apps.

## Public store and grocery APIs (other retailers are part of the product)
ShiptGiving shows real stores from many retailers as pickup points, not just one chain. That matches Shipt's multi-retailer marketplace.
| API | What we use it for | Key | Where |
|---|---|---|---|
| **OpenStreetMap Overpass** | Live lookup of real grocery and pharmacy stores near a partner or donor (Publix, Piggly Wiggly, Target, Walmart, ALDI, CVS, Walgreens, Winn-Dixie, Whole Foods) | none | `src/lib/stores/osm.ts`, `GET /api/stores?lat=&lng=` |
| **OSM snapshot (via Nominatim)** | The same real locations, cached, for when Overpass is busy (it often is) | none | `src/lib/stores/snapshot.ts` |
| **Open Food Facts** | Name, brand and photo for **food** items (it's a food database, so don't use it for socks or blankets) | none | `src/lib/stores/products.ts`, `GET /api/products?q=` |
| **Kroger Developer API** | Optional live shelf price (`KROGER_CLIENT_ID`/`SECRET` in `.env.local`) | free account | same |
Shipt itself has no public consumer API, so "Send via Shipt" mocks Shipt's existing gift-order checkout.

## Stack
- **Next.js (App Router) + TypeScript + Tailwind**, created fresh during build time with `create-next-app` in `shiptgiving/`. Add shadcn/ui components only as needed.
- **Leaflet + react-leaflet** with OpenStreetMap tiles for maps.
- **@anthropic-ai/sdk** (Claude) for need parsing only. `ANTHROPIC_API_KEY` goes in `.env.local`, with a keyword fallback when it's missing.
- **OSRM public demo server** for drive times and route lines; **NWS api.weather.gov** for weather. Both are free and need no key. Send a generic `User-Agent`.
- **State:** an in-memory store on the Next server (kept on `globalThis` so it survives hot reload). Every view polls `GET /api/state` every 2 seconds. No database.
- **Design:** Shipt's design language, spec in `docs/context/shipt-design.md` (Part 2). Tokens live in `shiptgiving/src/app/globals.css` as Tailwind v4 theme colors; font is Plus Jakarta Sans via `next/font`. Light only, no dark mode.
- **Tests:** Vitest for the routing engine and fee split only.
- Run: `cd shiptgiving && npm install && npm run dev`, then open http://localhost:3000.

## Data contract (`shiptgiving/src/lib/types.ts`; the lead owns it, so ask before changing it)
```ts
export type LatLng = { lat: number; lng: number };
export type Window = { days: number[]; open: string; close: string }; // days 0=Sun; "09:00"
export type Feature = "weatherSurge" | "perishables" | "dormKits" | "classroom" | "confidential";
export type Partner = {
  id: string; name: string; mission: string; neighborhood: string;
  address: string; location: LatLng;
  dropPoint?: { address: string; location: LatLng }; // used when confidential
  receiving: Window[];
  accepts: { newOnly: boolean; perishables: boolean; porchPickup: boolean; refuses: string[] };
  features: Feature[];
};
export type Store = { id: string; name: string; address: string; location: LatLng };
export type CatalogItem = { id: string; name: string; category: string; price: number; storeIds: string[] };
export type Urgency = "normal" | "high" | "urgent";
export type Need = {
  id: string; partnerId: string; itemId: string; title: string;
  qtyNeeded: number; qtyPledged: number; qtyReceived: number;
  urgency: Urgency; surgeReason?: string; deadline?: string; createdAt: string;
};
export type Fulfillment = "shipt" | "volunteer" | "porch";
export type PledgeStatus = "pledged" | "batched" | "picked_up" | "delivered" | "received";
export type Pledge = {
  id: string; needId: string; partnerId: string; donorName: string; qty: number;
  fulfillment: Fulfillment; storeId?: string; porch?: LatLng;
  cost: { items: number; deliveryShare: number; service: number; total: number };
  status: PledgeStatus; createdAt: string;
};
export type Stop = {
  id: string; kind: "start" | "pickup" | "dropoff"; label: string; location: LatLng;
  pledgeIds: string[]; window?: { open: string; close: string }; eta?: string;
};
export type RoutePlan = {
  driver: "shipt" | "volunteer"; stops: Stop[];
  minutes: number; miles: number; naiveMinutes: number; naiveMiles: number;
  polyline?: LatLng[];
};
export type Weather = { lowF: number; alerts: string[]; surge: boolean; reason?: string; simulated: boolean };
export type AppState = { partners: Partner[]; stores: Store[]; catalog: CatalogItem[]; needs: Need[]; pledges: Pledge[]; weather: Weather };
```

## Scaffold notes (merged 11:35)
- `useAppState()` from `@/lib/use-app-state` gives any client view the live `AppState` (polls every 2 s) plus `refresh()`.
- Store functions in `@/lib/store`: `getState`, `addPledge`, `setPledgeStatus`, `addNeeds(partnerId, items)`, `updateNeeds(fn)`, `setWeather(w)`, `setStores(s)`, `resetState`. They throw `StoreError` with an HTTP status; use `errorResponse()` from `@/lib/http` in route handlers.
- **Seed data:** Viraj exports `partners`, `catalog` and `needs` from `src/data/index.ts`; then the lead switches one import in `store.ts` from `@/lib/seed-stub`. Stores come from `src/lib/stores/snapshot.ts`.
- **Fees:** `store.ts` has a temporary `estimateCost` ($9.99 batch fee ÷ donors, 5% service on Shipt orders, $0 for volunteers). Emma's `src/lib/fees.ts` should export `pledgeCost(price, qty, fulfillment, donorsInBatch): PledgeCost` with the same rules, and the lead swaps it in.
- `POST /api/state {"reset": true}` restores the seed (demo reset).

## API (Next route handlers under `shiptgiving/src/app/api/`)
| Method and path | Body | Returns | Owner |
|---|---|---|---|
| `GET /api/state` | none | `AppState` | rmaytr |
| `POST /api/pledges` | `{needId, qty, fulfillment, donorName, storeId?, porch?}` | `Pledge` (also bumps `need.qtyPledged`) | rmaytr |
| `PATCH /api/pledges/[id]` | `{status}` | `Pledge` (`received` bumps `qtyReceived`) | rmaytr |
| `POST /api/route-plan` | `{start: LatLng, driver, pledgeIds?}` | `RoutePlan` | rmaytr |
| `GET /api/stores?lat=&lng=` | none | `{stores: Store[], source}` | rmaytr |
| `GET /api/products?q=` | none | `{name, brand, image, barcode, krogerPrice?, sources}` | rmaytr |
| `POST /api/needs` | `{partnerId, items: {itemId, title, qty, urgency}[]}` | `Need[]` | Viral-W |
| `POST /api/parse-need` | `{partnerId, text}` | `{items: {itemId, title, qty, urgency}[]}` | Viral-W |
| `GET /api/weather` / `POST /api/weather` | `{simulate?: "cold" \| "heat" \| null}` | `Weather` (applies the surge to Firehouse needs) | Viral-W |

## Owners
| Area | Owner | Folders (inside `shiptgiving/`) |
|---|---|---|
| Scaffold, types, store, core API, store/grocery APIs, routing engine, driver view, README | `rmaytr` (lead) | `src/lib/types.ts`, `src/lib/store.ts`, `src/lib/seed-stub.ts`, `src/lib/use-app-state.ts`, `src/lib/http.ts`, `src/lib/stores/`, `src/app/api/stores`, `src/app/api/products`, `src/lib/routing/`, `src/app/api/state`, `src/app/api/pledges`, `src/app/api/route-plan`, `src/app/driver/`, `src/app/layout.tsx`, `src/components/nav/`, `README.md` |
| Donor experience | `mulimangila` | `src/app/page.tsx`, `src/app/p/`, `src/components/donor/`, `src/lib/fees.ts` |
| Partner portal, seed data, AI parsing, weather | `Viral-W` | `src/app/partner/`, `src/components/partner/`, `src/data/`, `src/lib/ai.ts`, `src/lib/weather.ts`, `src/app/api/needs`, `src/app/api/parse-need`, `src/app/api/weather` |
| Shared UI primitives (`src/components/ui/`) | whoever needs it first; post on the board | |

## Timeline (today, CT)
| Time | Milestone |
|---|---|
| 11:15 | Spec merged; teammates start their agents |
| 11:40 | Lead pushes the scaffold: `create-next-app`, types, store with stub seed, `/api/state`, nav shell. Until then, teammates build components against the types above. |
| 12:00 | Viraj: real seed data merged. Emma: feed and partner page on real state. |
| 12:45 | **End-to-end slice:** pledge → batch route → delivered → partner confirms → meter fills |
| 1:30 | Weather Surge, AI parsing, fee split, map polish |
| 2:10 | Record the backup demo video |
| 2:30 | Submit (deadline 2:59) |

## Risks and what we do about them
| Risk | Mitigation |
|---|---|
| Delivery arrives when the nonprofit is closed | Checkout only offers slots inside receiving windows; the router enforces windows; if a stop would be late, it moves to the next window |
| Over-pledging | 15-minute quantity hold; needs close at 100% |
| Refused or unsafe items | Item-level accept rules; porch pickup new or sealed only; perishables Shipt same-day only; the driver can decline |
| Fake nonprofits | EIN verification and manual approval before posting |
| Shelter address safety | Confidential partners use a public drop point |
| Volunteer liability | Volunteers drive their own goods under platform terms; no Shipt insurance involved; they never see confidential addresses |
| Shared-cart billing complexity | One pledge = one order = one payment; only the delivery fee is shared, via authorize-then-settle |
| Shipt support load | Partner receipt confirmation + status tracking, so the platform handles donation questions |
| Tax promises | Only generate the acknowledgment; never promise a deduction. In 2026 the non-itemizer deduction is cash only, so in-kind gifts need itemizing ([IRS](https://www.irs.gov/newsroom/one-big-beautiful-bill-provisions)) |
| API outage during the demo | OSRM fallback to straight-line; AI fallback to keywords; weather "simulate" toggle |

## Decisions log
- 11:15. Chose ShiptGiving over a Shipt dispatch integration: Shipt already supports gift orders to any address, so the integration needs no new Shipt systems, labor or money handling.
- 11:15. No database: in-memory store plus polling is enough for a one-laptop live demo and keeps the code small.
- 11:15. Routing runs on our own pickup-and-delivery heuristic over an OSRM matrix instead of a hosted VRP service: small n, no keys, and every line of it is explainable.
- 11:15. The fee is shared only for delivery; items are paid per pledge. This keeps Shipt's billing unchanged.
- 11:30. Renamed the product to **ShiptGiving**; the app folder is `shiptgiving/`.
- 11:30. Added public retailer and grocery APIs (OSM stores, Open Food Facts, optional Kroger prices), so many real Birmingham stores appear as pickup points.
- 12:10. Adopted Shipt's design language (`docs/context/shipt-design.md`): white canvas, near-black type, Totemeal bands, mint express pills, Target red for urgency only, full-pill CTAs, hairline cards, Plus Jakarta Sans. Shared tokens in `globals.css`.
