"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { amountCharged, formatUsd, pledgeCost } from "@/lib/fees";
import { fleetCapacity } from "@/lib/routing/assign";
import type { AppState, Fulfillment, Need, Pledge } from "@/lib/types";
import { CostBreakdown } from "./cost-breakdown";
import { DeliveryOptions } from "./delivery-options";
import { dropOff, roadMiles } from "./geo";
import { useDonorLocation } from "./donor-location";
import { ItemPhoto } from "./item-photo";
import { PledgeSuccess } from "./pledge-success";
import { QuantityStepper } from "./quantity-stepper";

type Props = { need: Need; state: AppState; onClose: () => void; onPledged: (p: Pledge) => void };

const STEPS = ["Quantity", "Delivery", "Confirm"];
const METHOD: Record<Fulfillment, { name: string; cta: string }> = {
  shipt: { name: "Shipt delivers", cta: "Send via Shipt" },
  volunteer: { name: "I'll drive it", cta: "Pledge to drive" },
  porch: { name: "Porch pickup", cta: "Schedule pickup" },
};

export function FillSheet({ need, state, onClose, onPledged }: Props) {
  const partner = state.partners.find((p) => p.id === need.partnerId);
  const item = state.catalog.find((c) => c.id === need.itemId);
  const remaining = Math.max(0, need.qtyNeeded - need.qtyPledged);
  const [step, setStep] = useState(0);
  const [qtyWanted, setQty] = useState(1);
  const qty = Math.max(0, Math.min(qtyWanted, remaining)); // re-clamped as other donors pledge
  const [fulfillment, setFulfillment] = useState<Fulfillment>("shipt");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [donorName, setDonorName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Pledge | null>(null);
  const donor = useDonorLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  // Focus once on open; polling re-renders must not steal focus from the inputs.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
  const capacity = fleetCapacity(state.drivers);
  const storeName = stores.find((s) => s.store.id === chosenStore)?.store.name;

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

  const last = step === STEPS.length - 1;
  const row = "flex justify-between gap-3";

  return (
    <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fill-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="sheet-in flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white text-primary shadow-xl outline-none sm:rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b border-hairline p-4">
          <ItemPhoto itemId={need.itemId} category={item?.category} alt="" className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <h2 id="fill-title" className="truncate text-lg font-bold">{need.title}</h2>
            <p className="truncate text-sm text-secondary">for {partner.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-secondary hover:bg-surface-muted">×</button>
        </div>

        {done ? (
          <div className="overflow-y-auto p-5">
            <PledgeSuccess pledge={done} partner={partner} title={need.title} onClose={onClose} />
          </div>
        ) : (
          <>
            <ol aria-label="Steps" className="flex gap-2 px-4 pt-3 text-xs font-semibold">
              {STEPS.map((label, i) => (
                <li key={label} aria-current={i === step ? "step" : undefined} className={`flex-1 ${i <= step ? "text-primary" : "text-secondary"}`}>
                  <span className={`mb-1.5 block h-1 rounded-full ${i <= step ? "bg-primary" : "bg-hairline"}`} />
                  {i + 1}. {label}
                </li>
              ))}
            </ol>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {remaining < 1 && <p role="status" className="rounded-xl bg-express p-3 text-sm text-express">Someone just filled the rest of this need. Thank you!</p>}
              {step === 0 && (
                <>
                  <QuantityStepper value={qty} max={remaining} onChange={setQty} unitPrice={item?.price} />
                  {qty > capacity && capacity > 0 && (
                    <p role="status" className="rounded-xl bg-surface-muted p-3 text-sm text-secondary">
                      That&apos;s more than tomorrow&apos;s drivers can carry ({capacity} items). Part may wait for a later run.
                    </p>
                  )}
                </>
              )}
              {step === 1 && (
                <DeliveryOptions
                  partner={partner}
                  value={fulfillment}
                  onChange={setFulfillment}
                  allowPorch={allowPorch}
                  stores={stores}
                  storeId={chosenStore}
                  onStore={setStoreId}
                  driveMiles={driveMiles}
                  fromLabel={donor.label}
                  onLocate={donor.locate}
                  locating={donor.locating}
                />
              )}
              {last && (
                <>
                  <dl className="space-y-1 text-sm">
                    <div className={row}>
                      <dt className="text-secondary">Giving</dt>
                      <dd className="text-right font-semibold">{qty} × {need.title}</dd>
                    </div>
                    <div className={row}>
                      <dt className="text-secondary">How</dt>
                      <dd className="text-right font-semibold">
                        {METHOD[fulfillment].name}
                        {fulfillment === "shipt" && storeName ? ` from ${storeName}` : ""}
                      </dd>
                    </div>
                    <div className={row}>
                      <dt className="text-secondary">To</dt>
                      <dd className="text-right font-semibold">{partner.name}</dd>
                    </div>
                  </dl>
                  <CostBreakdown cost={cost} donors={fulfillment === "volunteer" ? 1 : donors} fulfillment={fulfillment} />
                  <label className="block text-sm">
                    <span className="font-medium">Name on the acknowledgment</span>
                    <input value={donorName} onChange={(e) => setDonorName(e.target.value)} maxLength={60} placeholder="A neighbor" autoComplete="name" className="mt-1 h-11 w-full rounded-xl border border-hairline px-3" />
                  </label>
                  {fulfillment === "shipt" && <p className="text-xs text-secondary">Demo checkout. In production this is Shipt&apos;s gift-order checkout.</p>}
                </>
              )}
              {error && <p role="alert" className="text-sm font-semibold text-sale">{error}</p>}
            </div>

            <div className="flex items-center gap-2 border-t border-hairline bg-white p-4">
              <div className="mr-auto">
                <p className="text-xs text-secondary">You pay</p>
                <p className="text-lg font-bold leading-tight tabular-nums">{formatUsd(amountCharged(cost, fulfillment))}</p>
              </div>
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} disabled={busy} className="press min-h-11 rounded-full border border-primary px-4 text-sm font-semibold hover:bg-surface-muted">
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={last ? submit : () => setStep(step + 1)}
                disabled={busy || qty < 1}
                className="press min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-black disabled:bg-hairline disabled:text-secondary"
              >
                {busy ? "Sending…" : last ? METHOD[fulfillment].cta : step === 0 ? "Choose delivery" : "Review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
