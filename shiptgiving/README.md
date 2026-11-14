# ShiptGiving

Birmingham nonprofits post what they need, like a wishlist. Anyone can fill a need in a few taps, and choose how it gets there:

- **Shipt delivers:** an ordinary Shipt gift order addressed to the nonprofit.
- **I'll drive it:** volunteer delivery, no fee.
- **Porch pickup:** a driver collects new items from your porch.

Pledges are then batched into routes for tomorrow's drivers, sized to the vehicles they actually drive and timed to each nonprofit's receiving hours.

Built at SHIPT Hacks 2026 ("Build a Better Birmingham") by team 404 Not Foundries. The full spec is in [`docs/context/project.md`](../docs/context/project.md). For a one-page overview see [`docs/OVERVIEW.md`](../docs/OVERVIEW.md); the in-app walkthrough is at `/how-it-works`.

## The problem in Birmingham

- **Firehouse Ministries** shelters 215+ men every night (29,509 shelter nights in 2025) and depends on in-kind donations of clothing and toiletries, collected through a static wish list. It opens its day shelter on any day under 40°F or with a heat advisory. ([home](https://firehouseshelter.com/), [FAQ](https://firehouseshelter.com/who-we-are/faq/))
- About **146,000 residents live in food deserts**, while Jones Valley Teaching Farm gives away everything it grows at one walk-up stand in a narrow weekly window. ([Bham Now](https://bhamnow.com/2024/11/14/how-to-find-healthy-food-in-birminghams-food-insecure-neighborhoods/))
- **Birmingham Promise** is growing from 50 to about 100 interns per semester plus 400 job shadowers, and its scholarship doesn't cover housing, meals or transportation. ([news](https://birminghampromise.org/?p=476), [FAQ](https://birminghampromise.org/about/faq/))
- Giving goods today takes effort: buy the item, find the drop-off hours, drive downtown, and hope it is still needed. Nonprofits end up with 60 of one thing and none of what they asked for.

ShiptGiving seeds 11 real Birmingham nonprofits (shelters, the food bank, education partners) with their locations, receiving hours and accept rules. Hours the partner hasn't published are marked as assumed.

## Run it

```bash
cd shiptgiving
npm install
cp .env.example .env.local   # optional keys, see below
npm run dev                   # http://localhost:3000
npm test                      # unit tests
npm run smoke                 # another terminal, with the dev server running
```

Use `SMOKE_URL=http://localhost:3003 npm run smoke` for another port (PowerShell: `$env:SMOKE_URL="http://localhost:3003"; npm run smoke`). The check changes test data, then restores the cold-night demo.
Keys are optional. `ANTHROPIC_API_KEY` goes in `shiptgiving/.env.local` and lets Claude turn a nonprofit's plain-text request into catalog items; without it (or if the call fails), parsing falls back to keyword matching. Kroger keys add live shelf prices; without them, prices are catalog estimates.

## Demo in 60 seconds

1. Open `/`. The app starts on a cold night: a simulated Weather Surge, tomorrow's drivers (2 school buses and a convertible) and a night of pledges already in.
2. Choose **Presenter** to see donor, nonprofit and driver side by side. **Cold night demo** or **Reset** brings that starting state back at any time.
3. Choose **Generate routes**: "2 XL routes + 1 S route", 308 items in 2 h 24 m instead of 4 h 21 m as separate round trips. That saves 1 h 57 m and 30 miles of driving.

## The views

| View | Path | What it does |
|---|---|---|
| **Home** | `/` | What ShiptGiving is, a live strip (urgent needs, items pledged, partners, weather surge) and a card for each view below. |
| **Give** | `/give`, `/p/[id]` | A Shipt-style feed: tonight's most urgent needs first, product cards with quick add, search and categories, and a live strip with the weather and recent pledges. Cards show which neighbors are already helping. The fill-a-need sheet covers quantity, the three delivery options, store picker and cost breakdown. Also partner pages, your pledges, and a written acknowledgment once the partner confirms receipt. |
| **Nonprofits** | `/partner` | Nonprofit staff post a need in plain English ("cold front tonight, need 40 pairs of men's socks"), see incoming pledges, and confirm receipt. Includes the Weather Surge panel, accept rules, dorm kits, the confidential-address notice, and a verification card (EIN, 501(c)(3) status, name and city checked against IRS records). |
| **Drivers** | `/driver` | "Tomorrow's drivers" (add or remove vehicles), Generate routes, a banner with the time and miles saved, a map with one color per route, and route cards with load, ETAs, late badges and Mark picked up / Mark delivered. |
| **Impact** | `/impact` | Items pledged and delivered, partners helped, value of goods, trips, minutes and miles saved by routing, progress per partner, recent activity. |
| **Shipt concept** | `/shipt`, `/shipt/order/[id]` | What ShiptGiving could look like as a section of the Shipt app: urgent needs, neighborhood stores, your community orders and order tracking. A mock; nothing is purchased or sent to Shipt. |
| **Presenter** | `/demo` | Donor, nonprofit and driver side by side on one screen, with Cold night demo, Generate routes and Reset. |

All views read the same state and refresh every 2 seconds, so a pledge made in one window shows up in the others.

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind**, one app. Pages are client components; all logic sits behind API route handlers in `src/app/api/`.
- **In-memory store** (`src/lib/store.ts`), kept on `globalThis` so it survives hot reload. Every write returns a new state object. There is no database: one Node process is enough for a one-laptop demo.
- **Polling:** `useAppState()` fetches `GET /api/state` every 2 seconds.
- **Seed data** in `src/data/`: 11 partners, 50 catalog items, 35 needs. The 13 stores come from an OpenStreetMap snapshot.
- **Start state:** `src/instrumentation.ts` loads the cold-night scenario when the server starts, so the app never opens empty. The demo reset returns to it.
- **Design:** Shipt's design language, written up in [`docs/context/shipt-design.md`](../docs/context/shipt-design.md). Colors are shared tokens in `src/app/globals.css`, the font is Plus Jakarta Sans, and the theme is light only.
- **Maps:** Leaflet with OpenStreetMap tiles.

| Method and path | Purpose |
|---|---|
| `GET /api/state` | The whole app state. `POST {"reset": true}` restores the blank seed (no pledges). |
| `POST /api/pledges`, `PATCH /api/pledges/[id]` | Make a pledge; move it along (`batched`, `picked_up`, `delivered`, `received`). |
| `POST /api/needs`, `POST /api/parse-need` | Publish needs; turn plain text into catalog items. |
| `GET /api/weather`, `POST /api/weather` | Current weather and surge; simulate cold or heat. |
| `POST /api/drivers`, `DELETE /api/drivers/[id]` | Tomorrow's drivers. |
| `POST /api/route-plan` | Plan routes for the open pledges and save them. |
| `GET /api/stores`, `GET /api/products` | Nearby stores; product name, brand, photo and optional price. |
| `GET /api/shipt/orders` | Each pledge as the gift order a Shipt platform integration would send (mock). |
| `POST /api/demo` | `seed` adds sample pledges; `cold-night` and `reset` both return to the starting cold-night state. |

## Public data and APIs

| Source | Used for | Key? |
|---|---|---|
| OpenStreetMap (Overpass, plus a Nominatim snapshot) | Real Birmingham grocery and pharmacy locations (Publix, Piggly Wiggly, Target, Walmart, ALDI, CVS, Walgreens, Winn-Dixie, Whole Foods) used as pickup points | No |
| Open Food Facts | Product names, brands and photos for food items | No |
| Kroger Developer API | Live shelf prices (optional) | Free account |
| OSRM public server | The road line drawn for each route | No |
| National Weather Service (api.weather.gov) | Tonight's low and heat alerts, which trigger the Weather Surge | No |
| ProPublica Nonprofit Explorer (IRS exempt-organization records) | A snapshot used to verify each partner; partners with no confirmed record stay unverified | No |
| Claude (Anthropic API) | Turning a nonprofit's plain-text need into catalog items | Yes (keyword fallback without it) |

Shipt has no public consumer API, so "Send via Shipt" is a mock of Shipt's existing gift-order checkout. No real payments happen.

## How the routing works

The planner (`src/lib/routing/`) is greedy and small on purpose, so every decision can be explained.

1. **Vehicle sizes.** Each driver has a vehicle, and the vehicle sets the route size: S compact (10 items), M sedan (25), L SUV or minivan (50), XL school bus (150). The capacities are our assumptions; the vehicle picker stands in for a VIN lookup.
2. **What gets routed.** Open "Shipt delivers" and "Porch pickup" pledges. Volunteers drive their own.
3. **Greedy fill, biggest vehicle first.** Pledges are grouped by drop-off partner. Each driver, largest first, takes groups in order of earliest closing time, then distance from the driver's start, loading pledges while they fit. A pledge bigger than the largest vehicle is split into vehicle-sized parts that can ride with different drivers. Whatever the fleet can't carry is reported as unrouted, and the fill-a-need sheet warns a donor whose pledge is more than tomorrow's drivers can carry.
4. **Shop, then deliver.** Each route visits all of its pickups (the chosen store, the store nearest the partner, or the donor's porch), then all of its drop-offs, so a pickup always comes before its drop-off. Stops at the same place are merged.
5. **Ordering.** Each phase is ordered by nearest neighbor and then improved with 2-opt (reverse any stretch of the path that makes it shorter).
6. **Times.** Drive time is straight-line distance × 1.3 at 25 mph, plus 5 minutes at every pickup and drop-off (parking, checkout, hand-off). ETAs run from a 9:00 AM start. A route's total covers the whole round trip, including the drive back to the start. A drop-off outside the partner's receiving hours is counted as late.
7. **Baseline.** Baseline = each donation as its own round trip, the way in-kind donations work today. A store order is start → store → nonprofit → back; a porch donor drives home → nonprofit → home. It uses the same distance model and the same 5 minutes per stop, so the saving comes from sharing trips and merging stops. Routes report minutes and miles against it.
8. **Confidential partners** are routed to their public drop point. A confidential partner with no drop point is never routed.

Known limits: stop time is a flat 5 minutes however much is loaded, the baseline assumes a store order starts where our driver starts, and a partner closed on the planning day is checked against the hours of its next open day.

## How we built it

Three people and several AI coding agents built this in one day.

- **Shared context.** Every agent reads [`AGENTS.md`](../AGENTS.md) and [`docs/context/project.md`](../docs/context/project.md) first, so they all work from the same spec, data contract and rules.
- **Folder ownership.** Each teammate owns a set of folders, listed in `AGENTS.md`. Agents edit only their owner's files and ask for a handoff otherwise.
- **An agent message board.** A pinned GitHub issue ([#2](https://github.com/404-Not-Foundries/TypeShipt/issues/2)) is the team channel. Agents post what they merged and which contracts changed, and read each other's posts through [`tools/board`](../tools/board). The routing contract, for example, was posted there for the driver view to build against.
- **Plan, build, review.** Work is planned before coding, built on one branch per task, checked with tests, type check, lint and a production build, reviewed, and merged in small pull requests.
- **Claude Code and Codex in parallel.** Each agent works in its own git worktree, so several features move at once without touching the same files. Work from one tool is reviewed with the other: the demo scenario and impact page were built by Codex and reviewed by Claude.
- **People decide.** The team lead assigns work and settles conflicts; agents don't reassign each other.

## Image credits

Item photos on the need cards are freely licensed (CC0, public domain, CC BY or CC BY-SA) and come from Wikimedia Commons, Flickr (via Openverse) and Open Food Facts. They were resolved once into a static snapshot, `src/lib/item-images.ts`, which lists the author and licence of every photo; the same list is on the Give page under "Photo credits". The photos illustrate the kind of item and are not the exact products. If a photo fails to load, the card falls back to the category line art.
