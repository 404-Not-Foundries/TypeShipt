type Option = { value: string; label: string };
type Props = { label: string; options: Option[]; value: string | null; onChange: (v: string | null) => void };

export function FilterChips({ label, options, value, onChange }: Props) {
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm ${active ? "border-emerald-700 bg-emerald-700 text-white" : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-100"}`;
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <button type="button" aria-pressed={value === null} className={chip(value === null)} onClick={() => onChange(null)}>
        All {label.toLowerCase()}
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={chip(value === o.value)}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
