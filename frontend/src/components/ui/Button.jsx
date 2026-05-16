import { cn } from '@/lib/utils';

export function Button({ className, variant = 'primary', loading, children, type = 'button', disabled, ...props }) {
  const variants = {
    primary:
      'bg-accent text-white hover:bg-accent-muted shadow-lg shadow-accent/25 disabled:opacity-50',
    ghost: 'bg-transparent border border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-900',
    outline: 'border border-ink-300 dark:border-ink-600 hover:border-accent hover:text-accent',
  };
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-[transform,color,background-color,border-color] motion-safe:active:scale-[0.98] motion-reduce:transition-colors',
        variants[variant],
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}
