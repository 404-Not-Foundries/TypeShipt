import { amountCharged, formatUsd } from "@/lib/fees";
import type { Partner, Pledge } from "@/lib/types";
import { dropOff } from "./geo";

type Props = { pledge: Pledge; partner: Partner; title: string; onClose: () => void };

const NEXT: Record<Pledge["fulfillment"], string> = {
  shipt: "Your gift order is in. It joins tonight's community batch, and you'll see it move to delivered here.",
  volunteer: "Thank you! Drop it off during receiving hours. Your mileage log is saved with the pledge.",
  porch: "A driver will pick it up on a batched route. Leave it on your porch, sealed and labeled.",
};

export function PledgeSuccess({ pledge, partner, title, onClose }: Props) {
  return (
    <div className="space-y-3 text-center" role="status">
      <p className="text-4xl" aria-hidden>🎉</p>
      <p className="text-lg font-semibold">
        {pledge.qty} × {title} pledged to {partner.name}
      </p>
      <p className="text-sm text-neutral-600">{NEXT[pledge.fulfillment]}</p>
      {pledge.fulfillment === "volunteer" && <p className="text-sm">Drop-off: {dropOff(partner).address}</p>}
      <p className="text-sm">
        You pay: <strong>{formatUsd(amountCharged(pledge.cost, pledge.fulfillment))}</strong>
      </p>
      <button type="button" onClick={onClose} className="w-full rounded-full bg-emerald-700 py-3 font-semibold text-white">
        Done
      </button>
    </div>
  );
}
