import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const savedFilters = [
  { value: 'all', label: 'All saves' },
  { value: 'gig', label: 'Gigs' },
  { value: 'artist', label: 'Artists' },
  { value: 'venue', label: 'Venues' },
] as const;

type SavedFilterValue = (typeof savedFilters)[number]['value'];

function isValidFilter(value: string): value is SavedFilterValue {
  return savedFilters.some((filter) => filter.value === value);
}

function FilterIcon({ filter }: { filter: SavedFilterValue }) {
  if (filter === 'gig') {
    return <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='M4 8h16M4 16h16M9 8v8M15 8v8' /><rect x='3' y='5' width='18' height='14' rx='2' /></svg>;
  }
  if (filter === 'artist') {
    return <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><circle cx='12' cy='8' r='3' /><path d='M5 20c1.5-3 4-5 7-5s5.5 2 7 5' /></svg>;
  }
  if (filter === 'venue') {
    return <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z' /><circle cx='12' cy='10' r='2.5' /></svg>;
  }
  return <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='M4 12h16M12 4v16' /></svg>;
}

export default async function SavedPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const filterParam = (await searchParams).filter || 'all';
  const filter = isValidFilter(filterParam) ? filterParam : 'all';

  const gigs = db.prepare(`SELECT gigs.*, venues.name venue_name, venues.suburb FROM saved_gigs
    JOIN gigs ON gigs.id = saved_gigs.gig_id
    JOIN venues ON venues.id = gigs.venue_id
    WHERE saved_gigs.user_id = ? ORDER BY gigs.date ASC`).all(session.id) as any[];

  const artists = db.prepare(`SELECT artists.id, artists.display_name, artists.instagram, artist_follows.created_at
    FROM artist_follows
    JOIN artists ON artists.id = artist_follows.artist_id
    WHERE artist_follows.user_id = ?
    ORDER BY artist_follows.created_at DESC`).all(session.id) as Array<{ id: number; display_name: string; instagram: string | null; created_at: string }>;

  const venues = db.prepare(`SELECT venues.id, venues.name, venues.suburb, venues.state, venue_follows.created_at
    FROM venue_follows
    JOIN venues ON venues.id = venue_follows.venue_id
    WHERE venue_follows.user_id = ?
    ORDER BY venue_follows.created_at DESC`).all(session.id) as Array<{ id: number; name: string; suburb: string; state: string; created_at: string }>;

  const showGigs = filter === 'all' || filter === 'gig';
  const showArtists = filter === 'all' || filter === 'artist';
  const showVenues = filter === 'all' || filter === 'venue';

  return <div className='space-y-6'>
    <div className='space-y-3'>
      <h1 className='text-2xl font-bold'>Your saved list</h1>
      <p className='text-sm text-zinc-400'>Track gigs, artists, and venues you want to come back to.</p>
      <div className='flex flex-wrap gap-2'>
        {savedFilters.map((savedFilter) => {
          const active = filter === savedFilter.value;
          return (
            <Link
              key={savedFilter.value}
              href={`/saved?filter=${savedFilter.value}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${active ? 'border-violet-500 bg-violet-600 text-white' : 'border-zinc-700 hover:bg-zinc-900'}`}
            >
              <FilterIcon filter={savedFilter.value} />
              {savedFilter.label}
            </Link>
          );
        })}
      </div>
    </div>

    {showGigs && <section className='space-y-3'>
      <h2 className='text-xl font-semibold'>Saved gigs</h2>
      {gigs.length === 0 ? <p className='text-sm text-zinc-400'>No saved gigs yet.</p> : gigs.map((gig) => (
        <Link key={gig.id} href={`/gigs/${gig.id}`} className='block rounded-xl border border-zinc-700 bg-zinc-900/40 p-3 hover:bg-zinc-900'>
          <p className='font-medium'>{gig.artist_name}</p>
          <p className='text-sm text-zinc-400'>{gig.venue_name} · {gig.suburb} · {gig.date}</p>
        </Link>
      ))}
    </section>}

    {showArtists && <section className='space-y-3'>
      <h2 className='text-xl font-semibold'>Followed artists</h2>
      {artists.length === 0 ? <p className='text-sm text-zinc-400'>No followed artists yet.</p> : artists.map((artist) => (
        <Link key={artist.id} href={`/artists/${artist.id}`} className='block rounded-xl border border-zinc-700 bg-zinc-900/40 p-3 hover:bg-zinc-900'>
          <p className='font-medium'>{artist.display_name}</p>
          {artist.instagram ? <p className='text-sm text-zinc-400'>@{artist.instagram.replace('@', '')}</p> : <p className='text-sm text-zinc-500'>No Instagram listed</p>}
        </Link>
      ))}
    </section>}

    {showVenues && <section className='space-y-3'>
      <h2 className='text-xl font-semibold'>Followed venues</h2>
      {venues.length === 0 ? <p className='text-sm text-zinc-400'>No followed venues yet.</p> : venues.map((venue) => (
        <Link key={venue.id} href={`/venues/${venue.id}`} className='block rounded-xl border border-zinc-700 bg-zinc-900/40 p-3 hover:bg-zinc-900'>
          <p className='font-medium'>{venue.name}</p>
          <p className='text-sm text-zinc-400'>{venue.suburb}, {venue.state}</p>
        </Link>
      ))}
    </section>}
  </div>;
}
