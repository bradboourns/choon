import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) redirect('/login');
  const data = await req.formData();
  db.prepare('INSERT INTO reports (gig_id,venue_id,reason,details,created_by_user_id) VALUES (?,?,?,?,?)').run(
    Number(data.get('gig_id') || 0) || null,
    Number(data.get('venue_id') || 0) || null,
    String(data.get('reason')),
    String(data.get('details') || ''),
    session.id,
  );
  redirect('/');
}
