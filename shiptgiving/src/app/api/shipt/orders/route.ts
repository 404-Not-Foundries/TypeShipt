import { connection } from "next/server";
import { errorResponse } from "@/lib/http";
import { toShiptOrder } from "@/lib/shipt-platform";
import { getState } from "@/lib/store";

export async function GET(): Promise<Response> {
  try {
    await connection();
    const state = getState();
    const orders = state.pledges.map((pledge) => toShiptOrder(pledge, state)).filter((order) => order !== null);
    return Response.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
