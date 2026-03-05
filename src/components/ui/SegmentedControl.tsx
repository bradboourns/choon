import { cn } from '@/lib/cn';

type Item<T extends string> = { key: T; label: string };

export default function SegmentedControl<T extends string>({ value, onChange, items }: { value: T; onChange: (key: T) => void; items: Array<Item<T>> }) {
  return (
    <div className='inline-flex rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-1'>
      {items.map((item) => (
        <button
          key={item.key}
          type='button'
          onClick={() => onChange(item.key)}
          className={cn('rounded-xl px-3 py-1.5 text-sm transition', value === item.key ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
