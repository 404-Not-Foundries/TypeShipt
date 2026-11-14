"use client";
import { useState } from "react";
import type { Fulfillment, Need, Pledge, PledgeStatus } from "@/lib/types";
import { confirmReceipt, errorMessage } from "./api";

type Props = { pledges: Pledge[]; needs: Need[]; onChanged: () => void };

const COLUMNS: { title: string; statuses: PledgeStatus[]; empty: string }[] = [
  { title: "Pledged", statuses: ["pledged", "batched"], empty: "No new pledges yet." },
  { title: "On the way", statuses: ["picked_up"], empty: "Nothing on the road." },
  { title: "Delivered", statuses: ["delivered"], empty: "Nothing waiting for a count." },
  { title: "Received", statuses: ["received"], empty: "Nothing confirmed yet." },
];

const FULFILLMENT_LABELS: Record<Fulfillment, string> = {
  shipt: "Shipt delivery",
  volunteer: "Volunteer driver",
  porch: "Porch pickup",
};

export function IncomingBoard({ pledges, needs, onChanged }: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function confirm(pledge: Pledge) {
    setPending(pledge.id);
    setError(null);
    try {
      await confirmReceipt(pledge.id);
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="incoming-heading">
      <h2 id="incoming-heading" className="text-lg font-semibold text-neutral-900">
        Incoming donations
      </h2>
      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = pledges.filter((p) => col.statuses.includes(p.status));
          return (
            <div key={col.title} className="rounded-xl border border-black/10 bg-white p-3">
              <h3 className="flex items-center justify-between text-sm font-semibold text-neutral-800">
                {col.title}
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">{items.length}</span>
              </h3>
              {items.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">{col.empty}</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {items.map((p) => {
                    const need = needs.find((n) => n.id === p.needId);
                    const delivered = p.status === "delivered";
                    return (
                      <li key={p.id} className="rounded-lg bg-neutral-50 p-2 text-sm">
                        <p className="font-medium text-neutral-900">
                          {p.qty} × {need?.title ?? "Item"}
                        </p>
                        <p className="text-neutral-600">
                          {p.donorName} · {FULFILLMENT_LABELS[p.fulfillment]}
                          {p.status === "batched" && " · on a route"}
                        </p>
                        {p.status !== "received" && (
                          <button
                            type="button"
                            disabled={pending !== null}
                            onClick={() => confirm(p)}
                            className={`mt-2 rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                              delivered
                                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                : "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
                            }`}
                          >
                            {pending === p.id ? "Confirming…" : `Confirm receipt of ${p.qty}`}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
