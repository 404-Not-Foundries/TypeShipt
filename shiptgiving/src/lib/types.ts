// Shared data contract. Owner: rmaytr. Ask on the board before changing it.

export type LatLng = { lat: number; lng: number };

/** days: 0 = Sunday. open/close: "HH:MM" 24h. assumed = hours not published by the partner. */
export type Window = { days: number[]; open: string; close: string; assumed?: boolean };

export type Feature = "weatherSurge" | "perishables" | "dormKits" | "classroom" | "confidential";

export type Partner = {
  id: string;
  name: string;
  mission: string;
  neighborhood: string;
  address: string;
  location: LatLng;
  dropPoint?: { address: string; location: LatLng }; // used instead of address when confidential
  receiving: Window[];
  accepts: { newOnly: boolean; perishables: boolean; porchPickup: boolean; refuses: string[] };
  features: Feature[];
};

export type Store = {
  id: string;
  name: string;
  brand: string;
  address: string;
  location: LatLng;
  source: "osm-live" | "osm-snapshot";
};

export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  price: number; // estimated unit price in USD
  storeIds: string[]; // empty = any store
  perishable?: boolean;
  image?: string; // filled from Open Food Facts when available
  brand?: string;
};

export type Urgency = "normal" | "high" | "urgent";

export type Need = {
  id: string;
  partnerId: string;
  itemId: string;
  title: string;
  qtyNeeded: number;
  qtyPledged: number;
  qtyReceived: number;
  urgency: Urgency;
  surgeReason?: string;
  deadline?: string;
  createdAt: string;
};

export type Fulfillment = "shipt" | "volunteer" | "porch";
export type PledgeStatus = "pledged" | "batched" | "picked_up" | "delivered" | "received";

export type PledgeCost = { items: number; deliveryShare: number; service: number; total: number };

export type Pledge = {
  id: string;
  needId: string;
  partnerId: string;
  donorName: string;
  qty: number;
  fulfillment: Fulfillment;
  storeId?: string;
  porch?: LatLng;
  cost: PledgeCost;
  status: PledgeStatus;
  createdAt: string;
};

export type Stop = {
  id: string;
  kind: "start" | "pickup" | "dropoff";
  label: string;
  location: LatLng;
  pledgeIds: string[];
  window?: { open: string; close: string };
  eta?: string;
};

export type RoutePlan = {
  driver: "shipt" | "volunteer";
  stops: Stop[];
  minutes: number;
  miles: number;
  naiveMinutes: number;
  naiveMiles: number;
  polyline?: LatLng[];
};

export type Weather = {
  lowF: number;
  alerts: string[];
  surge: boolean;
  reason?: string;
  simulated: boolean;
};

export type AppState = {
  partners: Partner[];
  stores: Store[];
  catalog: CatalogItem[];
  needs: Need[];
  pledges: Pledge[];
  weather: Weather;
};

export const FULFILLMENTS: Fulfillment[] = ["shipt", "volunteer", "porch"];
export const PLEDGE_STATUSES: PledgeStatus[] = ["pledged", "batched", "picked_up", "delivered", "received"];
