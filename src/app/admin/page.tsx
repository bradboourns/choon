import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  adminDismissGigFlagAction,
  adminRemoveGigAction,
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

  const allVenues = db.prepare(`SELECT venues.id, venues.name, venues.suburb, venues.city, venues.approved, COUNT(gigs.id) gig_count
    FROM venues LEFT JOIN gigs ON gigs.venue_id=venues.id AND gigs.status!='removed'
    GROUP BY venues.id
    ORDER BY venues.name ASC`).all() as any[];

  const allGigs = db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.status, gigs.date, gigs.needs_review, venues.name venue_name, popup_collectives.name popup_collective_name
    FROM gigs
    JOIN venues ON venues.id = gigs.venue_id
    LEFT JOIN popup_collectives ON popup_collectives.id = gigs.popup_collective_id
    WHERE gigs.status != 'removed'
    ORDER BY gigs.date ASC, gigs.start_time ASC
    LIMIT 150`).all() as any[];

  const allAccounts = db.prepare(`SELECT users.id, users.username, users.role, users.email, user_profiles.display_name,
      (SELECT COUNT(*) FROM gigs WHERE gigs.created_by_user_id = users.id AND gigs.status != 'removed') created_gigs,
      (SELECT COUNT(*) FROM saved_gigs WHERE saved_gigs.user_id = users.id) saved_gigs,
      (SELECT COUNT(*) FROM artist_follows WHERE artist_follows.user_id = users.id) artist_follows,
      (SELECT COUNT(*) FROM venue_follows WHERE venue_follows.user_id = users.id) venue_follows
    FROM users
    LEFT JOIN user_profiles ON user_profiles.user_id = users.id
    ORDER BY users.role ASC, users.username ASC`).all() as any[];

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

    <section className='space-y-3'>
      <h2 className='text-xl'>All venues</h2>
      {allVenues.map((v) => <div key={v.id} className='rounded border border-zinc-700 p-3'>
        <p className='font-semibold'>{v.name} · {v.suburb}</p>
        <p className='text-sm text-zinc-400'>{v.city} · {v.gig_count} gigs · {v.approved ? 'Approved' : 'Pending'}</p>
        <Link href={`/admin/venues/${v.id}`} className='mt-2 inline-block text-sm underline'>Moderate venue</Link>
      </div>)}
    </section>

    <section className='space-y-3'>
      <h2 className='text-xl'>All gigs</h2>
      {allGigs.map((gig) => <div key={gig.id} className='rounded border border-zinc-700 p-3'>
        <p className='font-semibold'>{gig.artist_name} @ {gig.venue_name}</p>
        <p className='text-sm text-zinc-400'>{gig.date} · {gig.status}{gig.popup_collective_name ? ` · Pop-up: ${gig.popup_collective_name}` : ''}{gig.needs_review ? ' · Needs review' : ''}</p>
        <div className='mt-2 flex gap-2'>
          <Link href={`/gigs/${gig.id}`} className='rounded border border-zinc-600 px-2 py-1 text-sm'>Open gig page</Link>
          <form action={adminRemoveGigAction}><input type='hidden' name='gig_id' value={gig.id}/><input type='hidden' name='return_to' value='/admin'/><button className='rounded bg-rose-700 px-2 py-1 text-sm'>Remove</button></form>
        </div>
      </div>)}
    </section>

    <section className='space-y-3'>
      <h2 className='text-xl'>All accounts</h2>
      {allAccounts.map((account) => <div key={account.id} className='rounded border border-zinc-700 p-3'>
        <p className='font-semibold'>{account.display_name || account.username} <span className='text-zinc-400'>@{account.username}</span></p>
        <p className='text-sm text-zinc-400'>{account.role} · {account.email}</p>
        <p className='mt-1 text-sm text-zinc-300'>Created gigs: {account.created_gigs} · Saved gigs: {account.saved_gigs} · Artist follows: {account.artist_follows} · Venue follows: {account.venue_follows}</p>
        <Link href={`/profiles/${account.username}`} className='text-sm underline'>Open profile</Link>
      </div>)}
    </section>
  </div>;
}
