import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { partners } from "@/data";
import { verificationRecords, type VerificationRecord } from "@/data/verification";
import { checkEmailDomain, cityMatch, formatEin, getVerification, namesMatch, verify } from "./verification";
import { VerificationCard } from "./verification-card";
import { VerifiedBadge } from "./verified-badge";

const base: VerificationRecord = {
  partnerId: "x",
  declared: { name: "Jimmie Hale Mission", city: "Birmingham", state: "AL" },
  irs: { ein: "630358757", legalName: "Downtown Jimmie Hale Mission", city: "Birmingham", state: "AL", subsection: 3, rulingYear: 1946 },
  checkedAt: "2026-11-14T19:15:00Z",
};
const failed = (r: VerificationRecord) => verify(r).checks.filter((c) => !c.pass).map((c) => c.id);

describe("automated verification checks", () => {
  it("verifies when EIN, 501(c)(3), name and city all pass", () => {
    const v = verify(base);
    expect(v.verified).toBe(true);
    expect(v.verifiedAt).toBe(base.checkedAt);
    expect(v.ein).toBe("630358757");
  });

  it("fails each check on its own", () => {
    expect(failed({ ...base, irs: null })).toEqual(["ein", "exempt", "name", "city"]);
    expect(failed({ ...base, irs: { ...base.irs!, subsection: 4 } })).toEqual(["exempt"]);
    expect(failed({ ...base, irs: { ...base.irs!, legalName: "Some Other Charity" } })).toEqual(["name"]);
    expect(failed({ ...base, irs: { ...base.irs!, city: "Mobile" } })).toEqual(["city"]);
    expect(verify({ ...base, irs: { ...base.irs!, city: "Mobile" } }).verifiedAt).toBeNull();
  });

  it("accepts a DBA name only when the street address matches", () => {
    const dba: VerificationRecord = {
      ...base,
      declared: { ...base.declared, name: "The Lovelady Center", street: "7916 2nd Avenue South" },
      irs: { ...base.irs!, legalName: "Freedom Rain Inc", street: "7916 2nd Ave S" },
    };
    expect(verify(dba).verified).toBe(true);
    expect(failed({ ...dba, irs: { ...dba.irs!, street: "100 Other St" } })).toEqual(["name"]);
  });

  it("matches names regardless of Inc, punctuation and abbreviations", () => {
    expect(namesMatch("Pathways", "Pathways Inc")).toBe(true);
    expect(namesMatch("Brother Bryan Mission", "Brother Bryan Rescue Mission")).toBe(true);
    expect(namesMatch("YWCA", "Young Womens Christian Assn")).toBe(true);
    expect(namesMatch("Ed Farm", "Edgewood Farm Supply")).toBe(false);
  });

  it("formats an EIN as XX-XXXXXXX", () => {
    expect(formatEin("630358757")).toBe("63-0358757");
  });
});

describe("seed partners", () => {
  it("has a verification record for every partner", () => {
    expect(verificationRecords.map((r) => r.partnerId).sort()).toEqual(partners.map((p) => p.id).sort());
  });

  it("only verifies partners with a confirmed IRS record", () => {
    const verified = partners.filter((p) => getVerification(p.id).verified).map((p) => p.id);
    expect(verified.sort()).toEqual(
      ["jvtf", "promise", "foodbank", "jimmiehale", "pathways", "ywca", "csm", "brotherbryan", "lovelady"].sort(),
    );
    expect(getVerification("firehouse").verified).toBe(false);
    expect(getVerification("edfarm").verified).toBe(false);
  });

  it("accepts an IRS city in the Birmingham metro (Food Bank in Bessemer)", () => {
    const city = getVerification("foodbank").checks.find((c) => c.id === "city");
    expect(city?.pass).toBe(true);
    expect(city?.detail).toContain("metro");
    expect(cityMatch({ city: "Birmingham", state: "AL" }, { city: "Hoover", state: "AL" })).toBe("metro");
    expect(cityMatch({ city: "Birmingham", state: "AL" }, { city: "Mobile", state: "AL" })).toBe(false);
    expect(cityMatch({ city: "Birmingham", state: "AL" }, { city: "Bessemer", state: "GA" })).toBe(false);
  });

  it("stores no street address for Pathways and never renders one for a confidential partner", () => {
    expect(verificationRecords.find((r) => r.partnerId === "pathways")?.irs?.street).toBeUndefined();
    for (const p of partners.filter((x) => x.features.includes("confidential"))) {
      const html = renderToStaticMarkup(
        <>
          <VerifiedBadge partnerId={p.id} />
          <VerificationCard partner={p} />
        </>,
      );
      const rec = verificationRecords.find((r) => r.partnerId === p.id)!;
      expect(html, p.id).toContain("Verified nonprofit");
      for (const street of [rec.irs?.street, rec.declared.street, p.address]) {
        if (street) expect(html, p.id).not.toContain(street);
      }
    }
  });

  it("renders the badge only for verified partners", () => {
    for (const p of partners) {
      const html = renderToStaticMarkup(<VerifiedBadge partnerId={p.id} />);
      expect(html.includes("Verified nonprofit"), p.id).toBe(getVerification(p.id).verified);
    }
  });
});

describe("religious organizations exempt from filing", () => {
  it("gives a church ministry with no IRS record the religious status, not verified", () => {
    const v = verify({ ...base, irs: null, religious: true });
    expect(v.status).toBe("religious");
    expect(v.verified).toBe(false);
    expect(v.verifiedAt).toBeNull();
  });

  it("ignores the religious flag when an IRS record exists", () => {
    expect(verify({ ...base, religious: true }).status).toBe("verified");
    expect(verify({ ...base, religious: true, irs: { ...base.irs!, city: "Mobile" } }).status).toBe("unverified");
  });

  it("marks Firehouse religious and leaves Ed Farm unverified", () => {
    expect(getVerification("firehouse").status).toBe("religious");
    expect(getVerification("edfarm").status).toBe("unverified");
  });

  it("shows a neutral pill and explanation instead of failed checks", () => {
    const badge = renderToStaticMarkup(<VerifiedBadge partnerId="firehouse" />);
    expect(badge).toContain("Religious organization");
    expect(badge).not.toContain("Verified nonprofit");
    const card = renderToStaticMarkup(<VerificationCard partner={{ id: "firehouse" }} />);
    expect(card).toContain("Religious organization (exempt from filing)");
    expect(card).toContain("Form 990");
    expect(card).not.toContain("Not passed");
    expect(card).not.toContain("Not verified yet");
  });
});

describe("optional email domain check", () => {
  const ywca = verificationRecords.find((r) => r.partnerId === "ywca")!;
  const jh = verificationRecords.find((r) => r.partnerId === "jimmiehale")!;

  it("passes an org domain that matches the name or acronym", () => {
    expect(checkEmailDomain("director@jimmiehale.org", jh).pass).toBe(true);
    expect(checkEmailDomain("staff@ywca.org", ywca).pass).toBe(true);
  });

  it("rejects personal webmail, unrelated domains and malformed input", () => {
    expect(checkEmailDomain("someone@gmail.com", jh).pass).toBe(false);
    expect(checkEmailDomain("someone@randomcorp.com", jh).pass).toBe(false);
    expect(checkEmailDomain("not-an-email", jh).pass).toBe(false);
  });
});
