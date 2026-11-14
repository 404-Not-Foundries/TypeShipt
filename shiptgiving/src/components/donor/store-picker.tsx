import type { Store } from "@/lib/types";

type Props = { stores: { store: Store; miles: number }[]; value: string | null; onChange: (id: string) => void };

export function StorePicker({ stores, value, onChange }: Props) {
  if (stores.length === 0) return <p className="text-sm text-neutral-500">No nearby stores found.</p>;
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium">Buy from (closest to the drop-off first)</legend>
      <ul className="max-h-48 space-y-1.5 overflow-y-auto">
        {stores.map(({ store, miles }) => (
          <li key={store.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 p-2.5 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50">
              <input type="radio" name="store" value={store.id} checked={value === store.id} onChange={() => onChange(store.id)} className="accent-emerald-700" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{store.brand}</span>
                <span className="block truncate text-xs text-neutral-500">{store.name} · {store.address}</span>
              </span>
              <span className="shrink-0 text-xs text-neutral-500">{miles.toFixed(1)} mi</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
