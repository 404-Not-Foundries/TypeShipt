export function FeedSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading needs" className="space-y-4">
      <div className="h-8 w-2/3 animate-pulse rounded bg-hairline" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-hairline" />
        ))}
      </div>
    </div>
  );
}
