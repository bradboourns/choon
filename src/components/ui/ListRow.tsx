import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface ListRowProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export default function ListRow({ title, subtitle, leading, trailing }: ListRowProps) {
  return (
    <button className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-md)] p-2 text-left transition active:bg-[var(--color-elevated)]">
      {leading}
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {subtitle && <span className="block text-xs text-[var(--color-text-secondary)]">{subtitle}</span>}
      </span>
      {trailing ?? <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden />}
    </button>
  );
}
