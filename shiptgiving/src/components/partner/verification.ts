// Owner: Viral-W. Automated nonprofit verification: no human approval step.
// A partner is verified when all four checks pass against its IRS record:
// EIN found, 501(c)(3) exempt, name matches (or a DBA at the same street), city + state match.
// Church ministries with no IRS record get a neutral "religious" status instead (see VerificationStatus).
import { verificationRecords, type IrsRecord, type VerificationRecord } from "@/data/verification";

export type CheckId = "ein" | "exempt" | "name" | "city";
export type Check = { id: CheckId; label: string; pass: boolean; detail: string };

/**
 * verified: every check passed.
 * religious: no IRS record, but the partner is a church ministry, which the IRS doesn't require to register or file.
 *   Shown neutrally, not as a failure. Still not `verified`.
 * unverified: anything else.
 */
export type VerificationStatus = "verified" | "religious" | "unverified";

export type Verification = {
  partnerId: string;
  status: VerificationStatus;
  ein: string | null;
  verified: boolean;
  verifiedAt: string | null;
  checkedAt: string | null;
  irs: IrsRecord | null;
  checks: Check[];
};

const STOPWORDS = new Set(["inc", "incorporated", "the", "of", "and", "corp", "co", "ltd", "llc"]);
const EXPANSIONS: Record<string, string> = { assn: "association", ywca: "young womens christian association" };

export function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’.]/g, "")
    .split(/[^a-z0-9]+/)
    .flatMap((t) => (EXPANSIONS[t] ?? t).split(" "))
    .filter((t) => t && !STOPWORDS.has(t));
}

const containsAll = (big: string[], small: string[]) => small.length > 0 && small.every((t) => big.includes(t));

/** True when one name's words are all inside the other ("Jimmie Hale Mission" ~ "Downtown Jimmie Hale Mission"). */
export function namesMatch(a: string, b: string): boolean {
  const ta = nameTokens(a);
  const tb = nameTokens(b);
  return containsAll(ta, tb) || containsAll(tb, ta);
}

const STREET_WORDS: Record<string, string> = { street: "st", avenue: "ave", north: "n", south: "s", east: "e", west: "w", drive: "dr", boulevard: "blvd" };
const normStreet = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => STREET_WORDS[w] ?? w)
    .join(" ");

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Birmingham metro cities. An IRS address anywhere in the metro counts as a Birmingham-area match. */
export const BIRMINGHAM_METRO = new Set(
  [
    "birmingham", "bessemer", "hoover", "homewood", "mountain brook", "vestavia hills", "irondale", "fairfield",
    "tarrant", "center point", "trussville", "pelham", "alabaster", "leeds", "midfield", "gardendale",
    "fultondale", "helena", "pleasant grove", "hueytown", "adamsville", "chelsea", "moody",
  ],
);

/** "same" when the cities match, "metro" when both are in the Birmingham metro, otherwise false. */
export function cityMatch(declared: { city: string; state: string }, irs: { city: string; state: string }): "same" | "metro" | false {
  if (!sameText(declared.state, irs.state)) return false;
  if (sameText(declared.city, irs.city)) return "same";
  const a = declared.city.trim().toLowerCase();
  const b = irs.city.trim().toLowerCase();
  return BIRMINGHAM_METRO.has(a) && BIRMINGHAM_METRO.has(b) ? "metro" : false;
}

