"use client";
// Owner: rmaytr. Presenter view: the demo script on top, then donor, nonprofit and driver side by side.
import { useState } from "react";
import { sendJson } from "@/components/driver/format";
import { PageHeader } from "@/components/ui/page-header";

const VIEWS = ["give", "partner", "driver"] as const;
type ViewId = (typeof VIEWS)[number];

const DEFAULT_SRC: Record<ViewId, string> = { give: "/give", partner: "/partner", driver: "/driver" };
const LABEL: Record<string, string> = {
  "/give": "Donor",
  "/partner": "Nonprofit",
  "/driver": "Driver",
  "/shipt": "Inside the Shipt app",
  "/impact": "Impact",
};

async function coldNight(): Promise<string> {
  await sendJson("/api/demo", "POST", { action: "cold-night" });
  return "Cold night is on: shelter needs are urgent and neighbors have pledged.";
}

async function reset(): Promise<string> {
  await sendJson("/api/demo", "POST", { action: "reset" });
  return "Reset to the starting state.";
}

async function generateRoutes(): Promise<string> {
  const plan = (await sendJson("/api/route-plan", "POST", {})) as { summary?: { label?: string } };
  return `Routes generated: ${plan.summary?.label ?? "see the Driver view"}.`;
}

type Step = {
  title: string;
  show: string;
  pane: ViewId;
  action?: { label: string; run: () => Promise<string> };
  /** Pages this step swaps into the panes. */
  open?: Partial<Record<ViewId, string>>;
};

const STEPS: Step[] = [
  { title: "Set the scene", show: "Press Cold night demo: shelter needs turn urgent and neighbors start pledging.", pane: "give", action: { label: "Cold night demo", run: coldNight } },
  { title: "Donor fills a need", show: "Tap Fill on a blanket, pick Shipt delivers, and confirm.", pane: "give" },
  { title: "Nonprofit posts a need", show: "Type a need in plain words. It becomes items donors can fill.", pane: "partner" },
  { title: "Batch the deliveries", show: "Press Generate routes: one route per vehicle, sized to what it can carry.", pane: "driver", action: { label: "Generate routes", run: generateRoutes } },
  { title: "Deliver and confirm", show: "The driver marks stops delivered. The nonprofit confirms receipt.", pane: "driver" },
  { title: "Show the impact", show: "City totals, and ShiptGiving as a section inside the Shipt app.", pane: "driver", open: { give: "/shipt", driver: "/impact" } },
];

const BTN = "press min-h-11 rounded-full px-5 text-sm font-semibold disabled:opacity-50";

export default function DemoPage() {
  const [current, setCurrent] = useState(0);
  const [tab, setTab] = useState<ViewId>("give");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; failed: boolean } | null>(null);
  const step = STEPS[current];
  const srcs = { ...DEFAULT_SRC, ...step.open };

  function go(i: number) {
    setCurrent(i);
    setTab(STEPS[i].pane);
  }

  async function run(id: string, task: () => Promise<string>) {
    setBusy(id);
    setNote(null);
    try {
      setNote({ text: await task(), failed: false });
    } catch (err) {
      setNote({ text: err instanceof Error ? err.message : "That didn't work. Try again.", failed: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    // Full-bleed: the layout caps pages at max-w-6xl, and three views need the whole laptop screen.
    <div className="relative left-1/2 w-screen -translate-x-1/2 space-y-3 px-4">
      <PageHeader title="Presenter view" sub={note ? undefined : "Follow the script left to right. Every view updates live."}>
        <p role="status" className={`mr-auto text-sm ${note?.failed ? "font-semibold text-sale" : "font-semibold text-express"}`}>
          {note?.text}
        </p>
        {STEPS.map((st, i) =>
          st.action ? (
            <button
              key={st.title}
              type="button"
              onClick={() => {
                go(i);
                run(st.title, st.action!.run);
              }}
              disabled={busy !== null}
              className={`${BTN} ${i === current ? "bg-primary text-white hover:bg-black" : "border border-primary bg-white hover:bg-surface-muted"}`}
            >
              {busy === st.title ? "Working…" : st.action.label}
            </button>
          ) : null,
        )}
        <button type="button" onClick={() => run("reset", reset).then(() => go(0))} disabled={busy !== null} className={`${BTN} border border-primary bg-white hover:bg-surface-muted`}>
          {busy === "reset" ? "Working…" : "Reset"}
        </button>
      </PageHeader>

      <ol aria-label="Demo script" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[1100px]:mx-0 min-[1100px]:grid min-[1100px]:grid-cols-6 min-[1100px]:overflow-visible min-[1100px]:px-0">
        {STEPS.map((s, i) => {
          const on = i === current;
          return (
            <li
              key={s.title}
              aria-current={on ? "step" : undefined}
              className={`flex w-60 shrink-0 flex-col rounded-2xl border p-3 min-[1100px]:w-auto ${on ? "border-primary bg-surface-muted" : "border-hairline bg-white"}`}
            >
              <button type="button" onClick={() => go(i)} className="flex min-h-11 flex-1 flex-col text-left">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums ${i < current ? "bg-express text-express" : on ? "bg-primary text-white" : "bg-surface-muted"}`}
                  >
                    {i < current ? "✓" : i + 1}
                  </span>
                  {s.title}
                </span>
                <span className="mt-1 text-xs text-secondary">{s.show}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div role="tablist" aria-label="View" className="flex gap-1 min-[1100px]:hidden">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            id={`tab-${v}`}
            aria-selected={tab === v}
            aria-controls={`view-${v}`}
            onClick={() => setTab(v)}
            className={`min-h-11 flex-1 rounded-full px-3 text-sm font-semibold ${tab === v ? "bg-primary text-white" : "bg-surface-muted text-primary"}`}
          >
            {LABEL[srcs[v]]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 min-[1100px]:grid-cols-3">
        {VIEWS.map((v) => {
          const src = srcs[v];
          const focus = step.pane === v;
          return (
            <section
              key={v}
              id={`view-${v}`}
              aria-labelledby={`label-${v}`}
              className={`overflow-hidden rounded-2xl border-2 bg-white min-[1100px]:block ${focus ? "border-primary" : "border-hairline"} ${tab === v ? "" : "hidden"}`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-4">
                <h2 id={`label-${v}`} className="text-lg font-extrabold">
                  {LABEL[src]}
                </h2>
                <a href={src} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm text-secondary underline hover:text-primary">
                  Open in a tab
                </a>
              </div>
              <iframe src={src} title={`${LABEL[src]} view`} className="block h-[calc(100dvh-22.5rem)] min-h-[28rem] w-full" />
            </section>
          );
        })}
      </div>
    </div>
  );
}
