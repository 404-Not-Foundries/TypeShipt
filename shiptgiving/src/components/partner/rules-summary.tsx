import type { Feature, Partner } from "@/lib/types";
import { formatWindow } from "./format";

const FEATURE_LABELS: Record<Feature, string> = {
  weatherSurge: "Weather Surge",
  perishables: "Perishables: Shipt same-day only",
  dormKits: "Dorm Kits",
  classroom: "Classroom: new electronics only",
  confidential: "Confidential address",
};

export function RulesSummary({ partner }: { partner: Partner }) {
  const confidential = partner.features.includes("confidential");
  const assumed = partner.receiving.some((w) => w.assumed);
  const { accepts } = partner;
  const rules = [
    accepts.newOnly ? "New items only" : "New or gently used items",
    accepts.perishables ? "Perishables accepted" : "No perishables",
    accepts.porchPickup ? "Porch pickups accepted" : "No porch pickups",
  ];

  return (
    <section className="rounded-xl border border-black/10 bg-white p-4" aria-labelledby="rules-heading">
      <h2 id="rules-heading" className="text-lg font-semibold text-neutral-900">
        Receiving and rules
      </h2>

      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-neutral-500">Deliver to</dt>
          <dd className="text-neutral-900">
            {confidential ? (partner.dropPoint?.address ?? "Public drop point") : partner.address}
            {confidential && (
              <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900">
                Confidential: drivers and donors only see this drop point
              </span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-medium text-neutral-500">Receiving windows</dt>
          <dd className="text-neutral-900">
            {partner.receiving.length === 0 ? "None set" : partner.receiving.map(formatWindow).join(" · ")}
            {assumed && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                Demo assumption: call to confirm
              </span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-medium text-neutral-500">Accept rules</dt>
          <dd>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {rules.map((r) => (
                <li key={r} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-800">
                  {r}
                </li>
              ))}
              {accepts.refuses.map((r) => (
                <li key={r} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-800">
                  Refuses: {r}
                </li>
              ))}
            </ul>
          </dd>
        </div>

        {partner.features.length > 0 && (
          <div>
            <dt className="font-medium text-neutral-500">Modules</dt>
            <dd>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {partner.features.map((f) => (
                  <li key={f} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-900">
                    {FEATURE_LABELS[f]}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
