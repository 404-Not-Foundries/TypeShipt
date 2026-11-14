import type { Window } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "09:00" -> "9am", "16:30" -> "4:30pm" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h)) return hhmm;
  const hour = h % 12 === 0 ? 12 : h % 12;
  const minutes = m ? `:${String(m).padStart(2, "0")}` : "";
  return `${hour}${minutes}${h < 12 ? "am" : "pm"}`;
}

/** [1,2,3,4,5] -> "Mon–Fri"; all seven -> "Daily"; gaps are listed. */
export function formatDays(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (sorted.length === 7) return "Daily";
  if (sorted.length === 0) return "By appointment";
  const consecutive = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (consecutive && sorted.length > 2) return `${DAYS[sorted[0]]}–${DAYS[sorted[sorted.length - 1]]}`;
  return sorted.map((d) => DAYS[d] ?? "?").join(", ");
}

export function formatWindow(w: Window): string {
  return `${formatDays(w.days)} ${formatTime(w.open)}–${formatTime(w.close)}`;
}
