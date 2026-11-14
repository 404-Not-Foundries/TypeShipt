// The one page-header pattern: title, one supporting line, optional actions on the right.
type Props = { title: React.ReactNode; sub?: React.ReactNode; children?: React.ReactNode };

export function PageHeader({ title, sub, children }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="max-w-3xl text-[28px] font-extrabold leading-[1.15] tracking-tight sm:text-4xl">{title}</h1>
        {sub && <p className="mt-1.5 max-w-prose text-secondary">{sub}</p>}
      </div>
      {children}
    </header>
  );
}
