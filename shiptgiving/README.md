# ShiptGiving

Birmingham nonprofits post what they need, like a wishlist. Anyone can fill a need in a few taps, and choose how it gets there:

- **Shipt delivers:** an ordinary Shipt gift order addressed to the nonprofit.
- **I'll drive it:** volunteer delivery, no fee.
- **Porch pickup:** a driver collects new items from your porch.

Pledges are then batched into routes for tomorrow's drivers, sized to the vehicles they actually drive and timed to each nonprofit's receiving hours.

Built at SHIPT Hacks 2026 ("Build a Better Birmingham") by team 404 Not Foundries. The full spec is in [`docs/context/project.md`](../docs/context/project.md).

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
cp .env.example .env.local   # optional: ANTHROPIC_API_KEY, Kroger keys
npm run dev                   # http://localhost:3000
npm test                      # unit tests
```

Everything works without keys: need parsing falls back to keywords, and prices fall back to catalog estimates.

**One-click demo:** open `/demo` and choose **Cold night demo**. It resets the data, turns on a simulated cold-weather surge and adds a night of pledges. Then choose **Generate routes** to get "2 XL routes + 1 S route": 308 items in 2 h 24 m, instead of 4 h 21 m if every donation were its own round trip. That is 1 h 57 m and 30 miles of driving saved. The same button is on `/impact`, and Generate routes is also on `/driver`.

## The views

| View | Path | What it does |
|---|---|---|
| **Home** | `/` | What ShiptGiving is, a live strip (urgent needs, items pledged, partners, weather surge) and a card for each view below. |
| **Give** | `/give`, `/p/[id]` | Needs feed (urgent first, weather banner, filters), partner pages, and the fill-a-need sheet: quantity, the three delivery options, store picker, cost breakdown, your pledges and a written acknowledgment once the partner confirms receipt. |
| **Nonprofits** | `/partner` | Nonprofit staff post a need in plain English ("cold front tonight, need 40 pairs of men's socks"), see incoming pledges, and confirm receipt. Includes the Weather Surge panel, accept rules, dorm kits and the confidential-address notice. |
| **Drivers** | `/driver` | "Tomorrow's drivers" (add or remove vehicles), Generate routes, a map with one color per route, and route cards with load, ETAs, late badges and Mark picked up / Mark delivered. |
| **Impact** | `/impact` | Items pledged and delivered, partners helped, value of goods, trips and minutes saved by routing, progress per partner, recent activity. |

`/demo` is a presenter view that shows Give, Partner and Driver side by side with the demo controls. All views read the same state and refresh every 2 seconds, so a pledge made in one window shows up in the others.

## Architecture

- **Next.js (App Router) + TypeScript + Tailwind**, one app. Pages are client components; all logic sits behind API route handlers in `src/app/api/`.
- **In-memory store** (`src/lib/store.ts`), kept on `globalThis` so it survives hot reload. Every write returns a new state object. There is no database: one Node process is enough for a one-laptop demo.
- **Polling:** `useAppState()` fetches `GET /api/state` every 2 seconds.
- **Seed data** in `src/data/`: 11 partners, 50 catalog items, 35 needs. The 13 stores come from an OpenStreetMap snapshot.
- **Maps:** Leaflet with OpenStreetMap tiles.

| Method and path | Purpose |
|---|---|
| `GET /api/state` | The whole app state. `POST {"reset": true}` restores the seed. |
| `POST /api/pledges`, `PATCH /api/pledges/[id]` | Make a pledge; move it along (`batched`, `picked_up`, `delivered`, `received`). |
| `POST /api/needs`, `POST /api/parse-need` | Publish needs; turn plain text into catalog items. |
| `GET /api/weather`, `POST /api/weather` | Current weather and surge; simulate cold or heat. |
| `POST /api/drivers`, `DELETE /api/drivers/[id]` | Tomorrow's drivers. |
| `POST /api/route-plan` | Plan routes for the open pledges and save them. |
| `GET /api/stores`, `GET /api/products` | Nearby stores; product name, brand, photo and optional price. |
| `POST /api/demo` | `seed`, `cold-night` or `reset`. |

## Public data and APIs

| Source | Used for | Key? |
|---|---|---|
| OpenStreetMap (Overpass, plus a Nominatim snapshot) | Real Birmingham grocery and pharmacy locations (Publix, Piggly Wiggly, Target, Walmart, ALDI, CVS, Walgreens, Winn-Dixie, Whole Foods) used as pickup points | No |
| Open Food Facts | Product names, brands and photos for food items | No |
| Kroger Developer API | Live shelf prices (optional) | Free account |
| OSRM public server | The road line drawn for each route | No |
| National Weather Service (api.weather.gov) | Tonight's low and heat alerts, which trigger the Weather Surge | No |
| Claude (Anthropic API) | Turning a nonprofit's plain-text need into catalog items | Yes (keyword fallback without it) |

Shipt has no public consumer API, so "Send via Shipt" is a mock of Shipt's existing gift-order checkout. No real payments happen.

## How the routing works

The planner (`src/lib/routing/`) is greedy and small on purpose, so every decision can be explained.

1. **Vehicle sizes.** Each driver has a vehicle, and the vehicle sets the route size: S compact (10 items), M sedan (25), L SUV or minivan (50), XL school bus (150). The capacities are our assumptions; the vehicle picker stands in for a VIN lookup.
2. **What gets routed.** Open "Shipt delivers" and "Porch pickup" pledges. Volunteers drive their own.
3. **Greedy fill, biggest vehicle first.** Pledges are grouped by drop-off partner. Each driver, largest first, takes groups in order of earliest closing time, then distance from the driver's start, loading whole pledges while they fit. Anything too big for every vehicle is reported as unrouted.
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
