import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import { logoutAction } from './actions';

export const metadata: Metadata = { title: 'Choon | Live Music Near You', description: 'Find live gigs near you.' };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/choon-logo.svg" alt="Choon" width={132} height={40} priority className="h-10 w-auto" />
            </Link>
            <div className="flex gap-3 text-sm">
              <Link href="/create-gig">Post gig</Link>
              <Link href="/saved">Saved</Link>
              {session?.role === 'admin' && <Link href="/admin">Admin</Link>}
              {session ? <form action={logoutAction}><button>Log out</button></form> : <Link href="/login">Log in</Link>}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
