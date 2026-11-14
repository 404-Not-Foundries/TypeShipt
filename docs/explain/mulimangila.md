# Emma (`mulimangila`): the donor experience

Everything a neighbor sees when they give: the **Give** feed, a partner's page, the fill-a-need sheet, the fee split, "fill it together", your pledges and the receipt. Main paths: `shiptgiving/src/app/give/`, `src/app/p/`, `src/components/donor/`, `src/lib/fees.ts`.

> The lead's UX pass ([PR #55](https://github.com/404-Not-Foundries/TypeShipt/pull/55)) restyled the feed, cards and sheet on top of this work: photo need cards, one sticky filter bar with sort, and a 3-step fill sheet. The rules and functions below are unchanged.

## What it does for the user

1. **Give (`/give`)** opens on a headline built from live data ("Birmingham shelters need N items before tonight's freeze" during a surge). Below it are a live strip (tonight's weather and the latest pledge), one sticky filter bar (search, nonprofit, sort by most urgent / closest / almost filled, category chips with counts), the **urgent** band, partner tiles and a grid of every need as a Shipt-style card with an item photo.
2. **A card** shows the price per item, the partner (with a check mark if it's a verified nonprofit), a progress meter (`12/40`), a pill ("Cold night", "Only 3 left", "Filled together") and who is already helping ("Maya, Jordan and 4 neighbors helping").
3. **Tap Fill** and the fill-a-need sheet opens in three steps (quantity, delivery, confirm) with the price pinned at the bottom: pick a quantity, then how it gets there (**Shipt delivers**, **I'll drive it**, **Porch pickup**). Shipt shows a store picker, and the other two show the receiving hours and the distance. A cost breakdown shows what you pay, with the $9.99 delivery fee split across everyone in the batch.
4. **After you pledge,** it appears in **Your pledges** with a live status (Pledged → In a batch → On the way → Delivered → Received ✓), a Track order link, and **View receipt** once the nonprofit confirms receipt.
5. **When a need hits 100%** on any screen, everyone who has the page open gets a short "Filled together" celebration that names the helpers.
6. **Partner page (`/p/[id]`)** shows the mission, hours, accept rules, a "Neighbors who showed up" thank-you wall and the partner's open needs.

## Files and what each one does

| File | What it does |
|---|---|
| `src/app/give/page.tsx` | The feed: headline, sections (urgent carousel, partners, all needs), search and category filter, opens the sheet. |
| `src/app/p/[id]/page.tsx` + `components/donor/partner-view.tsx` | The partner page. The page only adds `<Suspense>`; the view reads the route id. |
| `components/donor/fill-sheet.tsx` | The bottom sheet: quantity, delivery option, store, name, submit to `POST /api/pledges`. |
| `components/donor/delivery-options.tsx` | The three options as radio cards; hides porch pickup when the partner doesn't take it or the item is perishable. |
| `components/donor/cost-breakdown.tsx` | Items, delivery share ("$9.99 ÷ 3 donors"), service fee, and "You pay". |
| `components/donor/store-picker.tsx`, `quantity-stepper.tsx` | The store list (nearest to the drop-off first) and the − / + stepper. |
| `components/donor/need-card.tsx` | One product card: art, pill, price, partner link, meter, helpers line. |
| `components/donor/sort-needs.ts` | The feed order (open first, urgent first, almost-full first, surged first, newest). |
| `components/donor/community.ts` | "Fill it together" helpers: who is helping each need, recent activity, the "last few" rule. |
| `components/donor/live-strip.tsx`, `neighbor-wall.tsx`, `filled-celebration.tsx` | Live weather and activity line, the thank-you wall, the 100% celebration. |
| `components/donor/my-pledges.tsx`, `pledge-history.ts`, `receipt.tsx` | Your pledges (ids kept in `localStorage`, no account), statuses, and the written acknowledgment. |
| `components/donor/geo.ts`, `donor-location.ts` | Distance helpers, the drop-off for confidential partners, hours formatting; the donor's location (defaults to UAB until they share it). |
| `src/lib/fees.ts` | `pledgeCost`, `amountCharged`, `mileageValue`: the money rules. Tested in `src/lib/fees.test.ts`. |

## Data flow

- **Read:** every donor view calls `useAppState()` (`src/lib/use-app-state.ts`), which polls `GET /api/state` every 2 seconds and returns the whole `AppState` (`partners`, `needs`, `catalog`, `stores`, `pledges`, `weather`, `drivers`). Cards, meters, helpers and statuses are all derived from that one object, so a pledge made in another window shows up within 2 seconds.
- **Write:** the sheet sends `POST /api/pledges` with `{needId, qty, fulfillment, donorName, storeId?, porch?}`. On the server, `addPledge` in `src/lib/store.ts` validates it again, caps the quantity at what is still open, computes the cost with **our** `pledgeCost`, and bumps `need.qtyPledged`. It returns a `Pledge`.
- **Weather:** `/give` calls `GET /api/weather` once on load, so a live Weather Surge is applied even if nobody has opened the partner portal yet.
- **Types used:** `Need`, `Partner`, `Pledge`, `PledgeCost`, `Fulfillment` (`"shipt" | "volunteer" | "porch"`) and `PledgeStatus`, all from `src/lib/types.ts`.

## The functions that matter

### 1. `pledgeCost`: what a pledge costs (`src/lib/fees.ts`)
One function holds the pricing rules, and both the sheet (for the preview) and the server (for the saved pledge) call it, so the number you see is the number that's stored. Shipt orders pay items + a share of the $9.99 batch fee + 5% service. Porch pickups pay the delivery share only. Volunteers pay nothing extra.

```ts
export function pledgeCost(price: number, qty: number, fulfillment: Fulfillment, donorsInBatch: number): PledgeCost {
  const items = round2(price * qty);
  const donors = Math.max(1, Math.floor(donorsInBatch) || 1);
  const deliveryShare = fulfillment === "volunteer" ? 0 : round2(BATCH_DELIVERY_FEE / donors);
  const service = fulfillment === "shipt" ? round2(items * SERVICE_RATE) : 0;
  return { items, deliveryShare, service, total: round2(items + deliveryShare + service) };
}
```

### 2. `amountCharged`: what the donor actually pays (`src/lib/fees.ts`)
`cost.total` keeps the full item value for the receipt, but volunteers and porch donors already own the goods. This function is the "You pay" line, so we never charge someone for items they bring themselves.

```ts
export function amountCharged(cost: PledgeCost, fulfillment: Fulfillment): number {
  if (fulfillment === "shipt") return cost.total;
  return fulfillment === "porch" ? cost.deliveryShare : 0;
}
```

### 3. `sortNeeds`: what shows first (`src/components/donor/sort-needs.ts`)
A single comparator decides the feed. Open needs come before filled ones, then urgent ones, then almost-full needs (so a neighbor finishes them), then weather-surged needs, then the newest.

```ts
export function sortNeeds(needs: Need[]): Need[] {
  return [...needs].sort(
    (a, b) =>
      Number(isOpen(b)) - Number(isOpen(a)) ||
      RANK[a.urgency] - RANK[b.urgency] ||
      Number(isLastFew(b)) - Number(isLastFew(a)) ||
      Number(!!b.surgeReason) - Number(!!a.surgeReason) ||
      b.createdAt.localeCompare(a.createdAt),
  );
}
```

### 4. The fill sheet's batch size and live clamp (`src/components/donor/fill-sheet.tsx`)
The sheet counts how many donors are already in this partner's open batch (not volunteers) and adds you, which is the divisor in "$9.99 ÷ N". It also re-clamps your quantity every render, because other donors may pledge while the sheet is open.

```ts
  const qty = Math.max(0, Math.min(qtyWanted, remaining)); // re-clamped as other donors pledge
  // ...
  const donors =
    state.pledges.filter((p) => p.partnerId === partner.id && p.fulfillment !== "volunteer" && (p.status === "pledged" || p.status === "batched")).length + 1;
  const cost = pledgeCost(item?.price ?? 0, qty, fulfillment, donors);
```

### 5. `helpersByNeed`: "fill it together" (`src/components/donor/community.ts`)
It turns the pledge list into "who is helping each need": distinct named helpers (newest first), anonymous pledges counted once each, plus a pledge count. Cards, the live strip, the neighbor wall and the celebration all read from it. It's derived data only, so it needed no new API or store field.

```ts
export function helpersByNeed(pledges: Pledge[]): Map<string, Helpers> {
  const out = new Map<string, Helpers>();
  for (const p of [...pledges].reverse()) {
    const h = out.get(p.needId) ?? { names: [], people: 0, count: 0 };
    h.count += 1;
    const name = shortName(p.donorName.trim());
    if (!name || name === ANON) h.people += 1;
    else if (!h.names.includes(name)) {
```

## Design decisions and trade-offs

- **We chose one pledge = one small order** because it keeps Shipt's billing unchanged: each donor pays for their own items. Only the delivery fee is shared, and the share drops as more neighbors join the batch.
- **We chose to compute the cost in one shared function** (`pledgeCost`) and call it on both client and server, because a preview that disagrees with the saved price is the worst bug a checkout can have. The server is still the source of truth.
- **We chose `localStorage` for "Your pledges"** because there are no accounts. A donor can still see the status and the receipt without signing up. The trade-off: it's per browser, so clearing site data loses the list.
- **We chose to hide porch pickup** when the partner doesn't accept it or the item is perishable, instead of showing an error later. The server (`addPledge`) enforces the same rule.
- **We chose a receipt that never promises a deduction.** It says "No goods or services were provided in return" (what the IRS asks for on gifts of $250 and up) and "consult a tax professional", because in-kind gifts are only deductible for itemizers.
- **We chose Shipt's look** (product cards, pills, mint "Same-day" tag, full-pill buttons) from `docs/context/shipt-design.md`, so the feed could plausibly live inside the Shipt app.
- **Accessibility:** the sheet is a real `role="dialog"` that focuses once and closes on Escape, the options are radio inputs, and tap targets are at least 44px (the last donor PR).

## Known limits and what's next

- The checkout is a mock. In production, "Send via Shipt" would hand off to Shipt's existing gift-order checkout.
- The batch count in the sheet is a snapshot: if more donors join later, their shares are lower than the first donor's. A real version would authorize first and settle the final share when the batch closes.
- The donor location defaults to UAB until the donor taps "Use my location".
- Next: past-donor alerts on surge nights, saved donor profiles, a real Shipt deep link.

## Questions you might get about your code

- **How does the shared delivery fee work?** `pledgeCost` divides the $9.99 batch fee by the number of open, driver-delivered pledges for that partner, plus you. Volunteers don't count, because they drive themselves.
- **What stops two people over-filling the same need?** The sheet clamps your quantity to what is left on every poll, and the server's `addPledge` rejects anything above the remaining amount with a 409 ("Only N still needed").
- **Why does a porch donor pay anything?** A batched driver still has to drive to the porch, so porch donors pay their share of the delivery fee, but no item cost and no service fee.
- **Is the receipt a tax document?** It's a written acknowledgment with the details the IRS asks for. It never promises a deduction and tells the donor to consult a tax professional.
- **How do cards update live?** Every view polls `GET /api/state` every 2 seconds through `useAppState()`, and the meters, helpers and statuses are derived from that state on each render.
- **How is the urgent row decided?** The weather surge on the server marks matching needs `urgent` with a `surgeReason`, and `sortNeeds` plus the feed's urgent filter put them in the top carousel.
- **How did you test it?** `src/lib/fees.test.ts` covers the fee split, porch and volunteer rules, bad batch sizes and mileage. `community.test.ts` covers the helpers line.

## How I'd explain my part (30 seconds)

> "This is the donor side. It's a cold night, so the shelters' cold-weather needs are at the top of Give, marked Cold night. I tap one and chip in a few. I pick **Shipt delivers**: I pay for the items, a 5% service fee, and my share of one $9.99 delivery fee, split across every neighbor in this batch, so it drops as more people join. Someone else picks **I'll drive it**, which costs them nothing and gives them a mileage log. A third picks **porch pickup**. Watch the meter fill on every screen. When the nonprofit confirms receipt, my pledge turns Received and I get a written acknowledgment."
