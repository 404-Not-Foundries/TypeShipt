"use client";
import { useEffect, useState } from "react";
import type { AppState } from "@/lib/types";
import { helpersByNeed, helpersLine } from "./community";

type Moment = { needId: string; title: string; partner: string; qty: number; who: string | null };

const filledKey = (s: AppState) =>
  s.needs.filter((n) => n.qtyNeeded > 0 && n.qtyPledged >= n.qtyNeeded).map((n) => n.id).sort().join("|");

const PIECES = ["🎉", "💚", "✨", "🤝", "🎊", "💛"];

/**
 * When a need reaches 100% while the page is open (on any screen, via polling),
 * celebrate everyone who filled it. Needs already full on first load are not celebrated.
 */
export function FilledCelebration({ state }: { state: AppState }) {
  const key = filledKey(state);
  const [seen, setSeen] = useState<string | null>(null);
  const [moment, setMoment] = useState<Moment | null>(null);

  // Adjust state while rendering (React's "storing information from previous renders" pattern).
  if (seen === null) {
    setSeen(key);
  } else if (seen !== key) {
    const before = new Set(seen.split("|"));
    const newly = key.split("|").filter((id) => id && !before.has(id));
    setSeen(key);
    const need = state.needs.find((n) => n.id === newly[newly.length - 1]);
    if (need) {
      setMoment({
        needId: need.id,
        title: need.title,
        partner: state.partners.find((p) => p.id === need.partnerId)?.name ?? "A partner",
        qty: need.qtyNeeded,
        who: helpersLine(helpersByNeed(state.pledges).get(need.id), 3),
      });
    }
  }

  useEffect(() => {
    if (!moment) return;
    const id = setTimeout(() => setMoment(null), 8000);
    return () => clearTimeout(id);
  }, [moment]);

  if (!moment) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[1200] overflow-hidden">
      <style>{`@keyframes sg-fall{0%{transform:translateY(-10vh) rotate(0)}100%{transform:translateY(110vh) rotate(540deg)}}`}</style>
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={`${moment.needId}-${i}`}
          aria-hidden
          className="absolute top-0 text-2xl motion-reduce:hidden"
          style={{ left: `${(i * 37) % 100}%`, animation: `sg-fall ${2.4 + (i % 5) * 0.35}s ease-in ${(i % 7) * 0.15}s forwards` }}
        >
          {PIECES[i % PIECES.length]}
        </span>
      ))}
      <div
        role="status"
        className="pointer-events-auto absolute inset-x-4 bottom-6 mx-auto max-w-md rounded-2xl border border-hairline bg-white p-5 shadow-float"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-express">Filled together</p>
        <p className="mt-1 text-lg font-bold">
          {moment.partner} has all {moment.qty} {moment.title.toLowerCase()} 🎉
        </p>
        {moment.who && <p className="mt-1 text-sm text-secondary">Thank you, {moment.who}. This is what neighbors do.</p>}
        <button type="button" onClick={() => setMoment(null)} className="mt-3 min-h-11 rounded-full border border-primary px-4 text-sm font-semibold">
          Keep giving
        </button>
      </div>
    </div>
  );
}
