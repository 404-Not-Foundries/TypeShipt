import type { Partner } from "@/lib/types";

export function isConfidential(partner: Pick<Partner, "features">): boolean {
  return partner.features.includes("confidential");
}

/** The only address that may be shown for a partner. Confidential partners never expose their real address. */
export function publicAddress(partner: Pick<Partner, "features" | "address" | "dropPoint">): string {
  if (!isConfidential(partner)) return partner.address;
  return partner.dropPoint?.address ?? "Public drop point (shared with the driver at dispatch)";
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12 6h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5H6V4.5a2 2 0 1 1 4 0V6Z" />
    </svg>
  );
}

/** Small pill for partner pickers, headers and cards. Renders nothing for non-confidential partners. */
export function ConfidentialBadge({ partner, className = "" }: { partner: Pick<Partner, "features">; className?: string }) {
  if (!isConfidential(partner)) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800 ${className}`}
      title="This partner's real address is never shown to donors or drivers."
    >
      <LockIcon />
      Confidential address
    </span>
  );
}

/** Explainer panel for the partner portal. Renders nothing for non-confidential partners. */
export function ConfidentialNotice({ partner }: { partner: Pick<Partner, "features" | "address" | "dropPoint"> }) {
  if (!isConfidential(partner)) return null;
  return (
    <section
      aria-label="Confidential address"
      className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950"
    >
      <h3 className="flex items-center gap-1.5 font-semibold">
        <LockIcon />
        Your address stays private
      </h3>
      <p className="mt-1 text-violet-900">
        Donors and drivers never see where you are. Every delivery goes to your public drop point, and your team
        brings it the rest of the way.
      </p>
      <p className="mt-2">
        <span className="text-violet-700">Drop point: </span>
        <span className="font-medium">{publicAddress(partner)}</span>
      </p>
    </section>
  );
}
