import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');
  const gigs = db.prepare('SELECT gigs.*, venues.name venue_name FROM gigs JOIN venues ON venues.id=gigs.venue_id WHERE gigs.status IN ("pending","hidden") ORDER BY gigs.created_at DESC').all() as any[];
  const venues = db.prepare('SELECT * FROM venues WHERE approved=0').all() as any[];
  const reports = db.prepare('SELECT * FROM reports WHERE status="open" ORDER BY created_at DESC').all() as any[];
  return <div className='space-y-6'>
    <h1 className='text-3xl font-bold'>Admin moderation</h1>
    <section><h2 className='text-xl'>Pending gigs</h2>{gigs.map(g=><form key={g.id} action='/api/gig-status' method='post' className='my-2 rounded border border-zinc-700 p-3'>
      <input type='hidden' name='gig_id' value={g.id}/><p>{g.artist_name} @ {g.venue_name}</p>
      <button name='status' value='approved' className='mr-2 rounded bg-emerald-700 px-2 py-1'>Approve</button><button name='status' value='hidden' className='rounded bg-zinc-700 px-2 py-1'>Hide</button>
    </form>)}</section>
    <section><h2 className='text-xl'>Unapproved venues</h2>{venues.length===0?<p>All sorted.</p>:venues.map(v=><p key={v.id}>{v.name}</p>)}</section>
    <section><h2 className='text-xl'>Reports</h2>{reports.length===0?<p>No active reports.</p>:reports.map(r=><p key={r.id}>{r.reason}</p>)}</section>
  </div>;
}
