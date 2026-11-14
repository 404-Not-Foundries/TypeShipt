import { formatUsd } from "@/lib/fees";
import type { PledgeCost } from "@/lib/types";

export function CostBreakdown({ cost, donors }: { cost: PledgeCost; donors: number }) {
  const row = "flex justify-between";
  return (
    <dl className="space-y-1 rounded-xl bg-neutral-50 p-3 text-sm">
      <div className={row}>
        <dt>Items</dt>
        <dd>{formatUsd(cost.items)}</dd>
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
        <dt>Total</dt>
        <dd>{formatUsd(cost.total)}</dd>
      </div>
      {cost.deliveryShare > 0 && (
        <p className="pt-1 text-xs text-neutral-500">Your delivery share drops as more neighbors join this batch.</p>
      )}
    </dl>
  );
}
