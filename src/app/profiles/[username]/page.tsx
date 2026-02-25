import Link from 'next/link';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

const roleLabel: Record<string, string> = {
  admin: 'Platform admin',
  artist: 'Artist account',
  venue_admin: 'Venue account',
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
        (SELECT COUNT(*) FROM gig_interest WHERE user_id = ? AND status = 'going') AS marked_going
      `).get(account.id, account.id, account.id) as { saved_pages: number; artists_followed: number; marked_going: number }
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

  return <div className='space-y-4'>
    <Link href='/' className='text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>

    <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h1 className='text-3xl font-bold'>{account.display_name || account.username}</h1>
      <p className='text-sm text-zinc-400'>@{account.username} · {roleLabel[account.role] || 'Member'}</p>
      <p className='mt-2 text-zinc-300'>{account.bio || 'No bio set yet.'}</p>
      <p className='mt-2 text-sm text-zinc-400'>Location: {account.location || 'Gold Coast'}</p>
      {canViewEmail && <p className='text-sm text-zinc-400'>Email: {account.email}</p>}
    </section>

    {adminStats && <section className='grid gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard label='Open reports' value={adminStats.open_reports} />
      <StatCard label='Flagged gigs' value={adminStats.flagged_gigs} />
      <StatCard label='Pending venue requests' value={adminStats.pending_venue_requests} />
      <StatCard label='Total accounts' value={adminStats.total_accounts} />
    </section>}

    {fanStats && <section className='grid gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 sm:grid-cols-3'>
      <StatCard label='Saved pages' value={fanStats.saved_pages} />
      <StatCard label='Artists followed' value={fanStats.artists_followed} />
      <StatCard label='Marked going' value={fanStats.marked_going} />
    </section>}

    {artistProfile && artistStats && <section className='space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <div>
        <h2 className='text-xl font-semibold'>Artist profile</h2>
        <p className='text-sm text-zinc-400'>{artistProfile.display_name}</p>
        {artistProfile.instagram && <a className='text-violet-300 hover:text-violet-200' href={`https://instagram.com/${artistProfile.instagram.replace('@', '')}`}>@{artistProfile.instagram.replace('@', '')}</a>}
      </div>
      <div className='grid gap-3 sm:grid-cols-3'>
        <StatCard label='Total gigs' value={artistStats.total_gigs || 0} />
        <StatCard label='Upcoming gigs' value={artistStats.upcoming_gigs || 0} />
        <StatCard label='Venues played' value={artistStats.venues_played || 0} />
      </div>
    </section>}

    {account.role === 'venue_admin' && <section className='space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-xl font-semibold'>Managed venues</h2>
      {managedVenues.length > 1 && <p className='text-sm text-zinc-400'>This account acts as a master venue account with access to multiple individual venues.</p>}
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
  </div>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <div className='rounded-lg border border-zinc-800 bg-zinc-950/60 p-3'>
    <p className='text-xs uppercase tracking-wide text-zinc-500'>{label}</p>
    <p className='text-2xl font-bold'>{value}</p>
  </div>;
}
