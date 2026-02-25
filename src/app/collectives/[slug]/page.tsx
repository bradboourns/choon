import Link from 'next/link';
import db from '@/lib/db';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

export default async function CollectivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collective = db.prepare('SELECT id, name, description, website, instagram, base_city, region FROM popup_collectives WHERE slug = ?').get(slug) as
    | { id: number; name: string; description: string; website: string | null; instagram: string | null; base_city: string; region: string }
    | undefined;

  if (!collective) return <p>Collective not found.</p>;

  const gigs = db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.date, gigs.start_time, venues.name venue_name
    FROM gigs
    JOIN venues ON venues.id = gigs.venue_id
    WHERE gigs.popup_collective_id = ? AND gigs.status = 'approved' AND gigs.date >= date('now')
    ORDER BY gigs.date ASC, gigs.start_time ASC LIMIT 10`).all(collective.id) as Array<{ id: number; artist_name: string; date: string; start_time: string; venue_name: string }>;

  return <div className='space-y-4'>
    <Link href='/' className='text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>
    <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h1 className='text-3xl font-bold'>{collective.name}</h1>
      <p className='mt-2 text-zinc-300'>{collective.description || `${collective.name} presents events across ${collective.region}.`}</p>
      <p className='mt-2 text-sm text-zinc-400'>{collective.base_city} · {collective.region}</p>
      <div className='mt-2 flex flex-wrap gap-3 text-sm'>
        {collective.website && <a href={collective.website} className='text-violet-300 hover:text-violet-200'>Website</a>}
        {collective.instagram && <a href={`https://instagram.com/${collective.instagram.replace('@', '')}`} className='text-violet-300 hover:text-violet-200'>Instagram</a>}
      </div>
    </section>

    <section className='space-y-2 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-lg font-semibold'>Upcoming gigs</h2>
      {gigs.length === 0 ? <p className='text-sm text-zinc-400'>No upcoming gigs listed.</p> : gigs.map((gig) => (
        <Link key={gig.id} href={`/gigs/${gig.id}`} className='block rounded border border-zinc-700 bg-zinc-950/70 p-3 text-sm hover:bg-zinc-900'>
          <p className='font-medium'>{gig.artist_name}</p>
          <p className='text-zinc-400'>{gig.venue_name}</p>
          <p className='text-zinc-400'>{formatDateDDMMYYYY(gig.date)} · {formatTime(gig.start_time, '12h')}</p>
        </Link>
      ))}
    </section>
  </div>;
}
