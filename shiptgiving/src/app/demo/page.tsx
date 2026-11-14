"use client";
// Owner: rmaytr. Presenter view: Give, Partner and Driver side by side on one laptop.
import { useState } from "react";
import { sendJson } from "@/components/driver/format";

const VIEWS = [
  { id: "give", label: "Donor", hint: "fills a need", src: "/" },
  { id: "partner", label: "Nonprofit", hint: "posts needs, confirms receipt", src: "/partner" },
  { id: "driver", label: "Driver", hint: "runs tomorrow's routes", src: "/driver" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

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

const ACTIONS = [
  { id: "cold", label: "Cold night demo", run: coldNight, primary: true },
  { id: "routes", label: "Generate routes", run: generateRoutes, primary: false },
  { id: "reset", label: "Reset", run: reset, primary: false },
];

export default function DemoPage() {
  const [tab, setTab] = useState<ViewId>("give");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; failed: boolean } | null>(null);

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
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold">One need, three views</h1>
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => run(a.id, a.run)}
            disabled={busy !== null}
            className={`min-h-11 rounded-full px-5 text-sm font-semibold disabled:opacity-50 ${
              a.primary ? "bg-primary text-white" : "border border-primary bg-white text-primary hover:bg-surface-muted"
            }`}
          >
            {busy === a.id ? "Working…" : a.label}
          </button>
        ))}
      </div>
      <p role="status" className={`min-h-5 text-sm ${note?.failed ? "text-sale" : "text-secondary"}`}>
        {note?.text}
      </p>

      <div role="tablist" aria-label="View" className="flex gap-1 min-[1100px]:hidden">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            id={`tab-${v.id}`}
            aria-selected={tab === v.id}
            aria-controls={`view-${v.id}`}
            onClick={() => setTab(v.id)}
            className={`min-h-11 flex-1 rounded-full px-3 text-sm font-semibold ${
              tab === v.id ? "bg-primary text-white" : "bg-surface-muted text-primary"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 min-[1100px]:grid-cols-3">
        {VIEWS.map((v) => (
          <section
            key={v.id}
            id={`view-${v.id}`}
            aria-labelledby={`label-${v.id}`}
            className={`overflow-hidden rounded-2xl border border-hairline bg-white min-[1100px]:block ${
              tab === v.id ? "" : "hidden"
            }`}
          >
            <h2 id={`label-${v.id}`} className="border-b border-hairline px-4 py-2 text-sm font-bold">
              {v.label} <span className="font-normal text-secondary">{v.hint}</span>
            </h2>
            <iframe src={v.src} title={`${v.label} view`} className="block h-[calc(100dvh-15rem)] min-h-[28rem] w-full" />
          </section>
        ))}
      </div>
    </div>
  );
}
