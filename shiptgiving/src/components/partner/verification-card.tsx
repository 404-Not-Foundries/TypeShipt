"use client";
// Owner: Viral-W. Partner portal card: the automated nonprofit checks and their results.
// Never shows a street address (confidential partners included); only city and state.
import { useEffect, useState } from "react";
import { checkVerification } from "@/app/partner/actions";
import type { Partner } from "@/lib/types";
import type { LiveVerification } from "./verification-live";
import { checkEmailDomain, formatEin, getVerification, propublicaUrl, recordFor } from "./verification";
import { CheckIcon, RELIGIOUS_EXPLAINER } from "./verified-badge";
import { CARD, FIELD, HEADING, PILL_EXPRESS, PILL_MUTED } from "./styles";

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" });
const TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

function CrossIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm2.6 8.5a.75.75 0 1 1-1.1 1.1L8 9.06l-1.5 1.54a.75.75 0 1 1-1.1-1.1L6.94 8 5.4 6.5a.75.75 0 0 1 1.1-1.1L8 6.94 9.5 5.4a.75.75 0 1 1 1.1 1.1L9.06 8l1.54 1.5Z" />
    </svg>
  );
}

function Mark({ pass }: { pass: boolean }) {
  return (
    <span className={`mt-0.5 shrink-0 ${pass ? "text-express" : "text-sale"}`}>
      {pass ? <CheckIcon /> : <CrossIcon />}
      <span className="sr-only">{pass ? "Passed" : "Not passed"}</span>
    </span>
  );
}

type LiveState = { status: "checking" } | { status: "done"; result: LiveVerification } | { status: "error" };

export function VerificationCard({ partner }: { partner: Pick<Partner, "id"> }) {
  // Parent remounts the card per partner (key), so this runs once per partner.
  const [live, setLive] = useState<LiveState>({ status: "checking" });
  useEffect(() => {
    let cancelled = false;
    checkVerification(partner.id)
      .then((result) => !cancelled && setLive({ status: "done", result }))
      .catch(() => !cancelled && setLive({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [partner.id]);

  const v = live.status === "done" ? live.result : getVerification(partner.id);
  const isLive = live.status === "done" && live.result.source === "live";
  const record = recordFor(partner.id);
  const [email, setEmail] = useState("");
  const emailResult = record && email.trim() ? checkEmailDomain(email, record) : null;

  return (
    <section aria-label="Nonprofit verification" className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={HEADING}>Nonprofit verification</h3>
        {v.verified ? (
          <span className={PILL_EXPRESS}>
            <CheckIcon />
            Verified
          </span>
        ) : v.status === "religious" ? (
          <span className={PILL_MUTED}>Religious organization (exempt from filing)</span>
        ) : (
          <span className={PILL_MUTED}>Not verified yet</span>
        )}
      </div>

      <p className="mt-1 text-sm text-secondary">
        {v.verified
          ? "You show as a verified nonprofit. We checked you automatically against IRS records, with no paperwork."
          : v.status === "religious"
            ? `${RELIGIOUS_EXPLAINER} We looked for you in the IRS exempt-organization list and didn't find a record, which is normal for a ministry. If you did register, add your EIN and we'll verify you automatically.`
            : "We couldn't match you to an IRS 501(c)(3) record yet. This runs automatically once your EIN, name and city line up."}
      </p>

      {v.status !== "religious" && v.checks.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {v.checks.map((c) => (
            <li key={c.id} className="flex gap-2">
              <Mark pass={c.pass} />
              <span>
                <span className="font-semibold text-primary">{c.label}</span>
                <span className="block text-secondary">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-secondary" aria-live="polite">
        {live.status === "checking" && <>Checking IRS records live… </>}
        {isLive && v.checkedAt && (
          <>
            <span className="font-semibold text-express">Live</span>: checked {TIME.format(new Date(v.checkedAt))} CT.{" "}
          </>
        )}
        {live.status !== "checking" && !isLive && (
          <>Couldn&apos;t reach IRS records just now, so this is the last known result. </>
        )}
        {!isLive && v.checkedAt && <>Last checked {DATE.format(new Date(v.checkedAt))}. </>}
        Source: IRS Exempt Organizations master file
        {v.ein && (
          <>
            {" "}
            (
            <a
              href={propublicaUrl(v.ein)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline underline-offset-2"
            >
              EIN {formatEin(v.ein)} on ProPublica
            </a>
            )
          </>
        )}
        .
      </p>

      {record && (
        <div className="mt-4 border-t border-hairline pt-3">
          <label className="block text-sm">
            <span className="font-semibold text-primary">Optional: confirm with your work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="director@yourorg.org"
              className={`${FIELD} mt-1 w-full`}
              autoComplete="email"
            />
          </label>
          {emailResult && (
            <p className="mt-2 flex gap-2 text-sm" aria-live="polite">
              <Mark pass={emailResult.pass} />
              <span className={emailResult.pass ? "text-express" : "text-secondary"}>{emailResult.detail}</span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
