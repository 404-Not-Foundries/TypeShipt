import type { Need, Pledge, Urgency, Weather } from "@/lib/types";

export type DraftItem = { itemId: string; title: string; qty: number; urgency: Urgency };
export type Simulate = "cold" | "heat" | null;

async function call<T>(path: string, method: "GET" | "POST" | "PATCH", body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Try again.");
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data as { error?: unknown } | null)?.error;
    throw new Error(typeof message === "string" ? message : `Request failed (${res.status})`);
  }
  return data as T;
}

export const parseNeed = (partnerId: string, text: string) =>
  call<{ items: DraftItem[]; source?: "claude" | "keywords" }>("/api/parse-need", "POST", { partnerId, text });

export const publishNeeds = (partnerId: string, items: DraftItem[]) =>
  call<Need[]>("/api/needs", "POST", { partnerId, items });

export const loadWeather = () => call<Weather>("/api/weather", "GET");

export const simulateWeather = (simulate: Simulate) => call<Weather>("/api/weather", "POST", { simulate });

export const confirmReceipt = (pledgeId: string) =>
  call<Pledge>(`/api/pledges/${encodeURIComponent(pledgeId)}`, "PATCH", { status: "received" });

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
