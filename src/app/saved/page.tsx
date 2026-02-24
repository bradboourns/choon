import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SavedPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const gigs = db.prepare(`SELECT gigs.*, venues.name venue_name, venues.suburb FROM saved_gigs
    JOIN gigs ON gigs.id = saved_gigs.gig_id
    JOIN venues ON venues.id = gigs.venue_id
    WHERE saved_gigs.user_id = ? ORDER BY gigs.date ASC`).all(session.id) as any[];
  return <div className='space-y-3'><h1 className='text-2xl font-bold'>Saved gigs</h1>{gigs.length===0?<p>No saved gigs yet.</p>:gigs.map(g=><Link key={g.id} href={`/gigs/${g.id}`} className='block rounded border border-zinc-700 p-3'>{g.artist_name} · {g.venue_name} · {g.date}</Link>)}</div>;
}
