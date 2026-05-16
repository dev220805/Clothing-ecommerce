import { Skeleton } from '@/components/ui/Skeleton';

/** Route transition shell — keeps layout stable during code-split loads */
export function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-[3/4] max-w-md rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
