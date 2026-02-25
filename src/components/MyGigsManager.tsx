'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { updateGigAction, updateGigDetailsAction } from '@/app/actions';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

type Gig = {
  id: number;
  artist_name: string;
  venue_name: string;
  date: string;
  start_time: string;
  end_time: string;
  price_type: string;
  ticket_price: number;
  ticket_url: string;
  description: string;
  poster_url: string;
  status: string;
};

export default function MyGigsManager({ gigs, timeFormat, title = 'My gigs', backHref, selectedVenueName }: { gigs: Gig[]; timeFormat: '12h' | '24h'; title?: string; backHref?: string; selectedVenueName?: string }) {
  const [view, setView] = useState<'day' | 'calendar'>('day');
  const [editingGigId, setEditingGigId] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const groups = new Map<string, Gig[]>();
    gigs.forEach((gig) => {
      const key = gig.date;
      const current = groups.get(key) || [];
      current.push(gig);
      groups.set(key, current);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [gigs]);

  return <div className='space-y-3'>
    <div className='flex items-center justify-between'>
      <div>
        {backHref && <Link href={backHref} className='mb-2 inline-flex text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>}
        <h1 className='text-2xl font-bold'>{title}</h1>
        {selectedVenueName && <p className='text-sm text-zinc-400'>Currently selected venue: <span className='font-medium text-zinc-200'>{selectedVenueName}</span></p>}
      </div>
      <div className='rounded border border-zinc-700 p-1 text-sm'>
        <button onClick={() => setView('day')} className={`rounded px-3 py-1 ${view === 'day' ? 'bg-violet-600' : ''}`}>By day</button>
        <button onClick={() => setView('calendar')} className={`rounded px-3 py-1 ${view === 'calendar' ? 'bg-violet-600' : ''}`}>Calendar</button>
      </div>
    </div>

    {view === 'calendar' ? (
      <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
        {gigs.map((g) => (
          <div key={g.id} className='rounded border border-zinc-700 p-2 text-sm'>
            <p className='font-semibold'>{formatDateDDMMYYYY(g.date)}</p>
            <p>{formatTime(g.start_time, timeFormat)} · {g.artist_name}</p>
          </div>
        ))}
      </div>
    ) : (
      grouped.map(([date, dayGigs]) => <section key={date} className='space-y-2'>
        <h2 className='text-lg font-semibold'>{formatDateDDMMYYYY(date)}</h2>
        {dayGigs.map(g =><div key={g.id} className='rounded border border-zinc-700 p-3'>
          <p>{g.artist_name} · {g.venue_name}</p>
          <p className='text-sm text-zinc-300'>Time: {formatTime(g.start_time, timeFormat)}{g.end_time ? ` - ${formatTime(g.end_time, timeFormat)}` : ''}</p>
          <p>Status: {g.status}</p>
          <div className='mt-2 flex gap-2'>
            <form action={updateGigAction}><input type='hidden' name='gig_id' value={g.id}/><button name='status' value='cancelled' className='rounded border px-2 py-1'>Cancel</button></form>
            <form action={updateGigAction}><input type='hidden' name='gig_id' value={g.id}/><button name='status' value='approved' className='rounded border px-2 py-1'>Re-activate</button></form>
            <button onClick={() => setEditingGigId(editingGigId === g.id ? null : g.id)} className='rounded border px-2 py-1'>Edit</button>
          </div>
          {editingGigId === g.id && (
            <form action={updateGigDetailsAction} className='mt-3 grid gap-2 rounded border border-zinc-800 p-3'>
              <input type='hidden' name='gig_id' value={g.id} />
              <input name='artist_name' defaultValue={g.artist_name} required className='rounded bg-zinc-900 p-2' />
              <div className='grid grid-cols-2 gap-2'>
                <input type='date' name='date' defaultValue={g.date} required className='rounded bg-zinc-900 p-2' />
                <input type='time' name='start_time' defaultValue={g.start_time} required className='rounded bg-zinc-900 p-2' />
              </div>
              <input type='time' name='end_time' defaultValue={g.end_time || ''} className='rounded bg-zinc-900 p-2' />
              <select name='price_type' defaultValue={g.price_type} className='rounded bg-zinc-900 p-2'><option>Free</option><option>Door</option><option>Ticketed</option></select>
              <input type='number' min='0' step='0.01' name='ticket_price' defaultValue={g.ticket_price ?? 0} className='rounded bg-zinc-900 p-2' />
              <input name='ticket_url' defaultValue={g.ticket_url || ''} className='rounded bg-zinc-900 p-2' placeholder='Ticket URL' />
              <textarea name='description' defaultValue={g.description || ''} className='rounded bg-zinc-900 p-2' placeholder='Description' />
              <input name='poster_url' defaultValue={g.poster_url || ''} className='rounded bg-zinc-900 p-2' placeholder='Poster image URL' />
              <button className='rounded bg-violet-600 px-3 py-2 text-sm'>Save changes</button>
            </form>
          )}
        </div>)}
      </section>)
    )}
  </div>;
}
