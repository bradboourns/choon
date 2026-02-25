'use server';

import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { getSession, register, signIn, signOut } from '@/lib/auth';

export async function registerAction(formData: FormData) {
  const username = String(formData.get('username') || '');
  const password = String(formData.get('password') || '');
  const role = String(formData.get('role') || 'user');
  const ok = await register(username, password, role);
  if (!ok) redirect('/register');
  await signIn(username, password);
  redirect('/');
}

export async function loginAction(formData: FormData) {
  const user = await signIn(String(formData.get('username') || ''), String(formData.get('password') || ''));
  if (!user) redirect('/login');
  redirect('/');
}

export async function quickLoginAction(formData: FormData) {
  const user = await signIn(String(formData.get('profile') || ''), 'password');
  if (!user) redirect('/login');
  redirect('/');
}

export async function logoutAction() { await signOut(); redirect('/'); }

function ensureVenueCanPost(venueId: number, userId: number, role: string) {
  if (role !== 'venue_admin') return true;
  const membership = db.prepare('SELECT id FROM venue_memberships WHERE user_id=? AND venue_id=? AND approved=1').get(userId, venueId) as { id: number } | undefined;
  return Boolean(membership);
}

export async function createGigAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'artist' && session.role !== 'venue_admin')) redirect('/login');

  const venueId = Number(formData.get('venue_id'));
  if (!ensureVenueCanPost(venueId, session.id, session.role)) redirect('/create-gig?error=venue-permission');

  const genres = formData.getAll('genres');
  const vibes = formData.getAll('vibe_tags');
  db.prepare(`INSERT INTO gigs (venue_id,artist_name,date,start_time,end_time,price_type,ticket_url,description,genres,vibe_tags,poster_url,status,needs_review,created_by_user_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    venueId,
    String(formData.get('artist_name')),
    String(formData.get('date')),
    String(formData.get('start_time')),
    String(formData.get('end_time') || ''),
    String(formData.get('price_type')),
    String(formData.get('ticket_url') || ''),
    String(formData.get('description') || ''),
    JSON.stringify(genres),
    JSON.stringify(vibes),
    String(formData.get('poster_url') || ''),
    'approved',
    1,
    session.id,
  );
  redirect('/my-gigs');
}

export async function requestVenueAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'venue_admin') redirect('/login');

  db.prepare(`INSERT INTO venue_requests
    (requested_by_user_id,venue_name,abn,address,suburb,city,state,postcode,website,instagram,notes,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    session.id,
    String(formData.get('venue_name') || ''),
    String(formData.get('abn') || ''),
    String(formData.get('address') || ''),
    String(formData.get('suburb') || ''),
    String(formData.get('city') || 'Gold Coast'),
    String(formData.get('state') || 'QLD'),
    String(formData.get('postcode') || ''),
    String(formData.get('website') || ''),
    String(formData.get('instagram') || ''),
    String(formData.get('notes') || ''),
    'pending',
  );

  redirect('/create-gig?request=sent');
}

export async function updateGigAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');
  db.prepare('UPDATE gigs SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND created_by_user_id=?').run(String(formData.get('status')), Number(formData.get('gig_id')), session.id);
  redirect('/my-gigs');
}

export async function adminReviewVenueRequestAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const requestId = Number(formData.get('request_id'));
  const decision = String(formData.get('decision'));
  const request = db.prepare('SELECT * FROM venue_requests WHERE id=? AND status=\'pending\'').get(requestId) as any;
  if (!request) redirect('/admin');

  if (decision === 'approve') {
    const venueInsert = db.prepare(`INSERT INTO venues (name,abn,address,suburb,city,state,postcode,lat,lng,website,instagram,approved)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`);
    const insertedVenue = venueInsert.run(
      request.venue_name,
      request.abn,
      request.address,
      request.suburb,
      request.city,
      request.state,
      request.postcode,
      -28.0167,
      153.4,
      request.website,
      request.instagram,
    );
    const venueId = Number(insertedVenue.lastInsertRowid);
    db.prepare('INSERT OR REPLACE INTO venue_memberships (venue_id,user_id,role,approved) VALUES (?,?,?,1)').run(venueId, request.requested_by_user_id, 'owner');
    db.prepare('UPDATE venue_requests SET status=\'approved\', reviewed_by_user_id=?, reviewed_at=CURRENT_TIMESTAMP WHERE id=?').run(session.id, requestId);
  } else {
    db.prepare('UPDATE venue_requests SET status=\'rejected\', reviewed_by_user_id=?, reviewed_at=CURRENT_TIMESTAMP WHERE id=?').run(session.id, requestId);
  }

  redirect('/admin');
}

export async function adminRemoveGigAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');
  db.prepare("UPDATE gigs SET status='removed', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(Number(formData.get('gig_id')));
  redirect('/admin');
}

export async function adminDismissGigFlagAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');
  db.prepare('UPDATE gigs SET needs_review=0, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(Number(formData.get('gig_id')));
  redirect('/admin');
}

export async function adminRemoveVenueAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');
  const venueId = Number(formData.get('venue_id'));
  db.prepare("UPDATE gigs SET status='removed', updated_at=CURRENT_TIMESTAMP WHERE venue_id=?").run(venueId);
  db.prepare('DELETE FROM venue_memberships WHERE venue_id=?').run(venueId);
  db.prepare('DELETE FROM venues WHERE id=?').run(venueId);
  redirect('/admin');
}
