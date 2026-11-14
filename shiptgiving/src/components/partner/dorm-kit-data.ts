import type { CatalogItem, Need, Urgency } from "@/lib/types";

/** One line of a move-in kit for a single scholar. `match` patterns are tried in order against the catalog. */
type KitSlot = { label: string; qty: number; match: RegExp[] };

export type KitLine = { item: CatalogItem; label: string; qty: number };
export type KitNeedItem = { itemId: string; title: string; qty: number; urgency: Urgency };

const KIT_SLOTS: KitSlot[] = [
  { label: "Bedding", qty: 1, match: [/sheet/i, /comforter/i, /blanket/i] },
  { label: "Bath towel", qty: 2, match: [/towel/i] },
  { label: "Toiletries", qty: 1, match: [/toiletr/i, /hygiene kit/i, /shampoo/i, /body wash|soap/i] },
  { label: "Toothbrush and toothpaste", qty: 1, match: [/tooth/i] },
  { label: "Laundry detergent", qty: 1, match: [/laundry|detergent/i] },
  { label: "Notebooks", qty: 1, match: [/notebook/i, /school suppl/i] },
  { label: "Pens and pencils", qty: 1, match: [/\bpens?\b|pencil/i] },
  { label: "Backpack", qty: 1, match: [/backpack/i] },
  { label: "Snacks", qty: 2, match: [/snack|granola|breakfast bar/i, /\bbars\b/i, /ramen|mac/i] },
];

/** A ready-made move-in bundle is the whole kit, never one line of it. */
const BUNDLE = /move-in kit/i;

/** Maps the kit onto whatever the catalog offers. Slots with no matching item are left out; an item is used once. */
export function resolveDormKit(catalog: CatalogItem[]): KitLine[] {
  const used = new Set<string>();
  const lines: KitLine[] = [];
  for (const slot of KIT_SLOTS) {
    const item = slot.match
      .map((re) => catalog.find((c) => !used.has(c.id) && !BUNDLE.test(c.name) && re.test(`${c.id} ${c.name} ${c.category}`)))
      .find(Boolean);
    if (!item) continue;
    used.add(item.id);
    lines.push({ item, label: slot.label, qty: slot.qty });
  }
  return lines;
}

export function kitPrice(lines: KitLine[]): number {
  return Math.round(lines.reduce((sum, l) => sum + l.item.price * l.qty, 0) * 100) / 100;
}

export function kitNeedItems(lines: KitLine[], scholars: number): KitNeedItem[] {
  return lines.map((l) => ({
    itemId: l.item.id,
    title: `Dorm Kit: ${l.label}`,
    qty: l.qty * scholars,
    urgency: "normal",
  }));
}

/** Whole kits covered so far, counting only this partner's open needs for the kit's items. */
export function kitsCovered(lines: KitLine[], needs: Need[], partnerId: string, field: "qtyPledged" | "qtyReceived"): number {
  if (lines.length === 0) return 0;
  const perLine = lines.map((l) => {
    const total = needs
      .filter((n) => n.partnerId === partnerId && n.itemId === l.item.id)
      .reduce((sum, n) => sum + n[field], 0);
    return Math.floor(total / l.qty);
  });
  return Math.min(...perLine);
}
