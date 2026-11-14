import Link from "next/link";
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
    <div className="space-y-4 text-center" role="status">
      <span className="pop-in mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-express text-express" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-8 w-8">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <p className="text-xl font-bold leading-snug">
          {pledge.qty} × {title}
        </p>
        <p className="text-secondary">pledged to {partner.name}</p>
      </div>
      <p className="text-sm text-secondary">{NEXT[pledge.fulfillment]}</p>
      <dl className="space-y-1 rounded-2xl bg-surface-muted p-3 text-left text-sm">
        <div className="flex justify-between gap-3">
          <dt>You pay</dt>
          <dd className="font-bold tabular-nums">{formatUsd(amountCharged(pledge.cost, pledge.fulfillment))}</dd>
        </div>
        {pledge.fulfillment === "volunteer" && (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0">Drop-off</dt>
            <dd className="text-right">{dropOff(partner).address}</dd>
          </div>
        )}
      </dl>
      <div className="flex gap-2">
        {pledge.fulfillment === "shipt" && (
          <Link href={`/shipt/order/${pledge.id}`} className="press flex min-h-11 flex-1 items-center justify-center rounded-full border border-primary text-sm font-semibold hover:bg-surface-muted">
            Track order
          </Link>
        )}
        <button type="button" onClick={onClose} className="press min-h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-white hover:bg-black">
          Done
        </button>
      </div>
    </div>
  );
}
