import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import {
  adminDismissGigFlagAction,
  adminRemoveGigAction,
  adminRemoveVenueAction,
  adminReviewVenueRequestAction,
} from '../actions';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const flaggedGigs = db.prepare(`SELECT gigs.*, venues.name venue_name
    FROM gigs JOIN venues ON venues.id=gigs.venue_id
    WHERE gigs.needs_review=1 AND gigs.status!='removed'
    ORDER BY gigs.created_at DESC`).all() as any[];
  const venueRequests = db.prepare("SELECT venue_requests.*, users.username requester_username FROM venue_requests JOIN users ON users.id=venue_requests.requested_by_user_id WHERE venue_requests.status='pending' ORDER BY venue_requests.created_at DESC").all() as any[];
  const venues = db.prepare('SELECT * FROM venues WHERE approved=1 ORDER BY created_at DESC').all() as any[];
  const reports = db.prepare("SELECT * FROM reports WHERE status='open' ORDER BY created_at DESC").all() as any[];

  return <div className='space-y-6'>
    <h1 className='text-3xl font-bold'>Admin moderation</h1>

    <section>
      <h2 className='text-xl'>Flagged gigs (auto-published)</h2>
      {flaggedGigs.length === 0 ? <p>No flagged gigs.</p> : flaggedGigs.map((g) => <div key={g.id} className='my-2 rounded border border-zinc-700 p-3'>
        <p className='font-semibold'>{g.artist_name} @ {g.venue_name}</p>
        <p className='text-sm text-zinc-400'>Date: {g.date} · Status: {g.status}</p>
        <div className='mt-2 flex gap-2'>
          <form action={adminDismissGigFlagAction}><input type='hidden' name='gig_id' value={g.id}/><button className='rounded bg-emerald-700 px-2 py-1'>Mark reviewed</button></form>
          <form action={adminRemoveGigAction}><input type='hidden' name='gig_id' value={g.id}/><button className='rounded bg-rose-700 px-2 py-1'>Remove gig</button></form>
        </div>
      </div>)}
    </section>

    <section>
      <h2 className='text-xl'>Pending venue requests</h2>
      {venueRequests.length===0 ? <p>All sorted.</p> : venueRequests.map((v) => <div key={v.id} className='my-2 rounded border border-zinc-700 p-3'>
        <p className='font-semibold'>{v.venue_name} ({v.suburb})</p>
        <p className='text-sm text-zinc-400'>Requested by {v.requester_username} · ABN: {v.abn}</p>
        <p className='text-sm text-zinc-400'>{v.address}, {v.suburb} {v.postcode}, {v.state}</p>
        {v.notes && <p className='mt-1 text-sm'>{v.notes}</p>}
        <div className='mt-2 flex gap-2'>
          <form action={adminReviewVenueRequestAction}><input type='hidden' name='request_id' value={v.id}/><button name='decision' value='approve' className='rounded bg-emerald-700 px-2 py-1'>Approve</button></form>
          <form action={adminReviewVenueRequestAction}><input type='hidden' name='request_id' value={v.id}/><button name='decision' value='reject' className='rounded bg-zinc-700 px-2 py-1'>Reject</button></form>
        </div>
      </div>)}
    </section>

    <section>
      <h2 className='text-xl'>Approved venues</h2>
      {venues.length===0 ? <p>No active venues.</p> : venues.map((v) => <div key={v.id} className='my-2 rounded border border-zinc-700 p-3'>
        <p>{v.name} · {v.suburb}</p>
        <form action={adminRemoveVenueAction} className='mt-2'><input type='hidden' name='venue_id' value={v.id}/><button className='rounded bg-rose-700 px-2 py-1'>Remove venue + gigs</button></form>
      </div>)}
    </section>

    <section><h2 className='text-xl'>Reports</h2>{reports.length===0?<p>No active reports.</p>:reports.map((r)=><p key={r.id}>{r.reason}</p>)}</section>
  </div>;
}
