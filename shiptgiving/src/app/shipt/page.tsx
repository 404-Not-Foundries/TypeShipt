"use client";

import { useState } from "react";
import { CommunityBanner } from "@/components/shipt/community-banner";
import { CommunityOrders } from "@/components/shipt/community-orders";
import { ConceptHeader } from "@/components/shipt/concept-header";
import { StoreTiles } from "@/components/shipt/store-tiles";
import { useAppState } from "@/lib/use-app-state";

export default function ShiptConceptPage() {
  const { state, error } = useAppState();
  const [query, setQuery] = useState("");
  return (
    <section className="space-y-6 text-primary">
      <div className="rounded-xl border border-hairline bg-totemeal p-4">
        <p className="text-sm font-bold">Concept preview: ShiptGiving as a section of the Shipt app</p>
        <p className="mt-1 text-xs text-secondary">A mock gift-order experience. No purchases are placed or sent to Shipt.</p>
      </div>
      <ConceptHeader query={query} onQueryChange={setQuery} />
      {error && <p role="alert" className="rounded-xl border border-hairline bg-totemeal p-4 text-sm">{error}</p>}
      {!state ? (
        <p role="status" className="rounded-xl border border-hairline bg-surface-muted p-6 text-secondary">Loading your Birmingham community…</p>
      ) : (
        <>
          <StoreTiles stores={state.stores} query={query} />
          <CommunityBanner state={state} query={query} />
          <CommunityOrders state={state} />
        </>
      )}
    </section>
  );
}
