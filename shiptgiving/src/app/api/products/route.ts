import { lookupProduct } from "@/lib/stores/products";

const MAX_QUERY = 80;

/** GET /api/products?q=peanut%20butter  Name, brand, photo (Open Food Facts) and Kroger price if configured. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > MAX_QUERY) return Response.json({ error: "Give q (1-80 chars)" }, { status: 400 });
  return Response.json(await lookupProduct(q));
}
