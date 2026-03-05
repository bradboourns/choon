import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type CardVariant = 'default' | 'elevated' | 'glass' | 'muted';

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variants: Record<CardVariant, string> = {
  default: 'border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-sm)]',
  elevated: 'border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-md)]',
  glass: 'border-white/10 bg-[var(--surface-glass)] backdrop-blur-xl shadow-[var(--shadow-md)]',
  muted: 'border-[var(--border-subtle)] bg-[var(--surface-muted)]',
};

export default function Card({ className, children, variant = 'default', ...props }: Props) {
  return (
    <div className={cn('rounded-3xl border p-5', variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
