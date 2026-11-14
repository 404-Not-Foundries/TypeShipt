import { amountCharged, formatUsd } from "@/lib/fees";
import type { Fulfillment, PledgeCost } from "@/lib/types";

type Props = { cost: PledgeCost; donors: number; fulfillment: Fulfillment };

export function CostBreakdown({ cost, donors, fulfillment }: Props) {
  const row = "flex justify-between";
  const own = fulfillment !== "shipt";
  return (
    <dl className="space-y-1 rounded-xl bg-neutral-50 p-3 text-sm">
      <div className={row}>
        <dt>{own ? "Value of your items (you provide them)" : "Items"}</dt>
        <dd className={own ? "text-neutral-500" : undefined}>{formatUsd(cost.items)}</dd>
      </div>
      {cost.deliveryShare > 0 && (
        <div className={row}>
          <dt>
            Delivery share <span className="text-neutral-500">($9.99 ÷ {donors} {donors === 1 ? "donor" : "donors"})</span>
          </dt>
          <dd>{formatUsd(cost.deliveryShare)}</dd>
        </div>
      )}
      {cost.service > 0 && (
        <div className={row}>
          <dt>Service fee (5%)</dt>
          <dd>{formatUsd(cost.service)}</dd>
        </div>
      )}
      <div className={`${row} border-t border-black/10 pt-1 font-semibold`}>
        <dt>You pay</dt>
        <dd>{formatUsd(amountCharged(cost, fulfillment))}</dd>
      </div>
      {cost.deliveryShare > 0 && (
        <p className="pt-1 text-xs text-neutral-500">Your delivery share drops as more neighbors join this batch.</p>
      )}
    </dl>
  );
}
