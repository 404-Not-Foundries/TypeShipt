// In-memory app state shared by every API route. Owner: rmaytr.
// shortcut: lives in one Node process (fine for a one-laptop demo); swap for a database to deploy.
import type {
  AppState, Driver, Fulfillment, LatLng, Need, Pledge, PledgeStatus, RoutePlan, RouteSummary, Store, Urgency, VehicleType, Weather,
} from "@/lib/types";
import { FULFILLMENTS, PLEDGE_STATUSES, VEHICLES } from "@/lib/types";
import { catalog, needs, partners } from "@/data";
import { STORE_SNAPSHOT } from "@/lib/stores/snapshot";
import { pledgeCost } from "@/lib/fees";
import { summarize } from "@/lib/routing";

const MAX_NAME = 60;
const MAX_DRIVER_NAME = 40;
/** Downtown Birmingham, the default start point for a new driver. */
export const DOWNTOWN: LatLng = { lat: 33.5186, lng: -86.8104 };

const DEFAULT_WEATHER: Weather = { lowF: 55, alerts: [], surge: false, simulated: false };

export class StoreError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const g = globalThis as unknown as { __shiptgiving?: AppState };

function makeDriver(id: string, name: string, vehicle: VehicleType, start: LatLng): Driver {
  const { size, capacity } = VEHICLES[vehicle];
  return { id, name, vehicle, size, capacity, start, kind: "shipt" };
}

// Tomorrow's drivers for the demo: 2 school buses and a convertible.
const SEED_DRIVERS: Driver[] = [
  makeDriver("d-bus-1", "Bus 1", "bus", { lat: 33.5207, lng: -86.8025 }),
  makeDriver("d-bus-2", "Bus 2", "bus", { lat: 33.5149, lng: -86.8122 }),
  makeDriver("d-convertible", "Convertible", "compact", { lat: 33.5186, lng: -86.8104 }),
];

function fresh(): AppState {
  return structuredClone({
    partners, catalog, needs, stores: STORE_SNAPSHOT, pledges: [], weather: DEFAULT_WEATHER,
    drivers: SEED_DRIVERS, routes: [], unrouted: [], routeSummary: null,
  });
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
    cost: pledgeCost(item?.price ?? 0, qty, fulfillment, batchDonors),
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

/** Adds one of tomorrow's drivers. Validates untrusted input; start defaults to downtown. */
export function addDriver(name: unknown, vehicle: unknown, start?: unknown): Driver {
  const state = getState();
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (cleanName.length < 1 || cleanName.length > MAX_DRIVER_NAME) throw new StoreError(`Name must be 1-${MAX_DRIVER_NAME} characters`);
  if (typeof vehicle !== "string" || !Object.hasOwn(VEHICLES, vehicle)) throw new StoreError("Invalid vehicle");
  if (start !== undefined && !isLatLng(start)) throw new StoreError("Invalid start location");
  const id = `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const at = start === undefined ? DOWNTOWN : { lat: (start as LatLng).lat, lng: (start as LatLng).lng };
  const driver = makeDriver(id, cleanName, vehicle as VehicleType, at);
  commit({ ...state, drivers: [...state.drivers, driver] });
  return driver;
}

/** Removes a driver. Its route goes too: those pledges return to "pledged" and the summary covers the routes left. */
export function removeDriver(id: string): void {
  const state = getState();
  if (!state.drivers.some((d) => d.id === id)) throw new StoreError("Unknown driver", 404);
  commit({ ...state, drivers: state.drivers.filter((d) => d.id !== id) });
  if (!state.routes.some((r) => r.driverId === id)) return;
  const routes = state.routes.filter((r) => r.driverId !== id);
  setRoutes(routes, state.unrouted, routes.length > 0 ? summarize(routes) : null);
}

/** Saves a route plan. Pledges on a route become "batched"; batched pledges left off every route go back to "pledged". */
export function setRoutes(routes: RoutePlan[], unrouted: string[], summary: RouteSummary | null): AppState {
  const state = getState();
  const onRoute = new Set(routes.flatMap((r) => r.stops.flatMap((s) => s.pledgeIds)));
  const pledges = state.pledges.map((p): Pledge => {
    if (p.status === "pledged" && onRoute.has(p.id)) return { ...p, status: "batched" };
    if (p.status === "batched" && !onRoute.has(p.id)) return { ...p, status: "pledged" };
    return p;
  });
  return commit({ ...state, pledges, routes, unrouted, routeSummary: summary });
}
