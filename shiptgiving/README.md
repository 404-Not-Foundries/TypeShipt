# ShiptGiving: developer guide

This is the Next.js app behind ShiptGiving. For what it does, screenshots, the architecture diagrams and the team, see the [project README](../README.md). The same story is in the app at `/how-it-works`.

## Run it

Requires Node.js 20+.

```bash
cd shiptgiving
npm install
cp .env.example .env.local   # optional keys, see below
npm run dev                   # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm test` | Vitest unit tests (121 tests in 17 files) |
| `npx tsc --noEmit` | Type check (run `npm run build` once first so Next generates its route types) |
| `npm run build` / `npm start` | Production build and server |
| `npm run smoke` | 26 end-to-end checks against a running server (see below) |
| `npm run lint` | ESLint |

Keys are optional and go in `shiptgiving/.env.local`:

- `ANTHROPIC_API_KEY`: lets Claude turn a nonprofit's plain-text request into catalog items. Without it, or if the call fails, parsing falls back to keyword matching.
- `KROGER_CLIENT_ID` and `KROGER_CLIENT_SECRET`: live shelf prices. Without them, prices are catalog estimates.

## Smoke check

`npm run smoke` drives the whole flow against a running server: every page, posting and parsing a need, the cold-weather surge, a pledge of each kind, over-pledge refusal, route planning, confirming receipt, and the confidential-address guard on the Shipt payloads. It changes data, then restores the cold-night demo.

```bash
npm run dev                                         # terminal 1
npm run smoke                                       # terminal 2
SMOKE_URL=http://localhost:3003 npm run smoke       # another port
```

In PowerShell, set the port with `$env:SMOKE_URL="http://localhost:3003"; npm run smoke`.

## Demo in 60 seconds

1. Open `/`. The app starts on a cold night: a simulated Weather Surge, tomorrow's drivers (2 school buses and a convertible) and a night of pledges already in.
2. Choose **Presenter** to see donor, nonprofit and driver side by side. **Cold night demo** or **Reset** brings that starting state back at any time.
3. Choose **Generate routes**: "2 XL routes + 1 S route", 308 items in 2 h 24 m instead of 4 h 21 m as separate round trips. That saves 1 h 57 m and 30 miles of driving.

## Data and state

- **One app**: pages are client components; all logic sits behind route handlers in `src/app/api/`, which read JSON, call one store function and return JSON. Partner verification runs as a server action (`src/app/partner/actions.ts`).
- **In-memory store**: `src/lib/store.ts` keeps the state on `globalThis` so it survives hot reload. Every write validates its input and commits a new state object. There is no database.
- **Polling**: `useAppState()` (`src/lib/use-app-state.ts`) fetches `GET /api/state` every 2 seconds, so a pledge made in one window shows up in the others.
- **Seed data** in `src/data/`: 11 partners, 50 catalog items, 35 needs and the IRS records. The 13 stores come from an OpenStreetMap snapshot (`src/lib/stores/snapshot.ts`).
- **Start state**: `src/instrumentation.ts` loads the cold-night scenario (`src/lib/demo.ts`) when the server starts, so the app never opens empty. The demo reset returns to it.
- **Design**: Shipt-inspired tokens in `src/app/globals.css` (white and near-black canvas, warm cream, mint delivery pills, red for urgency), Plus Jakarta Sans, light theme only. Maps use Leaflet with OpenStreetMap tiles.

## API routes

| Method and path | Purpose |
|---|---|
| `GET /api/state` | The whole app state. `POST {"reset": true}` restores the blank seed (no pledges). |
| `POST /api/pledges`, `PATCH /api/pledges/[id]` | Make a pledge; move it along (`batched`, `picked_up`, `delivered`, `received`). |
| `POST /api/needs`, `POST /api/parse-need` | Publish needs; turn plain text into catalog items (nothing is saved). |
| `GET /api/weather`, `POST /api/weather` | Current weather and surge; simulate cold or heat. |
| `POST /api/drivers`, `DELETE /api/drivers/[id]` | Tomorrow's drivers. |
| `POST /api/route-plan` | Plan routes for the open pledges and save them. |
| `GET /api/stores`, `GET /api/products` | Nearby stores; product name, brand, photo and optional price. |
| `GET /api/shipt/orders` | Each pledge as the gift order a Shipt platform integration would send (mock). |
| `POST /api/demo` | `seed` adds sample pledges; `cold-night` and `reset` both return to the starting cold-night state. |

