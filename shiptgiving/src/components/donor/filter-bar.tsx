"use client";
import { useState } from "react";

type Props = {
  query: string;
  onQuery: (q: string) => void;
  categories: string[];
  value: string | null;
  onChange: (c: string | null) => void;
};

const TOP = 6;

/** Shipt-style search pill + the main categories, with the rest behind "More". */
export function FilterBar({ query, onQuery, categories, value, onChange }: Props) {
  const [more, setMore] = useState(false);
  const shown = more ? categories : categories.slice(0, TOP);
  const chip = (active: boolean) =>
    `min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${active ? "bg-primary text-white" : "border border-hairline bg-white hover:border-primary"}`;
  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Search needs</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="What would you like to give?"
          className="h-12 w-full rounded-full bg-surface-muted pl-5 pr-12 text-[15px] outline-none focus:ring-2 focus:ring-primary"
        />
        <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-secondary">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </label>
      <div role="group" aria-label="Categories" className={`flex gap-2 ${more ? "flex-wrap" : "-mx-4 overflow-x-auto px-4 [scrollbar-width:none]"}`}>
        <button type="button" aria-pressed={value === null} className={chip(value === null)} onClick={() => onChange(null)}>
          All
        </button>
        {shown.map((c) => (
          <button key={c} type="button" aria-pressed={value === c} className={chip(value === c)} onClick={() => onChange(value === c ? null : c)}>
            {c}
          </button>
        ))}
        {categories.length > TOP && (
          <button type="button" aria-expanded={more} className="min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold underline" onClick={() => setMore(!more)}>
            {more ? "Less" : `More (${categories.length - TOP})`}
          </button>
        )}
      </div>
    </div>
  );
}
