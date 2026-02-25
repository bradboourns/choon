'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { logoutAction } from '@/app/actions';

export default function AccountMenu({ canPostGig, isVenueAdmin }: { canPostGig: boolean; isVenueAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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

    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 8000);

    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [open]);

  return (
    <div ref={containerRef} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((current) => !current)}
        className='rounded-full border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900'
      >
        Account
      </button>
      {open && (
        <div className='absolute right-0 mt-2 min-w-44 rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl'>
          <Link onClick={() => setOpen(false)} href='/dashboard' className='block rounded-lg px-3 py-2 text-left hover:bg-zinc-800'>Dashboard</Link>
          <Link onClick={() => setOpen(false)} href='/analytics' className='block rounded-lg px-3 py-2 text-left hover:bg-zinc-800'>Analytics</Link>
          <Link onClick={() => setOpen(false)} href='/settings' className='block rounded-lg px-3 py-2 text-left hover:bg-zinc-800'>Settings</Link>
          {canPostGig && <Link onClick={() => setOpen(false)} href='/create-gig' className='block rounded-lg px-3 py-2 text-left hover:bg-zinc-800'>Post gig</Link>}
          {isVenueAdmin && <Link onClick={() => setOpen(false)} href='/request-venue' className='block rounded-lg px-3 py-2 text-left hover:bg-zinc-800'>Request venue</Link>}
          <form action={logoutAction}>
            <button className='w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-800'>Log out</button>
          </form>
        </div>
      )}
    </div>
  );
}
