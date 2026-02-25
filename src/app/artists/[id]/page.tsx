import db from '@/lib/db';
import Link from 'next/link';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

export default async function ArtistInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = db.prepare('SELECT * FROM artists WHERE id=?').get(Number(id)) as any;
  if (!artist) return <p>Artist not found.</p>;

  const gigs = db.prepare(`SELECT gigs.id, gigs.date, gigs.start_time, venues.id venue_id, venues.name venue_name
    FROM gigs JOIN venues ON venues.id = gigs.venue_id
    WHERE gigs.artist_id = ? AND gigs.status = 'approved'
    ORDER BY gigs.date ASC, gigs.start_time ASC LIMIT 10`).all(artist.id) as any[];

  const stats = db.prepare(`SELECT
      COUNT(*) total_gigs,
      SUM(CASE WHEN date >= date('now') THEN 1 ELSE 0 END) upcoming_gigs,
      COUNT(DISTINCT venue_id) venues_played
    FROM gigs
    WHERE artist_id = ? AND status = 'approved'`).get(artist.id) as { total_gigs: number; upcoming_gigs: number; venues_played: number };

  const partneredVenues = db.prepare(`SELECT venues.id, venues.name, partnerships.created_at
    FROM partnerships
    JOIN venues ON venues.id = partnerships.venue_id
    WHERE partnerships.artist_id = ? AND partnerships.status = 'accepted'
    ORDER BY venues.name`).all(artist.id) as Array<{ id: number; name: string; created_at: string }>;

  return <div className='space-y-4'>
    <Link href='/' className='text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>
    <h1 className='text-3xl font-bold'>{artist.display_name}</h1>
    {artist.instagram && <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} className='text-violet-300 hover:text-violet-200'>@{artist.instagram.replace('@', '')}</a>}

    <section className='grid gap-3 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 sm:grid-cols-3'>
      <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-3'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Gigs played</p>
        <p className='text-2xl font-bold'>{stats.total_gigs || 0}</p>
      </div>
      <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-3'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Upcoming gigs</p>
        <p className='text-2xl font-bold'>{stats.upcoming_gigs || 0}</p>
      </div>
      <div className='rounded-lg border border-zinc-800 bg-zinc-950/50 p-3'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Venues played</p>
        <p className='text-2xl font-bold'>{stats.venues_played || 0}</p>
      </div>
    </section>

    <section className='space-y-2 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-lg font-semibold'>Partnered venues</h2>
      {partneredVenues.length === 0 ? <p className='text-sm text-zinc-400'>No accepted venue partnerships yet.</p> : partneredVenues.map((venue) => (
        <Link key={venue.id} href={`/venues/${venue.id}`} className='block rounded border border-zinc-700 bg-zinc-950/70 p-3 text-sm hover:bg-zinc-900'>
          <p className='font-medium'>{venue.name}</p>
        </Link>
      ))}
    </section>

    <section className='space-y-2 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-lg font-semibold'>Upcoming gigs</h2>
      {gigs.length === 0 ? <p className='text-sm text-zinc-400'>No upcoming gigs available.</p> : gigs.map((gig) => (
        <Link key={gig.id} href={`/gigs/${gig.id}`} className='block rounded border border-zinc-700 bg-zinc-950/70 p-3 text-sm hover:bg-zinc-900'>
          <p className='font-medium'>{gig.venue_name}</p>
          <p className='text-zinc-400'>{formatDateDDMMYYYY(gig.date)} · {formatTime(gig.start_time, '12h')}</p>
          <p className='text-xs text-violet-300'>View venue: /venues/{gig.venue_id}</p>
        </Link>
      ))}
    </section>
  </div>;
}
