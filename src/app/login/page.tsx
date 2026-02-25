import db from '@/lib/db';
import { loginAction, quickLoginAction } from '../actions';

export default function LoginPage() {
  const quickProfiles = db.prepare(`SELECT username, role FROM users WHERE username IS NOT NULL AND username != '' ORDER BY created_at ASC, id ASC`).all() as Array<{ username: string; role: string }>;

  return (
    <div className='mx-auto flex max-w-md flex-col gap-4 rounded-xl border border-zinc-700 p-4'>
      <form action={loginAction} className='flex flex-col gap-3'>
        <h1 className='text-2xl font-bold'>Log in</h1>
        <p className='text-sm text-zinc-400'>Use your email or username and password.</p>
        <input name='username' type='text' required placeholder='Email or username' className='rounded bg-zinc-900 p-2' />
        <input name='password' type='password' required placeholder='Password' className='rounded bg-zinc-900 p-2' />
        <button className='rounded bg-violet-600 p-2'>Log in</button>
      </form>

      <div className='border-t border-zinc-800 pt-3'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Quick test logins</p>
        <div className='mt-2 flex flex-wrap gap-2'>
          {quickProfiles.map((profile) => (
            <form key={profile.username} action={quickLoginAction}>
              <input type='hidden' name='profile' value={profile.username} />
              <button type='submit' className='rounded-full border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900'>
                {profile.username} · {profile.role}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
