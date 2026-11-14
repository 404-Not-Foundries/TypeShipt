import { StoreError } from "@/lib/store";
import { errorResponse, readJson } from "@/lib/http";
import { refreshWeather, type Simulate } from "@/lib/weather";

const MODES: unknown[] = ["cold", "heat", null];

/** Current weather; also applies (or clears) the surge on matching needs. */
export async function GET() {
  try {
    return Response.json(await refreshWeather());
  } catch (err) {
    return errorResponse(err);
  }
}

/** Demo control: {"simulate": "cold" | "heat" | null}. null returns to the live NWS forecast. */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    if (!("simulate" in body) || !MODES.includes(body.simulate)) {
      throw new StoreError('Send {"simulate": "cold" | "heat" | null}');
    }
    return Response.json(await refreshWeather(body.simulate as Simulate));
  } catch (err) {
    return errorResponse(err);
  }
}
