import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { genres, vibes } from '@/lib/data';
import { redirect } from 'next/navigation';
import { createGigAction } from '../actions';

export default async function CreateGig({ searchParams }: { searchParams: Promise<{ error?: string; venue_id?: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'artist' && session.role !== 'venue_admin')) redirect('/login');

  const query = await searchParams;
  const preferredVenueId = query.venue_id ? Number(query.venue_id) : undefined;
  const venues = session.role === 'venue_admin'
    ? db.prepare(`SELECT venues.* FROM venues
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id=? AND venue_memberships.approved=1 AND venues.approved=1
      ORDER BY venues.name`).all(session.id) as any[]
    : db.prepare('SELECT * FROM venues WHERE approved=1 ORDER BY name').all() as any[];

  return <div className='space-y-6'>
    <form action={createGigAction} className='space-y-4 rounded-xl border border-zinc-700 p-4'>
      <h1 className='text-2xl font-bold'>Post a gig</h1>
      <p className='text-sm text-zinc-400'>Share complete event details so fans can discover and attend your gig.</p>
      {query.error === 'venue-permission' && <p className='rounded bg-amber-900/50 p-2 text-sm text-amber-200'>You can only post gigs for venues your account has been approved to manage.</p>}
      {venues.length === 0 ? (
        <p className='rounded bg-zinc-900 p-3 text-zinc-300'>No approved venues are linked to your account yet.</p>
      ) : (
        <>
          <p className='text-sm text-zinc-400'>Venue / Location</p>
          <select name='venue_id' required defaultValue={preferredVenueId && venues.some((v) => v.id === preferredVenueId) ? String(preferredVenueId) : undefined} className='w-full rounded bg-zinc-900 p-2'>{venues.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.suburb})</option>)}</select>
          <input name='artist_name' required placeholder='Artist/band name' className='w-full rounded bg-zinc-900 p-2'/>
          <div className='grid grid-cols-2 gap-2'><input type='date' name='date' required className='rounded bg-zinc-900 p-2'/><input type='time' name='start_time' required className='rounded bg-zinc-900 p-2'/></div>
          <input type='time' name='end_time' className='w-full rounded bg-zinc-900 p-2' placeholder='End time'/>
          <select name='price_type' required className='w-full rounded bg-zinc-900 p-2'><option>Free</option><option>Door</option><option>Ticketed</option></select>
          <input type='number' min='0' step='0.01' name='ticket_price' required placeholder='Ticket price (0 for free)' className='w-full rounded bg-zinc-900 p-2'/>
          <input name='ticket_url' placeholder='Ticket link (optional)' className='w-full rounded bg-zinc-900 p-2'/>
          <textarea name='description' required placeholder='Description' className='w-full rounded bg-zinc-900 p-2'/>
          <input name='poster_url' required placeholder='Poster image URL' className='w-full rounded bg-zinc-900 p-2'/>
          <fieldset><legend className='mb-1'>Genres</legend><div className='flex flex-wrap gap-2'>{genres.map((g) => <label key={g} className='rounded bg-zinc-800 px-2 py-1 text-sm'><input type='checkbox' name='genres' value={g} className='mr-1'/>{g}</label>)}</div></fieldset>
          <fieldset><legend className='mb-1'>Vibe tags</legend><div className='flex flex-wrap gap-2'>{vibes.map((v) => <label key={v} className='rounded bg-fuchsia-900/50 px-2 py-1 text-sm'><input type='checkbox' name='vibe_tags' value={v} className='mr-1'/>{v}</label>)}</div></fieldset>
          <button className='rounded bg-violet-600 px-4 py-2'>Publish gig (flagged for admin review)</button>
        </>
      )}
    </form>
  </div>;
}
