// Owner: Viral-W. Live verification: re-runs the automated checks against the IRS data on ProPublica at request time.
// Server-side only (called from src/app/partner/actions.ts). Results are cached for 10 minutes.
// On timeout or error, falls back to the last known (seed) result and says so.
import type { IrsRecord, VerificationRecord } from "@/data/verification";
import { cityMatch, getVerification, namesMatch, recordFor, verify, type Verification } from "./verification";

const API = "https://projects.propublica.org/nonprofits/api/v2";
export const CACHE_TTL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 4000;

export type LiveVerification = Verification & {
  /** live: fetched just now (or within the cache window). fallback: ProPublica was unreachable; last known result. */
  source: "live" | "fallback";
};

type Org = {
  ein: number | string;
  name: string;
  city: string;
  state: string;
  subsection_code?: number | string;
  subseccd?: number | string;
  ruling_date?: string;
  address?: string;
};

type Fetch = typeof fetch;
const cache = new Map<string, { at: number; value: LiveVerification }>();

export function clearVerificationCache() {
  cache.clear();
}

async function getJson<T>(url: string, fetchImpl: Fetch, emptyOn404?: T): Promise<T> {
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: "application/json" } });
  if (res.status === 404 && emptyOn404 !== undefined) return emptyOn404;
  if (!res.ok) throw new Error(`ProPublica returned ${res.status}`);
  return (await res.json()) as T;
}

/** Street is read only to match a DBA name, and only for partners that gave us a public street. */
function toIrs(org: Org, record: VerificationRecord): IrsRecord {
  const year = Number(String(org.ruling_date ?? "").slice(0, 4));
  return {
    ein: String(org.ein).padStart(9, "0"),
    legalName: org.name,
    city: org.city,
    state: org.state,
    subsection: Number(org.subsection_code ?? org.subseccd ?? 0),
    rulingYear: year || record.irs?.rulingYear || 0,
    ...(record.declared.street && org.address ? { street: org.address } : {}),
  };
}

async function lookup(record: VerificationRecord, fetchImpl: Fetch): Promise<IrsRecord | null> {
  let ein = record.irs?.ein;
  if (!ein) {
    // No EIN on file: search by name in the partner's state and take the first name + city match.
    const q = new URLSearchParams({ q: record.declared.name, "state[id]": record.declared.state });
    // ProPublica answers a search with no results with a 404.
    const found = await getJson<{ organizations?: Org[] }>(`${API}/search.json?${q}`, fetchImpl, { organizations: [] });
    const hit = (found.organizations ?? []).find(
      (o) => namesMatch(record.declared.name, o.name) && cityMatch(record.declared, o) !== false,
    );
    if (!hit) return null;
    ein = String(hit.ein).padStart(9, "0");
  }
  const data = await getJson<{ organization?: Org }>(`${API}/organizations/${ein}.json`, fetchImpl);
  return data.organization ? toIrs(data.organization, record) : null;
}

/** Never send a street address to the browser. */
function stripStreet<T extends Verification>(v: T): T {
  if (!v.irs?.street) return v;
  const irs = { ...v.irs };
  delete irs.street;
  return { ...v, irs };
}

export async function verifyLive(
  partnerId: string,
  { fetchImpl = fetch, now = Date.now }: { fetchImpl?: Fetch; now?: () => number } = {},
): Promise<LiveVerification> {
  const record = recordFor(partnerId);
  if (!record) return { ...getVerification(partnerId), source: "fallback" };

  const hit = cache.get(partnerId);
  if (hit && now() - hit.at < CACHE_TTL_MS) return hit.value;

  try {
    const irs = await lookup(record, fetchImpl);
    const value: LiveVerification = {
      ...stripStreet(verify({ ...record, irs, checkedAt: new Date(now()).toISOString() })),
      source: "live",
    };
    cache.set(partnerId, { at: now(), value });
    return value;
  } catch {
    return { ...stripStreet(getVerification(partnerId)), source: "fallback" };
  }
}
