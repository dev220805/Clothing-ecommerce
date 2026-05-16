import { cn } from '@/lib/utils';

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 dark:from-ink-800 dark:via-ink-700 dark:to-ink-800 bg-[length:200%_100%]',
        className
      )}
    />
  );
}
