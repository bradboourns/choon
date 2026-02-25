import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = db.prepare('SELECT display_name, bio, location FROM user_profiles WHERE user_id = ?').get(session.id) as
    | { display_name: string; bio: string; location: string }
    | undefined;

  return (
    <div className='space-y-5'>
      <h1 className='text-3xl font-bold'>Settings</h1>
      <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Account</h2>
        <p className='mt-2 text-zinc-300'>Username: {session.username}</p>
        <p className='text-zinc-300'>Role: {session.role}</p>
      </section>
      <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Profile snapshot</h2>
        <p className='mt-2 text-zinc-300'>Display name: {profile?.display_name || 'Not set'}</p>
        <p className='text-zinc-300'>Location: {profile?.location || 'Gold Coast'}</p>
        <p className='text-zinc-300'>Bio: {profile?.bio || 'No bio yet.'}</p>
      </section>
      <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Notifications</h2>
        <p className='mt-2 text-zinc-300'>In-app updates are enabled for saved gigs and moderation alerts.</p>
      </section>
    </div>
  );
}
