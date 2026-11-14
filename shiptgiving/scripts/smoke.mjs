const started = performance.now();
const workSignal = AbortSignal.timeout(48_000);
const totalSignal = AbortSignal.timeout(58_000);
const rows = [];
let base;
let serverResponded = false;
let serverUnavailable = false;

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(step, run) {
  const row = { step, result: "FAIL", detail: "", ms: 0 };
  rows.push(row);
  const before = performance.now();
  try {
    const outcome = await run();
    row.result = "PASS";
    row.detail = outcome.detail;
    return outcome.value;
  } catch (error) {
    row.detail = error instanceof Error ? error.message : String(error);
  } finally {
    row.ms = Math.round(performance.now() - before);
  }
}

async function request(path, { method = "GET", body, status = 200, page = false, signal = workSignal } = {}) {
  const response = await fetch(new URL(path, base), {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.any([AbortSignal.timeout(60_000), signal]),
    cache: "no-store",
    redirect: "manual",
  });
  serverResponded = true;
  const text = await response.text();
  expect(response.status === status, `${method} ${path}: expected HTTP ${status}, got ${response.status}`);
  if (page) return;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${method} ${path}: response is not JSON`);
  }
}

async function main() {
  base = await check("Target", async () => {
    const target = new URL(process.env.SMOKE_URL || "http://localhost:3000");
    expect(["http:", "https:"].includes(target.protocol), "SMOKE_URL must use http or https");
    return { value: target, detail: target.origin };
  });
  if (!base) return;

  try {
    await check("Server", async () => {
      await request("/api/state");
      return { detail: "Running server reached" };
    });
    if (!serverResponded) {
      serverUnavailable = true;
      return;
    }

    const pages = ["/", "/give", "/p/firehouse", "/p/pathways", "/partner", "/driver", "/impact", "/shipt", "/demo", "/how-it-works"];
    await Promise.all(pages.map((path) => check(`Page ${path}`, async () => {
      await request(path, { page: true });
      return { detail: "HTTP 200" };
    })));

    await check("Reset", async () => {
      await request("/api/demo", { method: "POST", body: { action: "reset" } });
      // /api/demo reset now loads a nearly full fleet; isolate the diagnostic fixtures.
      await request("/api/state", { method: "POST", body: { reset: true } });
      return { detail: "HTTP 200; smoke fixtures start from the blank seed" };
    });

    const items = await check("Parse need", async () => {
      const parsed = await request("/api/parse-need", {
        method: "POST",
        body: { partnerId: "firehouse", text: "cold front tonight, need 40 pairs of socks and 20 blankets" },
      });
      expect(Array.isArray(parsed.items) && parsed.items.length >= 2, "Expected at least two parsed items");
      expect(["claude", "keywords"].includes(parsed.source), "Expected source claude or keywords");
      return {
        value: parsed.items,
        detail: `${parsed.items.length} items; source=${parsed.source} (${parsed.source === "claude" ? "live AI" : "keyword fallback"})`,
      };
    });

    await check("Publish needs", async () => {
      expect(items, "Prerequisite failed: parse need");
      const needs = await request("/api/needs", { method: "POST", status: 201, body: { partnerId: "firehouse", items } });
      expect(Array.isArray(needs) && needs.length >= 2, "Expected at least two published needs");
      return { detail: `HTTP 201; ${needs.length} needs published` };
    });

    await check("Cold weather", async () => {
      const weather = await request("/api/weather", { method: "POST", body: { simulate: "cold" } });
      expect(weather.surge === true, "Cold simulation did not enable the weather surge");
      return { detail: "HTTP 200; cold surge active" };
    });

    const context = await check("Open Firehouse need", async () => {
      const state = await request("/api/state");
      const need = state.needs?.find((entry) => entry.partnerId === "firehouse"
        && entry.qtyNeeded - entry.qtyPledged >= 6
        && state.catalog?.some((item) => item.id === entry.itemId && !item.perishable && item.price > 0));
      expect(need, "No open, nonperishable Firehouse need with at least six remaining");
      expect(state.stores?.[0]?.id, "No store available for the Shipt pledge");
      return { value: { need, storeId: state.stores[0].id }, detail: "HTTP 200; six or more items remain" };
    });

    const pledges = [];
    for (const fulfillment of ["shipt", "volunteer", "porch"]) {
      const pledge = await check(`Pledge: ${fulfillment}`, async () => {
        expect(context, "Prerequisite failed: open Firehouse need");
        // Use small diagnostic pledges so the check fits every seeded vehicle.
        const created = await request("/api/pledges", {
          method: "POST", status: 201,
          body: {
            needId: context.need.id, qty: 1, fulfillment, donorName: "Smoke check",
            ...(fulfillment === "shipt" ? { storeId: context.storeId } : {}),
            ...(fulfillment === "porch" ? { porch: { lat: 33.51, lng: -86.80 } } : {}),
          },
        });
        expect(typeof created.id === "string" && created.id.length > 0, "Pledge response has no id");
        expect(Number.isFinite(created.cost?.total) && created.cost.total > 0, "Pledge cost.total must be positive");
        return { value: created, detail: `HTTP 201; total=$${created.cost.total.toFixed(2)}` };
      });
      pledges.push(pledge);
    }

    await check("Page /shipt/order/[id]", async () => {
      expect(pledges[0], "Prerequisite failed: Shipt pledge");
      await request(`/shipt/order/${encodeURIComponent(pledges[0].id)}`, { page: true });
      return { detail: "HTTP 200; order tracking for the Shipt pledge" };
    });

    await check("Reject over-pledge", async () => {
      expect(context, "Prerequisite failed: open Firehouse need");
      await request("/api/pledges", {
        method: "POST", status: 409,
        body: { needId: context.need.id, qty: 9999, fulfillment: "volunteer", donorName: "Smoke check" },
      });
      return { detail: "HTTP 409; over-pledge rejected" };
    });

    await check("Plan routes", async () => {
      const plan = await request("/api/route-plan", { method: "POST", body: {} });
      expect(Array.isArray(plan.unrouted) && plan.unrouted.length === 0, "Expected zero unrouted pledges");
      expect(plan.routes?.length > 0 && typeof plan.summary?.label === "string", "Expected routes and a summary");
      expect(Number.isFinite(plan.summary.minutes) && Number.isFinite(plan.summary.naiveMinutes), "Missing route durations");
      return { detail: `${plan.summary.label}; ${plan.summary.minutes} min vs ${plan.summary.naiveMinutes} min separate` };
    });

    await check("Confirm receipt", async () => {
      expect(pledges[0], "Prerequisite failed: first pledge");
      const received = await request(`/api/pledges/${encodeURIComponent(pledges[0].id)}`, {
        method: "PATCH", body: { status: "received" },
      });
      expect(received.status === "received", "Pledge was not marked received");
      return { detail: "HTTP 200; first pledge received" };
    });

    await check("Platform orders + privacy", async () => {
      let state = await request("/api/state");
      // Exercise both confidential partners instead of passing an empty privacy check.
      const probeIds = [];
      for (const partnerId of ["pathways", "ywca"]) {
        const need = state.needs.find((entry) => entry.partnerId === partnerId && entry.qtyNeeded > entry.qtyPledged);
        expect(need && state.stores[0]?.id, "Missing confidential partner fixture");
        const probe = await request("/api/pledges", {
          method: "POST", status: 201,
          body: { needId: need.id, qty: 1, fulfillment: "shipt", storeId: state.stores[0].id, donorName: "Smoke check" },
        });
        probeIds.push(probe.id);
      }
      state = await request("/api/state");
      const payload = await request("/api/shipt/orders");
      expect(Array.isArray(payload.orders) && payload.orders.length >= 1, "Expected at least one Platform order");
      const orderIds = new Set(payload.orders.map((order) => order.external_order_id));
      expect(pledges[0] && orderIds.has(pledges[0].id), "New Shipt pledge has no Platform order");
      expect(probeIds.every((id) => orderIds.has(id)), "A confidential Shipt pledge has no Platform order");
      const byId = new Map(state.pledges.map((pledge) => [pledge.id, pledge]));
      let confidential = 0;
      for (const order of payload.orders) {
        const pledge = byId.get(order.external_order_id);
        expect(pledge, "Platform order has no matching pledge");
        if (!["pathways", "ywca"].includes(pledge.partnerId)) continue;
        const partner = state.partners.find((entry) => entry.id === pledge.partnerId);
        const drop = partner?.dropPoint;
        expect(drop && order.recipient?.address === drop.address
          && order.recipient?.location?.lat === drop.location.lat
          && order.recipient?.location?.lng === drop.location.lng, "Confidential order must use only its public drop point");
        if (partner.address && partner.address !== drop.address) {
          const privateAddress = JSON.stringify(partner.address).slice(1, -1).toLowerCase();
          expect(!JSON.stringify(order).toLowerCase().includes(privateAddress), "Confidential address leaked into a Platform order");
        }
        confidential++;
      }
      expect(confidential > 0, "No confidential order was available to check");
      return { detail: `HTTP 200; ${payload.orders.length} orders, ${confidential} confidential drop points checked` };
    });
  } finally {
    if (serverResponded) {
      await check("Restore cold-night demo", async () => {
        await request("/api/demo", {
          method: "POST", body: { action: "cold-night" },
          signal: AbortSignal.any([totalSignal, AbortSignal.timeout(10_000)]),
        });
        return { detail: "HTTP 200; data reset to the cold-night demo" };
      });
    }
  }
}

await main().catch((error) => {
  rows.push({ step: "Smoke runner", result: "FAIL", detail: error instanceof Error ? error.message : String(error), ms: 0 });
});
console.table(rows);
const failed = rows.filter((row) => row.result === "FAIL").length;
console.log(`${failed ? "FAIL" : "PASS"}: ${rows.length - failed}/${rows.length} checks in ${((performance.now() - started) / 1000).toFixed(1)}s.`);
if (serverUnavailable) console.log("Start the app first: npm run dev");
if (rows.some((row) => row.step === "Restore cold-night demo" && row.result === "PASS")) {
  console.log("Reminder: smoke data was reset; the app is back in its cold-night demo state.");
}
process.exitCode = failed ? 1 : 0;
