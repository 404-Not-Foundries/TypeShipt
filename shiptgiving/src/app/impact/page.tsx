"use client";

import { DemoControls } from "@/components/impact/demo-controls";
import { ImpactStats } from "@/components/impact/impact-stats";
import { PartnerProgress } from "@/components/impact/partner-progress";
import { RecentActivity } from "@/components/impact/recent-activity";
import { useAppState } from "@/lib/use-app-state";

export default function ImpactPage() {
  const { state, error, refresh } = useAppState();
  return (
    <section className="space-y-6 text-neutral-900">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ShiptGiving impact, Birmingham</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">Every pledge moves a local nonprofit closer to what it needs. Follow the giving, from a neighbor&apos;s promise to a partner&apos;s doorstep.</p>
      </header>
      {error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
      {!state ? (
        <p role="status" className="rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-600">Loading community impact…</p>
      ) : (
        <>
          <ImpactStats state={state} />
          <DemoControls onRefresh={refresh} />
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <PartnerProgress state={state} />
            <RecentActivity state={state} />
          </div>
        </>
      )}
    </section>
  );
}
