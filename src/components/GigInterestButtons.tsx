'use client';

import { useState } from 'react';

type InterestStatus = 'interested' | 'going' | 'none';

type Props = {
  gigId: number;
  initialStatus: InterestStatus;
  compact?: boolean;
};

function Icon({ path }: { path: string }) {
  return <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d={path} /></svg>;
}

export default function GigInterestButtons({ gigId, initialStatus, compact = false }: Props) {
  const [status, setStatus] = useState<InterestStatus>(initialStatus);
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(next: InterestStatus) {
    if (isSaving) return;

    const previous = status;
    setStatus(next);
    setIsSaving(true);

    try {
      const data = new FormData();
      data.set('gig_id', String(gigId));
      data.set('status', next);
      const response = await fetch('/api/gig-interest', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) setStatus(previous);
    } catch {
      setStatus(previous);
    } finally {
      setIsSaving(false);
    }
  }

  const baseClass = compact
    ? 'inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5'
    : 'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-medium';

  return (
    <>
      <button
        type='button'
        disabled={isSaving}
        onClick={() => updateStatus(status === 'interested' ? 'none' : 'interested')}
        className={`${baseClass} ${status === 'interested' ? 'border-violet-400 bg-violet-600/40 text-white' : 'border-zinc-600 text-zinc-100 hover:bg-zinc-800'} ${isSaving ? 'opacity-70' : ''}`}
      >
        <Icon path='m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.1L12 17.2 6.4 20l1.1-6.1L3 9.5l6.2-.9L12 3Z' />
        Interested
      </button>
      <button
        type='button'
        disabled={isSaving}
        onClick={() => updateStatus(status === 'going' ? 'none' : 'going')}
        className={`${baseClass} ${status === 'going' ? 'border-emerald-400 bg-emerald-500/30 text-white' : 'border-zinc-600 text-zinc-100 hover:bg-zinc-800'} ${isSaving ? 'opacity-70' : ''}`}
      >
        <Icon path='m5 12 4 4L19 6' />
        Going
      </button>
    </>
  );
}
