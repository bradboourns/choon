import { ReactNode } from 'react';
import Card from './Card';

export default function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Card variant='muted' className='space-y-3 text-center'>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <p className='text-sm text-[var(--text-secondary)]'>{description}</p>
      {action && <div className='pt-1'>{action}</div>}
    </Card>
  );
}
