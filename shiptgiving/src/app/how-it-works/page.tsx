// Owner: rmaytr. "How it works": a scrollable walkthrough of the idea, features, flow, architecture and code.
import type { Metadata } from "next";
import { Architecture } from "@/components/explain/architecture";
import { CodeMap, KeyCode } from "@/components/explain/code-map";
import { FeatureCards, PledgeFlow } from "@/components/explain/features";

export const metadata: Metadata = {
  title: "How it works · ShiptGiving",
  description: "What ShiptGiving does, how a pledge flows, the architecture and the code behind it.",
};

const SECTIONS = [
  { id: "features", label: "Features" },
  { id: "flow", label: "Pledge flow" },
  { id: "architecture", label: "Architecture" },
  { id: "code", label: "Code" },
  { id: "decisions", label: "Decisions" },
];

const NUMBERS = [
  { value: "215+", label: "men sheltered every night at Firehouse Ministries, which runs on in-kind gifts" },
  { value: "146,000", label: "Birmingham residents living in food deserts" },
  { value: "11", label: "real Birmingham nonprofits seeded with hours and accept rules" },
  { value: "3", label: "ways to give: Shipt delivers, I'll drive it, porch pickup" },
];

const DECISIONS = [
  { title: "Next.js API routes", text: "One app, one language, one deploy. Pages and API share lib/types.ts, so a contract change breaks the build, not the demo." },
  { title: "In-memory store + 2 s polling", text: "One Node process is enough for a one-laptop demo: no database, no websockets. Every write returns a new state object; a database is the swap to deploy." },
  { title: "Greedy routing, not a solver", text: "Tens of stops, no keys, milliseconds, unit-tested, and every choice explains itself: biggest vehicle first, shop then deliver, nearest neighbor, 2-opt." },
  { title: "A gift order, so zero new Shipt systems", text: "Shipt already delivers gifts to any address. A pledge is one, pre-addressed to the nonprofit with a community tag: no new order type, labor or money handling." },
  { title: "AI with a fallback", text: "Claude must answer in a JSON schema limited to real catalog ids, and anything else is dropped. No key or a failed call falls back to a keyword parser." },
  { title: "Public APIs only", text: "OSM, Open Food Facts, OSRM, NWS and ProPublica need no keys. Each call has a timeout and a fallback: snapshot, straight line, last reading, seed record." },
  { title: "Live on Vercel, deployed by hand", text: "Deployed with the Vercel CLI, not on every merge, so the live demo can't change mid-presentation. Each instance starts in the cold-night demo state." },
  { title: "Checked before every demo", text: "121 unit tests (routing, fees, store, AI parse, weather, verification), plus npm run smoke: the whole flow against a running server, from posting a need to confirming receipt." },
];

function Section({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 space-y-4">
      <div>
        <h2 id={`${id}-title`} className="text-[28px] font-bold leading-tight">{title}</h2>
        <p className="mt-1 max-w-3xl text-secondary">{lead}</p>
      </div>
      {children}
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="space-y-12 text-primary">
      <section aria-labelledby="hiw-title" className="rounded-2xl bg-hero-sage p-6 sm:p-10">
        <p className="text-sm font-semibold">How it works</p>
        <h1 id="hiw-title" className="mt-1 text-[36px] font-extrabold leading-[1.1] tracking-tight sm:text-[52px]">
          Birmingham&apos;s wishlists, filled by Shipt
        </h1>
        <p className="mt-3 max-w-2xl text-lg">
          Nonprofits post what they need tonight. Neighbors fill it in a few taps, as an ordinary Shipt gift order, by
          driving it, or by porch pickup. Pledges are batched into routes sized to tomorrow&apos;s drivers.
        </p>
        <p className="mt-3 max-w-2xl text-secondary">
          Giving goods today means buying the item, finding the drop-off hours, driving downtown and hoping it is still
          needed. Nonprofits end up with 60 of one thing and none of what they asked for.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((n) => (
            <div key={n.value} className="flex flex-col-reverse rounded-2xl bg-white p-4">
              <dt className="text-sm text-secondary">{n.label}</dt>
              <dd className="text-3xl font-extrabold tabular-nums">{n.value}</dd>
            </div>
          ))}
        </dl>
        <nav aria-label="On this page" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold hover:bg-surface-muted">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <Section id="features" title="Features at a glance" lead="One web app, three roles, one shared live state. Every card opens the real feature.">
        <FeatureCards />
      </Section>

      <Section id="flow" title="How a pledge flows" lead="From a sentence typed by shelter staff to a delivered, acknowledged donation.">
        <PledgeFlow />
      </Section>

      <Section id="architecture" title="Architecture" lead="Next.js App Router, TypeScript and Tailwind. Pages call API routes; API routes call plain functions in lib/.">
        <Architecture />
      </Section>

      <Section id="code" title="Code map" lead="shiptgiving/src, folder by folder, with who owns what. Open a folder to see inside.">
        <CodeMap />
        <h3 className="pt-4 text-xl font-bold">Key code</h3>
        <KeyCode />
      </Section>

      <Section id="decisions" title="Tech decisions" lead="Each choice keeps the code small and the demo safe to run live.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DECISIONS.map((d) => (
            <li key={d.title} className="rounded-2xl border border-hairline bg-white p-5">
              <h3 className="font-bold">{d.title}</h3>
              <p className="mt-1 text-sm text-secondary">{d.text}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
