import type { CatalogItem, Urgency } from "@/lib/types";
import type { DraftItem } from "./api";

export type Row = DraftItem & { key: string };

const URGENCIES: Urgency[] = ["normal", "high", "urgent"];
const FIELD = "rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900";

type Props = {
  rows: Row[];
  catalog: CatalogItem[];
  onChange: (rows: Row[]) => void;
};

export function NeedRows({ rows, catalog, onChange }: Props) {
  const patch = (key: string, change: Partial<DraftItem>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...change } : r)));

  const pickItem = (key: string, itemId: string) => {
    const item = catalog.find((c) => c.id === itemId);
    patch(key, { itemId, title: item?.name ?? "" });
  };

  return (
    <ul className="space-y-2">
      {rows.map((row, i) => {
        const item = catalog.find((c) => c.id === row.itemId);
        return (
          <li key={row.key} className="grid grid-cols-2 gap-2 rounded-lg bg-neutral-50 p-2 sm:grid-cols-[1.2fr_1.5fr_5rem_6.5rem_auto]">
            <select
              aria-label={`Catalog item for row ${i + 1}`}
              value={row.itemId}
              onChange={(e) => pickItem(row.key, e.target.value)}
              className={FIELD}
            >
              {!item && <option value={row.itemId}>Pick a catalog item</option>}
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (${c.price.toFixed(2)})
                </option>
              ))}
            </select>
            <input
              aria-label={`Title for row ${i + 1}`}
              value={row.title}
              maxLength={80}
              onChange={(e) => patch(row.key, { title: e.target.value })}
              className={FIELD}
            />
            <input
              aria-label={`Quantity for row ${i + 1}`}
              type="number"
              min={1}
              max={10000}
              value={row.qty}
              onChange={(e) => patch(row.key, { qty: Math.trunc(Number(e.target.value)) || 0 })}
              className={FIELD}
            />
            <select
              aria-label={`Urgency for row ${i + 1}`}
              value={row.urgency}
              onChange={(e) => patch(row.key, { urgency: e.target.value as Urgency })}
              className={FIELD}
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
              className="rounded-lg px-2 py-1.5 text-sm text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** A row is publishable when it points at a real catalog item with a whole quantity in range. */
export function rowIsValid(row: DraftItem, catalog: CatalogItem[]): boolean {
  return catalog.some((c) => c.id === row.itemId) && Number.isInteger(row.qty) && row.qty >= 1 && row.qty <= 10000;
}
