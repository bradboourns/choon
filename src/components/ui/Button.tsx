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

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function Button({ variant = 'primary', loading, disabled, iconLeft, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold transition active:translate-y-px disabled:opacity-50 ${variantClass[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner /> : iconLeft}
      {children}
    </button>
  );
}
