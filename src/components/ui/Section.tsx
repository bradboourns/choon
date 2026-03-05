import { ReactNode } from 'react';
import Card from './Card';

export default function Section({ title, kicker, actions, children }: { title: string; kicker?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card variant='elevated' className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          {kicker && <p className='text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)]'>{kicker}</p>}
          <h2 className='text-xl font-semibold'>{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}
