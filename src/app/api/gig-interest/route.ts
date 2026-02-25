import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = await req.formData();
  const gigId = Number(data.get('gig_id'));
  const status = String(data.get('status') || '');
  const redirectTo = String(data.get('redirect_to') || '/');

  if (!gigId || !['interested', 'going', 'none'].includes(status)) {
    redirect(redirectTo);
  }

  if (status === 'none') {
    db.prepare('DELETE FROM gig_interest WHERE user_id = ? AND gig_id = ?').run(session.id, gigId);
  } else {
    db.prepare(`INSERT INTO gig_interest (user_id, gig_id, status, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, gig_id)
      DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP`).run(session.id, gigId, status);
  }

  redirect(redirectTo);
}