## How the routing works

The planner (`src/lib/routing/`) is greedy and small on purpose, so every decision can be explained. `assign.ts` decides who carries what; `order.ts` orders each route and computes ETAs and the baseline; `polyline.ts` fetches the road line from OSRM.

1. **Vehicle sizes**: each driver has a vehicle, and the vehicle sets the route size: S compact (10 items), M sedan (25), L SUV or minivan (50), XL school bus (150). The capacities are our assumptions; the vehicle picker stands in for a VIN lookup.
2. **What gets routed**: open "Shipt delivers" and "Porch pickup" pledges. Volunteers drive their own.
3. **Greedy fill, biggest vehicle first**: pledges are grouped by drop-off partner. Each driver, largest first, takes groups in order of earliest closing time, then distance from the driver's start, loading pledges while they fit. A pledge bigger than the largest vehicle is split into vehicle-sized parts that can ride with different drivers. Whatever the fleet can't carry is reported as unrouted, and the fill-a-need sheet warns a donor whose pledge is more than tomorrow's drivers can carry.
4. **Shop, then deliver**: each route visits all of its pickups (the chosen store, the store nearest the partner, or the donor's porch), then all of its drop-offs, so a pickup always comes before its drop-off. Stops at the same place are merged.
5. **Ordering**: each phase is ordered by nearest neighbor and then improved with 2-opt (reverse any stretch of the path that makes it shorter).
6. **Times**: drive time is straight-line distance × 1.3 at 25 mph, plus 5 minutes at every pickup and drop-off (parking, checkout, hand-off). ETAs run from a 9:00 AM start. A route's total covers the whole round trip, including the drive back to the start. A drop-off outside the partner's receiving hours is counted as late.
7. **Baseline**: each donation as its own round trip, the way in-kind donations work today. A store order is start → store → nonprofit → back; a porch donor drives home → nonprofit → home. It uses the same distance model and the same 5 minutes per stop, so the saving comes from sharing trips and merging stops.
8. **Confidential partners** are routed to their public drop point. A confidential partner with no drop point is never routed.

Known limits: stop time is a flat 5 minutes however much is loaded, the baseline assumes a store order starts where our driver starts, and a partner closed on the planning day is checked against the hours of its next open day.

## Tests

| File | Covers |
|---|---|
| `lib/routing/routing.test.ts` | Capacity, biggest vehicle first, spill-over, unrouted, pickups before drop-offs, baseline, stop time, late stops, drop points, oversized splits |
| `lib/store.test.ts` | Pledge validation, over-pledge refusal, fee split, received counted once, drivers |
| `lib/demo.test.ts` | Demo pledges; cold night gives "2 XL routes + 1 S route" on any weekday; reset and start state |
| `lib/fees.test.ts` | `pledgeCost` for each fulfillment, mileage value |
| `lib/ai.test.ts` | Keyword parser: the demo sentence, real catalog ids only, defaults, partner fit |
| `lib/weather.test.ts` | Surge rule and urgency restore |
| `lib/shipt-platform.test.ts` | Gift-order shape, nearest store, confidential addresses never exposed, Birmingham order day |
| `lib/item-images.test.ts` | Every catalog item has a photo |
| `data/seed.test.ts` | Seed minimums, unique ids, links, perishables rules, drop points |
| `components/partner/verification*.test.ts(x)` | IRS checks, live refresh, cache and fallback, religious exemption |
| `components/partner/confidential.test.tsx`, `dorm-kit-data.test.ts` | Confidential addresses never rendered; dorm kit lines |
| `components/donor/*.test.ts`, `components/driver/format.test.ts`, `components/explain/excerpts.test.ts` | Helper counts and sorting; driver formatting and late flags; code excerpts on `/how-it-works` match the source |

## Deploying

The live demo at https://shiptgiving.vercel.app is deployed by hand with the Vercel CLI from this folder (`vercel --prod`), not on every merge. Set `ANTHROPIC_API_KEY` in the Vercel project to enable Claude parsing. Each server instance keeps its own in-memory state and starts in the cold-night scenario.

## Item photos

Item photos are resolved once into a static snapshot, `src/lib/item-images.ts`, which lists the author and license of every photo; the Give page shows the same list under "Photo credits". Photos are hot-linked from Wikimedia Commons, Flickr and Open Food Facts; if one fails to load, the card falls back to the category line art.
