"use client";
import type { AppState } from "@/lib/types";
import { recentActivity, timeAgo } from "./community";
import { useNow } from "./use-now";

const WINDOW_MS = 10 * 60 * 1000;

/** Live "neighbors are giving" strip: the feed should feel like a community moving together. */
export function ActivityFeed({ state }: { state: AppState }) {
  const now = useNow(15000);
  const items = recentActivity(state, 4);
  if (items.length === 0) return null;
  const recent = state.pledges.filter((p) => now - Date.parse(p.createdAt) < WINDOW_MS).length;

  return (
    <section aria-labelledby="activity-title" className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="activity-title" className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          Neighbors giving now
        </h2>
        {recent > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-express px-2.5 py-0.5 text-xs font-semibold text-express">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-express-text)]" aria-hidden />
            {recent} in the last 10 min
          </span>
        )}
      </div>
      <ul className="mt-2 space-y-1.5 text-sm" aria-live="polite">
        {items.map((a) => (
          <li key={a.id} className="flex justify-between gap-3">
            <span className="min-w-0">
              <strong className="font-semibold">{a.who}</strong> pledged {a.qty} × {a.item}
              <span className="text-secondary"> for {a.partner}</span>
            </span>
            <span className="shrink-0 text-xs text-secondary">{timeAgo(a.at, now)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
