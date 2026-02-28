import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  iconLeft?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-accent)] text-white active:scale-[0.99]',
  secondary: 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)]',
  danger: 'bg-[var(--color-error)] text-white',
};

export default function Button({ variant = 'primary', loading, disabled, iconLeft, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold transition active:translate-y-px disabled:opacity-50 ${variantClass[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : iconLeft}
      {children}
    </button>
  );
}
