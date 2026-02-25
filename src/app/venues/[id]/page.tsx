import db from '@/lib/db';
import Link from 'next/link';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

export default async function VenueInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = db.prepare('SELECT * FROM venues WHERE id=?').get(Number(id)) as any;
  if (!venue) return <p>Venue not found.</p>;

  const gigs = db.prepare(`SELECT id, artist_name, artist_id, date, start_time
    FROM gigs WHERE venue_id = ? AND status = 'approved' AND date >= date('now')
    ORDER BY date ASC, start_time ASC LIMIT 10`).all(venue.id) as any[];

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
          <p className='text-zinc-400'>{formatDateDDMMYYYY(gig.date)} · {formatTime(gig.start_time, '12h')}</p>
        </Link>
      ))}
    </section>
  </div>;
}
