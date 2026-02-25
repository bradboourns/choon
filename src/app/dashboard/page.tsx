import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const roleLabel: Record<string, string> = {
  admin: 'Platform admin',
  artist: 'Artist',
  venue_admin: 'Venue admin',
  user: 'Music fan',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const managedVenues = session.role === 'venue_admin'
    ? db.prepare(`SELECT venues.id, venues.name, venues.suburb, venues.city, venues.state
      FROM venues
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id = ? AND venue_memberships.approved = 1
      ORDER BY venues.name`).all(session.id) as Array<{ id: number; name: string; suburb: string; city: string; state: string }>
    : [];

  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Dashboard</h1>
      <p className='text-zinc-300'>Welcome back. You are signed in as <span className='font-semibold'>{roleLabel[session.role] || 'Member'}</span>.</p>
      <div className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <p className='text-zinc-200'>This is the starting point for account tools. We&apos;ll continue to expand this with more shortcuts over time.</p>
      </div>

      {session.role === 'venue_admin' && (
        <section className='space-y-3'>
          <h2 className='text-xl font-semibold'>Your venues</h2>
          {managedVenues.length === 0 ? (
            <div className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 text-zinc-300'>
              <p>No venues are currently linked to this account.</p>
              <Link href='/request-venue' className='mt-3 inline-block rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Request a venue</Link>
            </div>
          ) : (
            <div className='grid gap-3'>
              {managedVenues.map((venue) => (
                <article key={venue.id} className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
                  <p className='text-lg font-semibold'>{venue.name}</p>
                  <p className='text-sm text-zinc-400'>{venue.suburb}, {venue.city} {venue.state}</p>
                  <div className='mt-3 flex flex-wrap gap-2 text-sm'>
                    <Link href={`/create-gig?venue_id=${venue.id}`} className='rounded-lg bg-violet-600 px-3 py-2 font-medium text-white hover:bg-violet-500'>Add gig for this venue</Link>
                    <Link href='/create-gig' className='rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800'>Post a gig</Link>
                    <Link href='/my-gigs' className='rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800'>View your gigs</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
