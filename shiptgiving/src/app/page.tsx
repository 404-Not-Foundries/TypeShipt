"use client";
// Owner: rmaytr. Home hub: what ShiptGiving is, how tonight looks, and a door for each role.
import Link from "next/link";
import { useEffect } from "react";
import { useAppState } from "@/lib/use-app-state";

const ROLES = [
  { href: "/give", title: "Give", who: "For neighbors", text: "See what Birmingham needs tonight and fill it in a few taps.", cta: "Fill a need" },
  { href: "/partner", title: "Nonprofits", who: "For partners", text: "Post what you need in plain words and confirm what arrives.", cta: "Open the portal" },
  { href: "/driver", title: "Drivers", who: "For Shipt and volunteer drivers", text: "Tomorrow's fleet, a route sized to each vehicle, and the map.", cta: "See the routes" },
];

const MORE = [
  { href: "/impact", title: "Impact", text: "What the city has given so far." },
  { href: "/shipt", title: "See it inside the Shipt app", text: "A concept of ShiptGiving as a Shipt section." },
  { href: "/demo", title: "Presenter view", text: "Donor, nonprofit and driver side by side." },
];

// The whole card is the link target; the heading stays the accessible name.
const STRETCH = "after:absolute after:inset-0 after:rounded-2xl";

export default function HomePage() {
  const { state, error, refresh } = useAppState();

  // Ask for the forecast once so an active Weather Surge shows here before any other page is opened.
  useEffect(() => {
    fetch("/api/weather", { cache: "no-store" })
      .then(() => refresh())
      .catch(() => {});
  }, [refresh]);

  const stats = state && [
    { label: "urgent needs", value: state.needs.filter((n) => n.urgency === "urgent" && n.qtyPledged < n.qtyNeeded).length },
    { label: "items pledged", value: state.needs.reduce((sum, n) => sum + n.qtyPledged, 0) },
    { label: "nonprofit partners", value: state.partners.length },
  ];

  return (
    <div className="space-y-6 text-primary">
      <section className="rounded-2xl bg-hero-sage p-6 sm:p-10">
        <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight sm:text-[56px]">ShiptGiving</h1>
        <p className="mt-3 max-w-2xl text-lg">
          Birmingham nonprofits post what they need tonight. Neighbors fill it through Shipt, by driving, or by porch
          pickup.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm font-semibold">
            {error}
          </p>
        )}
        {stats && (
          <dl aria-label="Right now in Birmingham" className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-sm">{s.label}</dt>
                <dd className="text-4xl font-extrabold tabular-nums">{s.value.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        )}
        {state?.weather.surge && state.weather.reason && (
          <p className="mt-5 inline-flex min-h-8 items-center rounded-full bg-dark-band px-4 text-sm font-semibold text-white">
            Weather Surge: {state.weather.reason}
          </p>
        )}
      </section>

      <ul className="grid gap-4 md:grid-cols-3">
        {ROLES.map((r) => (
          <li key={r.href} className="relative flex flex-col rounded-2xl border border-hairline bg-white p-6 hover:border-primary">
            <p className="text-sm text-secondary">{r.who}</p>
            <h2 className="mt-1 text-[28px] font-bold leading-tight">{r.title}</h2>
            <p className="mt-2 mb-6 text-secondary">{r.text}</p>
            <Link
              href={r.href}
              className={`mt-auto inline-flex min-h-11 items-center self-start rounded-full bg-primary px-6 text-sm font-semibold text-white ${STRETCH}`}
            >
              {r.cta}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="grid gap-3 sm:grid-cols-3">
        {MORE.map((m) => (
          <li key={m.href} className="relative rounded-2xl bg-totemeal p-4 hover:bg-surface-muted">
            <h2 className="font-bold">
              <Link href={m.href} className={`underline ${STRETCH}`}>
                {m.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-secondary">{m.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
