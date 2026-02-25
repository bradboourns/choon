import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { adminRemoveGigAction, adminRemoveVenueAction, adminUpdateGigStatusAction } from '@/app/actions';

export default async function AdminVenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const routeParams = await params;
  const venueId = Number(routeParams.id);

  const venue = db.prepare('SELECT * FROM venues WHERE id=?').get(venueId) as any;
  if (!venue) redirect('/admin/venues');

  const gigs = db.prepare(`SELECT * FROM gigs WHERE venue_id=? ORDER BY date DESC, start_time DESC`).all(venueId) as any[];

  return <div className='space-y-5'>
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold'>{venue.name}</h1>
        <p className='text-sm text-zinc-400'>{venue.address}, {venue.suburb} {venue.postcode}</p>
      </div>
      <Link href='/admin/venues' className='text-sm underline'>Back to venues</Link>
    </div>

    <section className='rounded border border-rose-700/60 bg-rose-950/20 p-3'>
      <h2 className='text-lg font-semibold'>Venue-level moderation</h2>
      <p className='text-sm text-zinc-300'>Remove the full venue and every gig under it.</p>
      <form action={adminRemoveVenueAction} className='mt-2'>
        <input type='hidden' name='venue_id' value={venueId} />
        <button className='rounded bg-rose-700 px-3 py-1.5 text-sm'>Remove entire venue + all gigs</button>
      </form>
    </section>

    <section>
      <h2 className='text-xl font-semibold'>Gig listings ({gigs.length})</h2>
      {gigs.length === 0 ? <p className='mt-2'>No gigs yet.</p> : (
        <div className='mt-2 space-y-3'>
          {gigs.map((gig) => <div key={gig.id} className='rounded border border-zinc-700 p-3'>
            <p className='font-semibold'>{gig.artist_name}</p>
            <p className='text-sm text-zinc-400'>{gig.date} · {gig.start_time} · Status: {gig.status}</p>
            {gig.admin_note ? <p className='mt-1 text-sm text-amber-300'>Admin note: {gig.admin_note}</p> : null}

            <div className='mt-2 flex flex-wrap gap-2'>
              <form action={adminUpdateGigStatusAction}>
                <input type='hidden' name='gig_id' value={gig.id} />
                <input type='hidden' name='status' value='on_hold' />
                <input type='hidden' name='return_to' value={`/admin/venues/${venueId}`} />
                <button className='rounded bg-amber-700 px-2 py-1 text-sm'>Place on hold</button>
              </form>

              <form action={adminRemoveGigAction}>
                <input type='hidden' name='gig_id' value={gig.id} />
                <input type='hidden' name='return_to' value={`/admin/venues/${venueId}`} />
                <button className='rounded bg-rose-700 px-2 py-1 text-sm'>Remove listing</button>
              </form>
            </div>

            <form action={adminUpdateGigStatusAction} className='mt-3 space-y-2 rounded border border-zinc-800 p-2'>
              <input type='hidden' name='gig_id' value={gig.id} />
              <input type='hidden' name='status' value='info_requested' />
              <input type='hidden' name='return_to' value={`/admin/venues/${venueId}`} />
              <label className='text-xs uppercase text-zinc-400'>Request info from venue before posting</label>
              <textarea name='admin_note' required placeholder='What details are missing?' className='w-full rounded bg-zinc-900 p-2 text-sm' />
              <button className='rounded bg-zinc-100 px-2 py-1 text-sm text-zinc-900'>Send info request + hold post</button>
            </form>
          </div>)}
        </div>
      )}
    </section>
  </div>;
}
