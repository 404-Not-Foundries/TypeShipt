import type { CatalogItem, Need, Partner } from "@/lib/types";

// shortcut: tiny stand-in seed so the app runs before the real data lands.
// Replace by importing { partners, catalog, needs } from "@/data" (Viral-W) in store.ts.

const now = "2026-11-14T11:30:00-06:00";

export const partners: Partner[] = [
  {
    id: "firehouse",
    name: "Firehouse Ministries",
    mission: "A pathway to stability for men experiencing homelessness in Birmingham.",
    neighborhood: "Downtown",
    address: "626 2nd Ave N, Birmingham, AL 35203",
    location: { lat: 33.5065, lng: -86.8251 },
    receiving: [{ days: [0, 1, 2, 3, 4, 5, 6], open: "07:00", close: "18:00" }],
    accepts: { newOnly: false, perishables: false, porchPickup: true, refuses: [] },
    features: ["weatherSurge"],
  },
  {
    id: "jimmiehale",
    name: "Jimmie Hale Mission",
    mission: "Shelter, meals and recovery programs for men in Birmingham.",
    neighborhood: "Woodlawn",
    address: "3420 2nd Ave N, Birmingham, AL 35222",
    location: { lat: 33.525, lng: -86.7863 },
    receiving: [{ days: [0, 1, 2, 3, 4, 5, 6], open: "08:00", close: "18:00", assumed: true }],
    accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: ["used underwear"] },
    features: ["weatherSurge"],
  },
];

export const catalog: CatalogItem[] = [
  { id: "socks-mens", name: "Men's crew socks, 6-pack (L/XL)", category: "Clothing", price: 9.99, storeIds: [] },
  { id: "blanket-fleece", name: "Fleece throw blanket", category: "Bedding", price: 12.99, storeIds: [] },
  { id: "hand-warmers", name: "Hand warmers, 10-pack", category: "Cold weather", price: 8.49, storeIds: [] },
  { id: "water-24", name: "Bottled water, 24-pack", category: "Heat relief", price: 4.99, storeIds: [] },
  { id: "breakfast-bars", name: "Breakfast bars, 12-count", category: "Food", price: 5.49, storeIds: [] },
];

export const needs: Need[] = [
  { id: "n-fh-socks", partnerId: "firehouse", itemId: "socks-mens", title: "Men's socks (L/XL)", qtyNeeded: 40, qtyPledged: 0, qtyReceived: 0, urgency: "high", createdAt: now },
  { id: "n-fh-blankets", partnerId: "firehouse", itemId: "blanket-fleece", title: "Blankets", qtyNeeded: 20, qtyPledged: 0, qtyReceived: 0, urgency: "normal", createdAt: now },
  { id: "n-jh-bars", partnerId: "jimmiehale", itemId: "breakfast-bars", title: "Breakfast bars", qtyNeeded: 30, qtyPledged: 0, qtyReceived: 0, urgency: "normal", createdAt: now },
];
