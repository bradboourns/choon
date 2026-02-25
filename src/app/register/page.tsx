import { registerAction } from '../actions';
import Link from 'next/link';

export default function RegisterPage() {
  return <form action={registerAction} className='mx-auto flex max-w-sm flex-col gap-3 rounded-xl border border-zinc-700 p-4'>
    <h1 className='text-2xl font-bold'>Join Choon</h1>
    <input name='username' type='text' required placeholder='Unique username' className='rounded bg-zinc-900 p-2'/>
    <input name='password' type='password' required placeholder='Password' className='rounded bg-zinc-900 p-2'/>
    <select name='role' className='rounded bg-zinc-900 p-2'><option value='user'>Music fan</option><option value='artist'>Artist</option><option value='venue_admin'>Venue admin</option></select>
    <p className='text-xs text-zinc-400'>No email needed. Just pick a unique username.</p>
    <button className='rounded bg-violet-600 p-2'>Create account</button>
    <Link href='/login' className='text-sm underline'>Already got an account?</Link>
  </form>;
}