export function runChecks(record: VerificationRecord): Check[] {
  const { declared, irs } = record;
  if (!irs) {
    const missing = "No IRS record to compare against.";
    return [
      { id: "ein", label: "EIN found in IRS records", pass: false, detail: "No matching exempt organization in the IRS master file." },
      { id: "exempt", label: "Tax-exempt 501(c)(3)", pass: false, detail: missing },
      { id: "name", label: "Name matches", pass: false, detail: missing },
      { id: "city", label: "City matches", pass: false, detail: missing },
    ];
  }

  const exempt = irs.subsection === 3;
  const direct = namesMatch(declared.name, irs.legalName);
  const viaStreet =
    !direct && !!declared.street && !!irs.street && normStreet(declared.street) === normStreet(irs.street);
  const city = cityMatch(declared, irs);
  const cityOk = city !== false;

  return [
    { id: "ein", label: "EIN found in IRS records", pass: true, detail: `EIN ${formatEin(irs.ein)}` },
    {
      id: "exempt",
      label: "Tax-exempt 501(c)(3)",
      pass: exempt,
      detail: exempt ? `Exempt since ${irs.rulingYear}` : `Listed under 501(c)(${irs.subsection}), not 501(c)(3)`,
    },
    {
      id: "name",
      label: "Name matches",
      pass: direct || viaStreet,
      detail: direct
        ? `IRS name: ${irs.legalName}`
        : viaStreet
          ? `Files as ${irs.legalName} at your street address`
          : `IRS name ${irs.legalName} doesn't match ${declared.name}`,
    },
    {
      id: "city",
      label: "City matches",
      pass: cityOk,
      detail: cityOk
        ? `${irs.city}, ${irs.state}${city === "metro" ? ` (${declared.city} metro)` : ""}`
        : `IRS lists ${irs.city}, ${irs.state}, not ${declared.city}, ${declared.state}`,
    },
  ];
}

export function verify(record: VerificationRecord): Verification {
  const checks = runChecks(record);
  const verified = checks.every((c) => c.pass);
  const status: VerificationStatus = verified ? "verified" : !record.irs && record.religious ? "religious" : "unverified";
  return {
    partnerId: record.partnerId,
    status,
    ein: record.irs?.ein ?? null,
    verified,
    verifiedAt: verified ? record.checkedAt : null,
    checkedAt: record.checkedAt,
    irs: record.irs,
    checks,
  };
}

const byId = new Map(verificationRecords.map((r) => [r.partnerId, verify(r)]));

/** Verification for a partner id. Unknown partners are unverified with no checks run. */
export function getVerification(partnerId: string): Verification {
  return (
    byId.get(partnerId) ?? {
      partnerId,
      status: "unverified",
      ein: null,
      verified: false,
      verifiedAt: null,
      checkedAt: null,
      irs: null,
      checks: [],
    }
  );
}

export function recordFor(partnerId: string): VerificationRecord | undefined {
  return verificationRecords.find((r) => r.partnerId === partnerId);
}

export function formatEin(ein: string): string {
  return /^\d{9}$/.test(ein) ? `${ein.slice(0, 2)}-${ein.slice(2)}` : ein;
}

export function propublicaUrl(ein: string): string {
  return `https://projects.propublica.org/nonprofits/organizations/${ein}`;
}

const FREE_MAIL = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com", "proton.me", "protonmail.com", "live.com", "msn.com"]);

/**
 * Optional extra signal: does a work email's domain look like the organization's?
 * Passes when the domain's name contains a 4+ letter word or the acronym of the declared or IRS name
 * (or is the start of that acronym, so ywca.org fits "YWCA Central Alabama").
 * Does not change `verified`.
 */
export function checkEmailDomain(email: string, record: Pick<VerificationRecord, "declared" | "irs">): { pass: boolean; detail: string } {
  const match = /^[^\s@]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i.exec(email.trim());
  if (!match) return { pass: false, detail: "Enter a full email address, like director@yourorg.org." };
  const domain = match[1].toLowerCase();
  if (FREE_MAIL.has(domain)) return { pass: false, detail: `${domain} is a personal email provider. Use your organization's email.` };

  const label = domain.split(".").slice(0, -1).join("");
  const names = [record.declared.name, record.irs?.legalName].filter((n): n is string => !!n);
  const fits = names.some((n) => {
    const tokens = nameTokens(n);
    const acronym = tokens.map((t) => t[0]).join("");
    const acronymFits = acronym.length >= 3 && (label.includes(acronym) || (label.length >= 3 && acronym.startsWith(label)));
    return acronymFits || tokens.some((t) => t.length >= 4 && label.includes(t));
  });
  return fits
    ? { pass: true, detail: `${domain} matches your organization's name.` }
    : { pass: false, detail: `${domain} doesn't look like your organization's name.` };
}
