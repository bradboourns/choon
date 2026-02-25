import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = await req.formData();
  const artistId = Number(data.get('artist_id'));
  const follow = String(data.get('follow') || '1') === '1';
  const redirectTo = String(data.get('redirect_to') || '/');

  if (!artistId) redirect(redirectTo);

  if (follow) {
    db.prepare('INSERT OR IGNORE INTO artist_follows (user_id, artist_id) VALUES (?, ?)').run(session.id, artistId);
  } else {
    db.prepare('DELETE FROM artist_follows WHERE user_id = ? AND artist_id = ?').run(session.id, artistId);
  }

  redirect(redirectTo);
}
