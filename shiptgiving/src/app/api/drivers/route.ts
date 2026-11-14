import { addDriver } from "@/lib/store";
import { errorResponse, readJson } from "@/lib/http";

/** POST {name, vehicle, start?} adds one of tomorrow's drivers. */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    return Response.json(addDriver(body.name, body.vehicle, body.start), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
