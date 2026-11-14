import { formatUsd } from "@/lib/fees";
import { toShiptRecipient, type ShiptPlatformOrder } from "@/lib/shipt-platform";
import type { AppState, Partner, Pledge } from "@/lib/types";

export function OrderDetails({ pledge, partner, state, order }: {
  pledge: Pledge; partner: Partner | undefined; state: AppState; order: ShiptPlatformOrder | null;
}) {
  const recipient = partner ? toShiptRecipient(partner) : null;
  const need = state.needs.find((entry) => entry.id === pledge.needId);
  const item = state.catalog.find((entry) => entry.id === need?.itemId);
  const cost = pledge.cost;
  const charge = pledge.fulfillment === "shipt" ? cost.total : pledge.fulfillment === "porch" ? cost.deliveryShare : 0;
  const window = order?.delivery_window;
  return (
    <div className="space-y-5">
      <section aria-labelledby="recipient-title" className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
        <h2 id="recipient-title" className="text-xl font-bold">Delivering to</h2>
        <p className="mt-3 font-semibold">{partner?.name ?? "Community partner"}</p>
        {partner?.features.includes("confidential") && <p className="mt-2 inline-flex rounded-full bg-express px-3 py-1 text-xs font-semibold text-express">Public drop point</p>}
        <p className="mt-2 text-sm text-secondary">{recipient?.address ?? "A public receiving address is not available yet. Contact the partner before traveling."}</p>
        {pledge.fulfillment !== "volunteer" && (
          <div className="mt-4 border-t border-hairline pt-3 text-sm">
            <p className="font-semibold">Receiving window for the order day · Central time</p>
            {window ? <p className="mt-1 text-secondary">{window.open}–{window.close}{window.assumed ? " · Assumed hours; call to confirm." : ""}</p>
              : <p className="mt-1 text-secondary">No receiving window on the order day. Confirm a delivery time with the partner.</p>}
          </div>
        )}
      </section>
      <section aria-labelledby="order-items-title" className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
        <h2 id="order-items-title" className="text-xl font-bold">Your items</h2>
        <p className="mt-3 font-semibold">{pledge.qty} × {item?.name ?? need?.title ?? "Requested item"}</p>
        <p className="mt-2 text-sm text-secondary">Goods value: {formatUsd(cost.items)}</p>
        {pledge.fulfillment === "porch" && <p className="mt-2 text-sm text-secondary">Pickup from your porch, then delivery to the partner.</p>}
      </section>
      <section aria-labelledby="order-cost-title" className="rounded-2xl border border-hairline bg-totemeal p-5 sm:p-6">
        <h2 id="order-cost-title" className="text-xl font-bold">Cost breakdown</h2>
        <dl className="mt-4 space-y-3 text-sm tabular-nums">
          <div className="flex justify-between gap-4"><dt>Goods value</dt><dd>{formatUsd(cost.items)}</dd></div>
          <div className="flex justify-between gap-4"><dt>Shared delivery fee</dt><dd>{formatUsd(cost.deliveryShare)}</dd></div>
          <div className="flex justify-between gap-4"><dt>Service fee</dt><dd>{formatUsd(cost.service)}</dd></div>
          <div className="flex justify-between gap-4 border-t border-hairline pt-3 font-semibold"><dt>Goods and fees</dt><dd>{formatUsd(cost.total)}</dd></div>
          <div className="flex justify-between gap-4 font-bold"><dt>Mock checkout charge</dt><dd>{formatUsd(charge)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-secondary">
          {pledge.fulfillment === "shipt" ? "Gift order estimate. No payment is collected in this preview."
            : pledge.fulfillment === "porch" ? "You already own the goods; only the shared delivery fee is charged in this mock."
              : "You supply and deliver the goods yourself. No checkout charge."}
        </p>
      </section>
    </div>
  );
}
