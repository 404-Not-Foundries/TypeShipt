import type { Weather } from "@/lib/types";

export function WeatherBanner({ weather }: { weather: Weather }) {
  if (!weather.surge) return null;
  return (
    <div role="status" className="rounded-2xl bg-sky-900 p-4 text-white">
      <p className="font-semibold">
        Weather Surge · low of {Math.round(weather.lowF)}°F tonight
        {weather.simulated && <span className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-xs">simulated</span>}
      </p>
      <p className="mt-1 text-sm text-sky-100">
        {weather.reason ?? "Shelters are opening extra beds."} Cold-weather needs have moved to the top.
      </p>
      {weather.alerts.length > 0 && <p className="mt-1 text-xs text-sky-200">NWS: {weather.alerts.join(" · ")}</p>}
    </div>
  );
}
