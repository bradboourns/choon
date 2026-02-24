import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { genres, vibes } from '@/lib/data';
import { redirect } from 'next/navigation';
import { createGigAction } from '../actions';

export default async function CreateGig() {
  const session = await getSession();
  if (!session) redirect('/login');
  const venues = db.prepare('SELECT * FROM venues WHERE approved=1 ORDER BY name').all() as any[];
  return <form action={createGigAction} className='space-y-4 rounded-xl border border-zinc-700 p-4'>
    <h1 className='text-2xl font-bold'>Post a gig in under 60 seconds</h1>
    <select name='venue_id' required className='w-full rounded bg-zinc-900 p-2'>{venues.map(v=><option key={v.id} value={v.id}>{v.name} ({v.suburb})</option>)}</select>
    <input name='artist_name' required placeholder='Artist/band name' className='w-full rounded bg-zinc-900 p-2'/>
    <div className='grid grid-cols-2 gap-2'><input type='date' name='date' required className='rounded bg-zinc-900 p-2'/><input type='time' name='start_time' required className='rounded bg-zinc-900 p-2'/></div>
    <input type='time' name='end_time' className='w-full rounded bg-zinc-900 p-2' placeholder='End time'/>
    <select name='price_type' required className='w-full rounded bg-zinc-900 p-2'><option>Free</option><option>Door</option><option>Ticketed</option></select>
    <input name='ticket_url' placeholder='Ticket link (optional)' className='w-full rounded bg-zinc-900 p-2'/>
    <textarea name='description' placeholder='Description' className='w-full rounded bg-zinc-900 p-2'/>
    <input name='poster_url' placeholder='Poster image URL (optional)' className='w-full rounded bg-zinc-900 p-2'/>
    <fieldset><legend className='mb-1'>Genres</legend><div className='flex flex-wrap gap-2'>{genres.map(g=><label key={g} className='rounded bg-zinc-800 px-2 py-1 text-sm'><input type='checkbox' name='genres' value={g} className='mr-1'/>{g}</label>)}</div></fieldset>
    <fieldset><legend className='mb-1'>Vibe tags</legend><div className='flex flex-wrap gap-2'>{vibes.map(v=><label key={v} className='rounded bg-fuchsia-900/50 px-2 py-1 text-sm'><input type='checkbox' name='vibe_tags' value={v} className='mr-1'/>{v}</label>)}</div></fieldset>
    <button className='rounded bg-violet-600 px-4 py-2'>Submit for approval</button>
  </form>;
}
