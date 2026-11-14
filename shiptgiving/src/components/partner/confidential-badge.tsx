import type { Partner } from "@/lib/types";
import { WARM_CARD } from "./styles";

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
      className={`inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white ${className}`}
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
      className={`${WARM_CARD} text-sm text-primary`}
    >
      <h3 className="flex items-center gap-1.5 text-base font-bold">
        <LockIcon />
        Your address stays private
      </h3>
      <p className="mt-1 text-secondary">
        Donors and drivers never see where you are. Every delivery goes to your public drop point, and your team
        brings it the rest of the way.
      </p>
      <p className="mt-2">
        <span className="text-secondary">Drop point: </span>
        <span className="font-semibold">{publicAddress(partner)}</span>
      </p>
    </section>
  );
}
