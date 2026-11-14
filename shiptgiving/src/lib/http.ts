import { StoreError } from "@/lib/store";

/** Turns a thrown error into a JSON error response without leaking internals. */
export function errorResponse(err: unknown): Response {
  if (err instanceof StoreError) return Response.json({ error: err.message }, { status: err.status });
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return typeof body === "object" && body !== null ? body : {};
  } catch {
    return {};
  }
}
