import type { ReactNode } from 'react';

interface TabsProps {
  items: string[];
  active: string;
  renderPanel: ReactNode;
}

export default function Tabs({ items, active, renderPanel }: TabsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => (
          <span key={item} className={`min-h-11 rounded-full px-4 py-2 text-sm ${active === item ? 'bg-[var(--color-accent)]/20 text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}>
            {item}
          </span>
        ))}
      </div>
      <div>{renderPanel}</div>
    </div>
  );
}
