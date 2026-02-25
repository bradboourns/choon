import { redirect } from 'next/navigation';
import HomeFeed from '@/components/HomeFeed';
import { getSession } from '@/lib/auth';
import { getGigs } from '@/lib/data';
import db from '@/lib/db';

export default async function Home() {
  const session = await getSession();
  if (session?.role === 'admin') redirect('/dashboard');

  const gigs = getGigs();

  const savedGigIds = session
    ? (db.prepare('SELECT gig_id FROM saved_gigs WHERE user_id = ?').all(session.id) as Array<{ gig_id: number }>).map((row) => row.gig_id)
    : [];

  const interestRows = session
    ? (db
        .prepare("SELECT gig_id, status FROM gig_interest WHERE user_id = ? AND status IN ('interested', 'going')")
        .all(session.id) as Array<{ gig_id: number; status: 'interested' | 'going' }>)
    : [];

  const followedArtistIds = session
    ? (db.prepare('SELECT artist_id FROM artist_follows WHERE user_id = ?').all(session.id) as Array<{ artist_id: number }>).map((row) => row.artist_id)
    : [];

  const interestByGig = Object.fromEntries(interestRows.map((row) => [row.gig_id, row.status]));

  return <HomeFeed initial={gigs} isLoggedIn={Boolean(session)} savedGigIds={savedGigIds} interestByGig={interestByGig} followedArtistIds={followedArtistIds} />;
}
