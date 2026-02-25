'use server';

import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { getSession, register, signIn, signOut } from '@/lib/auth';


function redirectAfterAuth(role: string) {
  if (role === 'admin') redirect('/dashboard');
  redirect('/');
}

const FALLBACK_GIG_DESCRIPTION = 'Details coming soon. This gig was submitted by the venue and will be updated shortly.';
const FALLBACK_POSTER_URL = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200';

function createProvisionalVenue(formData: FormData, userId: number) {
  const insertVenue = db.prepare(`INSERT INTO venues (name,abn,address,suburb,city,state,postcode,lat,lng,website,instagram,approved)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,0)`);
  const createdVenue = insertVenue.run(
    String(formData.get('venue_name') || '').trim(),
    String(formData.get('abn') || '').trim(),
    String(formData.get('address') || '').trim(),
    String(formData.get('suburb') || '').trim(),
    String(formData.get('city') || 'Gold Coast').trim(),
    String(formData.get('state') || 'QLD').trim(),
    String(formData.get('postcode') || '').trim(),
    -28.0167,
    153.4,
    String(formData.get('website') || '').trim(),
    String(formData.get('instagram') || '').trim(),
  );
  const venueId = Number(createdVenue.lastInsertRowid);
  db.prepare('INSERT OR REPLACE INTO venue_memberships (venue_id,user_id,role,approved) VALUES (?,?,?,1)').run(venueId, userId, 'owner');
  return venueId;
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirm_password') || '');
  const role = String(formData.get('role') || 'user');
  if (!email || password.length < 8 || password !== confirmPassword) redirect('/register?error=invalid-credentials');

  const ok = await register(email, password, role);
  if (!ok) redirect('/register');

  const user = await signIn(email, password);
  if (!user) redirect('/login');

  if (role === 'venue_admin') {
    const provisionalVenueId = createProvisionalVenue(formData, user.id);
    db.prepare(`INSERT INTO venue_requests
      (requested_by_user_id,venue_name,abn,address,suburb,city,state,postcode,website,instagram,notes,provisional_venue_id,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      user.id,
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
      provisionalVenueId,
      'pending',
    );
  }

  redirectAfterAuth(user.role);
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get('username') || '');
  const password = String(formData.get('password') || '');
  const user = await signIn(username, password);
  if (!user) {
    const normalized = username.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE username=? OR email=?').get(normalized, normalized) as { id: number } | undefined;
    redirect(existing ? '/login?error=wrong-password' : '/login?error=account-not-found');
  }
  redirectAfterAuth(user.role);
}

export async function quickLoginAction(formData: FormData) {
  const user = await signIn(String(formData.get('profile') || ''), 'password');
  if (!user) redirect('/login');
  redirectAfterAuth(user.role);
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
  const priceType = String(formData.get('price_type'));
  const venue = db.prepare('SELECT approved FROM venues WHERE id=?').get(venueId) as { approved: number } | undefined;
  const description = String(formData.get('description') || '').trim();
  const posterUrl = String(formData.get('poster_url') || '').trim();
  const artistIdRaw = Number(formData.get('artist_id') || 0);
  const artistId = Number.isFinite(artistIdRaw) && artistIdRaw > 0 ? artistIdRaw : null;

  db.prepare(`INSERT INTO gigs (venue_id,artist_name,artist_id,date,start_time,end_time,price_type,ticket_price,ticket_url,description,genres,vibe_tags,poster_url,status,needs_review,created_by_user_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    venueId,
    String(formData.get('artist_name')),
    artistId,
    String(formData.get('date')),
    String(formData.get('start_time')),
    String(formData.get('end_time') || ''),
    priceType,
    priceType === 'Free' ? 0 : Number(formData.get('ticket_price') || 0),
    String(formData.get('ticket_url') || ''),
    description || FALLBACK_GIG_DESCRIPTION,
    JSON.stringify(genres),
    JSON.stringify(vibes),
    posterUrl || FALLBACK_POSTER_URL,
    venue?.approved ? 'approved' : 'pending_venue_approval',
    1,
    session.id,
  );
  redirect(`/my-gigs?venue_id=${venueId}`);
}

export async function requestVenueAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'venue_admin') redirect('/login');

  const provisionalVenueId = createProvisionalVenue(formData, session.id);
  db.prepare(`INSERT INTO venue_requests
    (requested_by_user_id,venue_name,abn,address,suburb,city,state,postcode,website,instagram,notes,provisional_venue_id,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
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
    provisionalVenueId,
    'pending',
  );

  redirect('/request-venue?request=sent');
}

export async function requestPasswordResetAction(formData: FormData) {
  const identifier = String(formData.get('username') || '').trim().toLowerCase();
  if (!identifier) redirect('/login?error=missing-identifier');
  const user = db.prepare('SELECT id FROM users WHERE username=? OR email=?').get(identifier, identifier) as { id: number } | undefined;
  db.prepare('INSERT INTO password_reset_requests (user_id,login_identifier,note) VALUES (?,?,?)').run(user?.id || null, identifier, 'Manual reset request from login page');
  redirect('/login?reset=requested');
}

export async function updateGigDetailsAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');

  const gigId = Number(formData.get('gig_id'));
  const description = String(formData.get('description') || '').trim();
  const posterUrl = String(formData.get('poster_url') || '').trim();
  const priceType = String(formData.get('price_type') || 'Free');
  db.prepare(`UPDATE gigs
    SET artist_name=?, date=?, start_time=?, end_time=?, price_type=?, ticket_price=?, ticket_url=?, description=?, poster_url=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=? AND created_by_user_id=?`).run(
    String(formData.get('artist_name') || ''),
    String(formData.get('date') || ''),
    String(formData.get('start_time') || ''),
    String(formData.get('end_time') || ''),
    priceType,
    priceType === 'Free' ? 0 : Number(formData.get('ticket_price') || 0),
    String(formData.get('ticket_url') || ''),
    description || FALLBACK_GIG_DESCRIPTION,
    posterUrl || FALLBACK_POSTER_URL,
    gigId,
    session.id,
  );
  redirect('/my-gigs?updated=1');
}

export async function updateTimeFormatAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');
  const timeFormat = String(formData.get('time_format') || '12h') === '24h' ? '24h' : '12h';
  db.prepare('UPDATE user_profiles SET time_format=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?').run(timeFormat, session.id);
  redirect('/settings?saved=time-format');
}

export async function updateGigAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');
  db.prepare('UPDATE gigs SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND created_by_user_id=?').run(String(formData.get('status')), Number(formData.get('gig_id')), session.id);
  redirect('/my-gigs');
}


export async function requestPartnershipAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'venue_admin' && session.role !== 'artist')) redirect('/login');

  const venueId = Number(formData.get('venue_id') || 0);
  const artistId = Number(formData.get('artist_id') || 0);
  if (!venueId || !artistId) redirect('/dashboard?partnership=invalid');

  if (session.role === 'venue_admin') {
    const canManageVenue = db.prepare('SELECT id FROM venue_memberships WHERE user_id=? AND venue_id=? AND approved=1').get(session.id, venueId) as { id: number } | undefined;
    if (!canManageVenue) redirect('/dashboard?partnership=unauthorised');
  } else {
    const artist = db.prepare('SELECT id FROM artists WHERE id=? AND created_by_user_id=?').get(artistId, session.id) as { id: number } | undefined;
    if (!artist) redirect('/dashboard?partnership=unauthorised');
  }

  db.prepare(`INSERT INTO partnerships (venue_id,artist_id,requested_by_user_id,requested_by_role,status)
    VALUES (?,?,?,?, 'pending')
    ON CONFLICT(venue_id, artist_id)
    DO UPDATE SET requested_by_user_id=excluded.requested_by_user_id, requested_by_role=excluded.requested_by_role, status='pending', responded_at=NULL`).run(
    venueId,
    artistId,
    session.id,
    session.role,
  );

  redirect('/dashboard?partnership=requested');
}

export async function respondPartnershipAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== 'venue_admin' && session.role !== 'artist')) redirect('/login');

  const partnershipId = Number(formData.get('partnership_id') || 0);
  const decision = String(formData.get('decision') || 'declined') === 'accept' ? 'accepted' : 'declined';
  const partnership = db.prepare("SELECT * FROM partnerships WHERE id=? AND status='pending'").get(partnershipId) as any;
  if (!partnership) redirect('/dashboard');

  if (session.role === 'venue_admin') {
    const canManageVenue = db.prepare('SELECT id FROM venue_memberships WHERE user_id=? AND venue_id=? AND approved=1').get(session.id, partnership.venue_id) as { id: number } | undefined;
    if (!canManageVenue) redirect('/dashboard?partnership=unauthorised');
  } else {
    const artist = db.prepare('SELECT id FROM artists WHERE id=? AND created_by_user_id=?').get(partnership.artist_id, session.id) as { id: number } | undefined;
    if (!artist) redirect('/dashboard?partnership=unauthorised');
  }

  db.prepare('UPDATE partnerships SET status=?, responded_at=CURRENT_TIMESTAMP WHERE id=?').run(decision, partnershipId);
  redirect('/dashboard?partnership=updated');
}

export async function adminReviewVenueRequestAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const requestId = Number(formData.get('request_id'));
  const decision = String(formData.get('decision'));
  const request = db.prepare('SELECT * FROM venue_requests WHERE id=? AND status=\'pending\'').get(requestId) as any;
  if (!request) redirect('/admin');

  if (decision === 'approve') {
    const venueId = request.provisional_venue_id
      ? Number(request.provisional_venue_id)
      : Number(db.prepare(`INSERT INTO venues (name,abn,address,suburb,city,state,postcode,lat,lng,website,instagram,approved)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`).run(
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
      ).lastInsertRowid);
    db.prepare(`UPDATE venues
      SET name=?, abn=?, address=?, suburb=?, city=?, state=?, postcode=?, website=?, instagram=?, approved=1
      WHERE id=?`).run(
      request.venue_name,
      request.abn,
      request.address,
      request.suburb,
      request.city,
      request.state,
      request.postcode,
      request.website,
      request.instagram,
      venueId,
    );
    db.prepare('INSERT OR REPLACE INTO venue_memberships (venue_id,user_id,role,approved) VALUES (?,?,?,1)').run(venueId, request.requested_by_user_id, 'owner');
    db.prepare("UPDATE gigs SET status='approved', updated_at=CURRENT_TIMESTAMP WHERE venue_id=? AND status='pending_venue_approval'").run(venueId);

    const venueMaster = db.prepare("SELECT id FROM users WHERE username='venue' LIMIT 1").get() as { id: number } | undefined;
    if (venueMaster) {
      db.prepare('INSERT OR IGNORE INTO venue_memberships (venue_id,user_id,role,approved) VALUES (?,?,?,1)').run(venueId, venueMaster.id, 'owner');
    }

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
  redirect(String(formData.get('return_to') || '/admin'));
}

export async function adminUpdateGigStatusAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const gigId = Number(formData.get('gig_id'));
  const status = String(formData.get('status') || 'approved');
  const note = String(formData.get('admin_note') || '');

  db.prepare('UPDATE gigs SET status=?, admin_note=?, needs_review=0, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, note, gigId);
  redirect(String(formData.get('return_to') || '/admin'));
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
