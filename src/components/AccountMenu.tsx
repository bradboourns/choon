'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { logoutAction } from '@/app/actions';

type RoleType = 'admin' | 'artist' | 'venue_admin' | 'user';

export default function AccountMenu({ canPostGig, isVenueAdmin, username, role }: { canPostGig: boolean; isVenueAdmin: boolean; username: string; role: RoleType }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      return;
    }

    closeTimeoutRef.current = setTimeout(() => setOpen(false), 8000);
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [open]);

  return (
    <div ref={containerRef} className='relative'>
      <button type='button' onClick={() => setOpen((current) => !current)} className='inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1.5 hover:border-violet-400/40'>
        <span className='grid h-7 w-7 place-items-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-100'>{username.slice(0, 1).toUpperCase()}</span>
        <span className='max-w-24 truncate text-sm'>{username}</span>
      </button>
      {open && (
        <div className='absolute right-0 mt-2 min-w-52 space-y-1 rounded-2xl border border-white/10 bg-[var(--surface-glass)] p-1.5 backdrop-blur-xl shadow-[var(--shadow-md)]'>
          <p className='px-3 pt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--text-tertiary)]'>Account</p>
          <Link onClick={() => setOpen(false)} href={`/profiles/${username}`} className='block rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5'>Profile</Link>
          <Link onClick={() => setOpen(false)} href='/dashboard' className='block rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5'>Dashboard</Link>
          {role !== 'user' && <Link onClick={() => setOpen(false)} href='/analytics' className='block rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5'>Analytics {role === 'admin' ? '(coming soon)' : '(beta)'}</Link>}
          <Link onClick={() => setOpen(false)} href='/settings' className='block rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5'>Settings</Link>
          {canPostGig && <Link onClick={() => setOpen(false)} href='/create-gig' className='block rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5'>Post gig</Link>}
          {isVenueAdmin && <Link onClick={() => setOpen(false)} href='/request-venue' className='block rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5'>Request venue</Link>}
          <div className='border-t border-white/10 pt-1'>
            <form action={logoutAction}><button className='w-full rounded-xl px-3 py-2 text-left text-sm text-rose-200 hover:bg-rose-500/15'>Log out</button></form>
          </div>
        </div>
      )}
    </div>
  );
}
