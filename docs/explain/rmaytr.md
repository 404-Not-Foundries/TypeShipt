# My part of ShiptGiving: the core, routing, drivers and the demo (rmaytr)

A 10-minute read so I can explain my code in my own words. Paths are relative to `shiptgiving/`.

I own the scaffold, the data contract, the in-memory store, the core API, the store and product APIs, the routing engine, the driver view, the presenter view, the Shipt concept pages, the home hub and the cold-night start state. My agents (Claude Code) wrote most of it from my plans. Codex built the demo scenario and the Impact page (PR #24), and Claude reviewed it (follow-ups in PR #28).

## What it does for the user

- **Everyone:** every view shows the same live state. A pledge made in one window shows up in the others within 2 seconds.
- **Drivers:** "Tomorrow's drivers" lists who is driving and what they drive (2 school buses and a convertible by default). One click on **Generate routes** gives each vehicle one route sized to what it can carry, on a map, with ETAs, late badges and Mark picked up / Mark delivered buttons. A banner shows the time and miles saved against each donation driven as its own round trip.
- **Presenter:** `/demo` puts the donor, nonprofit and driver views side by side, with a six-step demo script (click a step to focus its pane) and Cold night demo, Generate routes and Reset in the header.
- **Shipt concept:** `/shipt` shows ShiptGiving as a section of the Shipt app, and `/shipt/order/[id]` tracks one pledge as a Shipt gift order, including the order payload a platform integration would send. It is a mock: nothing is sent to Shipt.
- **Home and Impact:** `/` explains the idea with live numbers and a door for each role. `/impact` shows items pledged and delivered, partners helped, value of goods, and trips, minutes and miles saved.
- **Start state:** the server opens on a cold night (simulated surge, seeded drivers, 13 pledges), so the app is never empty. Reset returns to it.

## Files and what each one does

| File | What it does |
|---|---|
| `src/lib/types.ts` | The shared data contract: `Partner`, `Need`, `Pledge`, `Driver`, `RoutePlan`, `RouteSummary`, `AppState`, and the vehicle table (S 10, M 25, L 50, XL 150 items). |
| `src/lib/store.ts` | The in-memory store on `globalThis`. Every write validates input and commits a new state object: `addPledge`, `setPledgeStatus`, `addNeeds`, `updateNeeds`, `setWeather`, `addDriver`, `removeDriver`, `setRoutes`, `resetState`. |
| `src/lib/http.ts` | `errorResponse` (a `StoreError` becomes a JSON error with its status, anything else a generic 500) and `readJson` (bad JSON becomes `{}`). |
| `src/lib/use-app-state.ts` | The `useAppState()` hook: fetches `GET /api/state` every 2 s and exposes `refresh()`. |
| `src/lib/seed-stub.ts` | The placeholder seed used before Viraj's real data landed. |
| `src/app/api/state`, `pledges`, `pledges/[id]`, `drivers`, `drivers/[id]`, `route-plan`, `demo` | Thin route handlers: read JSON, call one store or routing function, return JSON. |
| `src/lib/stores/osm.ts`, `snapshot.ts` | Real Birmingham grocery and pharmacy stores from OpenStreetMap Overpass, with a cached snapshot when Overpass is busy. |
| `src/lib/stores/products.ts`, `src/app/api/products` | Product name, brand and photo from Open Food Facts, plus an optional Kroger shelf price. |
| `src/lib/routing/assign.ts` | Step 1: which driver carries which pledges (greedy, biggest vehicle first). |
| `src/lib/routing/order.ts` | Step 2: the stop order for one driver (shop, then deliver; nearest neighbor + 2-opt), ETAs and the baseline. |
| `src/lib/routing/geo.ts` | Distance model: straight-line miles × 1.3, at 25 mph. |
| `src/lib/routing/polyline.ts` | The road line drawn on the map, from the public OSRM server, with straight segments as the fallback. |
| `src/lib/routing/index.ts` | `planRoutes` (pure), `planFleet` (adds polylines) and `summarize` ("2 XL routes + 1 S route"). |
| `src/app/driver/page.tsx`, `src/components/driver/` | Driver view: drivers panel, Leaflet route map, route cards, summary banner, format helpers. |
| `src/app/demo/page.tsx` | Presenter split view: three iframes, the six-step demo script and the demo buttons. |
| `src/lib/demo.ts`, `src/instrumentation.ts` | The cold-night scenario and the hook that loads it when the server starts. |
| `src/app/impact/page.tsx`, `src/components/impact/` | Impact page and its demo controls (Codex built, Claude reviewed). |
| `src/lib/shipt-platform.ts`, `src/app/api/shipt/orders`, `src/app/shipt/`, `src/components/shipt/` | Each pledge as the gift order a Shipt platform integration would send, plus the concept pages. |
| `src/app/page.tsx` | Home hub: hero, a Needed tonight panel and the story in three steps (post, fill, deliver). |
| `src/app/layout.tsx`, `src/components/nav/role-nav.tsx` | Root layout, font and the header nav. |

## Data flow

1. **Read:** every page calls `useAppState()`, which polls `GET /api/state`. That returns the whole `AppState` from `getState()`.
2. **Pledge:** the fill-a-need sheet sends `POST /api/pledges {needId, qty, fulfillment, donorName, storeId?, porch?}`. `addPledge` validates it, prices it with Emma's `pledgeCost`, bumps `need.qtyPledged` and stores a `Pledge` with status `pledged`.
3. **Plan:** `POST /api/route-plan` runs `planFleet(getState())`, then `setRoutes(routes, unrouted, summary)`. Pledges on a route become `batched`.
4. **Drive:** route cards send `PATCH /api/pledges/[id] {status: "picked_up" | "delivered"}` to `setPledgeStatus`.
5. **Receive:** the partner portal sends `status: "received"`. `setPledgeStatus` adds the quantity to `need.qtyReceived` once, so the meter fills and the donor's receipt appears.
6. **Drivers:** `POST /api/drivers {name, vehicle}` → `addDriver`; `DELETE /api/drivers/[id]` → `removeDriver` (its route goes too and its pledges return to `pledged`).
7. **Demo:** `POST /api/demo {action: "seed" | "cold-night" | "reset"}`. Cold night and reset both call `loadColdNight()`.
8. **Shipt concept:** `GET /api/shipt/orders` maps each pledge through `toShiptOrder(pledge, state)`.

## The functions that matter

### 1. `addPledge` validates untrusted input before anything changes (`src/lib/store.ts`)
The API body is never trusted. A pledge must point at a real need, use a known fulfillment, be a whole number, and fit what is still open. A 409 tells the donor someone else got there first.

```ts
  const need = state.needs.find((n) => n.id === input.needId);
  if (!need) throw new StoreError("Unknown need", 404);
  if (!FULFILLMENTS.includes(input.fulfillment as Fulfillment)) throw new StoreError("Invalid fulfillment");
  const fulfillment = input.fulfillment as Fulfillment;
  const remaining = need.qtyNeeded - need.qtyPledged;
  const qty = Number(input.qty);
  if (!Number.isInteger(qty) || qty < 1) throw new StoreError("Quantity must be a whole number of at least 1");
  if (qty > remaining) throw new StoreError(`Only ${remaining} still needed`, 409);
  const partner = state.partners.find((p) => p.id === need.partnerId);
  if (fulfillment === "porch" && !partner?.accepts.porchPickup) throw new StoreError("This partner does not take porch pickups");
```

Then it commits a new state with `{ ...state, needs: ..., pledges: [...state.pledges, pledge] }`. Nothing is mutated in place.

### 2. `assignPledges`: greedy fill, biggest vehicle first (`src/lib/routing/assign.ts`)
Pledges are grouped by the partner they go to. Drivers are sorted biggest first. Each driver takes partner groups in order of earliest closing time, then distance from its start, and loads pledges while they fit. Anything left over is reported as unrouted. A pledge bigger than the biggest vehicle is split first (`splitPledge`).

```ts
  const drivers = [...state.drivers].sort((a, b) => b.capacity - a.capacity);
  const assignments = drivers.map((driver): Assignment => {
    const ordered = [...groups].sort(
      (a, b) => a.closes - b.closes || roadMiles(driver.start, a.drop) - roadMiles(driver.start, b.drop),
    );
    let load = 0;
    const pledges: Pledge[] = [];
    for (const group of ordered) {
      for (const p of group.pledges) {
        if (taken.has(p) || load + p.qty > driver.capacity) continue;
        taken.add(p);
```

### 3. `orderStops`: nearest neighbor, then 2-opt (`src/lib/routing/order.ts`)
`buildRoute` orders a driver's pickups first and its drop-offs second, so every item is bought before it is delivered. Each phase starts with nearest neighbor, then 2-opt keeps reversing any stretch of the path that makes it shorter until nothing improves.

```ts
  for (let improved = true; improved; ) {
    improved = false;
    for (let i = 0; i < path.length - 1; i++) {
      for (let j = i + 1; j < path.length; j++) {
        const candidate = [...path.slice(0, i), ...path.slice(i, j + 1).reverse(), ...path.slice(j + 1)];
        if (length(candidate) < length(path) - 1e-9) {
          path = candidate;
          improved = true;
        }
      }
    }
  }
```

### 4. The baseline: each donation as its own round trip (`src/lib/routing/order.ts`)
The "time saved" number is only honest if the baseline is fair. It uses the same distance model and the same 5 minutes per stop as the route, so the saving comes only from sharing trips and merging stops.

```ts
    // Baseline: each donation as its own round trip, the way in-kind donations work today.
    // A porch donor drives home -> nonprofit -> home; a store order is start -> store -> nonprofit -> start.
    const soloTrip = pledge.fulfillment === "porch" && pledge.porch
      ? [pledge.porch, drop, pledge.porch]
      : [driver.start, ...(pickup ? [pickup.location] : []), drop, driver.start];
    naiveMiles += pathMiles(soloTrip);
    naiveStops += soloTrip.length - 2;
```

On the cold-night data this gives "2 XL routes + 1 S route": 308 items in 2 h 24 m instead of 4 h 21 m as separate round trips.

### 5. `toShiptRecipient`: a pledge becomes a normal gift order, and shelter addresses stay private (`src/lib/shipt-platform.ts`)
A confidential partner is addressed to its public drop point. If it has none, there is no order at all, never a fallback to the real address.

```ts
/** Confidential recipients have no fallback to the shelter's address or coordinates. */
export function toShiptRecipient(partner: Partner): ShiptRecipient | null {
  const destination = partner.features.includes("confidential") ? partner.dropPoint : partner;
  if (!destination) return null;
  return { name: partner.name, address: destination.address, location: { ...destination.location } };
}
```

The same rule is in routing: `hasSafeDrop` in `assign.ts` never routes a confidential partner without a drop point.

## Design decisions, in our words

- **We chose Next.js API routes** because one app, one language and one `npm run dev` covers the pages and the server. Three people could build against the same types from minute one.
- **We chose an in-memory store plus 2-second polling** because a database and websockets add setup and failure modes that a one-laptop demo doesn't need. The store sits behind a handful of functions, so swapping in a database later changes one file.
- **We chose a greedy heuristic instead of a VRP solver** because the Shipt mentor told us Shipt buckets drivers by vehicle size (S to XL) and plans from tomorrow's drivers. Greedy fill plus 2-opt is small, runs in milliseconds, needs no API key, is unit-tested, and every step can be explained.
- **We chose straight-line × 1.3 at 25 mph for drive times** because it is deterministic, works offline and keeps tests stable. OSRM only draws the road line on the map.
- **We chose a gift order as the Shipt integration** because Shipt already supports gift delivery to another address. A ShiptGiving order is a gift order addressed to the nonprofit with a `community` tag: no new order type, no new labor, no money handling.
- **We start the app in the cold-night state** because an empty app shows nothing. `instrumentation.ts` loads it before the server takes requests, and Reset returns to it.
- **We validate at the store, not in the UI,** because the API is public. Every write checks its input and throws a `StoreError` with an HTTP status.

## Known limits

- State lives in one Node process. A restart or a second server instance loses it.
- Drive times are estimates, not live traffic. Stop time is a flat 5 minutes however much is loaded.
- The baseline assumes a store order starts where our driver starts.
- A partner closed on the planning day is checked against its next open day's hours (marked `shortcut:` in the code).
- Vehicle capacities are our assumptions; the vehicle picker stands in for Shipt's VIN lookup.
- No auth, no real payments, no real Shipt API (it is partner-gated).

## What's next

- A database (Postgres) behind the same store functions, and server-sent events instead of polling.
- An OSRM duration matrix for real drive times, with the straight-line model as the fallback.
- Real dates for multi-day scheduling, and per-item stop time.
- A real Shipt platform integration using the `toShiptOrder` shape as the starting point.

## Questions you might get about your code

- **Why no database?** It's a one-laptop demo and every view polls one server. The store is a few functions over one state object, so a database replaces one file, not the app.
- **Why polling instead of websockets?** Two seconds is fast enough to feel live, it works everywhere, and it's one `setInterval` in `use-app-state.ts`.
- **How do you stop over-pledging?** `addPledge` checks the quantity against what is still open and returns 409 if it's too much. The fill sheet also re-clamps as other donors pledge.
- **Is the routing optimal?** No, it's a heuristic: greedy assignment, then nearest neighbor and 2-opt. For the handful of stops on each route it runs in milliseconds, and every step can be explained and tested.
- **How does a pickup always come before its drop-off?** Each route visits all its pickups, then all its drop-offs. Precedence holds by construction.
- **What if a pledge is bigger than any vehicle?** `splitPledge` breaks it into vehicle-sized chunks that can ride with different drivers. What the whole fleet can't carry is shown as unrouted.
- **Where does "time saved" come from?** Each donation as its own round trip, with the same distance model and the same 5 minutes per stop. The saving is shared trips and merged stops, nothing else.
- **Do you use OSRM for the times?** No, only for the line on the map. Times use straight-line distance × 1.3 at 25 mph, which is deterministic and works offline.
- **How do you protect a shelter's address?** Confidential partners are routed and addressed to a public drop point only. Without one they are never routed and never get an order.
- **What would Shipt have to build?** Nothing new: it's a gift order to the nonprofit's address with a `community` tag, paid through the normal checkout.
- **How is it tested?** Vitest: 14 test files, 111 tests. `routing.test.ts` covers capacity, biggest-first, precedence, the baseline, late stops, drop points and splits; `store.test.ts` covers validation and fees; `demo.test.ts` checks the cold night gives "2 XL routes + 1 S route" on any weekday.
- **What did AI write and what did you write?** I planned each piece, my agents wrote it on its own branch, and every PR was tested and reviewed before merge. Codex built the Impact page and Claude reviewed it.

## How I'd explain my part (30 seconds)

"Under the three views is one small server. Every page polls `/api/state` every two seconds, so a pledge made by a donor shows up for the nonprofit and the driver right away. The store validates every write, so you can't over-pledge. When we hit Generate routes, the planner looks at tomorrow's drivers, two school buses and a convertible, fills the biggest vehicle first by each nonprofit's closing time, and orders each route shop-then-deliver with 2-opt. That's 2 XL routes and 1 small route: 308 items in 2 hours 24 minutes instead of 4 hours 21 as separate trips. And every Shipt delivery is just a gift order Shipt already supports, addressed to the nonprofit."
