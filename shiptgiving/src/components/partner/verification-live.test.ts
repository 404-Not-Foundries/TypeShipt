import { beforeEach, describe, expect, it, vi } from "vitest";
import { CACHE_TTL_MS, clearVerificationCache, verifyLive } from "./verification-live";

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

const org = (over: Record<string, unknown> = {}) => ({
  organization: {
    ein: 630358757,
    name: "Downtown Jimmie Hale Mission",
    city: "Birmingham",
    state: "AL",
    subsection_code: 3,
    ruling_date: "1946-04-01",
    address: "PO BOX 10472",
    ...over,
  },
});

describe("verifyLive", () => {
  beforeEach(() => clearVerificationCache());

  it("re-runs the checks on live IRS data and stamps the check time", async () => {
    const fetchImpl = vi.fn(() => json(org())) as unknown as typeof fetch;
    const v = await verifyLive("jimmiehale", { fetchImpl, now: () => Date.parse("2026-11-14T19:30:00Z") });
    expect(v.source).toBe("live");
    expect(v.verified).toBe(true);
    expect(v.checkedAt).toBe("2026-11-14T19:30:00.000Z");
    expect(String((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])).toContain("/organizations/630358757.json");
  });

  it("reflects a live change, such as losing 501(c)(3) status", async () => {
    const fetchImpl = (() => json(org({ subsection_code: 4 }))) as unknown as typeof fetch;
    const v = await verifyLive("jimmiehale", { fetchImpl });
    expect(v.source).toBe("live");
    expect(v.verified).toBe(false);
    expect(v.checks.find((c) => !c.pass)?.id).toBe("exempt");
  });

  it("caches for 10 minutes, then fetches again", async () => {
    let t = 0;
    const fetchImpl = vi.fn(() => json(org())) as unknown as typeof fetch;
    const calls = () => (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length;
    await verifyLive("jimmiehale", { fetchImpl, now: () => t });
    t = CACHE_TTL_MS - 1;
    await verifyLive("jimmiehale", { fetchImpl, now: () => t });
    expect(calls()).toBe(1);
    t = CACHE_TTL_MS + 1;
    await verifyLive("jimmiehale", { fetchImpl, now: () => t });
    expect(calls()).toBe(2);
  });

  it("falls back to the last known result when ProPublica fails", async () => {
    const down = (() => json({}, 503)) as unknown as typeof fetch;
    const v = await verifyLive("jimmiehale", { fetchImpl: down });
    expect(v.source).toBe("fallback");
    expect(v.verified).toBe(true);
    const thrown = (() => Promise.reject(new Error("timeout"))) as unknown as typeof fetch;
    expect((await verifyLive("pathways", { fetchImpl: thrown })).source).toBe("fallback");
  });

  it("searches by name when no EIN is on file, and keeps religious status when nothing matches", async () => {
    const fetchImpl = vi.fn(() =>
      json({ organizations: [{ ein: 851299138, name: "Firehouse Community Arts Center", city: "Birmingham", state: "AL" }] }),
    ) as unknown as typeof fetch;
    const v = await verifyLive("firehouse", { fetchImpl });
    expect(String((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])).toContain("search.json");
    expect(v.source).toBe("live");
    expect(v.status).toBe("religious");
  });

  it("treats a 404 from search as no results, not an outage", async () => {
    const fetchImpl = (() => json({ total_results: 0, organizations: [] }, 404)) as unknown as typeof fetch;
    const v = await verifyLive("edfarm", { fetchImpl });
    expect(v.source).toBe("live");
    expect(v.status).toBe("unverified");
  });

  it("matches a DBA by live street but never returns the street", async () => {
    const fetchImpl = (() =>
      json(org({ ein: 721344856, name: "Freedom Rain Inc", address: "7916 2ND AVE S", ruling_date: "1997-07-01" }))) as unknown as typeof fetch;
    const v = await verifyLive("lovelady", { fetchImpl });
    expect(v.verified).toBe(true);
    expect(v.irs?.street).toBeUndefined();
    expect(JSON.stringify(v)).not.toContain("7916");
  });
});
