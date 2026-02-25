import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { genres, vibes } from '@/lib/data';
import { redirect } from 'next/navigation';
import { createGigAction, requestVenueAction } from '../actions';

export default async function CreateGig({ searchParams }: { searchParams: Promise<{ error?: string; request?: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'artist' && session.role !== 'venue_admin')) redirect('/login');

  const query = await searchParams;
  const venues = session.role === 'venue_admin'
    ? db.prepare(`SELECT venues.* FROM venues
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id=? AND venue_memberships.approved=1 AND venues.approved=1
      ORDER BY venues.name`).all(session.id) as any[]
    : db.prepare('SELECT * FROM venues WHERE approved=1 ORDER BY name').all() as any[];

  return <div className='space-y-6'>
    <form action={createGigAction} className='space-y-4 rounded-xl border border-zinc-700 p-4'>
      <h1 className='text-2xl font-bold'>Post a gig in under 60 seconds</h1>
      {query.error === 'venue-permission' && <p className='rounded bg-amber-900/50 p-2 text-sm text-amber-200'>You can only post gigs for venues your account has been approved to manage.</p>}
      {venues.length === 0 ? (
        <p className='rounded bg-zinc-900 p-3 text-zinc-300'>No approved venues are linked to your account yet.</p>
      ) : (
        <>
          <select name='venue_id' required className='w-full rounded bg-zinc-900 p-2'>{venues.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.suburb})</option>)}</select>
          <input name='artist_name' required placeholder='Artist/band name' className='w-full rounded bg-zinc-900 p-2'/>
          <div className='grid grid-cols-2 gap-2'><input type='date' name='date' required className='rounded bg-zinc-900 p-2'/><input type='time' name='start_time' required className='rounded bg-zinc-900 p-2'/></div>
          <input type='time' name='end_time' className='w-full rounded bg-zinc-900 p-2' placeholder='End time'/>
          <select name='price_type' required className='w-full rounded bg-zinc-900 p-2'><option>Free</option><option>Door</option><option>Ticketed</option></select>
          <input name='ticket_url' placeholder='Ticket link (optional)' className='w-full rounded bg-zinc-900 p-2'/>
          <textarea name='description' placeholder='Description' className='w-full rounded bg-zinc-900 p-2'/>
          <input name='poster_url' placeholder='Poster image URL (optional)' className='w-full rounded bg-zinc-900 p-2'/>
          <fieldset><legend className='mb-1'>Genres</legend><div className='flex flex-wrap gap-2'>{genres.map((g) => <label key={g} className='rounded bg-zinc-800 px-2 py-1 text-sm'><input type='checkbox' name='genres' value={g} className='mr-1'/>{g}</label>)}</div></fieldset>
          <fieldset><legend className='mb-1'>Vibe tags</legend><div className='flex flex-wrap gap-2'>{vibes.map((v) => <label key={v} className='rounded bg-fuchsia-900/50 px-2 py-1 text-sm'><input type='checkbox' name='vibe_tags' value={v} className='mr-1'/>{v}</label>)}</div></fieldset>
          <button className='rounded bg-violet-600 px-4 py-2'>Publish gig (flagged for admin review)</button>
        </>
      )}
    </form>

    {session.role === 'venue_admin' && (
      <form action={requestVenueAction} className='space-y-3 rounded-xl border border-zinc-700 p-4'>
        <h2 className='text-xl font-semibold'>Request a new venue listing</h2>
        {query.request === 'sent' && <p className='rounded bg-emerald-900/40 p-2 text-sm text-emerald-300'>Request sent to admin for approval.</p>}
        <p className='text-sm text-zinc-400'>Submit a venue you own/manage. Admin can approve or reject, and approved venues appear as separate listings for fans.</p>
        <input name='venue_name' required placeholder='Venue name' className='w-full rounded bg-zinc-900 p-2'/>
        <input name='abn' required placeholder='ABN' className='w-full rounded bg-zinc-900 p-2'/>
        <input name='address' required placeholder='Street address' className='w-full rounded bg-zinc-900 p-2'/>
        <div className='grid grid-cols-2 gap-2'>
          <input name='suburb' required placeholder='Suburb' className='rounded bg-zinc-900 p-2'/>
          <input name='postcode' required placeholder='Postcode' className='rounded bg-zinc-900 p-2'/>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <input name='city' defaultValue='Gold Coast' required placeholder='City' className='rounded bg-zinc-900 p-2'/>
          <input name='state' defaultValue='QLD' required placeholder='State' className='rounded bg-zinc-900 p-2'/>
        </div>
        <input name='website' placeholder='Website (optional)' className='w-full rounded bg-zinc-900 p-2'/>
        <input name='instagram' placeholder='Instagram handle (optional)' className='w-full rounded bg-zinc-900 p-2'/>
        <textarea name='notes' placeholder='Notes for admin (optional)' className='w-full rounded bg-zinc-900 p-2'/>
        <button className='rounded bg-zinc-100 px-4 py-2 text-zinc-900'>Send venue request</button>
      </form>
    )}
  </div>;
}
