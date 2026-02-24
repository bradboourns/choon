import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { updateGigAction } from '../actions';

export default async function MyGigs() {
  const session = await getSession();
  if (!session) redirect('/login');
  const gigs = db.prepare('SELECT gigs.*, venues.name venue_name FROM gigs JOIN venues ON venues.id=gigs.venue_id WHERE created_by_user_id=? ORDER BY date DESC').all(session.id) as any[];
  return <div className='space-y-3'><h1 className='text-2xl font-bold'>My gigs</h1>{gigs.map(g=><div key={g.id} className='rounded border border-zinc-700 p-3'>
    <p>{g.artist_name} · {g.venue_name} · {g.date}</p><p>Status: {g.status}</p>
    <form action={updateGigAction} className='mt-2 flex gap-2'><input type='hidden' name='gig_id' value={g.id}/><button name='status' value='cancelled' className='rounded border px-2 py-1'>Cancel</button><button name='status' value='pending' className='rounded border px-2 py-1'>Resubmit</button></form>
  </div>)}</div>;
}
