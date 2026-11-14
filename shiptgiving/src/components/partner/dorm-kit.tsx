"use client";
import { useMemo, useState } from "react";
import type { CatalogItem, Need, Partner } from "@/lib/types";
import { kitNeedItems, kitPrice, kitsCovered, resolveDormKit } from "./dorm-kit-data";
import { ALERT, BTN_PRIMARY, FIELD, HEADING, SUCCESS, WARM_CARD } from "./styles";

type Props = {
  partner: Pick<Partner, "id" | "features">;
  catalog: CatalogItem[];
  needs: Need[];
  /** Called after the kit's needs are published, e.g. `refresh` from `useAppState()`. */
  onPublished?: () => void;
};

const MAX_SCHOLARS = 50;

/** Dorm Kit bundle for partners with the `dormKits` feature. Renders nothing for other partners. */
export function DormKit({ partner, catalog, needs, onPublished }: Props) {
  const lines = useMemo(() => resolveDormKit(catalog), [catalog]);
  const [scholars, setScholars] = useState(5);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!partner.features.includes("dormKits") || lines.length === 0) return null;

  const price = kitPrice(lines);
  const pledged = kitsCovered(lines, needs, partner.id, "qtyPledged");
  const received = kitsCovered(lines, needs, partner.id, "qtyReceived");

  async function publish() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: partner.id, items: kitNeedItems(lines, scholars) }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setMessage({ ok: true, text: `Posted ${scholars} Dorm ${scholars === 1 ? "Kit" : "Kits"} to the donor feed.` });
      onPublished?.();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Could not post the kit." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Dorm Kit bundle" className={`${WARM_CARD} text-sm text-primary`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={HEADING}>Dorm Kit</h3>
        <p className="text-secondary">
          <span className="text-base font-bold text-primary">${price.toFixed(2)}</span> moves in one scholar
        </p>
      </div>
      <p className="mt-1 text-secondary">
        Everything one scholar needs on move-in day, posted as a bundle so donors can fund a whole kit.
      </p>

      <ul className="mt-3 divide-y divide-hairline rounded-xl border border-hairline bg-white">
        {lines.map((l) => (
          <li key={l.item.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <span>
              <span className="font-semibold">{l.label}</span>
              <span className="block text-xs text-secondary">{l.item.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-primary">
              {l.qty} × ${l.item.price.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-secondary">
        <span className="font-bold text-primary">{pledged}</span> {pledged === 1 ? "kit" : "kits"} fully pledged
        {" · "}
        <span className="font-bold text-primary">{received}</span> received
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span>Scholars</span>
          <input
            type="number"
            min={1}
            max={MAX_SCHOLARS}
            value={scholars}
            onChange={(e) => {
              const n = Math.round(Number(e.target.value));
              setScholars(Number.isFinite(n) ? Math.min(MAX_SCHOLARS, Math.max(1, n)) : 1);
            }}
            className={`${FIELD} w-20 tabular-nums`}
          />
        </label>
        <button
          type="button"
          onClick={publish}
          disabled={busy}
          className={BTN_PRIMARY}
        >
          {busy ? "Posting…" : `Post ${scholars} ${scholars === 1 ? "kit" : "kits"} · $${(price * scholars).toFixed(2)}`}
        </button>
      </div>
      {message && (
        <p role="status" className={`mt-3 ${message.ok ? SUCCESS : ALERT}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
