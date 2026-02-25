import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import MyGigsManager from '@/components/MyGigsManager';

export default async function MyGigs({ searchParams }: { searchParams: Promise<{ venue_id?: string; back_to?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const query = await searchParams;
  const venueId = Number(query.venue_id || 0);
  const isVenueAdmin = session.role === 'venue_admin';

  const managedVenues = isVenueAdmin
    ? db.prepare(`SELECT venues.id, venues.name
      FROM venues
      JOIN venue_memberships ON venue_memberships.venue_id = venues.id
      WHERE venue_memberships.user_id = ? AND venue_memberships.approved = 1
      ORDER BY venues.name`).all(session.id) as Array<{ id: number; name: string }>
    : [];

  const selectedVenue = venueId
    ? managedVenues.find((venue) => venue.id === venueId) || null
    : (managedVenues.length === 1 ? managedVenues[0] : null);

  const gigs = selectedVenue
    ? db.prepare('SELECT gigs.*, venues.name venue_name FROM gigs JOIN venues ON venues.id=gigs.venue_id WHERE gigs.venue_id=? ORDER BY date ASC, start_time ASC').all(selectedVenue.id) as any[]
    : db.prepare('SELECT gigs.*, venues.name venue_name FROM gigs JOIN venues ON venues.id=gigs.venue_id WHERE created_by_user_id=? ORDER BY date ASC, start_time ASC').all(session.id) as any[];

  const profile = db.prepare('SELECT time_format FROM user_profiles WHERE user_id=?').get(session.id) as { time_format: '12h' | '24h' } | undefined;
  const title = selectedVenue ? `${selectedVenue.name} gigs` : 'My gigs';
  const backHref = selectedVenue ? (query.back_to || '/dashboard') : undefined;

  return <MyGigsManager gigs={gigs} timeFormat={profile?.time_format || '12h'} title={title} backHref={backHref} selectedVenueName={managedVenues.length > 1 ? selectedVenue?.name : undefined} />;
}
