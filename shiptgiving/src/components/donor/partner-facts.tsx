import { VerifiedBadge } from "@/components/partner/verified-badge";
import type { Need, Partner } from "@/lib/types";
import { dropOff, formatWindow, hoursAssumed } from "./geo";

const FEATURE: Record<Partner["features"][number], string> = {
  weatherSurge: "Weather Surge shelter",
  perishables: "Accepts fresh food (same-day Shipt only)",
  dormKits: "Dorm move-in kits",
  classroom: "Classroom tech (new only)",
  confidential: "Confidential location",
};

export function PartnerFacts({ partner, needs }: { partner: Partner; needs: Need[] }) {
  const drop = dropOff(partner);
  const received = needs.reduce((sum, n) => sum + n.qtyReceived, 0);
  const pledged = needs.reduce((sum, n) => sum + n.qtyPledged, 0);
  const a = partner.accepts;
  const rules = [
    a.newOnly ? "New items only" : "New or gently used items",
    a.perishables ? "Perishables OK (delivered inside the window)" : "No perishables",
    a.porchPickup ? "Porch pickup available" : "No porch pickups",
  ];

  return (
    <header className="space-y-4">
      <div>
        <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-tight sm:text-4xl">{partner.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm text-secondary">{partner.neighborhood}</span>
          <VerifiedBadge partnerId={partner.id} />
        </div>
        <p className="mt-2 text-primary">{partner.mission}</p>
        {partner.features.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {partner.features.map((f) => (
              <li key={f} className="rounded-full bg-express px-2.5 py-0.5 text-xs font-semibold text-express">{FEATURE[f]}</li>
            ))}
          </ul>
        )}
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label="items received" value={received} />
        <Stat label="items pledged" value={pledged} />
        <Stat label="open needs" value={needs.filter((n) => n.qtyPledged < n.qtyNeeded).length} />
      </dl>

      <div className="grid gap-3 sm:grid-cols-3">
        <Box title={drop.confidential ? "Drop point" : "Address"}>
          <p>{drop.address}</p>
          {drop.confidential && <p className="mt-1 text-xs text-secondary">The shelter&apos;s address stays private. Deliveries go to this public drop point.</p>}
        </Box>
        <Box title="Receiving hours">
          <ul>{partner.receiving.map((w, i) => <li key={i}>{formatWindow(w)}</li>)}</ul>
          {hoursAssumed(partner) && <p className="mt-1 text-xs text-secondary">Hours not published — call to confirm.</p>}
        </Box>
        <Box title="What they accept">
          <ul className="list-disc pl-4">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
          {a.refuses.length > 0 && <p className="mt-1 text-xs text-sale">Can&apos;t take: {a.refuses.join(", ")}</p>}
        </Box>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse rounded-2xl bg-white p-3">
      <dt className="text-xs text-secondary">{label}</dt>
      <dd className="text-2xl font-bold text-primary">{value}</dd>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-hairline bg-white p-4 text-sm">
      <h2 className="mb-1 font-semibold">{title}</h2>
      {children}
    </section>
  );
}
