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

type ManagedVenue = { id: number; name: string; suburb: string; city: string; state: string };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const managedVenues = session.role === 'venue_admin'
    ? db.prepare(`SELECT venues.id, venues.name, venues.suburb, venues.city, venues.state
      FROM venues
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id = ? AND venue_memberships.approved = 1
      ORDER BY venues.name`).all(session.id) as ManagedVenue[]
    : [];

  const pendingVenueRequests = session.role === 'venue_admin'
    ? db.prepare(`SELECT id, venue_name, suburb, city, state, status, created_at
      FROM venue_requests
      WHERE requested_by_user_id = ? AND status = 'pending'
      ORDER BY created_at DESC`).all(session.id) as Array<{ id: number; venue_name: string; suburb: string; city: string; state: string; status: string; created_at: string }>
    : [];

  const adminPendingVenueRequests = session.role === 'admin'
    ? db.prepare("SELECT COUNT(*) count FROM venue_requests WHERE status='pending'").get() as { count: number }
    : { count: 0 };
  const adminPendingGigIssues = session.role === 'admin'
    ? db.prepare("SELECT COUNT(*) count FROM gigs WHERE needs_review=1 AND status!='removed'").get() as { count: number }
    : { count: 0 };
  const adminOpenReports = session.role === 'admin'
    ? db.prepare("SELECT COUNT(*) count FROM reports WHERE status='open'").get() as { count: number }
    : { count: 0 };

  const singleVenue = managedVenues.length === 1 ? managedVenues[0] : null;

  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Dashboard</h1>
      <p className='text-zinc-300'>Welcome back. You are signed in as <span className='font-semibold'>{roleLabel[session.role] || 'Member'}</span>.</p>

      {session.role === 'admin' && (
        <section className='space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
          <h2 className='text-xl font-semibold'>Admin moderation queue</h2>
          <div className='grid gap-3 sm:grid-cols-3'>
            <Link href='/admin' className='rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 hover:bg-zinc-900'>
              <p className='text-sm uppercase tracking-wide text-zinc-400'>Pending venues</p>
              <p className='mt-1 text-2xl font-bold'>{adminPendingVenueRequests.count}</p>
            </Link>
            <Link href='/admin' className='rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 hover:bg-zinc-900'>
              <p className='text-sm uppercase tracking-wide text-zinc-400'>Gig issues</p>
              <p className='mt-1 text-2xl font-bold'>{adminPendingGigIssues.count}</p>
            </Link>
            <Link href='/admin' className='rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 hover:bg-zinc-900'>
              <p className='text-sm uppercase tracking-wide text-zinc-400'>Open reports</p>
              <p className='mt-1 text-2xl font-bold'>{adminOpenReports.count}</p>
            </Link>
          </div>
        </section>
      )}

      {session.role === 'venue_admin' && (
        <section className='space-y-3'>
          <h2 className='text-xl font-semibold'>{managedVenues.length > 1 ? 'Your venues' : 'Your venue'}</h2>

          {managedVenues.length === 0 ? (
            <div className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 text-zinc-300'>
              <p>No approved venues are currently linked to this account.</p>
              <Link href='/request-venue' className='mt-3 inline-block rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Request a venue</Link>
            </div>
          ) : singleVenue ? (
            <article className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
              <p className='text-lg font-semibold'>{singleVenue.name}</p>
              <p className='text-sm text-zinc-400'>{singleVenue.suburb}, {singleVenue.city} {singleVenue.state}</p>
              <div className='mt-3 flex flex-wrap gap-2 text-sm'>
                <Link href={`/create-gig?venue_id=${singleVenue.id}`} className='rounded-lg bg-violet-600 px-3 py-2 font-medium text-white hover:bg-violet-500'>Add gig for this venue</Link>
                <Link href='/my-gigs' className='rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800'>View your gigs</Link>
              </div>
            </article>
          ) : (
            <div className='grid gap-3'>
              {managedVenues.map((venue) => (
                <article key={venue.id} className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
                  <p className='text-lg font-semibold'>{venue.name}</p>
                  <p className='text-sm text-zinc-400'>{venue.suburb}, {venue.city} {venue.state}</p>
                  <div className='mt-3 flex flex-wrap gap-2 text-sm'>
                    <Link href={`/create-gig?venue_id=${venue.id}`} className='rounded-lg bg-violet-600 px-3 py-2 font-medium text-white hover:bg-violet-500'>Add gig for this venue</Link>
                    <Link href='/my-gigs' className='rounded-lg border border-zinc-600 px-3 py-2 hover:bg-zinc-800'>View your gigs</Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pendingVenueRequests.length > 0 && (
            <div className='rounded-2xl border border-amber-700/70 bg-amber-900/20 p-4'>
              <h3 className='text-lg font-semibold text-amber-100'>Pending venue approvals</h3>
              <p className='mt-1 text-sm text-amber-200'>These requests are submitted and waiting for admin approval.</p>
              <ul className='mt-3 space-y-2'>
                {pendingVenueRequests.map((request) => (
                  <li key={request.id} className='rounded-lg border border-amber-800/80 bg-zinc-950/50 p-3'>
                    <p className='font-medium text-zinc-100'>{request.venue_name}</p>
                    <p className='text-sm text-zinc-300'>{request.suburb}, {request.city} {request.state}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {(session.role === 'artist' || session.role === 'user') && (
        <div className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
          <p className='text-zinc-200'>This is the starting point for account tools. We&apos;ll continue to expand this with more shortcuts over time.</p>
        </div>
      )}
    </div>
  );
}
