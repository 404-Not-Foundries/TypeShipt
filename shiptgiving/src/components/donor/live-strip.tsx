"use client";
import type { AppState } from "@/lib/types";
import { recentActivity, timeAgo } from "./community";
import { useNow } from "./use-now";

const WINDOW_MS = 10 * 60 * 1000;

/** One compact line: tonight's weather + neighbors giving right now. Replaces the banner and activity box. */
export function LiveStrip({ state }: { state: AppState }) {
  const now = useNow(15000);
  const { weather } = state;
  const latest = recentActivity(state, 1)[0];
  const recent = state.pledges.filter((p) => now - Date.parse(p.createdAt) < WINDOW_MS).length;
  if (!weather.surge && !latest) return null;

  const dark = weather.surge;
  return (
    <div
      role="status"
      className={`flex flex-col gap-1 rounded-2xl px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${dark ? "bg-dark-band text-white" : "border border-hairline bg-white"}`}
    >
      {weather.surge && (
        <p className="font-semibold">
          {Math.round(weather.lowF)}°F tonight{weather.alerts[0] ? ` · ${weather.alerts[0]}` : ""}
          {weather.simulated && <span className="ml-2 text-xs font-normal opacity-60">(simulated)</span>}
        </p>
      )}
      {latest && (
        <p className={dark ? "text-white/75" : "text-secondary"}>
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${dark ? "bg-white" : "bg-[var(--accent-express-text)]"} animate-pulse`} aria-hidden />
          {recent > 1 ? `${recent} neighbors gave in the last 10 min · ` : ""}
          {latest.who} pledged {latest.qty} × {latest.item.toLowerCase()} · {timeAgo(latest.at, now)}
        </p>
      )}
    </div>
  );
}
