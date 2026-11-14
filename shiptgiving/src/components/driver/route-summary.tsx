import { formatMinutes } from "./format";
import type { RouteSummary } from "@/lib/types";

export function RouteSummaryBanner({ summary }: { summary: RouteSummary }) {
  const saved = summary.naiveMinutes - summary.minutes;
  return (
    <section aria-live="polite" className="rounded-2xl bg-emerald-800 p-5 text-white">
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{summary.label}</h2>
      <p className="mt-2 text-emerald-50">
        {summary.items} items in {formatMinutes(summary.minutes)} of driving, instead of{" "}
        {formatMinutes(summary.naiveMinutes)} as separate trips
        {saved > 0 ? `. That saves ${formatMinutes(saved)}.` : "."}
      </p>
    </section>
  );
}
