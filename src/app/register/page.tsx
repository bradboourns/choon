'use client';

import { useMemo, useState } from 'react';
import { registerAction } from '../actions';
import Link from 'next/link';
import VenueDetailsFields from '@/components/VenueDetailsFields';

export default function RegisterPage() {
  const [role, setRole] = useState('user');
  const venueRoleSelected = useMemo(() => role === 'venue_admin', [role]);

  return <form action={registerAction} className='mx-auto flex max-w-xl flex-col gap-3 rounded-xl border border-zinc-700 p-4'>
    <h1 className='text-2xl font-bold'>Join Choon</h1>
    <input name='email' type='email' required placeholder='Email address' className='rounded bg-zinc-900 p-2' />
    <input name='password' type='password' minLength={8} required placeholder='Password (min 8 chars)' className='rounded bg-zinc-900 p-2' />
    <input name='confirm_password' type='password' minLength={8} required placeholder='Confirm password' className='rounded bg-zinc-900 p-2' />
    <select name='role' value={role} onChange={(event) => setRole(event.target.value)} className='rounded bg-zinc-900 p-2'>
      <option value='user'>Music fan</option>
      <option value='artist'>Artist</option>
      <option value='venue_admin'>Venue admin</option>
    </select>

    {venueRoleSelected && <>
      <VenueDetailsFields showContainer/>
      <p className='text-xs text-zinc-400'>Submitting this form also sends your venue request to admin for review.</p>
    </>}

    <button className='rounded bg-violet-600 p-2'>Create account</button>
    <Link href='/login' className='text-sm underline'>Already got an account?</Link>
  </form>;
}
