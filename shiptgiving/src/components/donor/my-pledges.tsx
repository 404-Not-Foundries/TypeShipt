"use client";
import { useState } from "react";
import { amountCharged, formatUsd } from "@/lib/fees";
import type { AppState, PledgeStatus } from "@/lib/types";
import { Receipt } from "./receipt";

const STATUS: Record<PledgeStatus, string> = {
  pledged: "Pledged",
  batched: "In a batch",
  picked_up: "On the way",
  delivered: "Delivered",
  received: "Received ✓",
};

export function MyPledges({ ids, state }: { ids: string[]; state: AppState }) {
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const mine = ids.map((id) => state.pledges.find((p) => p.id === id)).filter((p) => p !== undefined);
  if (mine.length === 0) return null;
  const receipt = mine.find((p) => p.id === receiptId);

  return (
    <section aria-labelledby="my-pledges" className="rounded-2xl border border-hairline bg-totemeal p-4">
      <h2 id="my-pledges" className="font-semibold">Your pledges</h2>
      <ul className="mt-2 divide-y divide-hairline text-sm">
        {mine.map((p) => {
          const need = state.needs.find((n) => n.id === p.needId);
          const partner = state.partners.find((x) => x.id === p.partnerId);
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="min-w-0">
                {p.qty} × {need?.title ?? "item"} · {partner?.name}
                <span className="block text-xs text-secondary">{formatUsd(amountCharged(p.cost, p.fulfillment))}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.status === "received" ? "bg-express text-express" : "border border-hairline bg-white"}`}>{STATUS[p.status]}</span>
                {p.status === "received" && (
                  <button type="button" onClick={() => setReceiptId(p.id)} className="text-xs font-medium text-primary underline">
                    View receipt
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {receipt && <Receipt pledge={receipt} state={state} onClose={() => setReceiptId(null)} />}
    </section>
  );
}
