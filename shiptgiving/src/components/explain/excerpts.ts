// Short real excerpts for the "Key code" cards on /how-it-works. Owner: rmaytr.
// excerpts.test.ts checks that every path exists and every line still appears in it, so these can't silently rot.

export type Excerpt = { title: string; path: string; owner: string; why: string; code: string };

export const EXCERPTS: Excerpt[] = [
  {
    title: "Validate a pledge before it counts",
    path: "src/lib/store.ts",
    owner: "rmaytr",
    why: "Every pledge is untrusted input. The store checks it, caps it at what is still open, and only then records it.",
    code: `export function addPledge(input: NewPledge): Pledge {
  const state = getState();
  const need = state.needs.find((n) => n.id === input.needId);
  if (!need) throw new StoreError("Unknown need", 404);
  if (!FULFILLMENTS.includes(input.fulfillment as Fulfillment)) throw new StoreError("Invalid fulfillment");
  const fulfillment = input.fulfillment as Fulfillment;
  const remaining = need.qtyNeeded - need.qtyPledged;
  const qty = Number(input.qty);
  if (!Number.isInteger(qty) || qty < 1) throw new StoreError("Quantity must be a whole number of at least 1");
  if (qty > remaining) throw new StoreError(\`Only \${remaining} still needed\`, 409);`,
  },
  {
    title: "Fill the biggest vehicle first",
    path: "src/lib/routing/assign.ts",
    owner: "rmaytr",
    why: "Greedy and explainable: each driver, largest first, takes partners that close earliest and sit closest, while the load fits.",
    code: `  const drivers = [...state.drivers].sort((a, b) => b.capacity - a.capacity);
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
        pledges.push(p);
        load += p.qty;
      }
    }`,
  },
  {
    title: "Claude first, keywords if it fails",
    path: "src/lib/ai.ts",
    owner: "Viral-W",
    why: "Claude turns plain text into catalog items. With no key, or on any error, an offline keyword matcher keeps the portal working.",
    code: `export async function parseNeed(text: string, catalog: CatalogItem[], partner?: Partner): Promise<ParseResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return { items: await claudeParse(text, catalog, partner), source: "claude" };
    } catch {
      // fall through to the offline parser so the portal keeps working
    }
  }
  return { items: keywordParse(text, catalog, partner), source: "keywords" };
}`,
  },
  {
    title: "The Weather Surge rule",
    path: "src/lib/weather.ts",
    owner: "Viral-W",
    why: "Firehouse opens its day shelter under 40°F or in a heat advisory, so the same rule turns matching needs urgent.",
    code: `export function surgeReasons(reading: Reading): { cold?: string; heat?: string } {
  const heatAlert = reading.alerts.find((a) => HEAT_ALERT.test(a));
  return {
    cold: reading.lowF < COLD_LOW_F ? \`Tonight's low: \${Math.round(reading.lowF)}°F\` : undefined,
    heat: heatAlert ? \`\${heatAlert} in effect\` : undefined,
  };
}`,
  },
  {
    title: "One pledge, one price",
    path: "src/lib/fees.ts",
    owner: "mulimangila",
    why: "Items are paid per pledge. Only the $9.99 batch delivery fee is shared, split across the donors in the same batch.",
    code: `export function pledgeCost(price: number, qty: number, fulfillment: Fulfillment, donorsInBatch: number): PledgeCost {
  const items = round2(price * qty);
  const donors = Math.max(1, Math.floor(donorsInBatch) || 1);
  const deliveryShare = fulfillment === "volunteer" ? 0 : round2(BATCH_DELIVERY_FEE / donors);
  const service = fulfillment === "shipt" ? round2(items * SERVICE_RATE) : 0;
  return { items, deliveryShare, service, total: round2(items + deliveryShare + service) };
}`,
  },
  {
    title: "A pledge as a Shipt gift order",
    path: "src/lib/shipt-platform.ts",
    owner: "rmaytr",
    why: "The integration is an ordinary gift order addressed to the nonprofit, with a community tag. No new order type.",
    code: `  return {
    external_order_id: pledge.id,
    order_type: pledge.fulfillment === "porch" ? "pickup" : "gift",
    tags: ["community", "shiptgiving"],
    retailer: { store_id: store.id, name: store.name, address: store.address },
    recipient,
    delivery_window: receivingWindow(partner, pledge.createdAt),`,
  },
];
