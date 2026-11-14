import { formatUsd, mileageValue } from "@/lib/fees";
import type { Fulfillment, Partner, PledgeCost, Store } from "@/lib/types";
import { CostBreakdown } from "./cost-breakdown";
import { formatWindow, hoursAssumed } from "./geo";
import { StorePicker } from "./store-picker";

type Props = {
  partner: Partner;
  value: Fulfillment;
  onChange: (f: Fulfillment) => void;
  allowPorch: boolean;
  stores: { store: Store; miles: number }[];
  storeId: string | null;
  onStore: (id: string) => void;
  cost: PledgeCost;
  donors: number;
  driveMiles: number;
  fromLabel: string;
  onLocate: () => void;
  locating: boolean;
};

const OPTIONS: { value: Fulfillment; title: string; blurb: string }[] = [
  { value: "shipt", title: "Shipt delivers", blurb: "Buy it from a nearby store. It arrives as a gift order." },
  { value: "volunteer", title: "I'll drive it", blurb: "Bring new items you own or buy. No fees." },
  { value: "porch", title: "Porch pickup", blurb: "New or sealed items at home. A driver picks them up." },
];

export function DeliveryOptions(p: Props) {
  const options = OPTIONS.filter((o) => o.value !== "porch" || p.allowPorch);
  return (
    <div className="space-y-3">
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-medium">How should it get there?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((o) => (
            <label key={o.value} className="cursor-pointer rounded-xl border border-black/10 p-3 has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50">
              <input type="radio" name="fulfillment" value={o.value} checked={p.value === o.value} onChange={() => p.onChange(o.value)} className="sr-only" />
              <span className="block font-medium">{o.title}</span>
              <span className="block text-xs text-neutral-600">{o.blurb}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {p.value === "shipt" && <StorePicker stores={p.stores} value={p.storeId} onChange={p.onStore} />}

      {p.value !== "shipt" && (
        <div className="rounded-xl bg-neutral-50 p-3 text-sm">
          <p className="font-medium">Receiving hours</p>
          <ul>
            {p.partner.receiving.map((w, i) => <li key={i}>{formatWindow(w)}</li>)}
          </ul>
          {hoursAssumed(p.partner) && <p className="text-xs text-amber-700">Hours not published — call to confirm.</p>}
          <p className="mt-2">
            About <strong>{p.driveMiles.toFixed(1)} mi</strong> from {p.fromLabel}.{" "}
            <button type="button" onClick={p.onLocate} className="text-emerald-700 underline" disabled={p.locating}>
              {p.locating ? "Locating…" : "Use my location"}
            </button>
          </p>
          {p.value === "volunteer" && (
            <p className="text-xs text-neutral-600">
              Mileage log: round trip ≈ {formatUsd(mileageValue(p.driveMiles))} at the 14¢/mile charitable rate (itemizers only).
            </p>
          )}
        </div>
      )}

      <CostBreakdown cost={p.cost} donors={p.donors} />
    </div>
  );
}
