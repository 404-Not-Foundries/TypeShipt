/** One color per route, in route order. Picked to stay distinct on the OSM base map. */
// No reds: red is reserved for late stops.
export const ROUTE_COLORS = ["#0b6e3b", "#1d4ed8", "#7c3aed", "#b45309", "#0e7490", "#4b5563"];

export function routeColor(index: number): string {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

/** Stop numbers shown on the map and in the card: the start is 0, real stops count from 1. */
export function numberStops(stops: { kind: string }[]): number[] {
  let n = 0;
  return stops.map((s) => (s.kind === "start" ? 0 : ++n));
}

/** 38 → "38 min", 190 → "3 h 10 m", 120 → "2 h". */
export function formatMinutes(total: number): string {
  const m = Math.max(0, Math.round(total));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} m` : `${h} h`;
}

function clockMinutes(t: string): number | null {
  const d = t.includes("T") ? new Date(t) : null;
  if (d) return Number.isNaN(d.getTime()) ? null : d.getHours() * 60 + d.getMinutes();
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** A stop is late when its ETA falls outside the receiving window. Unknown times count as on time. */
export function isLate(stop: { eta?: string; window?: { open: string; close: string } }): boolean {
  if (!stop.eta || !stop.window) return false;
  const [eta, open, close] = [stop.eta, stop.window.open, stop.window.close].map(clockMinutes);
  if (eta === null || open === null || close === null) return false;
  return eta < open || eta > close;
}

/** ETAs may arrive as "HH:MM" or an ISO timestamp; show both as a short clock time. */
export function formatEta(eta?: string): string {
  if (!eta) return "";
  if (!eta.includes("T")) return eta;
  const d = new Date(eta);
  return Number.isNaN(d.getTime()) ? eta : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export async function sendJson(url: string, method: string, body?: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data && typeof data === "object" && "error" in data ? String(data.error) : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
