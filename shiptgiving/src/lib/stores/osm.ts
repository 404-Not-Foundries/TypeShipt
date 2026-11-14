import type { LatLng, Store } from "@/lib/types";
import { STORE_SNAPSHOT } from "./snapshot";

const OVERPASS = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "ShiptGiving/0.1 (hackathon demo)";
const TIMEOUT_MS = 8000;
const CACHE_MS = 30 * 60 * 1000;
const BRANDS = "Target|Publix|Walmart|ALDI|Aldi|Piggly Wiggly|Winn-Dixie|CVS|Walgreens|Whole Foods|Food Giant|Sprouts";

type OsmElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const cache = new Map<string, { at: number; stores: Store[] }>();

function toStore(e: OsmElement): Store | null {
  const lat = e.lat ?? e.center?.lat;
  const lng = e.lon ?? e.center?.lon;
  const brand = e.tags?.brand;
  if (lat === undefined || lng === undefined || !brand) return null;
  const street = [e.tags?.["addr:housenumber"], e.tags?.["addr:street"]].filter(Boolean).join(" ");
  return {
    id: `osm-${e.id}`,
    brand,
    name: e.tags?.name ?? brand,
    address: street || "Birmingham, AL",
    location: { lat, lng },
    source: "osm-live",
  };
}

/** Real grocery and pharmacy stores near a point, from OpenStreetMap. Falls back to the snapshot. */
export async function storesNear(point: LatLng, radiusM = 8000): Promise<Store[]> {
  const key = `${point.lat.toFixed(3)},${point.lng.toFixed(3)},${radiusM}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.stores;

  const query = `[out:json][timeout:8];nwr["shop"~"supermarket|department_store|chemist|convenience"]["brand"~"${BRANDS}"](around:${radiusM},${point.lat},${point.lng});out center tags;`;
  try {
    const res = await fetch(OVERPASS, {
      method: "POST",
      headers: { "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const json = (await res.json()) as { elements: OsmElement[] };
    const stores = json.elements.map(toStore).filter((x): x is Store => x !== null);
    if (stores.length === 0) throw new Error("Overpass returned no stores");
    cache.set(key, { at: Date.now(), stores });
    return stores;
  } catch {
    // Overpass is a shared public server and is often at capacity; the snapshot is the same OSM data.
    return STORE_SNAPSHOT;
  }
}
