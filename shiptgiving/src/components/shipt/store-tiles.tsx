import type { Store } from "@/lib/types";

export function StoreTiles({ stores, query }: { stores: Store[]; query: string }) {
  const visible = stores.filter((store) => (store.name + " " + store.brand).toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <section aria-labelledby="store-tiles-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="store-tiles-title" className="text-2xl font-bold">Your neighborhood stores</h2>
        <p className="text-xs text-secondary">Sample delivery times</p>
      </div>
      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-hairline bg-surface-muted p-5 text-sm text-secondary">
          {stores.length ? "No stores match your search. Try a store name or clear the search." : "Nearby stores will appear here when available."}
        </p>
      ) : (
        <div tabIndex={0} role="region" aria-label="Scroll nearby stores" className="mt-4 overflow-x-auto rounded-xl pb-3">
          <ul className="flex gap-4">
            {visible.map((store) => {
              const initials = store.brand.split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
              return (
                <li key={store.id} className="w-36 shrink-0">
                  <div aria-hidden="true" className="flex h-24 items-center justify-center rounded-xl border border-hairline bg-surface-muted text-3xl font-extrabold">{initials || "S"}</div>
                  <h3 className="mt-2 min-h-10 text-sm font-semibold">{store.name}</h3>
                  <p className="mt-2 inline-flex rounded-full bg-express px-3 py-1 text-xs font-semibold text-express">
                    <span aria-hidden="true" className="mr-1">ϟ</span>By 2:20 pm
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
