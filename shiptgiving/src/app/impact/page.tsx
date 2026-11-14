"use client";

import { DemoControls } from "@/components/impact/demo-controls";
import { ImpactStats } from "@/components/impact/impact-stats";
import { PartnerProgress } from "@/components/impact/partner-progress";
import { RecentActivity } from "@/components/impact/recent-activity";
import { PageHeader } from "@/components/ui/page-header";
import { useAppState } from "@/lib/use-app-state";

export default function ImpactPage() {
  const { state, error, refresh } = useAppState();
  return (
    <section className="space-y-6 text-primary">
      <PageHeader title="ShiptGiving impact, Birmingham" sub={<>Every pledge moves a local nonprofit closer to what it needs. Follow the giving, from a neighbor&apos;s promise to a partner&apos;s doorstep.</>} />
      {error && <p role="alert" className="rounded-xl bg-totemeal p-3 text-sm font-semibold">{error}</p>}
      {!state ? (
        <p role="status" className="rounded-2xl border border-hairline bg-white p-6 text-secondary">Loading community impact…</p>
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
