import type { Partner } from "@/lib/types";
import { FIELD, PILL_MUTED } from "./styles";

type Props = { partners: Partner[]; value: string; onChange: (id: string) => void };

export function PartnerPicker({ partners, value, onChange }: Props) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-secondary">Signed in as</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD} rounded-full font-semibold`}
      >
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <span className={PILL_MUTED}>Demo: no login</span>
    </label>
  );
}
