import { formatUsd, mileageValue } from "@/lib/fees";
import type { Fulfillment, Partner, Store } from "@/lib/types";
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
        <div className="grid gap-2">
          {options.map((o) => (
            <label key={o.value} className="cursor-pointer rounded-xl border border-hairline p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:checked]:border-primary has-[:checked]:bg-surface-muted">
              <input type="radio" name="fulfillment" value={o.value} checked={p.value === o.value} onChange={() => p.onChange(o.value)} className="sr-only" />
              <span className="flex items-center gap-2 font-semibold">
                {o.title}
                {o.value === "shipt" && <span className="rounded-full bg-express px-2 py-0.5 text-[11px] font-semibold text-express">⚡ Same-day</span>}
              </span>
              <span className="block text-xs text-secondary">{o.blurb}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {p.value === "shipt" && <StorePicker stores={p.stores} value={p.storeId} onChange={p.onStore} />}

      {p.value !== "shipt" && (
        <div className="rounded-xl bg-surface-muted p-3 text-sm">
          <p className="font-medium">Receiving hours</p>
          <ul>
            {p.partner.receiving.map((w, i) => <li key={i}>{formatWindow(w)}</li>)}
          </ul>
          {hoursAssumed(p.partner) && <p className="text-xs text-secondary">Hours not published — call to confirm.</p>}
          <p className="mt-2">
            {p.value === "porch" ? <>Pickup from <strong>{p.fromLabel}</strong>, about </> : <>About </>}
            <strong>{p.driveMiles.toFixed(1)} mi</strong>{p.value === "porch" ? " to the drop-off." : ` from ${p.fromLabel}.`}{" "}
            <button type="button" onClick={p.onLocate} className="text-primary underline" disabled={p.locating}>
              {p.locating ? "Locating…" : "Use my location"}
            </button>
          </p>
          {p.value === "volunteer" && (
            <p className="text-xs text-secondary">
              Mileage log: round trip ≈ {formatUsd(mileageValue(p.driveMiles))} at the 14¢/mile charitable rate (itemizers only).
            </p>
          )}
        </div>
      )}

    </div>
  );
}
