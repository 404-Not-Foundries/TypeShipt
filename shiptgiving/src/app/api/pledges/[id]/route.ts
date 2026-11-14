import { setPledgeStatus } from "@/lib/store";
import { errorResponse, readJson } from "@/lib/http";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await readJson(req);
    return Response.json(setPledgeStatus(id, body.status));
  } catch (err) {
    return errorResponse(err);
  }
}
