import type { AppState, LatLng, Partner, Pledge, PledgeCost } from "@/lib/types";

export type ShiptRecipient = { name: string; address: string; location: LatLng };
export type ShiptPlatformOrder = {
  external_order_id: string;
  order_type: "gift" | "pickup";
  tags: ["community", "shiptgiving"];
  retailer: { store_id: string; name: string; address: string };
  recipient: ShiptRecipient;
  delivery_window: { open: string; close: string; assumed: boolean } | null;
  line_items: { sku: string; name: string; quantity: number; unit_price: number }[];
  pricing: PledgeCost;
  fulfillment: "shipt" | "porch";
  pickup_location?: LatLng;
  note: string;
};

/** Confidential recipients have no fallback to the shelter's address or coordinates. */
export function toShiptRecipient(partner: Partner): ShiptRecipient | null {
  const destination = partner.features.includes("confidential") ? partner.dropPoint : partner;
  if (!destination) return null;
  return { name: partner.name, address: destination.address, location: { ...destination.location } };
}

const radians = (degrees: number) => degrees * Math.PI / 180;
function haversine(a: LatLng, b: LatLng): number {
  const h = Math.sin(radians(b.lat - a.lat) / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(radians(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(Math.min(1, h)));
}

function receivingWindow(partner: Partner, createdAt: string): ShiptPlatformOrder["delivery_window"] {
  const placedAt = new Date(createdAt);
  if (!Number.isFinite(placedAt.getTime())) return null;
  // Anchor "today" to placement in Birmingham; polling must not move an existing order's window.
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Chicago" }).format(placedAt);
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const window = partner.receiving.find((entry) => entry.days.includes(day));
  return window ? { open: window.open, close: window.close, assumed: window.assumed ?? false } : null;
}

/** Illustrative payload only: no network, state changes, or claim to Shipt's private API schema. */
export function toShiptOrder(pledge: Pledge, state: AppState): ShiptPlatformOrder | null {
  if (pledge.fulfillment === "volunteer" || pledge.qty <= 0) return null;
  const partner = state.partners.find((entry) => entry.id === pledge.partnerId);
  const need = state.needs.find((entry) => entry.id === pledge.needId && entry.partnerId === pledge.partnerId);
  const item = state.catalog.find((entry) => entry.id === need?.itemId);
  if (!partner || !item) return null;
  const recipient = toShiptRecipient(partner);
  if (!recipient || (pledge.fulfillment === "porch" && !pledge.porch)) return null;
  const store = state.stores.find((entry) => entry.id === pledge.storeId)
    ?? state.stores.reduce<(typeof state.stores)[number] | undefined>((nearest, entry) =>
      !nearest || haversine(recipient.location, entry.location) < haversine(recipient.location, nearest.location)
        ? entry : nearest, undefined);
  if (!store) return null;

  return {
    external_order_id: pledge.id,
    order_type: pledge.fulfillment === "porch" ? "pickup" : "gift",
    tags: ["community", "shiptgiving"],
    retailer: { store_id: store.id, name: store.name, address: store.address },
    recipient,
    delivery_window: receivingWindow(partner, pledge.createdAt),
    // Preserve the placed order's goods value if the catalog estimate changes later.
    line_items: [{ sku: item.id, name: item.name, quantity: pledge.qty, unit_price: pledge.cost.items / pledge.qty }],
    pricing: { ...pledge.cost },
    fulfillment: pledge.fulfillment,
    ...(pledge.fulfillment === "porch" ? { pickup_location: { ...pledge.porch! } } : {}),
    note: "Donation via ShiptGiving. Deliver to receiving desk.",
  };
}
