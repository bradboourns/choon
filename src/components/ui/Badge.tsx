import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'genre' | 'vibe' | 'status' | 'muted';

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  genre: 'border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-secondary)]',
  vibe: 'border-violet-400/35 bg-violet-500/15 text-violet-100',
  status: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-100',
  muted: 'border-[var(--border-subtle)] bg-transparent text-[var(--text-tertiary)]',
};

export default function Badge({ className, children, variant = 'genre', ...props }: Props) {
  return <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium', variants[variant], className)} {...props}>{children}</span>;
}
