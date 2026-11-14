import { seedDemoPledges } from "@/lib/demo";
import { errorResponse, readJson } from "@/lib/http";
import { resetState } from "@/lib/store";

export async function POST(req: Request): Promise<Response> {
  try {
    const { action } = await readJson(req);
    if (action === "seed") return Response.json({ created: seedDemoPledges().length });
    if (action === "reset") {
      resetState();
      return Response.json({ ok: true });
    }
    return Response.json({ error: 'Action must be "seed" or "reset"' }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
