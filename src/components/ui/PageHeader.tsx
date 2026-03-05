import { ReactNode } from 'react';

export default function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className='flex flex-wrap items-start justify-between gap-4'>
      <div className='space-y-1'>
        <p className='text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]'>Choon</p>
        <h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>{title}</h1>
        {description && <p className='max-w-2xl text-sm text-[var(--text-secondary)] md:text-base'>{description}</p>}
      </div>
      {actions && <div className='flex flex-wrap gap-2'>{actions}</div>}
    </div>
  );
}
