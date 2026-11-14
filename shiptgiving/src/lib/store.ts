// In-memory app state shared by every API route. Owner: rmaytr.
// shortcut: lives in one Node process (fine for a one-laptop demo); swap for a database to deploy.
import type { AppState, Fulfillment, LatLng, Need, Pledge, PledgeCost, PledgeStatus, Store, Urgency, Weather } from "@/lib/types";
import { FULFILLMENTS, PLEDGE_STATUSES } from "@/lib/types";
import { catalog, needs, partners } from "@/lib/seed-stub";
import { STORE_SNAPSHOT } from "@/lib/stores/snapshot";

export const BATCH_DELIVERY_FEE = 9.99;
export const SERVICE_RATE = 0.05;
const MAX_NAME = 60;

const DEFAULT_WEATHER: Weather = { lowF: 55, alerts: [], surge: false, simulated: false };

export class StoreError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const g = globalThis as unknown as { __shiptgiving?: AppState };

function fresh(): AppState {
  return structuredClone({ partners, catalog, needs, stores: STORE_SNAPSHOT, pledges: [], weather: DEFAULT_WEATHER });
}

export function getState(): AppState {
  g.__shiptgiving ??= fresh();
  return g.__shiptgiving;
}

function commit(next: AppState): AppState {
  g.__shiptgiving = next;
  return next;
}

export function resetState(): AppState {
  return commit(fresh());
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// shortcut: replace with pledgeCost() from src/lib/fees.ts (mulimangila) once it is merged.
function estimateCost(price: number, qty: number, fulfillment: Fulfillment, donorsInBatch: number): PledgeCost {
  const items = round2(price * qty);
  const deliveryShare = fulfillment === "volunteer" ? 0 : round2(BATCH_DELIVERY_FEE / donorsInBatch);
  const service = fulfillment === "shipt" ? round2(items * SERVICE_RATE) : 0;
  return { items, deliveryShare, service, total: round2(items + deliveryShare + service) };
}

const isLatLng = (p: unknown): p is LatLng =>
  typeof p === "object" && p !== null && Number.isFinite((p as LatLng).lat) && Number.isFinite((p as LatLng).lng);

export type NewPledge = {
  needId: unknown;
  qty: unknown;
  fulfillment: unknown;
  donorName?: unknown;
  storeId?: unknown;
  porch?: unknown;
};

/** Validates untrusted input, caps quantity at what is still open, and records the pledge. */
export function addPledge(input: NewPledge): Pledge {
  const state = getState();
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
  if (fulfillment === "porch" && !isLatLng(input.porch)) throw new StoreError("Porch pickup needs a location");
  const storeId = typeof input.storeId === "string" ? input.storeId : undefined;
  if (storeId && !state.stores.some((s) => s.id === storeId)) throw new StoreError("Unknown store");
  const donorName = typeof input.donorName === "string" && input.donorName.trim()
    ? input.donorName.trim().slice(0, MAX_NAME)
    : "A neighbor";

  const item = state.catalog.find((c) => c.id === need.itemId);
  const batchDonors = state.pledges.filter(
    (p) => p.partnerId === need.partnerId && p.fulfillment !== "volunteer" && (p.status === "pledged" || p.status === "batched"),
  ).length + 1;

  const pledge: Pledge = {
    id: `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    needId: need.id,
    partnerId: need.partnerId,
    donorName,
    qty,
    fulfillment,
    storeId,
    porch: fulfillment === "porch" ? (input.porch as LatLng) : undefined,
    cost: estimateCost(item?.price ?? 0, qty, fulfillment, batchDonors),
    status: "pledged",
    createdAt: new Date().toISOString(),
  };
  commit({
    ...state,
    needs: state.needs.map((n) => (n.id === need.id ? { ...n, qtyPledged: n.qtyPledged + qty } : n)),
    pledges: [...state.pledges, pledge],
  });
  return pledge;
}

/** Moves a pledge along its lifecycle. "received" adds to the need's received count once. */
export function setPledgeStatus(id: string, status: unknown): Pledge {
  const state = getState();
  const pledge = state.pledges.find((p) => p.id === id);
  if (!pledge) throw new StoreError("Unknown pledge", 404);
  if (!PLEDGE_STATUSES.includes(status as PledgeStatus)) throw new StoreError("Invalid status");
  const next: Pledge = { ...pledge, status: status as PledgeStatus };
  const newlyReceived = next.status === "received" && pledge.status !== "received";
  commit({
    ...state,
    pledges: state.pledges.map((p) => (p.id === id ? next : p)),
    needs: newlyReceived
      ? state.needs.map((n) => (n.id === pledge.needId ? { ...n, qtyReceived: n.qtyReceived + pledge.qty } : n))
      : state.needs,
  });
  return next;
}

export type NewNeedItem = { itemId: string; title?: string; qty: number; urgency?: Urgency };

/** Publishes needs for a partner (used by the partner portal). */
export function addNeeds(partnerId: string, items: NewNeedItem[]): Need[] {
  const state = getState();
  if (!state.partners.some((p) => p.id === partnerId)) throw new StoreError("Unknown partner", 404);
  if (!Array.isArray(items) || items.length === 0) throw new StoreError("No items");
  const created = items.map((it, i): Need => {
    const item = state.catalog.find((c) => c.id === it.itemId);
    if (!item) throw new StoreError(`Unknown catalog item ${it.itemId}`);
    if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > 10000) throw new StoreError("Invalid quantity");
    return {
      id: `n-${Date.now().toString(36)}-${i}`,
      partnerId,
      itemId: item.id,
      title: it.title?.slice(0, 80) || item.name,
      qtyNeeded: it.qty,
      qtyPledged: 0,
      qtyReceived: 0,
      urgency: it.urgency ?? "normal",
      createdAt: new Date().toISOString(),
    };
  });
  commit({ ...state, needs: [...created, ...state.needs] });
  return created;
}

/** Applies a pure update to every need (e.g. the weather surge raising urgency). */
export function updateNeeds(update: (n: Need) => Need): Need[] {
  const state = getState();
  return commit({ ...state, needs: state.needs.map(update) }).needs;
}

export function setWeather(weather: Weather): Weather {
  commit({ ...getState(), weather });
  return weather;
}

export function setStores(stores: Store[]): Store[] {
  if (stores.length > 0) commit({ ...getState(), stores });
  return getState().stores;
}
