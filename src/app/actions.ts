'use server';

import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { getSession, register, signIn, signOut } from '@/lib/auth';

export async function registerAction(formData: FormData) {
  const ok = await register(String(formData.get('email')), String(formData.get('password')), String(formData.get('role') || 'user'));
  if (!ok) redirect('/register');
  await signIn(String(formData.get('email')), String(formData.get('password')));
  redirect('/');
}

export async function loginAction(formData: FormData) {
  const user = await signIn(String(formData.get('email')), String(formData.get('password')));
  if (!user) redirect('/login');
  redirect('/');
}

export async function quickLoginAction(formData: FormData) {
  const user = await signIn(String(formData.get('profile')), 'password');
  if (!user) redirect('/login');
  redirect('/');
}

export async function logoutAction() { await signOut(); redirect('/'); }

export async function createGigAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');
  const genres = formData.getAll('genres');
  const vibes = formData.getAll('vibe_tags');
  db.prepare(`INSERT INTO gigs (venue_id,artist_name,date,start_time,end_time,price_type,ticket_url,description,genres,vibe_tags,poster_url,status,created_by_user_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    Number(formData.get('venue_id')),
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
    'pending',
    session.id,
  );
  redirect('/my-gigs');
}

export async function updateGigAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/login');
  db.prepare('UPDATE gigs SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND created_by_user_id=?').run(String(formData.get('status')), Number(formData.get('gig_id')), session.id);
  redirect('/my-gigs');
}
