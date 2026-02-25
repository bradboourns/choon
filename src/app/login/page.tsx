import { loginAction } from '../actions';

const adminProfiles = ['admin', 'venue', 'fan', 'artist'];

export default function LoginPage() {
  return (
    <form action={loginAction} className='mx-auto flex max-w-md flex-col gap-3 rounded-xl border border-zinc-700 p-4'>
      <h1 className='text-2xl font-bold'>Log in</h1>
      <p className='text-sm text-zinc-400'>Use your email to log in. For admin profiles you can also use: admin, venue, fan, artist.</p>
      <input name='email' type='text' required placeholder='Email or admin profile' className='rounded bg-zinc-900 p-2' />
      <input name='password' type='password' required placeholder='Password' className='rounded bg-zinc-900 p-2' />
      <button className='rounded bg-violet-600 p-2'>Log in</button>
      <div className='pt-2'>
        <p className='text-xs uppercase tracking-wide text-zinc-500'>Quick admin logins</p>
        <div className='mt-2 flex flex-wrap gap-2'>
          {adminProfiles.map((profile) => (
            <button key={profile} type='submit' name='email' value={profile} className='rounded-full border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900'>
              {profile}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
