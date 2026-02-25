import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requestVenueAction } from '../actions';
import VenueDetailsFields from '@/components/VenueDetailsFields';
import db from '@/lib/db';
import Link from 'next/link';

export default async function RequestVenuePage({ searchParams }: { searchParams: Promise<{ request?: string; new?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'venue_admin') redirect('/login');

  const query = await searchParams;
  const pendingRequests = db.prepare(`SELECT id, venue_name, suburb, city, state, created_at
    FROM venue_requests
    WHERE requested_by_user_id=? AND status='pending'
    ORDER BY created_at DESC`).all(session.id) as Array<{ id: number; venue_name: string; suburb: string; city: string; state: string; created_at: string }>;
  const showForm = query.new === '1' || pendingRequests.length === 0;

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Request a new venue listing</h1>
      <p className='text-sm text-zinc-400'>
        Submit a venue you own/manage. Admin can approve or reject, and approved venues appear as separate listings for fans.
      </p>

      {pendingRequests.length > 0 && (
        <section className='rounded-xl border border-amber-800/70 bg-amber-950/30 p-4'>
          <h2 className='text-lg font-semibold text-amber-200'>Pending venue requests ({pendingRequests.length})</h2>
          <p className='mt-1 text-sm text-amber-100/80'>These requests are waiting for admin review.</p>
          <div className='mt-3 space-y-2'>
            {pendingRequests.map((request) => (
              <div key={request.id} className='rounded-lg border border-amber-900/70 bg-amber-950/30 p-3 text-sm'>
                <p className='font-medium text-amber-100'>{request.venue_name}</p>
                <p className='text-amber-100/80'>{request.suburb}, {request.city} {request.state}</p>
                <p className='text-xs text-amber-100/60'>Submitted {new Date(request.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
          {!showForm && (
            <div className='mt-4 flex flex-wrap gap-2'>
              <Link href='/request-venue?new=1' className='rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white'>Add another venue</Link>
              <Link href='/dashboard' className='rounded-lg border border-amber-700 px-3 py-2 text-sm text-amber-100 hover:bg-amber-900/30'>Back to dashboard</Link>
            </div>
          )}
        </section>
      )}

      {showForm && (
        <form action={requestVenueAction} className='space-y-3 rounded-xl border border-zinc-700 p-4'>
          {query.request === 'sent' && <p className='rounded bg-emerald-900/40 p-2 text-sm text-emerald-300'>Request sent to admin for approval.</p>}
          <VenueDetailsFields defaultCity="" defaultState="" />
          <button className='rounded bg-zinc-100 px-4 py-2 text-zinc-900'>Send venue request</button>
        </form>
      )}
    </div>
  );
}
