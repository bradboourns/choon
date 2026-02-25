import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = await req.formData();
  const venueId = Number(data.get('venue_id'));
  const follow = String(data.get('follow') || '1') === '1';
  const redirectTo = String(data.get('redirect_to') || '/');

  if (!venueId) redirect(redirectTo);

  if (follow) {
    db.prepare('INSERT OR IGNORE INTO venue_follows (user_id, venue_id) VALUES (?, ?)').run(session.id, venueId);
  } else {
    db.prepare('DELETE FROM venue_follows WHERE user_id = ? AND venue_id = ?').run(session.id, venueId);
  }

  redirect(redirectTo);
}
