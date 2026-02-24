import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) redirect('/login');
  const data = await req.formData();
  db.prepare('INSERT OR IGNORE INTO saved_gigs (user_id,gig_id) VALUES (?,?)').run(session.id, Number(data.get('gig_id')));
  redirect('/saved');
}
