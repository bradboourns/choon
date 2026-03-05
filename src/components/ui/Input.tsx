import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]/80', className)} {...props} />;
}
