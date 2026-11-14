"use client";
import { useEffect } from "react";
import { formatUsd } from "@/lib/fees";
import type { AppState, Pledge } from "@/lib/types";

type Props = { pledge: Pledge; state: AppState; onClose: () => void };

/** Written acknowledgment for an in-kind gift (what the IRS asks for on gifts of $250+). Never promises a deduction. */
export function Receipt({ pledge, state, onClose }: Props) {
  const partner = state.partners.find((p) => p.id === pledge.partnerId);
  const need = state.needs.find((n) => n.id === pledge.needId);
  const item = state.catalog.find((c) => c.id === need?.itemId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 text-sm text-neutral-900 shadow-xl sm:rounded-3xl"
      >
        <h2 id="receipt-title" className="text-lg font-bold">Donation acknowledgment</h2>
        <p className="mt-1 text-neutral-600">{partner?.name ?? "Partner"}</p>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between gap-4"><dt className="text-neutral-500">Donor</dt><dd>{pledge.donorName}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-neutral-500">Items received</dt><dd className="text-right">{pledge.qty} × {item?.name ?? need?.title}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-neutral-500">Item cost paid</dt><dd>{formatUsd(pledge.cost.items)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-neutral-500">Pledged</dt><dd>{new Date(pledge.createdAt).toLocaleDateString()}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-neutral-500">Reference</dt><dd className="font-mono text-xs">{pledge.id}</dd></div>
        </dl>
        <p className="mt-4 rounded-lg bg-neutral-50 p-3 font-medium">No goods or services were provided in return for this contribution.</p>
        <p className="mt-3 text-xs text-neutral-500">
          This is a non-cash gift. Whether it is deductible depends on your situation (for example, whether you itemize). Please consult a tax professional.
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => window.print()} className="flex-1 rounded-full border border-black/15 py-2.5 font-medium">Print</button>
          <button type="button" onClick={onClose} className="flex-1 rounded-full bg-emerald-700 py-2.5 font-medium text-white">Close</button>
        </div>
      </article>
    </div>
  );
}
