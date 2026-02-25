import db from '@/lib/db';
import Link from 'next/link';

export default async function ArtistInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = db.prepare('SELECT * FROM artists WHERE id=?').get(Number(id)) as any;
  if (!artist) return <p>Artist not found.</p>;

  const gigs = db.prepare(`SELECT gigs.id, gigs.date, gigs.start_time, venues.id venue_id, venues.name venue_name
    FROM gigs JOIN venues ON venues.id = gigs.venue_id
    WHERE gigs.artist_id = ? AND gigs.status = 'approved'
    ORDER BY gigs.date ASC, gigs.start_time ASC LIMIT 10`).all(artist.id) as any[];

  return <div className='space-y-4'>
    <Link href='/' className='text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>
    <h1 className='text-3xl font-bold'>{artist.display_name}</h1>
    {artist.instagram && <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} className='text-violet-300 hover:text-violet-200'>@{artist.instagram.replace('@', '')}</a>}
    <section className='space-y-2 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-lg font-semibold'>Upcoming gigs</h2>
      {gigs.length === 0 ? <p className='text-sm text-zinc-400'>No upcoming gigs available.</p> : gigs.map((gig) => (
        <Link key={gig.id} href={`/gigs/${gig.id}`} className='block rounded border border-zinc-700 bg-zinc-950/70 p-3 text-sm hover:bg-zinc-900'>
          <p className='font-medium'>{gig.venue_name}</p>
          <p className='text-zinc-400'>{gig.date} · {gig.start_time}</p>
          <p className='text-xs text-violet-300'>View venue: /venues/{gig.venue_id}</p>
        </Link>
      ))}
    </section>
  </div>;
}
