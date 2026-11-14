// Feature cards and the pledge flow for /how-it-works. Owner: rmaytr.
import Link from "next/link";
import { Icon, type IconName } from "./icon";

type Feature = { icon: IconName; title: string; text: string; href: string; cta: string };

const FEATURES: Feature[] = [
  { icon: "gift", title: "Give", text: "Tonight's most urgent needs first. Chip in any amount, then pick Shipt delivers, I'll drive it, or porch pickup.", href: "/give", cta: "Fill a need" },
  { icon: "chat", title: "Nonprofits + AI", text: "Staff type a need in plain English. Claude matches it to catalog items; a keyword parser takes over offline.", href: "/partner", cta: "Post a need" },
  { icon: "snow", title: "Weather Surge", text: "The NWS forecast for Birmingham. Under 40°F or a heat advisory, matching items turn urgent with the reason shown.", href: "/partner", cta: "See the surge" },
  { icon: "route", title: "Drivers + routing", text: "Tomorrow's fleet, S to XL. Pledges are batched into one route per vehicle: shop first, then deliver.", href: "/driver", cta: "Generate routes" },
  { icon: "chart", title: "Impact", text: "Items pledged and delivered, partners helped, and the minutes and miles routing saved.", href: "/impact", cta: "See impact" },
  { icon: "bag", title: "Inside the Shipt app", text: "Each pledge as an ordinary gift order to the nonprofit, with tracking. A concept; nothing is sent to Shipt.", href: "/shipt", cta: "Open the concept" },
  { icon: "panels", title: "Presenter", text: "Donor, nonprofit and driver side by side, with Cold night demo, Generate routes and Reset.", href: "/demo", cta: "Open split view" },
];

export function FeatureCards() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((f) => (
        <li key={f.title} className="flex flex-col rounded-2xl border border-hairline bg-white p-5">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-express text-express">
            <Icon name={f.icon} />
          </span>
          <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
          <p className="mt-1 mb-4 text-sm text-secondary">{f.text}</p>
          <Link href={f.href} className="mt-auto inline-flex min-h-11 items-center self-start rounded-full border border-primary px-4 text-sm font-semibold hover:bg-surface-muted">
            {f.cta} <span aria-hidden="true">&nbsp;→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

type Step = { icon: IconName; title: string; text: string };

const STEPS: Step[] = [
  { icon: "post", title: "Nonprofit posts", text: "“Cold front tonight, need 40 pairs of socks.”" },
  { icon: "spark", title: "AI parses", text: "Claude (or keywords) returns catalog items, qty and urgency." },
  { icon: "gift", title: "Donor pledges", text: "Validated, capped at what's open, priced by pledgeCost." },
  { icon: "route", title: "Batched route", text: "Greedy fill by vehicle size, then 2-opt stop order." },
  { icon: "truck", title: "Delivered", text: "Driver marks picked up, then delivered. Every view updates." },
  { icon: "receipt", title: "Receipt", text: "Partner confirms counts; the donor gets a written acknowledgment." },
  { icon: "chart", title: "Impact", text: "Meters fill and the trips saved add up." },
];

export function PledgeFlow() {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative flex gap-3 rounded-2xl bg-totemeal p-4 lg:flex-col lg:gap-2">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary">
            <Icon name={s.icon} />
          </span>
          <div>
            <p className="text-xs font-semibold text-secondary">Step {i + 1}</p>
            <h3 className="font-bold leading-tight">{s.title}</h3>
            <p className="mt-1 text-sm text-secondary">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
