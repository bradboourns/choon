'use client';

import { useMemo, useState } from 'react';
import { registerAction } from '../actions';
import Link from 'next/link';

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

    {venueRoleSelected && <div className='space-y-2 rounded border border-zinc-800 p-3'>
      <p className='text-sm font-semibold'>Venue details</p>
      <input name='venue_name' required placeholder='Venue name' className='w-full rounded bg-zinc-900 p-2' />
      <input name='abn' required placeholder='ABN' className='w-full rounded bg-zinc-900 p-2' />
      <input name='address' required placeholder='Street address' className='w-full rounded bg-zinc-900 p-2' />
      <div className='grid grid-cols-2 gap-2'>
        <input name='suburb' required placeholder='Suburb' className='rounded bg-zinc-900 p-2' />
        <input name='postcode' required placeholder='Postcode' className='rounded bg-zinc-900 p-2' />
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <input name='city' defaultValue='Gold Coast' required placeholder='City' className='rounded bg-zinc-900 p-2' />
        <input name='state' defaultValue='QLD' required placeholder='State' className='rounded bg-zinc-900 p-2' />
      </div>
      <input name='website' placeholder='Website (optional)' className='w-full rounded bg-zinc-900 p-2' />
      <input name='instagram' placeholder='Instagram handle (optional)' className='w-full rounded bg-zinc-900 p-2' />
      <textarea name='notes' placeholder='Notes for admin (optional)' className='w-full rounded bg-zinc-900 p-2' />
      <p className='text-xs text-zinc-400'>Submitting this form also sends your venue request to admin for review.</p>
    </div>}

    <button className='rounded bg-violet-600 p-2'>Create account</button>
    <Link href='/login' className='text-sm underline'>Already got an account?</Link>
  </form>;
}
