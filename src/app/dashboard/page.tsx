import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const roleLabel: Record<string, string> = {
  admin: 'Platform admin',
  artist: 'Artist',
  venue_admin: 'Venue admin',
  user: 'Music fan',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Dashboard</h1>
      <p className='text-zinc-300'>Welcome back. You are signed in as <span className='font-semibold'>{roleLabel[session.role] || 'Member'}</span>.</p>
      <div className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <p className='text-zinc-200'>This is the starting point for account tools. We&apos;ll continue to expand this with more shortcuts over time.</p>
      </div>
    </div>
  );
}
