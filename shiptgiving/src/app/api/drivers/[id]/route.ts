import { removeDriver } from "@/lib/store";
import { errorResponse } from "@/lib/http";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    removeDriver(id);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
