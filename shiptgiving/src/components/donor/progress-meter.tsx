type Props = { pledged: number; needed: number; received?: number };

export function ProgressMeter({ pledged, needed, received = 0 }: Props) {
  const pct = needed > 0 ? Math.min(100, Math.round((pledged / needed) * 100)) : 0;
  const recvPct = needed > 0 ? Math.min(100, Math.round((received / needed) * 100)) : 0;
  return (
    <div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={needed}
        aria-valuenow={pledged}
        aria-label={`${pledged} of ${needed} pledged`}
        className="relative h-2.5 overflow-hidden rounded-full bg-neutral-200"
      >
        <div className="absolute inset-y-0 left-0 bg-emerald-300 transition-all" style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 left-0 bg-emerald-700 transition-all" style={{ width: `${recvPct}%` }} />
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        <strong className="text-neutral-900">{pledged}</strong> of {needed} pledged
        {received > 0 && <> · {received} received</>}
      </p>
    </div>
  );
}
