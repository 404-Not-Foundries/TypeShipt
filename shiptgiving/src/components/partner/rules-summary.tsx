import type { Feature, Partner } from "@/lib/types";
import { ConfidentialBadge, publicAddress } from "./confidential-badge";
import { formatWindow } from "./format";
import { CARD, HEADING, PILL_MUTED } from "./styles";

const FEATURE_LABELS: Record<Feature, string> = {
  weatherSurge: "Weather Surge",
  perishables: "Perishables: Shipt same-day only",
  dormKits: "Dorm Kits",
  classroom: "Classroom: new electronics only",
  confidential: "Confidential address",
};

export function RulesSummary({ partner }: { partner: Partner }) {
  const assumed = partner.receiving.some((w) => w.assumed);
  const { accepts } = partner;
  const rules = [
    accepts.newOnly ? "New items only" : "New or gently used items",
    accepts.perishables ? "Perishables accepted" : "No perishables",
    accepts.porchPickup ? "Porch pickups accepted" : "No porch pickups",
  ];

  return (
    <section className={CARD} aria-labelledby="rules-heading">
      <h2 id="rules-heading" className={HEADING}>
        Receiving and rules
      </h2>

      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-secondary">Deliver to</dt>
          <dd className="text-primary">
            {publicAddress(partner)}
            <ConfidentialBadge partner={partner} className="ml-2" />
          </dd>
        </div>

        <div>
          <dt className="font-medium text-secondary">Receiving windows</dt>
          <dd className="text-primary">
            {partner.receiving.length === 0 ? "None set" : partner.receiving.map(formatWindow).join(" · ")}
            {assumed && (
              <span className={`ml-2 ${PILL_MUTED}`}>
                Demo assumption: call to confirm
              </span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-medium text-secondary">Accept rules</dt>
          <dd>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {rules.map((r) => (
                <li key={r} className={PILL_MUTED}>
                  {r}
                </li>
              ))}
              {accepts.refuses.map((r) => (
                <li key={r} className="inline-flex items-center rounded-full border border-hairline bg-white px-2.5 py-0.5 text-xs font-medium text-primary">
                  Refuses: {r}
                </li>
              ))}
            </ul>
          </dd>
        </div>

        {partner.features.length > 0 && (
          <div>
            <dt className="font-medium text-secondary">Modules</dt>
            <dd>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {partner.features.map((f) => (
                  <li key={f} className="inline-flex items-center rounded-full bg-hero-sage px-2.5 py-0.5 text-xs font-semibold text-primary">
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
