import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import AccountMenu from '@/components/AccountMenu';

export const metadata: Metadata = { title: 'Choon | Live Music Near You', description: 'Find live gigs near you.' };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const canPostGig = session?.role === 'artist' || session?.role === 'venue_admin';
  const roleLabel: Record<string, string> = {
    admin: 'Platform admin',
    artist: 'Artist (beta)',
    venue_admin: 'Venue (coming soon)',
    user: 'Music fan',
  };

  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <div className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.08),transparent_30%)]' />
        <header className='sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--surface-glass)]/90 backdrop-blur-xl'>
          <nav className='mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6'>
            <Link href='/' className='group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2'>
              <Image src='/choon-logo.svg' alt='Choon' width={40} height={40} priority className='h-9 w-9 shrink-0 rounded-xl' />
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]'>Live music near you</p>
                <p className='text-2xl font-black leading-none tracking-tight'>choon</p>
              </div>
            </Link>

            <div className='flex flex-wrap items-center justify-end gap-2 text-sm'>
              {session && (
                <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)]' title='Current account type'>
                  {roleLabel[session.role] || 'Member'}
                </span>
              )}
              {session?.role === 'user' && <Link href='/' className='rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2 hover:border-violet-400/30'>Find choons</Link>}
              {session?.role === 'user' && <Link href='/saved' className='inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2 hover:border-violet-400/30'><svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z' /></svg> Saved</Link>}
              {session ? (
                <AccountMenu canPostGig={canPostGig} isVenueAdmin={session.role === 'venue_admin'} username={session.username} role={session.role as 'admin' | 'artist' | 'venue_admin' | 'user'} />
              ) : (
                <>
                  <Link href='/login' className='rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2 hover:border-violet-400/30'>Log in</Link>
                  <Link href='/register' className='rounded-full bg-[var(--accent-primary)] px-4 py-2 font-semibold text-white shadow-[var(--shadow-glow)] hover:bg-violet-500'>Create account</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className='mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8'>{children}</main>
      </body>
    </html>
  );
}
