import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { genres, vibes } from '@/lib/data';
import { redirect } from 'next/navigation';
import CreateGigForm from '@/components/CreateGigForm';

export default async function CreateGig({ searchParams }: { searchParams: Promise<{ error?: string; venue_id?: string; lead?: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'artist' && session.role !== 'venue_admin')) redirect('/login');

  const query = await searchParams;
  const preferredVenueId = query.venue_id ? Number(query.venue_id) : undefined;
  const venues = session.role === 'venue_admin'
    ? db.prepare(`SELECT venues.* FROM venues
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id=? AND venue_memberships.approved=1
      ORDER BY venues.approved DESC, venues.name`).all(session.id) as any[]
    : db.prepare('SELECT * FROM venues WHERE approved=1 ORDER BY name').all() as any[];

  const partneredArtists = session.role === 'venue_admin'
    ? db.prepare(`SELECT artists.id, artists.display_name
      FROM partnerships
      JOIN artists ON artists.id = partnerships.artist_id
      JOIN venue_memberships ON venue_memberships.venue_id = partnerships.venue_id
      WHERE venue_memberships.user_id = ? AND venue_memberships.approved = 1 AND partnerships.status = 'accepted'
      GROUP BY artists.id, artists.display_name
      ORDER BY artists.display_name`).all(session.id) as Array<{ id: number; display_name: string }>
    : [];

  return <div className='space-y-6'>
    <CreateGigForm
      venues={venues}
      preferredVenueId={preferredVenueId}
      error={query.error}
      lead={query.lead}
      genres={genres}
      vibes={vibes}
      partneredArtists={partneredArtists}
      role={session.role}
    />
  </div>;
}
