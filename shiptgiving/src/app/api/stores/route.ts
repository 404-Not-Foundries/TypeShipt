import { storesNear } from "@/lib/stores/osm";
import { setStores } from "@/lib/store";

const DOWNTOWN = { lat: 33.5186, lng: -86.8104 };

/** GET /api/stores?lat=..&lng=..  Real nearby stores from OpenStreetMap (snapshot fallback). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat") ?? DOWNTOWN.lat);
  const lng = Number(url.searchParams.get("lng") ?? DOWNTOWN.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Response.json({ error: "Bad coordinates" }, { status: 400 });
  const stores = await storesNear({ lat, lng });
  if (url.searchParams.get("save") === "1") setStores(stores);
  return Response.json({ stores, source: stores[0]?.source ?? "none" });
}
