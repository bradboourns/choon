import db from '@/lib/db';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

export default async function VenueInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const venue = db.prepare('SELECT * FROM venues WHERE id=?').get(Number(id)) as any;
  if (!venue) return <p>Venue not found.</p>;

  const gigs = db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.artist_id, gigs.date, gigs.start_time, popup_collectives.name popup_collective_name
    FROM gigs
    LEFT JOIN popup_collectives ON popup_collectives.id = gigs.popup_collective_id
    WHERE gigs.venue_id = ? AND gigs.status = 'approved' AND gigs.date >= date('now')
    ORDER BY gigs.date ASC, gigs.start_time ASC LIMIT 10`).all(venue.id) as any[];


  const followsVenue = session
    ? Boolean(db.prepare('SELECT 1 FROM venue_follows WHERE user_id = ? AND venue_id = ?').get(session.id, venue.id))
    : false;

  const stats = db.prepare(`SELECT
      COUNT(*) hosted_gigs,
      SUM(CASE WHEN date >= date('now') THEN 1 ELSE 0 END) upcoming_gigs,
      COUNT(DISTINCT artist_id) unique_artists
    FROM gigs
    WHERE venue_id = ? AND status = 'approved'`).get(venue.id) as { hosted_gigs: number; upcoming_gigs: number; unique_artists: number };

  return <div className='space-y-4'>
    <Link href='/' className='text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>
    <h1 className='text-3xl font-bold'>{venue.name}</h1>
    <p className='text-zinc-300'>{venue.address}, {venue.suburb} {venue.state} {venue.postcode}</p>
    {venue.website && <a href={venue.website} className='text-violet-300 hover:text-violet-200'>Venue website</a>}
    {session && <form action='/api/follow-venue' method='post' className='inline'>
      <input type='hidden' name='venue_id' value={venue.id} />
      <input type='hidden' name='follow' value={followsVenue ? '0' : '1'} />
      <input type='hidden' name='redirect_to' value={`/venues/${venue.id}`} />
      <button className='inline-flex items-center gap-1.5 rounded border border-zinc-600 px-3 py-1.5 text-sm'>
        <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z' /><circle cx='12' cy='10' r='2.5' /></svg>
        {followsVenue ? 'Following venue' : 'Follow venue'}
      </button>
    </form>}

    <section className='grid gap-3 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 sm:grid-cols-3'>
      <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-3'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Gigs hosted</p>
        <p className='text-2xl font-bold'>{stats.hosted_gigs || 0}</p>
      </div>
      <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-3'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Upcoming gigs</p>
        <p className='text-2xl font-bold'>{stats.upcoming_gigs || 0}</p>
      </div>
      <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-3'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Artists hosted</p>
        <p className='text-2xl font-bold'>{stats.unique_artists || 0}</p>
      </div>
    </section>

    <section className='space-y-2 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-lg font-semibold'>Upcoming gigs</h2>
      {gigs.length === 0 ? <p className='text-sm text-zinc-400'>No upcoming gigs available.</p> : gigs.map((gig) => (
        <Link key={gig.id} href={`/gigs/${gig.id}`} className='block rounded border border-zinc-700 bg-zinc-950/70 p-3 text-sm hover:bg-zinc-900'>
          <p className='font-medium'>{gig.artist_name}</p>
          {gig.artist_id && <p className='text-xs text-violet-300'>Artist page: /artists/{gig.artist_id}</p>}
          {gig.popup_collective_name && <p className='text-xs text-emerald-300'>Presented by {gig.popup_collective_name}</p>}
          <p className='text-zinc-400'>{formatDateDDMMYYYY(gig.date)} · {formatTime(gig.start_time, '12h')}</p>
        </Link>
      ))}
    </section>
  </div>;
}
