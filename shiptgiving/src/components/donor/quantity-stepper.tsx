import { formatUsd } from "@/lib/fees";

type Props = { value: number; max: number; onChange: (n: number) => void; unitPrice?: number };

export function QuantityStepper({ value, max, onChange, unitPrice }: Props) {
  const set = (n: number) => onChange(Math.max(1, Math.min(max, n)));
  const btn = "h-10 w-10 rounded-full border border-black/15 text-xl disabled:opacity-40";
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">How many?</p>
        <p className="text-xs text-neutral-500">
          {max} still needed{unitPrice ? ` · about ${formatUsd(unitPrice)} each` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= 1} aria-label="Fewer">−</button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={value}
          onChange={(e) => set(Number(e.target.value) || 1)}
          aria-label="Quantity"
          className="w-14 rounded-lg border border-black/15 py-1.5 text-center"
        />
        <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= max} aria-label="More">+</button>
      </div>
    </div>
  );
}
