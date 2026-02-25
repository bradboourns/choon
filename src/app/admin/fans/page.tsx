import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminFansPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const fanAccounts = db.prepare(`
    SELECT
      users.id,
      users.username,
      users.email,
      user_profiles.display_name,
      user_profiles.location,
      COUNT(DISTINCT saved_gigs.gig_id) AS saved_count,
      COUNT(DISTINCT artist_follows.artist_id) AS follow_count,
      COUNT(DISTINCT venue_follows.venue_id) AS venue_follow_count
    FROM users
    LEFT JOIN user_profiles ON user_profiles.user_id = users.id
    LEFT JOIN saved_gigs ON saved_gigs.user_id = users.id
    LEFT JOIN artist_follows ON artist_follows.user_id = users.id
    LEFT JOIN venue_follows ON venue_follows.user_id = users.id
    WHERE users.role = 'user'
    GROUP BY users.id
    ORDER BY saved_count DESC, follow_count DESC, users.username ASC
  `).all() as Array<{
    id: number;
    username: string;
    email: string;
    display_name: string;
    location: string;
    saved_count: number;
    follow_count: number;
    venue_follow_count: number;
  }>;

  const savedGigRows = db.prepare(`
    SELECT users.id user_id, gigs.artist_name, venues.name venue_name
    FROM users
    JOIN saved_gigs ON saved_gigs.user_id = users.id
    JOIN gigs ON gigs.id = saved_gigs.gig_id
    JOIN venues ON venues.id = gigs.venue_id
    WHERE users.role = 'user' AND gigs.status != 'removed'
    ORDER BY users.username ASC, gigs.date ASC
  `).all() as Array<{ user_id: number; artist_name: string; venue_name: string }>;

  const venueFollowRows = db.prepare(`
    SELECT users.id user_id, venues.name
    FROM users
    JOIN venue_follows ON venue_follows.user_id = users.id
    JOIN venues ON venues.id = venue_follows.venue_id
    WHERE users.role = 'user'
    ORDER BY users.username ASC, venues.name ASC
  `).all() as Array<{ user_id: number; name: string }>;

  const followRows = db.prepare(`
    SELECT users.id user_id, artists.display_name
    FROM users
    JOIN artist_follows ON artist_follows.user_id = users.id
    JOIN artists ON artists.id = artist_follows.artist_id
    WHERE users.role = 'user'
    ORDER BY users.username ASC, artists.display_name ASC
  `).all() as Array<{ user_id: number; display_name: string }>;

  return <div className='space-y-4'>
    <div className='flex items-center justify-between'>
      <h1 className='text-3xl font-bold'>Fan moderation</h1>
      <Link href='/admin' className='text-sm underline'>Back to admin</Link>
    </div>

    <p className='text-sm text-zinc-400'>Review fan profiles, what they save, and which artists they follow.</p>

    {fanAccounts.length === 0 ? <p>No fan accounts found.</p> : (
      <div className='grid gap-3'>
        {fanAccounts.map((fan) => {
          const saved = savedGigRows.filter((row) => row.user_id === fan.id).map((row) => `${row.artist_name} @ ${row.venue_name}`);
          const follows = followRows.filter((row) => row.user_id === fan.id).map((row) => row.display_name);
          const venueFollows = venueFollowRows.filter((row) => row.user_id === fan.id).map((row) => row.name);

          return <div key={fan.id} className='rounded border border-zinc-700 p-3'>
            <p className='font-semibold'>{fan.display_name} <Link href={`/profiles/${fan.username}`} className='text-zinc-400 underline'>@{fan.username}</Link></p>
            <p className='text-sm text-zinc-400'>{fan.email} · {fan.location || 'Unknown location'}</p>
            <p className='mt-2 text-sm'>Saved pages: <span className='font-semibold'>{fan.saved_count}</span> · Artist follows: <span className='font-semibold'>{fan.follow_count}</span> · Venue follows: <span className='font-semibold'>{fan.venue_follow_count}</span></p>
            <p className='mt-2 text-sm text-zinc-300'>Saved gigs: {saved.length ? saved.join(' • ') : 'None yet'}</p>
            <p className='mt-1 text-sm text-zinc-300'>Artist follows: {follows.length ? follows.join(' • ') : 'None yet'}</p>
            <p className='mt-1 text-sm text-zinc-300'>Venue follows: {venueFollows.length ? venueFollows.join(' • ') : 'None yet'}</p>
          </div>;
        })}
      </div>
    )}
  </div>;
}
