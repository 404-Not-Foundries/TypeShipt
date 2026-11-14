// Small display helpers for the donor views. Owner: mulimangila.
import type { LatLng, Partner, Window } from "@/lib/types";

export function milesBetween(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Road miles are longer than straight-line; 1.3x matches the routing fallback. */
export const roadMiles = (a: LatLng, b: LatLng) => milesBetween(a, b) * 1.3;

/** Where donations actually go: the public drop point for confidential partners. */
export function dropOff(p: Partner): { address: string; location: LatLng; confidential: boolean } {
  const confidential = p.features.includes("confidential");
  if (confidential && p.dropPoint) return { ...p.dropPoint, confidential };
  return { address: confidential ? "Public drop point (shared after you pledge)" : p.address, location: p.location, confidential };
}

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

function dayRange(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return "Daily";
  const contiguous = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (contiguous && sorted.length > 2) return `${DAY[sorted[0]]}–${DAY[sorted[sorted.length - 1]]}`;
  return sorted.map((d) => DAY[d]).join(", ");
}

export const formatWindow = (w: Window) => `${dayRange(w.days)} ${to12h(w.open)}–${to12h(w.close)}`;
export const hoursAssumed = (p: Partner) => p.receiving.some((w) => w.assumed);
