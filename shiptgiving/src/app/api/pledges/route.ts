import { addPledge } from "@/lib/store";
import { errorResponse, readJson } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    return Response.json(addPledge(body as Parameters<typeof addPledge>[0]), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
