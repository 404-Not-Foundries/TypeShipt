import type { Partner } from "@/lib/types";

type Props = { partners: Partner[]; value: string; onChange: (id: string) => void };

export function PartnerPicker({ partners, value, onChange }: Props) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-neutral-600">Signed in as</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-2 font-medium text-neutral-900"
      >
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Demo: no login</span>
    </label>
  );
}
