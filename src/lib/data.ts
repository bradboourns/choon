import db from './db';

export const genres = ['Rock', 'Indie', 'Electronic', 'Pop', 'Jazz', 'Hip Hop', 'Soul'];
export const vibes = ['Chill', 'Loud', 'Sweaty', 'Underground', 'Date night', 'Dancey', 'Acoustic'];

export function getGigs(filters: any = {}) {
  let q = `SELECT gigs.*, venues.name venue_name, venues.suburb, venues.city, venues.address, venues.lat, venues.lng, popup_collectives.name popup_collective_name, popup_collectives.slug popup_collective_slug
           FROM gigs JOIN venues ON gigs.venue_id = venues.id
           LEFT JOIN popup_collectives ON popup_collectives.id = gigs.popup_collective_id
           WHERE gigs.status='approved' AND venues.approved=1 AND venues.city='Gold Coast'`;
  const args: any[] = [];
  if (filters.search) {
    q += ` AND (gigs.artist_name LIKE ? OR venues.name LIKE ? OR venues.suburb LIKE ? OR venues.city LIKE ?)`;
    for (let i = 0; i < 4; i++) args.push(`%${filters.search}%`);
  }
  if (filters.price) { q += ' AND gigs.price_type = ?'; args.push(filters.price); }
  if (filters.dateFrom) { q += ' AND gigs.date >= ?'; args.push(filters.dateFrom); }
  if (filters.dateTo) { q += ' AND gigs.date <= ?'; args.push(filters.dateTo); }
  q += ' ORDER BY gigs.date ASC, gigs.start_time ASC';
  return db.prepare(q).all(...args) as any[];
}

export function getGig(id: number) {
  return db.prepare(`SELECT gigs.*, venues.name venue_name, venues.address, venues.suburb, venues.city, venues.state, venues.postcode, venues.lat, venues.lng,
    popup_collectives.name popup_collective_name, popup_collectives.slug popup_collective_slug,
    artists.spotify_monthly_listeners artist_spotify_monthly_listeners, artists.show_spotify_monthly_listeners artist_show_spotify_monthly_listeners
  FROM gigs JOIN venues ON gigs.venue_id = venues.id
  LEFT JOIN popup_collectives ON popup_collectives.id = gigs.popup_collective_id
  LEFT JOIN artists ON artists.id = gigs.artist_id
  WHERE gigs.id = ?`).get(id) as any;
}
