import type { PropsWithChildren } from 'react';

export default function Card({ children }: PropsWithChildren) {
  return <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elev-1)]">{children}</section>;
}
