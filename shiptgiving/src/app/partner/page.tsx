"use client";
// Owner: Viral-W. Partner portal: post needs, see rules, watch incoming donations, confirm receipt.
import { useCallback, useState } from "react";
import { useAppState } from "@/lib/use-app-state";
import { loadWeather } from "@/components/partner/api";
import { IncomingBoard } from "@/components/partner/incoming-board";
import { OpenNeeds } from "@/components/partner/open-needs";
import { PartnerPicker } from "@/components/partner/partner-picker";
import { PostNeed } from "@/components/partner/post-need";
import { RulesSummary } from "@/components/partner/rules-summary";
import { SurgePanel } from "@/components/partner/surge-panel";

export default function PartnerPage() {
  const { state, error, refresh } = useAppState();
  const [pickedId, setPickedId] = useState<string | null>(null);

  // The state poll does not re-run the weather surge, so new needs get it by asking for the weather again.
  const afterPublish = useCallback(async () => {
    await loadWeather().catch(() => undefined); // the surge panel reports weather errors itself
    await refresh();
  }, [refresh]);

  if (!state) {
    return <p className="text-neutral-600">{error ?? "Loading the partner portal…"}</p>;
  }

  const partner = state.partners.find((p) => p.id === pickedId) ?? state.partners[0];
  if (!partner) return <p className="text-neutral-600">No partners are set up yet.</p>;

  const needs = state.needs.filter((n) => n.partnerId === partner.id);
  const pledges = state.pledges.filter((p) => p.partnerId === partner.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{partner.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">{partner.mission}</p>
        </div>
        <PartnerPicker partners={state.partners} value={partner.id} onChange={setPickedId} />
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <PostNeed key={partner.id} partner={partner} catalog={state.catalog} onPublished={afterPublish} />
          <OpenNeeds needs={needs} />
        </div>
        <div className="space-y-4">
          <SurgePanel partner={partner} weather={state.weather} needs={needs} onChanged={refresh} />
          <RulesSummary partner={partner} />
        </div>
      </div>

      <IncomingBoard key={partner.id} pledges={pledges} needs={needs} onChanged={refresh} />
    </div>
  );
}
