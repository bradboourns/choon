import { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export default function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]/80', className)} {...props} />;
}
