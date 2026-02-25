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
    artist: 'Artist',
    venue_admin: 'Venue',
    user: 'Music fan',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/choon-logo.svg" alt="Choon" width={40} height={40} priority className="h-10 w-10 shrink-0 rounded-md" />
              <span className="text-3xl font-black tracking-tight">choon</span>
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
              {session && (
                <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400" title="Current account type">
                  {roleLabel[session.role] || 'Member'}
                </span>
              )}
              {session?.role === 'user' && <Link href="/" className="rounded-full border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">Find choons</Link>}
              {session ? (
                <AccountMenu canPostGig={canPostGig} isVenueAdmin={session.role === 'venue_admin'} />
              ) : (
                <>
                  <Link href="/login" className="rounded-full border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">Log in</Link>
                  <Link href="/register" className="rounded-full bg-violet-600 px-3 py-1.5 font-semibold text-white hover:bg-violet-500">Create account</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
