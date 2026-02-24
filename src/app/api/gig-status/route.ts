import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');
  const data = await req.formData();
  db.prepare('UPDATE gigs SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(String(data.get('status')), Number(data.get('gig_id')));
  redirect('/admin');
}
