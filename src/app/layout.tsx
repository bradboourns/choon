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
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/choon-logo.svg" alt="Choon" width={40} height={40} priority className="h-10 w-10 shrink-0 rounded-md" />
              <span className="text-3xl font-black tracking-tight">choon</span>
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
              <Link href="/create-gig" className="rounded-full border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">Post gig</Link>
              <Link href="/saved" className="rounded-full border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">Saved</Link>
              {session?.role === 'admin' && <Link href="/admin" className="rounded-full border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">Admin</Link>}
              {session ? (
                <form action={logoutAction}>
                  <button className="rounded-full border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900">Log out</button>
                </form>
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
