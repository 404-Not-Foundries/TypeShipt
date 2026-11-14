import type { VehicleSize } from "@/lib/types";

const LEVEL: Record<VehicleSize, number> = { S: 1, M: 2, L: 3, XL: 4 };

/** Route-size chip: the letter plus four cargo blocks, filled up to the size. */
export function SizeBadge({ size }: { size: VehicleSize }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-2 py-1 text-xs font-bold text-white"
      aria-label={`Route size ${size}`}
    >
      <span className="w-5 text-center">{size}</span>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`w-1 rounded-sm ${n <= LEVEL[size] ? "bg-amber-300" : "bg-white/25"}`}
            style={{ height: 4 + n * 2 }}
          />
        ))}
      </span>
    </span>
  );
}
