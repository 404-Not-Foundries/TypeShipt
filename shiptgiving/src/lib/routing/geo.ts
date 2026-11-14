// Distance and drive-time estimates. Owner: rmaytr.
import type { LatLng } from "@/lib/types";

const EARTH_RADIUS_MILES = 3958.8;
/** Roads are longer than the straight line between two points. */
export const ROAD_FACTOR = 1.3;
export const AVG_MPH = 25;

const rad = (deg: number) => (deg * Math.PI) / 180;

export function haversineMiles(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/** Estimated driving miles between two points. */
export const roadMiles = (a: LatLng, b: LatLng) => haversineMiles(a, b) * ROAD_FACTOR;

export const minutesFor = (miles: number) => (miles / AVG_MPH) * 60;

/** Estimated driving miles along a list of points, in order. */
export function pathMiles(points: LatLng[]): number {
  return points.slice(1).reduce((sum, p, i) => sum + roadMiles(points[i], p), 0);
}
