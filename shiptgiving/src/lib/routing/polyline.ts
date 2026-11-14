// Road geometry for the map, from the public OSRM demo server. Owner: rmaytr.
import type { LatLng } from "@/lib/types";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
const TIMEOUT_MS = 8000;

/** The road path through `points`; falls back to straight segments if OSRM is slow, down, or answers oddly. */
export async function roadPolyline(points: LatLng[]): Promise<LatLng[]> {
  if (points.length < 2) return points;
  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const res = await fetch(`${OSRM_URL}/${coords}?overview=full&geometries=geojson`, {
      headers: { "User-Agent": "route-planner-demo" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return points;
    const line: unknown = (await res.json())?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(line) || line.length < 2) return points;
    const path = line.map((c): LatLng => ({ lat: Number(c?.[1]), lng: Number(c?.[0]) }));
    return path.every((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)) ? path : points;
  } catch {
    return points; // the demo keeps working offline
  }
}
