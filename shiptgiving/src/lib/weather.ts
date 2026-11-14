// Weather Surge: NWS forecast for Birmingham raises cold-weather or heat-relief needs to urgent. Owner: Viral-W.
import type { AppState, Need, Urgency, Weather } from "@/lib/types";
import { getState, setWeather, updateNeeds } from "@/lib/store";

export const COLD_LOW_F = 40;
const POINT = "33.5186,-86.8104"; // downtown Birmingham
const NWS = "https://api.weather.gov";
const HEADERS = { "User-Agent": "community-giving-demo", Accept: "application/geo+json" };
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 5000;

const COLD_WORDS = /sock|blanket|warmer|glove|mitten|beanie|\bhats?\b|coat|jacket|thermal|scarf|cold/i;
const HEAT_WORDS = /water|electrolyte|sunscreen|sports drink|cooling|heat/i;
const HEAT_ALERT = /heat/i;

export type Simulate = "cold" | "heat" | null;
type Reading = Pick<Weather, "lowF" | "alerts">;
type Memory = { simulate: Simulate; cache?: { at: number; reading: Reading }; base: Map<string, Urgency> };

const g = globalThis as unknown as { __shiptgivingWeather?: Memory };
const memory = (): Memory => (g.__shiptgivingWeather ??= { simulate: null, base: new Map() });

const SIMULATED: Record<"cold" | "heat", Reading> = {
  cold: { lowF: 34, alerts: [] },
  heat: { lowF: 78, alerts: ["Heat Advisory"] },
};
const FALLBACK: Reading = { lowF: 55, alerts: [] };

/** The surge rule: a low under 40°F or an active heat alert. Returns one reason per kind. */
export function surgeReasons(reading: Reading): { cold?: string; heat?: string } {
  const heatAlert = reading.alerts.find((a) => HEAT_ALERT.test(a));
  return {
    cold: reading.lowF < COLD_LOW_F ? `Tonight's low: ${Math.round(reading.lowF)}°F` : undefined,
    heat: heatAlert ? `${heatAlert} in effect` : undefined,
  };
}

export function toWeather(reading: Reading, simulated: boolean): Weather {
  const { cold, heat } = surgeReasons(reading);
  const reason = [cold, heat].filter(Boolean).join(" · ") || undefined;
  return { lowF: reading.lowF, alerts: reading.alerts, surge: Boolean(reason), reason, simulated };
}

/**
 * Builds the per-need update for the current weather. Matching needs at weatherSurge partners become
 * urgent with a surgeReason; needs raised earlier return to the urgency remembered in `base`.
 */
export function surgeUpdater(
  state: Pick<AppState, "partners" | "catalog">,
  reading: Reading,
  base: Map<string, Urgency> = new Map(),
): (n: Need) => Need {
  const { cold, heat } = surgeReasons(reading);
  const surgePartners = new Set(state.partners.filter((p) => p.features.includes("weatherSurge")).map((p) => p.id));
  const itemText = new Map(state.catalog.map((c) => [c.id, `${c.name} ${c.category}`]));

  return (need) => {
    const text = `${need.itemId} ${need.title} ${itemText.get(need.itemId) ?? ""}`;
    const reason = !surgePartners.has(need.partnerId)
      ? undefined
      : (cold && COLD_WORDS.test(text) ? cold : undefined) ?? (heat && HEAT_WORDS.test(text) ? heat : undefined);

    if (reason) {
      if (!need.surgeReason) base.set(need.id, need.urgency);
      return { ...need, urgency: "urgent", surgeReason: reason };
    }
    if (!need.surgeReason) return need;
    const rest: Need = { ...need, urgency: base.get(need.id) ?? "normal" };
    delete rest.surgeReason;
    base.delete(need.id);
    return rest;
  };
}

async function nws(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`NWS ${res.status}`);
  return res.json();
}

type Period = { isDaytime: boolean; temperature: number; temperatureUnit: string };

/** Tonight's low (first night period of the forecast) plus the names of active alerts. */
export async function fetchReading(): Promise<Reading> {
  const point = await nws(`${NWS}/points/${POINT}`);
  const forecastUrl = (point.properties as { forecast?: string } | undefined)?.forecast;
  if (!forecastUrl?.startsWith(`${NWS}/`)) throw new Error("NWS forecast link missing");
  const [forecast, active] = await Promise.all([nws(forecastUrl), nws(`${NWS}/alerts/active?point=${POINT}`)]);

  const periods = (forecast.properties as { periods?: Period[] } | undefined)?.periods ?? [];
  const tonight = periods.find((p) => p.isDaytime === false);
  if (!tonight || !Number.isFinite(tonight.temperature)) throw new Error("NWS forecast has no night period");
  const lowF = tonight.temperatureUnit === "C" ? tonight.temperature * 1.8 + 32 : tonight.temperature;

  const features = (active.features as { properties?: { event?: string } }[] | undefined) ?? [];
  const alerts = [...new Set(features.map((f) => f.properties?.event).filter((e): e is string => Boolean(e)))];
  return { lowF, alerts };
}

async function liveWeather(mem: Memory): Promise<Weather> {
  if (mem.cache && Date.now() - mem.cache.at < CACHE_MS) return toWeather(mem.cache.reading, false);
  try {
    const reading = await fetchReading();
    mem.cache = { at: Date.now(), reading };
    return toWeather(reading, false);
  } catch {
    // NWS is down or slow: keep the demo alive with the last reading, or a mild stand-in.
    return toWeather(mem.cache?.reading ?? FALLBACK, true);
  }
}

/**
 * Resolves the current weather (simulated or live), saves it to the store and applies the surge to needs.
 * Pass `simulate` to switch demo mode; leave it undefined to keep the current mode.
 */
export async function refreshWeather(simulate?: Simulate): Promise<Weather> {
  const mem = memory();
  if (simulate !== undefined) mem.simulate = simulate;
  const weather = mem.simulate ? toWeather(SIMULATED[mem.simulate], true) : await liveWeather(mem);
  updateNeeds(surgeUpdater(getState(), weather, mem.base));
  return setWeather(weather);
}
