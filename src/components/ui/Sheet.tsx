import type { PropsWithChildren } from 'react';

interface SheetProps extends PropsWithChildren {
  title: string;
}

export default function Sheet({ title, children }: SheetProps) {
  return (
    <aside className="fixed inset-x-0 bottom-0 rounded-t-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 pb-[calc(var(--space-6)+var(--safe-bottom))] shadow-[var(--elev-1)] animate-[page-enter_250ms_ease]">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </aside>
  );
}
