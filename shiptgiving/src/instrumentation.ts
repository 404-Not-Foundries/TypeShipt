// Runs once when the server starts, before it takes requests. Owner: rmaytr.
// The app opens in the cold-night demo state (simulated cold surge, seeded drivers, a night of pledges), never empty.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { loadColdNight } = await import("@/lib/demo");
  await loadColdNight();
}
