import { loadColdNight, seedDemoPledges } from "@/lib/demo";
import { errorResponse, readJson } from "@/lib/http";
import { resetState } from "@/lib/store";
import { refreshWeather } from "@/lib/weather";

export async function POST(req: Request): Promise<Response> {
  try {
    const { action } = await readJson(req);
    if (action === "seed") return Response.json({ created: seedDemoPledges().length });
    if (action === "cold-night") return Response.json({ created: (await loadColdNight()).length });
    if (action === "reset") {
      resetState();
      await refreshWeather(null); // back to the live forecast, or cold-night's simulated surge would return on the next weather check
      return Response.json({ ok: true });
    }
    return Response.json({ error: 'Action must be "seed", "cold-night" or "reset"' }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
