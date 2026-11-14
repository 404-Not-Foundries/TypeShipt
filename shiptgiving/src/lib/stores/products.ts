// Public grocery product APIs:
// - Open Food Facts (free, no key): product name, brand, photo. FOOD ONLY: call it for food items, not socks or blankets.
// - Kroger Developer API (free account, optional): live shelf price. Needs KROGER_CLIENT_ID / KROGER_CLIENT_SECRET.

const USER_AGENT = "ShiptGiving/0.1 (hackathon demo)";
const TIMEOUT_MS = 8000;

export type ProductInfo = {
  query: string;
  name?: string;
  brand?: string;
  image?: string;
  barcode?: string;
  krogerPrice?: number;
  sources: string[];
};

const cache = new Map<string, ProductInfo>();

async function openFoodFacts(q: string): Promise<Partial<ProductInfo> | null> {
  const url = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=1&fields=code,product_name,brands,image_front_small_url`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      hits?: { code?: string; product_name?: string; brands?: string[] | string; image_front_small_url?: string }[];
    };
    const hit = json.hits?.[0];
    if (!hit) return null;
    const brand = Array.isArray(hit.brands) ? hit.brands[0] : hit.brands;
    return { name: hit.product_name, brand, image: hit.image_front_small_url, barcode: hit.code };
  } catch {
    return null;
  }
}

let krogerToken: { value: string; expires: number } | null = null;
let krogerLocationId: string | null = null;

async function krogerAuth(): Promise<string | null> {
  const id = process.env.KROGER_CLIENT_ID;
  const secret = process.env.KROGER_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (krogerToken && krogerToken.expires > Date.now()) return krogerToken.value;
  const res = await fetch("https://api.kroger.com/v1/connect/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials&scope=product.compact",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token: string; expires_in: number };
  krogerToken = { value: json.access_token, expires: Date.now() + (json.expires_in - 60) * 1000 };
  return krogerToken.value;
}

async function krogerPrice(q: string): Promise<number | null> {
  try {
    const token = await krogerAuth();
    if (!token) return null;
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
    if (!krogerLocationId) {
      const loc = await fetch("https://api.kroger.com/v1/locations?filter.zipCode.near=35203&filter.limit=1", {
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const lj = (await loc.json()) as { data?: { locationId: string }[] };
      krogerLocationId = lj.data?.[0]?.locationId ?? null;
      if (!krogerLocationId) return null;
    }
    const res = await fetch(
      `https://api.kroger.com/v1/products?filter.term=${encodeURIComponent(q)}&filter.locationId=${krogerLocationId}&filter.limit=1`,
      { headers, signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    const pj = (await res.json()) as { data?: { items?: { price?: { regular?: number; promo?: number } }[] }[] };
    const price = pj.data?.[0]?.items?.[0]?.price;
    return price?.promo || price?.regular || null;
  } catch {
    return null;
  }
}

/** Look up a product by plain name across the public APIs. Never throws; returns what it found. */
export async function lookupProduct(query: string): Promise<ProductInfo> {
  const q = query.trim().toLowerCase();
  const hit = cache.get(q);
  if (hit) return hit;
  const [off, kroger] = await Promise.all([openFoodFacts(q), krogerPrice(q)]);
  const info: ProductInfo = { query: q, sources: [] };
  if (off) Object.assign(info, off, { sources: [...info.sources, "Open Food Facts"] });
  if (kroger) {
    info.krogerPrice = kroger;
    info.sources.push("Kroger");
  }
  cache.set(q, info);
  return info;
}
