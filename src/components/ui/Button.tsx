import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'subtle';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-[var(--accent-primary)] text-white shadow-[var(--shadow-glow)] hover:bg-violet-500',
  secondary: 'border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]',
  ghost: 'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
  outline: 'border-[var(--border-strong)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--accent-soft)] hover:text-[var(--text-primary)]',
  destructive: 'border-transparent bg-[var(--state-destructive)]/85 text-white hover:bg-[var(--state-destructive)]',
  subtle: 'border-[var(--border-subtle)] bg-[var(--surface-glass)] text-[var(--text-secondary)] backdrop-blur hover:bg-[var(--surface-elevated)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-xl px-3 text-sm',
  md: 'h-10 rounded-xl px-4 text-sm',
  lg: 'h-11 rounded-2xl px-5 text-sm',
  icon: 'h-10 w-10 rounded-xl',
};

export default function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 border font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-page)] disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
