# Viraj (`Viral-W`): partner portal, seed data, AI parsing, weather, verification

Everything a nonprofit sees, plus the data and the "smart" inputs behind it: the **Nonprofits** portal, the real Birmingham seed data, Claude need parsing with a keyword fallback, the NWS **Weather Surge**, and automated nonprofit verification. Main paths: `shiptgiving/src/app/partner/`, `src/components/partner/`, `src/data/`, `src/lib/ai.ts`, `src/lib/weather.ts`, `src/app/api/{needs,parse-need,weather}/`.

## What it does for the user

1. **Pick a partner** (Firehouse, Jimmie Hale, Pathways, …) at the top of `/partner`. The header shows a Verified or Confidential badge.
2. **Post a need in plain English:** "Cold front tonight, need 40 pairs of men's socks L/XL and 20 blankets." Tap **Turn into items** and you get editable rows (catalog item, title, quantity, urgency). The note says whether Claude or the offline keyword matcher did it. Fix anything, then **Publish**: the needs go straight to the donor feed.
3. **Weather Surge:** the panel shows tonight's NWS low and alerts. Under 40°F (or with a heat advisory), cold-weather (or heat-relief) needs at Firehouse and Jimmie Hale jump to **urgent** with the reason ("Tonight's low: 34°F"). For the demo there are three buttons: Simulate cold night, Simulate heat advisory, Simulation off.
4. **Incoming donations:** four columns (Pledged, On the way, Delivered, Received). **Confirm receipt of N** moves a pledge to Received, fills the meter's received count and unlocks the donor's receipt.
5. **Receiving and rules:** hours (marked "call to confirm" when the partner hasn't published them), new-only, perishables, porch pickups, refused items, and the partner's modules.
6. **Partner modules:** Dorm Kits for Birmingham Promise (publish a whole move-in kit for one scholar), and a confidential notice for shelters whose real address is never shown.
7. **Verification card:** EIN found, 501(c)(3), name match and city match, checked against IRS records through ProPublica, live when it can reach it.

## Files and what each one does

| File | What it does |
|---|---|
| `src/app/partner/page.tsx` | The portal layout: picker, post-need, dorm kit, open needs, surge panel, rules, verification, incoming board. |
| `src/app/partner/actions.ts` | Server action `checkVerification(partnerId)` that validates the id and runs the live check. |
| `components/partner/api.ts` | One small `call()` wrapper plus `parseNeed`, `publishNeeds`, `loadWeather`, `simulateWeather`, `confirmReceipt`. |
| `components/partner/post-need.tsx`, `need-rows.tsx` | The plain-text box, the editable draft rows, publish. |
| `components/partner/incoming-board.tsx` | The four status columns and Confirm receipt. |
| `components/partner/surge-panel.tsx` | Weather Surge status, raised needs, simulate buttons. |
| `components/partner/rules-summary.tsx`, `open-needs.tsx`, `partner-picker.tsx` | Rules and hours, the partner's needs, the partner switcher. |
| `components/partner/dorm-kit.tsx`, `dorm-kit-data.ts` | Maps a move-in kit (bedding, towels, toiletries, …) onto whatever the catalog has, then publishes it. |
| `components/partner/confidential-badge.tsx` | `isConfidential`, `publicAddress` (the only address that may be shown), the badge and notice. |
| `components/partner/verification.ts`, `verification-live.ts`, `verification-card.tsx`, `verified-badge.tsx` | The 4 checks, the live ProPublica lookup with cache and fallback, the card and badge. |
| `src/data/partners.ts`, `catalog.ts`, `needs.ts`, `verification.ts`, `index.ts` | Seed: 11 real Birmingham partners, 50 catalog items, 35 needs, IRS snapshot records. |
| `src/lib/ai.ts` | `parseNeed`: Claude with a strict JSON schema, keyword fallback. |
| `src/lib/weather.ts` | NWS fetch, the surge rule, simulate mode, applying the surge to needs. |
| `src/app/api/parse-need/route.ts`, `api/needs/route.ts`, `api/weather/route.ts` | The three API routes, each validating its input. |

## Data flow

- **Post a need:** `POST /api/parse-need {partnerId, text}` → `parseNeed()` in `lib/ai.ts` → `{items, source}`. Nothing is saved yet. Then `POST /api/needs {partnerId, items}` → `addNeeds()` in the lead's `lib/store.ts` → `Need[]`. After publishing, the portal calls `GET /api/weather` again, so a surge also applies to the new needs.
- **Weather:** `GET /api/weather` → `refreshWeather()` reads live NWS (cached 10 min) or the simulated reading, then `updateNeeds(surgeUpdater(...))` and `setWeather()` in the store. `POST /api/weather {simulate: "cold" | "heat" | null}` switches the mode.
- **Confirm receipt:** `PATCH /api/pledges/[id] {status: "received"}` → `setPledgeStatus()` in the store, which adds to `need.qtyReceived` exactly once.
- **Verification:** when the module loads, `getVerification()` runs the 4 checks on the snapshot in `data/verification.ts` (used for badges). The card calls the server action `checkVerification()` → `verifyLive()`, which asks ProPublica (4 s timeout, 10 min cache) and falls back to the snapshot.
- **Reads:** the portal uses `useAppState()` (2-second polling of `GET /api/state`) like every other view.
- **Types:** `Partner`, `Need`, `Urgency`, `CatalogItem`, `Weather`, `Pledge` from `src/lib/types.ts`; `ParsedItem` in `lib/ai.ts`; `Verification` and `Check` in `verification.ts`.

## The functions that matter

### 1. `parseNeed`: Claude first, keywords if anything fails (`src/lib/ai.ts`)
With an `ANTHROPIC_API_KEY`, Claude reads the request. Without one, or if the call throws or times out, the offline parser answers instead, so the portal never breaks in a demo.

```ts
export async function parseNeed(text: string, catalog: CatalogItem[], partner?: Partner): Promise<ParseResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return { items: await claudeParse(text, catalog, partner), source: "claude" };
    } catch {
      // fall through to the offline parser so the portal keeps working
    }
  }
  return { items: keywordParse(text, catalog, partner), source: "keywords" };
}
```

### 2. The output schema: Claude can only pick real catalog ids (`src/lib/ai.ts`)
We send the catalog and a JSON schema whose `itemId` is an `enum` of real ids, so the model can't invent items. `sanitize()` checks the result again anyway (real id, finite quantity clamped to 1–10,000, valid urgency).

```ts
          properties: {
            itemId: { type: "string", enum: catalog.map((c) => c.id) },
            title: { type: "string" },
            qty: { type: "integer" },
            urgency: { type: "string", enum: URGENCIES },
          },
          required: ["itemId", "title", "qty", "urgency"],
          additionalProperties: false,
```

### 3. `keywordParse`: the offline parser (`src/lib/ai.ts`)
It splits the text on commas, "and", "plus" and so on, finds a quantity in each phrase, and matches the phrase to the catalog item with the most shared words. Ties go to the item that fits the partner, so "socks" at a men's shelter becomes men's socks. Phrases with no number ("cold front tonight") are skipped when other phrases have one. Words like "tonight" or "freezing" set the urgency.

```ts
  const segments = text.split(/[,;.\n]+|\band\b|\bplus\b|&/i).map((s) => s.trim()).filter(Boolean);
  const anyQty = segments.some((s) => findQty(s) !== undefined);
  const byItem = new Map<string, ParsedItem>();
  for (const segment of segments) {
    const qty = findQty(segment);
    if (anyQty && qty === undefined) continue; // skip context phrases like "cold front tonight"
    const item = bestMatch(segment, catalog, context);
    if (!item) continue;
```

### 4. `surgeReasons` and `surgeUpdater`: the Weather Surge (`src/lib/weather.ts`)
The rule is Firehouse's own day-shelter trigger: a low under 40°F, or an active heat alert. `surgeUpdater` then walks every need: at a `weatherSurge` partner, cold items (socks, blankets, gloves, …) or heat items (water, electrolytes, sunscreen) become urgent with a reason. It remembers each need's old urgency, so turning the surge off puts it back.

```ts
export function surgeReasons(reading: Reading): { cold?: string; heat?: string } {
  const heatAlert = reading.alerts.find((a) => HEAT_ALERT.test(a));
  return {
    cold: reading.lowF < COLD_LOW_F ? `Tonight's low: ${Math.round(reading.lowF)}°F` : undefined,
    heat: heatAlert ? `${heatAlert} in effect` : undefined,
  };
}
```

### 5. `verify`: four checks, no human step (`src/components/partner/verification.ts`)
A partner is **verified** only when all four checks pass against its IRS record: EIN found, 501(c)(3), name matches (or a doing-business-as name at the same street), and city matches (anywhere in the Birmingham metro counts). A church ministry with no IRS record gets a neutral **religious** status, because churches don't have to register with the IRS. Anything else stays **unverified**.

```ts
export function verify(record: VerificationRecord): Verification {
  const checks = runChecks(record);
  const verified = checks.every((c) => c.pass);
  const status: VerificationStatus = verified ? "verified" : !record.irs && record.religious ? "religious" : "unverified";
  return {
    partnerId: record.partnerId,
    status,
    ein: record.irs?.ein ?? null,
    verified,
```

## Design decisions and trade-offs

- **We chose "parse, then confirm, then publish"** because staff must see what goes live. The AI drafts rows; a person edits and publishes them. `/api/parse-need` saves nothing.
- **We chose a strict JSON schema with an enum of catalog ids** because a free-text answer could name items we don't stock. The schema plus `sanitize()` means every published need points at a real catalog item. The system prompt also says the request text is data, not instructions.
- **We chose a keyword fallback** because the demo can't depend on a network call or an API key. It handles the demo sentence exactly, and it's unit-tested (`src/lib/ai.test.ts`).
- **We chose NWS** (api.weather.gov) because it's free, needs no key, and covers Birmingham. It's cached for 10 minutes with a 5-second timeout. If it's down, we keep the last reading or a mild stand-in, so the feed never breaks. The simulate buttons make the demo repeatable.
- **We chose Firehouse's own rule** (under 40°F or a heat advisory) instead of inventing a city program, because that's when Firehouse actually opens its day shelter.
- **We chose real seed data:** 11 Birmingham nonprofits with OpenStreetMap coordinates, real receiving rules, and hours marked `assumed` when the partner hasn't published them (the UI says "call to confirm").
- **We chose automated verification** over a manual approval queue, using IRS records through ProPublica. We never invent a record: partners we couldn't confirm have `irs: null` and stay unverified. Street addresses are used only to match a DBA name and are stripped before anything reaches the browser.
- **We chose public drop points for confidential shelters:** `publicAddress()` is the only address the UI may show, and drivers get the drop point, never the real address.

## Known limits and what's next

- The keyword parser only knows catalog words. Unusual phrasing ("PJs" for pajamas) can miss, and staff then add the row by hand.
- The surge looks at tonight's forecast only, for partners with the `weatherSurge` feature (Firehouse and Jimmie Hale).
- Verification checks IRS status, not who is logged in. There are no partner accounts yet, so anyone can open any partner's portal in the demo.
- Next: partner logins tied to a verified EIN, texting past donors when a surge starts, more partner modules (classroom wishlists for Ed Farm).

## Questions you might get about your code

- **What happens without an API key?** `parseNeed` skips Claude and uses `keywordParse`, and the portal says "Matched by keywords (offline mode)". The demo sentence parses the same way.
- **Can the AI invent an item or a quantity?** No. The schema only allows real catalog ids, and `sanitize()` drops unknown ids and clamps quantities to 1–10,000 before staff even see the rows.
- **What if someone types instructions into the request box?** The prompt tells Claude the request is data to parse, the output is schema-bound, and a person confirms every row before publishing.
- **How does the surge know which items to raise?** It matches the need's item id, title and category against cold words (socks, blankets, gloves, …) or heat words (water, electrolytes, sunscreen), only at partners with the `weatherSurge` feature.
- **What if NWS is down?** We keep the last good reading (or a mild 55°F stand-in) and mark it simulated, so nothing crashes. The simulate buttons still work.
- **How does Confirm receipt update the donor?** It sends `PATCH /api/pledges/[id]` with `received`. The store adds the quantity to `qtyReceived` once, and the donor's next poll shows Received and the receipt.
- **Why is Firehouse not "verified"?** It's a Christian ministry with no IRS record we could find, and churches don't have to register, so it shows a neutral "religious" status instead of a failure.
- **Is the seed data real?** Yes: real Birmingham nonprofits, OpenStreetMap coordinates and published rules. Hours that weren't published are marked as assumed.

## How I'd explain my part (30 seconds)

> "This is the nonprofit portal. Firehouse staff don't fill out a form; they type what they'd say: 'Cold front tonight, need 40 pairs of men's socks and 20 blankets.' Claude turns that into catalog items, with a keyword fallback if there's no connection. Staff check the rows and hit Publish, and the needs are on the donor feed right away. The Weather Surge reads the National Weather Service: tonight's low is under 40°F, Firehouse's own day-shelter trigger, so blankets and socks jump to urgent with the reason shown to donors. Later, when the driver delivers, staff tap Confirm receipt. The meter fills, and the donor gets their acknowledgment."
