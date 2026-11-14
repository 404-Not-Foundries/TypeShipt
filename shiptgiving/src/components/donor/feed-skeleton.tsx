export function FeedSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading needs" className="space-y-4">
      <div className="h-8 w-2/3 animate-pulse rounded bg-hairline" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-hairline" />
        ))}
      </div>
    </div>
  );
}
