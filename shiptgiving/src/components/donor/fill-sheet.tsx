"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { pledgeCost } from "@/lib/fees";
import type { AppState, Fulfillment, Need, Pledge } from "@/lib/types";
import { DeliveryOptions } from "./delivery-options";
import { dropOff, roadMiles } from "./geo";
import { useDonorLocation } from "./donor-location";
import { PledgeSuccess } from "./pledge-success";
import { QuantityStepper } from "./quantity-stepper";

type Props = { need: Need; state: AppState; onClose: () => void; onPledged: (p: Pledge) => void };

export function FillSheet({ need, state, onClose, onPledged }: Props) {
  const partner = state.partners.find((p) => p.id === need.partnerId);
  const item = state.catalog.find((c) => c.id === need.itemId);
  const remaining = Math.max(0, need.qtyNeeded - need.qtyPledged);
  const [qty, setQty] = useState(Math.min(1, remaining));
  const [fulfillment, setFulfillment] = useState<Fulfillment>("shipt");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [donorName, setDonorName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Pledge | null>(null);
  const donor = useDonorLocation();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const drop = partner ? dropOff(partner) : null;
  const stores = useMemo(() => {
    if (!drop) return [];
    const allowed = item?.storeIds.length ? state.stores.filter((s) => item.storeIds.includes(s.id)) : [];
    const pool = allowed.length ? allowed : state.stores;
    return pool.map((store) => ({ store, miles: roadMiles(store.location, drop.location) })).sort((a, b) => a.miles - b.miles).slice(0, 6);
  }, [drop, item, state.stores]);
  const chosenStore = storeId ?? stores[0]?.store.id ?? null;

  if (!partner || !drop) return null;
  const allowPorch = partner.accepts.porchPickup && !item?.perishable;
  const donors =
    state.pledges.filter((p) => p.partnerId === partner.id && p.fulfillment !== "volunteer" && (p.status === "pledged" || p.status === "batched")).length + 1;
  const cost = pledgeCost(item?.price ?? 0, qty, fulfillment, donors);
  const driveMiles = roadMiles(donor.point, drop.location);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needId: need.id,
          qty,
          fulfillment,
          donorName,
          storeId: fulfillment === "shipt" ? chosenStore : undefined,
          porch: fulfillment === "porch" ? donor.point : undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong");
      setDone(body as Pledge);
      onPledged(body as Pledge);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const cta = fulfillment === "shipt" ? "Send via Shipt" : fulfillment === "volunteer" ? "Pledge to drive it" : "Schedule porch pickup";

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fill-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 text-neutral-900 shadow-xl outline-none sm:rounded-3xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="fill-title" className="text-lg font-bold">{need.title}</h2>
            <p className="text-sm text-neutral-600">for {partner.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-2 text-2xl leading-none text-neutral-500 hover:bg-neutral-100">×</button>
        </div>

        {done ? (
          <PledgeSuccess pledge={done} partner={partner} title={need.title} onClose={onClose} />
        ) : (
          <div className="space-y-4">
            <QuantityStepper value={qty} max={remaining} onChange={setQty} unitPrice={item?.price} />
            <DeliveryOptions
              partner={partner}
              value={fulfillment}
              onChange={setFulfillment}
              allowPorch={allowPorch}
              stores={stores}
              storeId={chosenStore}
              onStore={setStoreId}
              cost={cost}
              donors={fulfillment === "volunteer" ? 1 : donors}
              driveMiles={driveMiles}
              fromLabel={donor.label}
              onLocate={donor.locate}
              locating={donor.locating}
            />
            <label className="block text-sm">
              <span className="font-medium">Name on the acknowledgment</span>
              <input value={donorName} onChange={(e) => setDonorName(e.target.value)} maxLength={60} placeholder="A neighbor" autoComplete="name" className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="button" onClick={submit} disabled={busy || qty < 1} className="w-full rounded-full bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:bg-neutral-300">
              {busy ? "Sending…" : cta}
            </button>
            {fulfillment === "shipt" && <p className="text-center text-xs text-neutral-500">Demo checkout. In production this is Shipt&apos;s gift-order checkout.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
