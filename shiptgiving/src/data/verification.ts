// Owner: Viral-W. Nonprofit verification records for the seed partners.
// Each irs block is a snapshot of the IRS Exempt Organizations Business Master File, read through the
// ProPublica Nonprofit Explorer API (https://projects.propublica.org/nonprofits/api/v2/organizations/<ein>.json)
// on 2026-11-14. Partners with no IRS record we could confirm have irs: null and stay unverified; nothing is invented.
// Verification is automated (see components/partner/verification.ts): no human approval step.

export type IrsRecord = {
  ein: string; // 9 digits, no dash
  legalName: string; // as the IRS lists it
  city: string;
  state: string;
  subsection: number; // 3 = 501(c)(3)
  rulingYear: number; // year the IRS granted exemption
  /** IRS street address. Only kept when needed to match a doing-business-as name; never rendered. Never kept for confidential partners. */
  street?: string;
};

export type VerificationRecord = {
  partnerId: string;
  /** What the partner told us when it applied. */
  declared: {
    name: string;
    city: string;
    state: string;
    /** Public street address, used to match a DBA name to the IRS legal name. */
    street?: string;
  };
  irs: IrsRecord | null;
  checkedAt: string; // ISO time of the last automated check
};

const CHECKED_AT = "2026-11-14T19:15:00Z";
const bham = (name: string, street?: string) => ({ name, city: "Birmingham", state: "AL", ...(street ? { street } : {}) });

export const verificationRecords: VerificationRecord[] = [
  { partnerId: "firehouse", declared: bham("Firehouse Ministries"), irs: null, checkedAt: CHECKED_AT },
  {
    partnerId: "jvtf",
    // The IRS still lists the farm under its former name, at the same street address.
    declared: bham("Jones Valley Teaching Farm", "701 25th St N"),
    irs: { ein: "522359003", legalName: "Jones Valley Urban Farm", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 2002, street: "701 25th St N" },
    checkedAt: CHECKED_AT,
  },
  { partnerId: "edfarm", declared: bham("Ed Farm"), irs: null, checkedAt: CHECKED_AT },
  {
    partnerId: "promise",
    declared: bham("Birmingham Promise"),
    irs: { ein: "842830568", legalName: "Birmingham Promise Inc", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 2020 },
    checkedAt: CHECKED_AT,
  },
  {
    partnerId: "foodbank",
    // Real mismatch: the IRS address is in Bessemer, so the city check fails.
    declared: bham("Community Food Bank of Central Alabama"),
    irs: { ein: "630837956", legalName: "Community Food Bank Of Central Alabama", city: "Bessemer", state: "AL", subsection: 3, rulingYear: 1983 },
    checkedAt: CHECKED_AT,
  },
  {
    partnerId: "jimmiehale",
    declared: bham("Jimmie Hale Mission"),
    irs: { ein: "630358757", legalName: "Downtown Jimmie Hale Mission", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 1946 },
    checkedAt: CHECKED_AT,
  },
  {
    partnerId: "pathways",
    // Confidential: no street stored.
    declared: bham("Pathways"),
    irs: { ein: "630867285", legalName: "Pathways Inc", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 2006 },
    checkedAt: CHECKED_AT,
  },
  {
    partnerId: "ywca",
    // Confidential shelter, but the IRS address is the public admin office (already the drop point).
    declared: bham("YWCA Central Alabama", "309 23rd St N"),
    irs: { ein: "630288882", legalName: "Young Womens Christian Assn Of Birmingham", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 1943, street: "309 23rd St N" },
    checkedAt: CHECKED_AT,
  },
  {
    partnerId: "csm",
    declared: bham("Christian Service Mission"),
    irs: { ein: "630594603", legalName: "Christian Service Mission", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 1985 },
    checkedAt: CHECKED_AT,
  },
  {
    partnerId: "brotherbryan",
    declared: bham("Brother Bryan Mission"),
    irs: { ein: "630322672", legalName: "Brother Bryan Rescue Mission", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 1981 },
    checkedAt: CHECKED_AT,
  },
  {
    partnerId: "lovelady",
    // The Lovelady Center files with the IRS as Freedom Rain Inc, at the center's street address.
    declared: bham("The Lovelady Center", "7916 2nd Ave S"),
    irs: { ein: "721344856", legalName: "Freedom Rain Inc", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 1997, street: "7916 2nd Ave S" },
    checkedAt: CHECKED_AT,
  },
];
