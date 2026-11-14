import { formatMinutes } from "./format";
import type { RouteSummary } from "@/lib/types";

export function RouteSummaryBanner({ summary }: { summary: RouteSummary }) {
  const saved = summary.naiveMinutes - summary.minutes;
  return (
    <section aria-live="polite" className="rounded-2xl bg-hero-sage p-5">
      <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{summary.label}</h2>
      <p className="mt-2">
        {summary.items} items in {formatMinutes(summary.minutes)} of driving
        {saved > 0
          ? `, instead of ${formatMinutes(summary.naiveMinutes)} as separate trips. That saves ${formatMinutes(saved)}.`
          : "."}
      </p>
    </section>
  );
}
