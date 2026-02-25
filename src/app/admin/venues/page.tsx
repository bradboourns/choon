import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminVenuesPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const venues = db.prepare(`SELECT venues.*, COUNT(gigs.id) gig_count
    FROM venues LEFT JOIN gigs ON gigs.venue_id = venues.id AND gigs.status!='removed'
    WHERE venues.approved=1
    GROUP BY venues.id
    ORDER BY venues.name ASC`).all() as any[];

  return <div className='space-y-4'>
    <div className='flex items-center justify-between'>
      <h1 className='text-3xl font-bold'>Venue sub-pages</h1>
      <Link href='/admin' className='text-sm underline'>Back to admin</Link>
    </div>

    {venues.length === 0 ? <p>No approved venues yet.</p> : (
      <div className='grid gap-3'>
        {venues.map((venue) => <div key={venue.id} className='rounded border border-zinc-700 p-3'>
          <p className='font-semibold'>{venue.name}</p>
          <p className='text-sm text-zinc-400'>{venue.address}, {venue.suburb} · {venue.gig_count} active gigs</p>
          <Link href={`/admin/venues/${venue.id}`} className='mt-2 inline-block rounded bg-zinc-100 px-3 py-1.5 text-sm text-zinc-900'>Manage gigs + venue</Link>
        </div>)}
      </div>
    )}
  </div>;
}
