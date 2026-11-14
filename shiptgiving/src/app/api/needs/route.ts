import { errorResponse, readJson } from "@/lib/http";
import { addNeeds, StoreError, type NewNeedItem } from "@/lib/store";
import type { Urgency } from "@/lib/types";

const MAX_ITEMS = 50;
const URGENCIES: Urgency[] = ["normal", "high", "urgent"];

function toItem(raw: unknown): NewNeedItem {
  const it = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  if (typeof it.itemId !== "string") throw new StoreError("Each item needs an itemId");
  if (it.urgency !== undefined && !URGENCIES.includes(it.urgency as Urgency)) throw new StoreError("Invalid urgency");
  return {
    itemId: it.itemId,
    title: typeof it.title === "string" ? it.title.trim() : undefined,
    qty: Number(it.qty),
    urgency: it.urgency as Urgency | undefined,
  };
}

/** POST {partnerId, items: {itemId, title, qty, urgency}[]} -> Need[]. Publishes confirmed needs. */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    if (typeof body.partnerId !== "string") throw new StoreError("Missing partnerId");
    if (!Array.isArray(body.items) || body.items.length === 0) throw new StoreError("No items");
    if (body.items.length > MAX_ITEMS) throw new StoreError(`At most ${MAX_ITEMS} items at once`);
    return Response.json(addNeeds(body.partnerId, body.items.map(toItem)), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
