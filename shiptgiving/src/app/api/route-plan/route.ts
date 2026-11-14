import { getState, setRoutes } from "@/lib/store";
import { errorResponse } from "@/lib/http";
import { planFleet } from "@/lib/routing";

/** POST {} plans routes for tomorrow's drivers over the open pledges and saves them to state. */
export async function POST() {
  try {
    const { routes, unrouted, summary } = await planFleet(getState());
    setRoutes(routes, unrouted, summary);
    return Response.json({ routes, unrouted, summary });
  } catch (err) {
    return errorResponse(err);
  }
}
