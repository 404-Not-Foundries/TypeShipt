import { parseNeed } from "@/lib/ai";
import { errorResponse, readJson } from "@/lib/http";
import { getState, StoreError } from "@/lib/store";

const MAX_TEXT = 1000;

/** POST {partnerId, text} -> {items: {itemId, title, qty, urgency}[], source}. Nothing is saved. */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) throw new StoreError("Describe what you need");
    if (text.length > MAX_TEXT) throw new StoreError(`Keep it under ${MAX_TEXT} characters`);
    const state = getState();
    const partner = state.partners.find((p) => p.id === body.partnerId);
    if (!partner) throw new StoreError("Unknown partner", 404);
    return Response.json(await parseNeed(text, state.catalog, partner));
  } catch (err) {
    return errorResponse(err);
  }
}
