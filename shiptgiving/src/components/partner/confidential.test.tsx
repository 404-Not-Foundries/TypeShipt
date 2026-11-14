import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { catalog, needs, partners } from "@/data";
import { ConfidentialBadge, ConfidentialNotice } from "./confidential-badge";
import { DormKit } from "./dorm-kit";
import { RulesSummary } from "./rules-summary";

describe("partner portal panels with the real seed", () => {
  const confidential = partners.filter((p) => p.features.includes("confidential"));

  it("never renders a confidential partner's real address", () => {
    expect(confidential.length).toBeGreaterThan(0);
    for (const partner of confidential) {
      const html = renderToStaticMarkup(
        <>
          <ConfidentialBadge partner={partner} />
          <ConfidentialNotice partner={partner} />
          <RulesSummary partner={partner} />
        </>,
      );
      expect(html, partner.id).toContain("Confidential address");
      expect(html, partner.id).toContain(partner.dropPoint?.address);
      expect(html, partner.id).not.toContain(partner.address);
    }
  });

  it("shows the Dorm Kit only for dormKits partners", () => {
    for (const partner of partners) {
      const html = renderToStaticMarkup(<DormKit partner={partner} catalog={catalog} needs={needs} />);
      expect(html.includes("Dorm Kit"), partner.id).toBe(partner.features.includes("dormKits"));
    }
  });
});
