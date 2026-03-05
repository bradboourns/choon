import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';
import { requestPartnershipAction, respondPartnershipAction } from '@/app/actions';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import Select from '@/components/ui/Select';
import StatCard from '@/components/ui/StatCard';
import Textarea from '@/components/ui/Textarea';

const roleLabel: Record<string, string> = {
  admin: 'Platform admin',
  artist: 'Artist',
  venue_admin: 'Venue management account',
  user: 'Music fan',
};

type ManagedVenue = { id: number; name: string; suburb: string; city: string; state: string; posted_count: number; pending_count: number };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const managedVenues = session.role === 'venue_admin'
    ? db.prepare(`SELECT venues.id, venues.name, venues.suburb, venues.city, venues.state,
        SUM(CASE WHEN gigs.id IS NOT NULL THEN 1 ELSE 0 END) posted_count,
        SUM(CASE WHEN gigs.status IN ('pending', 'pending_venue_approval') THEN 1 ELSE 0 END) pending_count
      FROM venues
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      LEFT JOIN gigs ON gigs.venue_id = venues.id
      WHERE venue_memberships.user_id = ? AND venue_memberships.approved = 1
      GROUP BY venues.id, venues.name, venues.suburb, venues.city, venues.state
      ORDER BY venues.name`).all(session.id) as ManagedVenue[]
    : [];

  const pendingVenueRequests = session.role === 'venue_admin'
    ? db.prepare(`SELECT id, venue_name, suburb, city, state, status, created_at
      FROM venue_requests
      WHERE requested_by_user_id = ? AND status = 'pending'
      ORDER BY created_at DESC`).all(session.id) as Array<{ id: number; venue_name: string; suburb: string; city: string; state: string; status: string; created_at: string }>
    : [];

  const adminPendingVenueRequests = session.role === 'admin' ? db.prepare("SELECT COUNT(*) count FROM venue_requests WHERE status='pending'").get() as { count: number } : { count: 0 };
  const adminPendingGigIssues = session.role === 'admin' ? db.prepare("SELECT COUNT(*) count FROM gigs WHERE needs_review=1 AND status!='removed'").get() as { count: number } : { count: 0 };
  const adminOpenReports = session.role === 'admin' ? db.prepare("SELECT COUNT(*) count FROM reports WHERE status='open'").get() as { count: number } : { count: 0 };

  const singleVenue = managedVenues.length === 1 ? managedVenues[0] : null;
  const singleVenueUpcoming = singleVenue
    ? db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.date, gigs.start_time, gigs.status, gigs.artist_id
      FROM gigs WHERE venue_id = ? AND date >= date('now') AND status != 'removed'
      ORDER BY date ASC, start_time ASC LIMIT 6`).all(singleVenue.id) as Array<{ id: number; artist_name: string; date: string; start_time: string; status: string; artist_id: number | null }>
    : [];

  const artistProfile = session.role === 'artist' ? db.prepare('SELECT id, display_name FROM artists WHERE created_by_user_id=? LIMIT 1').get(session.id) as { id: number; display_name: string } | undefined : undefined;

  const acceptedPartnerships = session.role === 'venue_admin'
    ? db.prepare(`SELECT partnerships.id, venues.id venue_id, venues.name venue_name, artists.id artist_id, artists.display_name artist_name, partnerships.status
      FROM partnerships
      JOIN venues ON venues.id = partnerships.venue_id
      JOIN artists ON artists.id = partnerships.artist_id
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id=? AND venue_memberships.approved=1 AND partnerships.status='accepted'
      ORDER BY venues.name, artists.display_name`).all(session.id) as any[]
    : artistProfile
      ? db.prepare(`SELECT partnerships.id, venues.id venue_id, venues.name venue_name, artists.id artist_id, artists.display_name artist_name, partnerships.status
        FROM partnerships
        JOIN venues ON venues.id = partnerships.venue_id
        JOIN artists ON artists.id = partnerships.artist_id
        WHERE artists.id=? AND partnerships.status='accepted'
        ORDER BY venues.name`).all(artistProfile.id) as any[]
      : [];

  const pendingPartnerships = session.role === 'venue_admin'
    ? db.prepare(`SELECT partnerships.id, venues.id venue_id, venues.name venue_name, artists.id artist_id, artists.display_name artist_name, partnerships.requested_by_role
      FROM partnerships
      JOIN venues ON venues.id = partnerships.venue_id
      JOIN artists ON artists.id = partnerships.artist_id
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id=? AND venue_memberships.approved=1 AND partnerships.status='pending'
      ORDER BY partnerships.created_at DESC`).all(session.id) as any[]
    : artistProfile
      ? db.prepare(`SELECT partnerships.id, venues.id venue_id, venues.name venue_name, artists.id artist_id, artists.display_name artist_name, partnerships.requested_by_role
        FROM partnerships
        JOIN venues ON venues.id = partnerships.venue_id
        JOIN artists ON artists.id = partnerships.artist_id
        WHERE artists.id=? AND partnerships.status='pending'
        ORDER BY partnerships.created_at DESC`).all(artistProfile.id) as any[]
      : [];

  const artists = session.role === 'venue_admin'
    ? db.prepare(`SELECT MIN(artists.id) id, artists.display_name
      FROM artists
      JOIN users ON users.id = artists.created_by_user_id
      WHERE users.role = 'artist'
      GROUP BY LOWER(TRIM(artists.display_name))
      ORDER BY artists.display_name ASC`).all() as Array<{ id: number; display_name: string }>
    : [];

  const fanStats = session.role === 'user'
    ? db.prepare(`SELECT
        (SELECT COUNT(*) FROM saved_gigs WHERE user_id = ?) AS saved_pages,
        (SELECT COUNT(*) FROM artist_follows WHERE user_id = ?) AS artists_followed,
        (SELECT COUNT(*) FROM gig_interest WHERE user_id = ? AND status = 'going') AS going_count,
        (SELECT COUNT(*) FROM gig_interest WHERE user_id = ? AND status = 'interested') AS interested_count
      `).get(session.id, session.id, session.id, session.id) as { saved_pages: number; artists_followed: number; going_count: number; interested_count: number }
    : null;

  const fanUpcoming = session.role === 'user'
    ? db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.date, gigs.start_time, venues.name venue_name
      FROM gig_interest
      JOIN gigs ON gigs.id = gig_interest.gig_id
      JOIN venues ON venues.id = gigs.venue_id
      WHERE gig_interest.user_id = ? AND gig_interest.status = 'going' AND gigs.status = 'approved' AND gigs.date >= date('now')
      ORDER BY gigs.date ASC, gigs.start_time ASC
      LIMIT 5
    `).all(session.id) as Array<{ id: number; artist_name: string; date: string; start_time: string; venue_name: string }>
    : [];

  return (
    <div className='space-y-5'>
      <PageHeader title='Dashboard' description={`Welcome back. You are signed in as ${roleLabel[session.role] || 'Member'}.`} />

      {session.role === 'admin' && <Section title='Admin moderation queue' kicker='Operations'>
        <div className='grid gap-3 sm:grid-cols-3'>
          <Link href='/admin'><StatCard label='Pending venues' value={adminPendingVenueRequests.count} /></Link>
          <Link href='/admin'><StatCard label='Gig issues' value={adminPendingGigIssues.count} /></Link>
          <Link href='/admin'><StatCard label='Open reports' value={adminOpenReports.count} /></Link>
        </div>
      </Section>}

      {session.role === 'venue_admin' && <Section title={managedVenues.length > 1 ? 'Your venues' : 'Your venue'} kicker='Venue admin'>
        {managedVenues.length === 0 ? <EmptyState title='No linked venues yet' description='No approved venues are currently linked to this account.' action={<Link href='/request-venue'><Button variant='outline'>Request a venue</Button></Link>} /> : singleVenue ? (
          <Card variant='muted' className='space-y-4 rounded-2xl'>
            <div>
              <p className='text-lg font-semibold'>{singleVenue.name}</p>
              <p className='text-sm text-[var(--text-secondary)]'>{singleVenue.suburb}, {singleVenue.city} {singleVenue.state}</p>
              <Link href={`/venues/${singleVenue.id}`} className='text-sm text-violet-300 hover:text-violet-200'>View venue information page</Link>
            </div>
            <div className='flex flex-wrap gap-2 text-sm'>
              <Link href={`/create-gig?venue_id=${singleVenue.id}`}><Button variant='primary'>Add gig for this venue</Button></Link>
              <Link href={`/my-gigs?venue_id=${singleVenue.id}&back_to=/dashboard`}><Button variant='outline'>{singleVenue.name} gigs</Button></Link>
            </div>
            <div className='space-y-2'>
              <h3 className='font-semibold'>Upcoming gigs for this venue</h3>
              {singleVenueUpcoming.length === 0 ? <p className='text-sm text-[var(--text-secondary)]'>No upcoming gigs yet.</p> : singleVenueUpcoming.map((gig) => (
                <Link key={gig.id} href={`/gigs/${gig.id}`} className='block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 text-sm hover:bg-[var(--surface-muted)]'>
                  <p className='font-medium'>{gig.artist_name}</p>
                  <p className='text-[var(--text-secondary)]'>{formatDateDDMMYYYY(gig.date)} · {formatTime(gig.start_time, '12h')}</p>
                  <p className='text-[var(--text-muted)]'>Status: {gig.status}</p>
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <div className='grid gap-3'>
            {managedVenues.map((venue) => (
              <Card key={venue.id} variant='muted' className='space-y-3 rounded-2xl'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-lg font-semibold'>{venue.name}</p>
                    <p className='text-sm text-[var(--text-secondary)]'>{venue.suburb}, {venue.city} {venue.state}</p>
                    <Link href={`/venues/${venue.id}`} className='text-sm text-violet-300 hover:text-violet-200'>Venue information page</Link>
                  </div>
                  <div className='text-right text-xs text-[var(--text-tertiary)]'><p>{venue.posted_count} gigs posted</p><p>{venue.pending_count} pending</p></div>
                </div>
                <div className='flex flex-wrap gap-2 text-sm'>
                  <Link href={`/create-gig?venue_id=${venue.id}`}><Button variant='primary'>Add gig for this venue</Button></Link>
                  <Link href={`/my-gigs?venue_id=${venue.id}&back_to=/dashboard`}><Button variant='outline'>Open {venue.name} gigs</Button></Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {pendingVenueRequests.length > 0 && <Card variant='muted' className='border-amber-700/70 bg-amber-900/20'>
          <h3 className='text-lg font-semibold text-amber-100'>Pending venue approvals</h3>
          <p className='mt-1 text-sm text-amber-200'>These requests are submitted and waiting for admin approval.</p>
          <ul className='mt-3 space-y-2'>
            {pendingVenueRequests.map((request) => (
              <li key={request.id} className='rounded-xl border border-amber-800/80 bg-zinc-950/50 p-3'>
                <p className='font-medium text-zinc-100'>{request.venue_name}</p>
                <p className='text-sm text-zinc-300'>{request.suburb}, {request.city} {request.state}</p>
              </li>
            ))}
          </ul>
        </Card>}
      </Section>}

      {(session.role === 'venue_admin' || session.role === 'artist') && <Section title='Artist & venue partnerships' kicker='Collaborations'>
        {session.role === 'venue_admin' && <form action={requestPartnershipAction} className='space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4'>
          <div className='grid gap-2 sm:grid-cols-2'>
            <Select name='venue_id' required><option value=''>Select venue</option>{managedVenues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</Select>
            <Select name='artist_id'><option value=''>Artist does not have an account yet</option>{artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.display_name}</option>)}</Select>
          </div>
          <div className='grid gap-2 sm:grid-cols-2'>
            <Input name='artist_name' placeholder='Artist name (for outreach if no account)' />
            <Input type='email' name='artist_contact_email' placeholder='Artist contact email (for outreach)' />
          </div>
          <Textarea name='outreach_note' className='min-h-20' placeholder='Optional note for Choon onboarding team' />
          <Button type='submit' variant='primary'>Request partnership</Button>
        </form>}

        {session.role === 'artist' && artistProfile && <form action={requestPartnershipAction} className='grid gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 md:grid-cols-[1fr_auto]'>
          <div className='grid gap-2 sm:grid-cols-2'>
            <Select name='venue_id' required><option value=''>Select venue</option>{(db.prepare(`SELECT MIN(id) id, name FROM venues WHERE approved=1 GROUP BY name ORDER BY name`).all() as Array<{ id: number; name: string }>).map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</Select>
            <input type='hidden' name='artist_id' value={artistProfile.id} />
            <div className='rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 text-sm text-[var(--text-secondary)]'>{artistProfile.display_name}</div>
          </div>
          <Button type='submit' variant='primary'>Request partnership</Button>
        </form>}

        {pendingPartnerships.length > 0 && <div className='space-y-2'>
          <p className='font-medium'>Pending requests</p>
          {pendingPartnerships.map((request) => (
            <div key={request.id} className='flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-sm'>
              <p>{request.venue_name} ↔ {request.artist_name} <span className='text-[var(--text-muted)]'>(requested by {request.requested_by_role === 'artist' ? 'artist' : 'venue'})</span></p>
              <div className='flex gap-2'>
                <form action={respondPartnershipAction}><input type='hidden' name='partnership_id' value={request.id} /><Button type='submit' name='decision' value='accept' variant='subtle' className='text-emerald-300'>Accept</Button></form>
                <form action={respondPartnershipAction}><input type='hidden' name='partnership_id' value={request.id} /><Button type='submit' name='decision' value='decline' variant='subtle' className='text-rose-300'>Decline</Button></form>
              </div>
            </div>
          ))}
        </div>}

        {acceptedPartnerships.length > 0 && <div className='space-y-2'>
          <p className='font-medium'>Accepted partnerships</p>
          {acceptedPartnerships.map((partnership) => (
            <p key={partnership.id} className='rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-sm'>
              <Link href={`/venues/${partnership.venue_id}`} className='text-violet-300 hover:text-violet-200'>{partnership.venue_name}</Link> ↔ <Link href={`/artists/${partnership.artist_id}`} className='text-violet-300 hover:text-violet-200'>{partnership.artist_name}</Link>
            </p>
          ))}
        </div>}
      </Section>}

      {session.role === 'user' && fanStats && <Section title='Fan activity' kicker='Your profile' actions={<Link href={`/profiles/${session.username}`} className='text-sm text-violet-300 hover:text-violet-200'>Open full profile</Link>}>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard label='Saved pages' value={fanStats.saved_pages} />
          <StatCard label='Artists followed' value={fanStats.artists_followed} />
          <StatCard label='Marked going' value={fanStats.going_count} />
          <StatCard label='Interested' value={fanStats.interested_count} />
        </div>
        <div className='space-y-2'>
          <h3 className='font-medium'>Upcoming gigs you marked as going</h3>
          {fanUpcoming.length === 0 ? <p className='text-sm text-[var(--text-secondary)]'>No upcoming gigs marked as going yet.</p> : fanUpcoming.map((gig) => (
            <Link key={gig.id} href={`/gigs/${gig.id}`} className='block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-sm hover:bg-[var(--surface-primary)]'>
              <p className='font-medium'>{gig.artist_name} <span className='text-[var(--text-secondary)]'>@ {gig.venue_name}</span></p>
              <p className='text-[var(--text-secondary)]'>{formatDateDDMMYYYY(gig.date)} · {formatTime(gig.start_time, '12h')}</p>
            </Link>
          ))}
        </div>
      </Section>}

      {session.role === 'artist' && <Card variant='muted' className='rounded-2xl'><p className='text-[var(--text-secondary)]'>Artist tools are available above. Use your profile page for deeper stats and links.</p></Card>}
    </div>
  );
}
