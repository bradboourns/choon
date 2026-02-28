import type { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function Chip({ active, className = '', ...props }: ChipProps) {
  return (
    <button
      className={`min-h-11 rounded-full border px-4 text-sm transition active:scale-[0.98] ${active ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-white' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]'} ${className}`}
      {...props}
    />
  );
}
