import { getState, resetState } from "@/lib/store";

export function GET() {
  return Response.json(getState());
}

/** Demo helper: POST {"reset": true} restores the seed data. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body?.reset !== true) return Response.json({ error: "Send {\"reset\": true}" }, { status: 400 });
  return Response.json(resetState());
}
