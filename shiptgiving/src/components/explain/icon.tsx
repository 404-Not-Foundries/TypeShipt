// Tiny line icons for /how-it-works. Owner: rmaytr. Decorative: the text next to each one carries the meaning.

export type IconName = "gift" | "chat" | "snow" | "route" | "chart" | "bag" | "panels" | "post" | "spark" | "box" | "truck" | "check" | "receipt";

const PATHS: Record<IconName, string[]> = {
  gift: ["M4 11h16v9H4z", "M3 7h18v4H3z", "M12 7v13", "M12 7c-2-4-6-3-5 0", "M12 7c2-4 6-3 5 0"],
  chat: ["M4 5h16v11H9l-5 4z", "M8 9h8", "M8 12h5"],
  snow: ["M12 3v18", "M4.2 7.5l15.6 9", "M4.2 16.5l15.6-9", "M10 4.5l2 1.5 2-1.5", "M10 19.5l2-1.5 2 1.5"],
  route: ["M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"],
  chart: ["M4 20h16", "M7 16v-4", "M12 16V8", "M17 16v-7"],
  bag: ["M5 8h14l-1 12H6z", "M9 8V6a3 3 0 0 1 6 0v2"],
  panels: ["M3 5h18v14H3z", "M9 5v14", "M15 5v14"],
  post: ["M6 3h9l3 3v15H6z", "M9 10h6", "M9 14h6", "M9 18h3"],
  spark: ["M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"],
  box: ["M4 8l8-4 8 4v8l-8 4-8-4z", "M4 8l8 4 8-4", "M12 12v8"],
  truck: ["M3 7h11v9H3z", "M14 10h4l3 3v3h-7z", "M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M17 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"],
  check: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M8 12l3 3 5-6"],
  receipt: ["M6 3h12v18l-3-2-3 2-3-2-3 2z", "M9 8h6", "M9 12h6"],
};

export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
