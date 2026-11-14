"use client";

type Props = { query: string; onQueryChange: (query: string) => void };

export function ConceptHeader({ query, onQueryChange }: Props) {
  return (
    <header className="sticky top-0 z-[1001] border-y border-hairline bg-white py-4">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <span className="text-3xl font-extrabold tracking-tight">Shipt</span>
        <p className="text-right text-xs leading-5 sm:order-3">
          Deliver to <span className="block text-sm font-semibold underline underline-offset-4">35203</span>
        </p>
        <div className="relative col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <label htmlFor="concept-search" className="sr-only">Search nearby stores and urgent needs</label>
          <input id="concept-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)}
            placeholder="What are you looking for?"
            className="min-h-11 w-full rounded-full border border-hairline bg-surface-muted py-3 pr-11 pl-5 text-sm text-primary placeholder:text-secondary" />
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            className="pointer-events-none absolute top-3 right-4 size-5">
            <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
          </svg>
        </div>
      </div>
    </header>
  );
}
