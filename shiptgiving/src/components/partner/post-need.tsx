"use client";
import { useRef, useState } from "react";
import type { CatalogItem, Partner } from "@/lib/types";
import { errorMessage, parseNeed, publishNeeds } from "./api";
import { NeedRows, rowIsValid, type Row } from "./need-rows";

const EXAMPLE = "Cold front tonight, need 40 pairs of men's socks L/XL and 20 blankets";

type Props = { partner: Partner; catalog: CatalogItem[]; onPublished: () => void };

export function PostNeed({ partner, catalog, onPublished }: Props) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<"parse" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const nextKey = useRef(0);

  const withKey = (item: Omit<Row, "key">): Row => ({ ...item, key: `row-${nextKey.current++}` });

  async function parse() {
    setBusy("parse");
    setError(null);
    setNotice(null);
    try {
      const { items, source } = await parseNeed(partner.id, text.trim());
      setRows(items.map(withKey));
      if (items.length === 0) setError("No catalog items matched. Add rows by hand or reword the request.");
      else if (source) setNotice(source === "claude" ? "Matched by Claude." : "Matched by keywords (offline mode).");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    setBusy("publish");
    setError(null);
    try {
      const items = rows.map(({ itemId, title, qty, urgency }) => ({ itemId, title: title.trim(), qty, urgency }));
      const created = await publishNeeds(partner.id, items);
      setNotice(`Published ${created.length} ${created.length === 1 ? "need" : "needs"} to the donor feed.`);
      setRows([]);
      setText("");
      onPublished();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const addRow = () => {
    const first = catalog[0];
    if (!first) return;
    const row = withKey({ itemId: first.id, title: first.name, qty: 1, urgency: "normal" });
    setRows((prev) => [...prev, row]);
  };

  const canPublish = rows.length > 0 && rows.every((r) => rowIsValid(r, catalog)) && busy === null;

  return (
    <section className="rounded-xl border border-black/10 bg-white p-4" aria-labelledby="post-need-heading">
      <h2 id="post-need-heading" className="text-lg font-semibold text-neutral-900">
        Post a need
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Write it the way you would say it. We match it to catalog items, and you confirm before anything goes live.
      </p>

      <label htmlFor="need-text" className="sr-only">
        Describe what you need
      </label>
      <textarea
        id="need-text"
        rows={3}
        value={text}
        maxLength={1000}
        onChange={(e) => setText(e.target.value)}
        placeholder={EXAMPLE}
        className="mt-3 w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={parse}
          disabled={text.trim().length === 0 || busy !== null}
          className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {busy === "parse" ? "Reading…" : "Turn into items"}
        </button>
        <button
          type="button"
          onClick={() => setText(EXAMPLE)}
          disabled={busy !== null}
          className="rounded-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Use the example
        </button>
        <button
          type="button"
          onClick={addRow}
          disabled={busy !== null || catalog.length === 0}
          className="rounded-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Add a row by hand
        </button>
      </div>

      {rows.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium text-neutral-700">Check the items, then publish</h3>
          <NeedRows rows={rows} catalog={catalog} onChange={setRows} />
          <button
            type="button"
            onClick={publish}
            disabled={!canPublish}
            className="mt-3 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {busy === "publish" ? "Publishing…" : `Publish ${rows.length} ${rows.length === 1 ? "need" : "needs"}`}
          </button>
        </div>
      )}

      <div aria-live="polite" className="mt-3 text-sm">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-red-800">{error}</p>}
        {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">{notice}</p>}
      </div>
    </section>
  );
}
