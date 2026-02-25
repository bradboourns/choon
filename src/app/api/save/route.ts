import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) redirect('/login');
  const data = await req.formData();
  const gigId = Number(data.get('gig_id'));
  const action = String(data.get('action') || 'save');
  const redirectTo = String(data.get('redirect_to') || '/saved');

  if (!gigId) redirect(redirectTo);

  if (action === 'unsave') {
    db.prepare('DELETE FROM saved_gigs WHERE user_id = ? AND gig_id = ?').run(session.id, gigId);
  } else {
    db.prepare('INSERT OR IGNORE INTO saved_gigs (user_id,gig_id) VALUES (?,?)').run(session.id, gigId);
  }

  redirect(redirectTo);
}
