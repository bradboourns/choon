import Link from 'next/link';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { formatDateDDMMYYYY } from '@/lib/format';

const roleLabel: Record<string, string> = {
  admin: 'Platform admin',
  artist: 'Artist account',
  venue_admin: 'Venue management account',
  user: 'Fan account',
};

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getSession();

  const account = db.prepare(`
    SELECT users.id, users.username, users.email, users.role, users.created_at,
      user_profiles.display_name, user_profiles.bio, user_profiles.location
    FROM users
    LEFT JOIN user_profiles ON user_profiles.user_id = users.id
    WHERE users.username = ?
  `).get(username) as {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: string;
    display_name: string;
    bio: string;
    location: string;
  } | undefined;

  if (!account) return <p>Profile not found.</p>;

  const canViewEmail = session?.role === 'admin' || session?.username === account.username;
  const isOwner = session?.username === account.username;

  const adminStats = account.role === 'admin'
    ? db.prepare(`SELECT
        (SELECT COUNT(*) FROM reports WHERE status = 'open') AS open_reports,
        (SELECT COUNT(*) FROM gigs WHERE needs_review = 1 AND status != 'removed') AS flagged_gigs,
        (SELECT COUNT(*) FROM venue_requests WHERE status = 'pending') AS pending_venue_requests,
        (SELECT COUNT(*) FROM users) AS total_accounts
      `).get() as { open_reports: number; flagged_gigs: number; pending_venue_requests: number; total_accounts: number }
    : null;

  const fanStats = account.role === 'user'
    ? db.prepare(`SELECT
        (SELECT COUNT(*) FROM saved_gigs WHERE user_id = ?) AS saved_pages,
        (SELECT COUNT(*) FROM artist_follows WHERE user_id = ?) AS artists_followed,
        (SELECT COUNT(*) FROM venue_follows WHERE user_id = ?) AS venues_followed,
        (SELECT COUNT(*) FROM gig_interest WHERE user_id = ? AND status = 'going') AS marked_going
      `).get(account.id, account.id, account.id, account.id) as { saved_pages: number; artists_followed: number; venues_followed: number; marked_going: number }
    : null;

  const artistProfile = account.role === 'artist'
    ? db.prepare('SELECT id, display_name, instagram FROM artists WHERE created_by_user_id = ?').get(account.id) as { id: number; display_name: string; instagram: string } | undefined
    : undefined;

  const artistStats = artistProfile
    ? db.prepare(`SELECT
        COUNT(*) AS total_gigs,
        SUM(CASE WHEN date >= date('now') THEN 1 ELSE 0 END) AS upcoming_gigs,
        COUNT(DISTINCT venue_id) AS venues_played
      FROM gigs
      WHERE artist_id = ? AND status = 'approved'
    `).get(artistProfile.id) as { total_gigs: number; upcoming_gigs: number; venues_played: number }
    : null;

  const recentArtistGigs = artistProfile
    ? db.prepare(`SELECT id, date, artist_name
      FROM gigs
      WHERE artist_id = ? AND status = 'approved'
      ORDER BY date DESC, id DESC
      LIMIT 5`).all(artistProfile.id) as Array<{ id: number; date: string; artist_name: string }>
    : [];

  const managedVenues = account.role === 'venue_admin'
    ? db.prepare(`
      SELECT venues.id, venues.name, venues.suburb, venues.city,
        COUNT(gigs.id) AS total_gigs,
        SUM(CASE WHEN gigs.date >= date('now') AND gigs.status = 'approved' THEN 1 ELSE 0 END) AS upcoming_gigs
      FROM venue_memberships
      JOIN venues ON venues.id = venue_memberships.venue_id
      LEFT JOIN gigs ON gigs.venue_id = venues.id AND gigs.status != 'removed'
      WHERE venue_memberships.user_id = ? AND venue_memberships.approved = 1
      GROUP BY venues.id
      ORDER BY venues.name ASC
    `).all(account.id) as Array<{ id: number; name: string; suburb: string; city: string; total_gigs: number; upcoming_gigs: number }>
    : [];

  const recentSavedGigs = account.role === 'user'
    ? db.prepare(`SELECT gigs.id, gigs.date, gigs.artist_name
      FROM saved_gigs
      JOIN gigs ON gigs.id = saved_gigs.gig_id
      WHERE saved_gigs.user_id = ? AND gigs.status = 'approved' AND gigs.date >= date('now')
      ORDER BY gigs.date ASC
      LIMIT 5`).all(account.id) as Array<{ id: number; date: string; artist_name: string }>
    : [];

  const adminQueues = account.role === 'admin'
    ? db.prepare(`SELECT
      (SELECT COUNT(*) FROM venue_requests WHERE status='pending') AS pending_venue_requests,
      (SELECT COUNT(*) FROM reports WHERE status='open') AS open_reports,
      (SELECT COUNT(*) FROM gigs WHERE needs_review=1 AND status!='removed') AS flagged_gigs
    `).get() as { pending_venue_requests: number; open_reports: number; flagged_gigs: number }
    : null;

  const displayName = account.display_name || account.username;
  const profileCompletion = [account.display_name, account.bio, account.location].filter(Boolean).length;
  const completionPercent = Math.round((profileCompletion / 3) * 100);

  return <div className='space-y-5'>
    <Link href='/' className='text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>

    <section className='rounded-2xl border border-zinc-700 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-violet-900/20 p-5'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex items-start gap-4'>
          <div className='grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/40 bg-violet-500/20 text-xl font-bold text-violet-100'>
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className='text-3xl font-bold leading-tight'>{displayName}</h1>
            <p className='text-sm text-zinc-300'>@{account.username} · {roleLabel[account.role] || 'Member'}</p>
            <p className='mt-2 max-w-2xl text-zinc-200'>{account.bio || 'Tell people what kind of live music experiences you are into.'}</p>
            <p className='mt-2 text-sm text-zinc-400'>
              {account.location || 'Gold Coast'} · Joined {formatDateDDMMYYYY(account.created_at)}
            </p>
            {canViewEmail && <p className='text-sm text-zinc-400'>Email: {account.email}</p>}
          </div>
        </div>

        <div className='space-y-3'>
          {isOwner && <div className='flex flex-wrap justify-end gap-2'>
            <Link href='/settings' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Edit profile</Link>
            <Link href='/dashboard' className='rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500'>Open dashboard</Link>
          </div>}

          <div className='w-56 rounded-xl border border-zinc-700 bg-zinc-950/60 p-3'>
            <div className='flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400'>
              <span>Profile completeness</span>
              <span>{completionPercent}%</span>
            </div>
            <div className='mt-2 h-2 overflow-hidden rounded-full bg-zinc-800'>
              <div className='h-full rounded-full bg-violet-500' style={{ width: `${completionPercent}%` }} />
            </div>
            <p className='mt-2 text-xs text-zinc-400'>Add display name, bio, and location for a stronger profile.</p>
          </div>
        </div>
      </div>
    </section>

    {adminStats && <section className='grid gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard label='Open reports' value={adminStats.open_reports} helper='Moderation workload' />
      <StatCard label='Flagged gigs' value={adminStats.flagged_gigs} helper='Awaiting review' />
      <StatCard label='Pending venue requests' value={adminStats.pending_venue_requests} helper='Needs action' />
      <StatCard label='Total accounts' value={adminStats.total_accounts} helper='Platform members' />
    </section>}

    {fanStats && <section className='grid gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard label='Saved pages' value={fanStats.saved_pages} helper='Bookmarked gigs' />
      <StatCard label='Artists followed' value={fanStats.artists_followed} helper='Creator connections' />
      <StatCard label='Venues followed' value={fanStats.venues_followed} helper='Place connections' />
      <StatCard label='Marked going' value={fanStats.marked_going} helper='Upcoming plans' />
    </section>}

    {artistProfile && artistStats && <section className='space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <h2 className='text-xl font-semibold'>Artist profile</h2>
          <p className='text-sm text-zinc-400'>{artistProfile.display_name}</p>
        </div>
        {artistProfile.instagram && <a className='text-violet-300 hover:text-violet-200' href={`https://instagram.com/${artistProfile.instagram.replace('@', '')}`}>@{artistProfile.instagram.replace('@', '')}</a>}
      </div>
      <div className='grid gap-3 sm:grid-cols-3'>
        <StatCard label='Total gigs' value={artistStats.total_gigs || 0} helper='All approved shows' />
        <StatCard label='Upcoming gigs' value={artistStats.upcoming_gigs || 0} helper='Future appearances' />
        <StatCard label='Venues played' value={artistStats.venues_played || 0} helper='Unique places' />
      </div>
      <ActivityList title='Recent activity' emptyLabel='No approved gig activity yet.' items={recentArtistGigs.map((gig) => ({ href: `/gigs/${gig.id}`, label: gig.artist_name, meta: formatDateDDMMYYYY(gig.date) }))} />
    </section>}

    {account.role === 'venue_admin' && <section className='space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-xl font-semibold'>Managed venues</h2>
      {managedVenues.length > 1 && <p className='text-sm text-zinc-400'>This venue management account can manage multiple individual venues.</p>}
      {managedVenues.length === 0 ? <p className='text-sm text-zinc-400'>No approved venue memberships yet.</p> : (
        <div className='grid gap-2'>
          {managedVenues.map((venue) => <Link key={venue.id} href={`/venues/${venue.id}`} className='rounded border border-zinc-700 bg-zinc-950/70 p-3 text-sm hover:bg-zinc-900'>
            <p className='font-semibold'>{venue.name}</p>
            <p className='text-zinc-400'>{venue.suburb}, {venue.city}</p>
            <p className='text-zinc-400'>{venue.upcoming_gigs || 0} upcoming · {venue.total_gigs || 0} total gigs</p>
          </Link>)}
        </div>
      )}
    </section>}

    {account.role === 'user' && <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <ActivityList
        title='Upcoming saved gigs'
        emptyLabel='No saved upcoming gigs right now.'
        items={recentSavedGigs.map((gig) => ({ href: `/gigs/${gig.id}`, label: gig.artist_name, meta: formatDateDDMMYYYY(gig.date) }))}
      />
    </section>}

    {adminQueues && <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-xl font-semibold'>Moderation focus</h2>
      <div className='mt-3 grid gap-2 sm:grid-cols-3'>
        <Link href='/admin/venues' className='rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 hover:bg-zinc-900'>
          <p className='text-sm text-zinc-400'>Pending venue requests</p>
          <p className='text-2xl font-bold'>{adminQueues.pending_venue_requests}</p>
        </Link>
        <Link href='/admin' className='rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 hover:bg-zinc-900'>
          <p className='text-sm text-zinc-400'>Open reports</p>
          <p className='text-2xl font-bold'>{adminQueues.open_reports}</p>
        </Link>
        <Link href='/admin' className='rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 hover:bg-zinc-900'>
          <p className='text-sm text-zinc-400'>Flagged gigs</p>
          <p className='text-2xl font-bold'>{adminQueues.flagged_gigs}</p>
        </Link>
      </div>
    </section>}
  </div>;
}

function StatCard({ label, value, helper }: { label: string; value: number; helper?: string }) {
  return <div className='rounded-lg border border-zinc-800 bg-zinc-950/60 p-3'>
    <p className='text-xs uppercase tracking-wide text-zinc-500'>{label}</p>
    <p className='text-2xl font-bold'>{value}</p>
    {helper && <p className='text-xs text-zinc-500'>{helper}</p>}
  </div>;
}

function ActivityList({
  title,
  emptyLabel,
  items,
}: {
  title: string;
  emptyLabel: string;
  items: Array<{ href: string; label: string; meta: string }>;
}) {
  return <div className='space-y-2'>
    <h2 className='text-xl font-semibold'>{title}</h2>
    {items.length === 0
      ? <p className='text-sm text-zinc-400'>{emptyLabel}</p>
      : <div className='grid gap-2'>
        {items.map((item) => <Link key={`${item.href}-${item.label}-${item.meta}`} href={item.href} className='rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 text-sm hover:bg-zinc-900'>
          <p className='font-medium'>{item.label}</p>
          <p className='text-zinc-400'>{item.meta}</p>
        </Link>)}
      </div>}
  </div>;
}
