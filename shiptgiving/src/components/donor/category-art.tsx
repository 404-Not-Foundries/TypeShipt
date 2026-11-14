// Line illustrations for need tiles (the catalog has no photos). Owner: mulimangila.

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ART: Record<string, React.ReactNode> = {
  Clothing: <path {...P} d="M9 4l3 2 3-2 5 3-2 4-2-1v10H8V10l-2 1-2-4z" />,
  Bedding: <><rect {...P} x="3" y="7" width="18" height="11" rx="2" /><path {...P} d="M3 11h18M7 18v2M17 18v2" /></>,
  "Cold weather": <path {...P} d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5" />,
  "Heat relief": <><circle {...P} cx="12" cy="12" r="4" /><path {...P} d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
  Hygiene: <><rect {...P} x="8" y="8" width="8" height="13" rx="2" /><path {...P} d="M10 8V5h4v3M12 5V3h3" /></>,
  Food: <><path {...P} d="M5 9h14l-1.5 11h-11z" /><path {...P} d="M9 9V6a3 3 0 016 0v3" /></>,
  "Fresh food": <path {...P} d="M12 7c-4-3-8 0-7 5s4 8 7 8 6-3 7-8-3-8-7-5zM12 7c0-2 1-3 3-4" />,
  "Baby & kids": <><circle {...P} cx="12" cy="9" r="5" /><path {...P} d="M9 9h.01M15 9h.01M10 11.5c1 .8 3 .8 4 0M7 21c1-4 9-4 10 0" /></>,
  "Garden & kitchen": <path {...P} d="M7 21V11M7 11c-3 0-4-3-4-6 3 0 4 3 4 6zM7 11c3 0 4-3 4-6-3 0-4 3-4 6zM14 4v17M17 4v5a3 3 0 01-6 0V4" />,
  "School & tech": <><rect {...P} x="4" y="5" width="16" height="11" rx="1.5" /><path {...P} d="M2 19h20" /></>,
  Dorm: <><path {...P} d="M4 20V9l8-5 8 5v11z" /><path {...P} d="M10 20v-6h4v6" /></>,
};
const FALLBACK = <><path {...P} d="M4 8l8-4 8 4v8l-8 4-8-4z" /><path {...P} d="M4 8l8 4 8-4M12 12v8" /></>;

const TINT: Record<string, string> = {
  "Cold weather": "bg-hero-sage",
  Bedding: "bg-hero-sage",
  "Fresh food": "bg-express",
  "Garden & kitchen": "bg-express",
  Dorm: "bg-totemeal",
  "School & tech": "bg-totemeal",
};

export function CategoryArt({ category, className = "" }: { category?: string; className?: string }) {
  const art = (category && ART[category]) ?? FALLBACK;
  const tint = (category && TINT[category]) ?? "bg-surface-muted";
  return (
    <div className={`flex items-center justify-center ${tint} ${className}`} aria-hidden>
      <svg viewBox="0 0 24 24" className="h-14 w-14 text-primary/80">{art}</svg>
    </div>
  );
}
