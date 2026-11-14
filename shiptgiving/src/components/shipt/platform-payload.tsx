import type { ShiptPlatformOrder } from "@/lib/shipt-platform";

export function PlatformPayload({ order, volunteer }: { order: ShiptPlatformOrder | null; volunteer: boolean }) {
  return (
    <details className="rounded-2xl border border-hairline bg-white px-5 py-2">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Developer view: Shipt Platform API payload</summary>
      <p className="my-3 text-sm text-secondary">Illustrative mock schema. Shipt&apos;s live Platform API is partner-gated; this preview sends no requests to it.</p>
      {order ? (
        <pre tabIndex={0} aria-label="Mock Shipt Platform order JSON" className="mb-3 max-h-96 max-w-full overflow-auto rounded-xl bg-surface-muted p-4 text-xs leading-6 text-primary">
          {JSON.stringify(order, null, 2)}
        </pre>
      ) : <p className="mb-3 text-sm text-secondary">{volunteer ? "Volunteer deliveries do not create a Shipt order." : "The mock order cannot be prepared until the item, store, and public receiving details are available."}</p>}
    </details>
  );
}
