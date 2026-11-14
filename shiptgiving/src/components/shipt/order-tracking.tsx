"use client";

import Link from "next/link";
import { OrderDetails } from "@/components/shipt/order-details";
import { OrderTimeline } from "@/components/shipt/order-timeline";
import { PlatformPayload } from "@/components/shipt/platform-payload";
import { toShiptOrder } from "@/lib/shipt-platform";
import { useAppState } from "@/lib/use-app-state";

export function OrderTracking({ pledgeId }: { pledgeId: string }) {
  const { state, error } = useAppState();
  const pledge = state?.pledges.find((entry) => entry.id === pledgeId);
  const partner = state?.partners.find((entry) => entry.id === pledge?.partnerId);
  const order = state && pledge ? toShiptOrder(pledge, state) : null;
  return (
    <section className="space-y-5 text-primary">
      <Link href="/shipt" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Back to the Shipt concept</Link>
      <header>
        <p className="text-sm font-semibold text-secondary">Concept preview · Live donation tracking</p>
        <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">Your community order</h1>
        <p className="mt-2 max-w-2xl text-sm text-secondary">Follow your pledge as the driver and partner update it. This is a mock experience; no order is sent to Shipt.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-hairline bg-totemeal p-4 text-sm">{error}</p>}
      {!state ? (
        <p role="status" className="rounded-xl border border-hairline bg-surface-muted p-6 text-secondary">Loading your order…</p>
      ) : !pledge ? (
        <div className="rounded-2xl border border-hairline bg-totemeal p-6">
          <h2 className="text-xl font-bold">We couldn&apos;t find that pledge</h2>
          <p className="mt-2 max-w-lg text-sm text-secondary">It may have been cleared by a demo reset. Browse current needs or return to your community orders.</p>
          <Link href="/give" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">Browse needs</Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-hairline bg-hero-sage p-5">
            <p className="font-semibold">{pledge.donorName}, thank you for giving to {partner?.name ?? "your community"}.</p>
            <p className="mt-2 break-all text-xs text-secondary">Order {pledge.id}</p>
            {pledge.fulfillment === "volunteer" && <p className="mt-3 text-sm font-semibold">You&apos;re delivering this one yourself</p>}
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <OrderTimeline status={pledge.status} partnerName={partner?.name ?? "the partner"} volunteer={pledge.fulfillment === "volunteer"} />
            <OrderDetails pledge={pledge} partner={partner} state={state} order={order} />
          </div>
          <PlatformPayload order={order} volunteer={pledge.fulfillment === "volunteer"} />
        </>
      )}
    </section>
  );
}
