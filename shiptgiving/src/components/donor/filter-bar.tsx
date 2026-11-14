"use client";
import type { SortMode } from "./sort-needs";

type Option = { id: string; name: string; count: number };

type Props = {
  query: string;
  onQuery: (q: string) => void;
  partners: Option[];
  partnerId: string | null;
  onPartner: (id: string | null) => void;
  categories: Option[];
  selected: string[];
  onToggleCategory: (name: string) => void;
  sort: SortMode;
  onSort: (s: SortMode) => void;
  shown: number;
  total: number;
  onClear: () => void;
};

const SORTS: { value: SortMode; label: string }[] = [
  { value: "urgent", label: "Most urgent" },
  { value: "closest", label: "Closest" },
  { value: "filled", label: "Almost filled" },
];

function PillSelect({ label, active, children, ...rest }: { label: string; active: boolean } & React.ComponentProps<"select">) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        {...rest}
        className={`h-11 max-w-[9.5rem] cursor-pointer sm:max-w-[13rem] appearance-none truncate rounded-full border pl-4 pr-9 text-sm font-semibold ${active ? "border-primary bg-surface-muted" : "border-hairline bg-white hover:border-primary"}`}
      >
        {children}
      </select>
      <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-3 top-3.5 h-4 w-4">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

/** One sticky bar for the whole browse: search, nonprofit, sort, category chips, the result count and Clear. */
export function FilterBar(p: Props) {
  const active = p.query.trim() !== "" || p.partnerId !== null || p.selected.length > 0;
  return (
    <div className="sticky top-0 z-20 -mx-4 space-y-2 border-b border-hairline bg-white px-4 py-3 sm:top-[61px]">
      <label className="relative block">
        <span className="sr-only">Search needs</span>
        <input
          type="search"
          value={p.query}
          onChange={(e) => p.onQuery(e.target.value)}
          placeholder="Search blankets, socks, a shelter…"
          className="h-12 w-full rounded-full bg-surface-muted pl-12 pr-5 text-[15px] outline-none focus:ring-2 focus:ring-primary"
        />
        <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-secondary">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </label>

      <div role="group" aria-label="Filters" className="-mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <PillSelect label="Nonprofit" active={p.partnerId !== null} value={p.partnerId ?? ""} onChange={(e) => p.onPartner(e.target.value || null)}>
          <option value="">All nonprofits</option>
          {p.partners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.count})
            </option>
          ))}
        </PillSelect>
        <PillSelect label="Sort by" active={p.sort !== "urgent"} value={p.sort} onChange={(e) => p.onSort(e.target.value as SortMode)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </PillSelect>
        {p.categories.map((c) => {
          const on = p.selected.includes(c.name);
          return (
            <button
              key={c.name}
              type="button"
              aria-pressed={on}
              onClick={() => p.onToggleCategory(c.name)}
              className={`press min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${on ? "bg-primary text-white" : "border border-hairline bg-white hover:border-primary"}`}
            >
              {c.name} <span className={`font-normal tabular-nums ${on ? "text-white/70" : "text-secondary"}`}>{c.count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-6 items-center justify-between gap-3 text-sm">
        <p role="status" className="text-secondary">
          <span className="font-semibold text-primary tabular-nums">{p.shown}</span> of {p.total} needs
        </p>
        {active && (
          <button type="button" onClick={p.onClear} className="-my-2.5 min-h-11 px-1 font-semibold underline">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
