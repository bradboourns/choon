import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { updateArtistStatsVisibilityAction, updateProfileAction, updateTimeFormatAction } from '../actions';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = db.prepare('SELECT display_name, avatar_url, bio, location, time_format FROM user_profiles WHERE user_id = ?').get(session.id) as
    | { display_name: string; avatar_url: string; bio: string; location: string; time_format: '12h' | '24h' }
    | undefined;

  const artistSettings = session.role === 'artist'
    ? db.prepare('SELECT spotify_monthly_listeners, show_spotify_monthly_listeners FROM artists WHERE created_by_user_id = ?').get(session.id) as
      | { spotify_monthly_listeners: number; show_spotify_monthly_listeners: number }
      | undefined
    : undefined;

  return (
    <div className='space-y-5'>
      <h1 className='text-3xl font-bold'>Settings</h1>
      <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Account</h2>
        <p className='mt-2 text-zinc-300'>Username: {session.username}</p>
        <p className='text-zinc-300'>Role: {session.role}</p>
      </section>
      <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Profile details</h2>
        <p className='mt-2 text-sm text-zinc-400'>Keep this up to date as your music taste, city, or brand changes over time.</p>
        <form action={updateProfileAction} className='mt-3 grid gap-3 sm:max-w-2xl'>
          <label className='space-y-1 text-sm'>
            <span className='text-zinc-300'>Display name</span>
            <input name='display_name' defaultValue={profile?.display_name || ''} className='w-full rounded bg-zinc-800 px-3 py-2' />
          </label>
          <label className='space-y-1 text-sm'>
            <span className='text-zinc-300'>Profile picture URL</span>
            <input
              type='url'
              name='avatar_url'
              placeholder='https://...'
              defaultValue={profile?.avatar_url || ''}
              className='w-full rounded bg-zinc-800 px-3 py-2'
            />
          </label>
          <label className='space-y-1 text-sm'>
            <span className='text-zinc-300'>Location</span>
            <input name='location' defaultValue={profile?.location || ''} className='w-full rounded bg-zinc-800 px-3 py-2' />
          </label>
          <label className='space-y-1 text-sm'>
            <span className='text-zinc-300'>Bio</span>
            <textarea name='bio' rows={4} defaultValue={profile?.bio || ''} className='w-full rounded bg-zinc-800 px-3 py-2' />
          </label>
          <button className='w-fit rounded bg-violet-600 px-3 py-2 text-sm'>Save profile</button>
        </form>
      </section>
      <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Notifications</h2>
        <p className='mt-2 text-zinc-300'>In-app updates are enabled for saved gigs and moderation alerts.</p>
      </section>

      {session.role === 'artist' && <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Artist visibility</h2>
        <p className='mt-2 text-sm text-zinc-400'>Choose whether your Spotify monthly listeners appear on gig pages.</p>
        <form action={updateArtistStatsVisibilityAction} className='mt-3 grid gap-3 sm:max-w-md'>
          <label className='space-y-1 text-sm'>
            <span className='text-zinc-300'>Spotify monthly listeners</span>
            <input
              type='number'
              min='0'
              name='spotify_monthly_listeners'
              defaultValue={artistSettings?.spotify_monthly_listeners ?? 0}
              className='w-full rounded bg-zinc-800 px-3 py-2'
            />
          </label>
          <label className='inline-flex items-center gap-2 text-sm text-zinc-300'>
            <input type='checkbox' name='show_spotify_monthly_listeners' defaultChecked={Boolean(artistSettings?.show_spotify_monthly_listeners)} />
            Show this number publicly on gig pages
          </label>
          <button className='w-fit rounded bg-violet-600 px-3 py-2 text-sm'>Save artist settings</button>
        </form>
      </section>}
      <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
        <h2 className='text-lg font-semibold'>Time preferences</h2>
        <form action={updateTimeFormatAction} className='mt-3 flex items-center gap-3'>
          <select name='time_format' defaultValue={profile?.time_format || '12h'} className='rounded bg-zinc-800 px-3 py-2'>
            <option value='12h'>12-hour clock (default)</option>
            <option value='24h'>24-hour clock</option>
          </select>
          <button className='rounded bg-violet-600 px-3 py-2 text-sm'>Save</button>
        </form>
      </section>
    </div>
  );
}
