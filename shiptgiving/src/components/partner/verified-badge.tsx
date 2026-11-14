// Owner: Viral-W. "Verified nonprofit" pill. Safe to mount anywhere a partner is shown (donor feed, partner page).
import { formatEin, getVerification } from "./verification";
import { PILL_EXPRESS, PILL_MUTED } from "./styles";

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm3.2 5.3-3.7 4a.75.75 0 0 1-1.1 0l-1.6-1.7a.75.75 0 1 1 1.1-1l1.05 1.12 3.15-3.4a.75.75 0 1 1 1.1 1Z" />
    </svg>
  );
}

export const RELIGIOUS_EXPLAINER =
  "Churches and their ministries are tax-exempt without registering with the IRS and don't file Form 990, so they often aren't in IRS lists.";

/** Verified pill, or a neutral pill for church ministries. Renders nothing for unverified partners. */
export function VerifiedBadge({ partnerId, className = "" }: { partnerId: string; className?: string }) {
  const v = getVerification(partnerId);
  if (v.status === "religious") {
    return (
      <span className={`${PILL_MUTED} ${className}`} title={RELIGIOUS_EXPLAINER}>
        Religious organization
      </span>
    );
  }
  if (!v.verified || !v.ein) return null;
  return (
    <span
      className={`${PILL_EXPRESS} ${className}`}
      title={`IRS-registered 501(c)(3), EIN ${formatEin(v.ein)}. Checked automatically against IRS records.`}
    >
      <CheckIcon />
      Verified nonprofit
    </span>
  );
}
