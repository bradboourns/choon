'use client';

import { useMemo, useState } from 'react';
import { registerAction } from '../actions';
import Link from 'next/link';
import VenueDetailsFields from '@/components/VenueDetailsFields';
import { useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const [role, setRole] = useState('user');
  const venueRoleSelected = useMemo(() => role === 'venue_admin', [role]);
  const fanRoleSelected = useMemo(() => role === 'user', [role]);
  const query = useSearchParams();
  const error = query.get('error');
  const intent = query.get('intent');

  return <form action={registerAction} className='mx-auto flex max-w-xl flex-col gap-3 rounded-xl border border-zinc-700 p-4'>
    <h1 className='text-2xl font-bold'>Join Choon</h1>
    {error === 'invalid-credentials' && <p className='rounded bg-amber-900/60 p-2 text-sm text-amber-100'>Please provide valid account details and matching passwords.</p>}
    {error === 'missing-fan-details' && <p className='rounded bg-amber-900/60 p-2 text-sm text-amber-100'>Fan signup requires first name, last name, DOB, username, and your city.</p>}
    {intent === 'interested' && <p className='rounded bg-violet-900/40 p-2 text-sm text-violet-100'>Create an account to mark gigs as interested or going. Searching and browsing stays free.</p>}
    {intent === 'follow-venue' && <p className='rounded bg-violet-900/40 p-2 text-sm text-violet-100'>Create an account to follow venues and keep track of places you like. Searching and browsing stays free.</p>}

    <input name='email' type='email' required placeholder='Email address' className='rounded bg-zinc-900 p-2' />
    <input name='username' type='text' required placeholder='Public username' className='rounded bg-zinc-900 p-2' />
    <input name='password' type='password' minLength={8} required placeholder='Password (min 8 chars)' className='rounded bg-zinc-900 p-2' />
    <input name='confirm_password' type='password' minLength={8} required placeholder='Confirm password' className='rounded bg-zinc-900 p-2' />
    <select name='role' value={role} onChange={(event) => setRole(event.target.value)} className='rounded bg-zinc-900 p-2'>
      <option value='user'>Music fan</option>
      <option value='artist'>Artist</option>
      <option value='venue_admin'>Venue management account</option>
    </select>

    {fanRoleSelected && <section className='space-y-2 rounded border border-zinc-800 bg-zinc-950/60 p-3'>
      <p className='text-sm font-semibold text-zinc-200'>Private fan details</p>
      <div className='grid gap-2 sm:grid-cols-2'>
        <input name='first_name' type='text' required={fanRoleSelected} placeholder='First name (private)' className='rounded bg-zinc-900 p-2' />
        <input name='last_name' type='text' required={fanRoleSelected} placeholder='Last name (private)' className='rounded bg-zinc-900 p-2' />
      </div>
      <input name='date_of_birth' type='date' required={fanRoleSelected} className='rounded bg-zinc-900 p-2' />
      <input name='home_city' type='text' required={fanRoleSelected} placeholder='Home city (used to default map/search)' className='rounded bg-zinc-900 p-2' />
      <p className='text-xs text-zinc-400'>Your name and DOB are private. Your username is public.</p>
    </section>}

    {venueRoleSelected && <>
      <VenueDetailsFields showContainer/>
      <p className='text-xs text-zinc-400'>Submitting this form also sends your venue request to admin for review.</p>
    </>}

    <button className='rounded bg-violet-600 p-2'>Create account</button>
    <Link href='/login' className='text-sm underline'>Already got an account?</Link>
  </form>;
}
