import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className='space-y-4'>
      <h1 className='text-3xl font-bold'>Analytics</h1>
      <div className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <p className='text-zinc-300'>Analytics is coming soon. We&apos;ll use this area for audience growth, gig performance, and engagement insights.</p>
      </div>
    </div>
  );
}
