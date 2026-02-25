import { redirect } from 'next/navigation';
import HomeFeed from '@/components/HomeFeed';
import { getSession } from '@/lib/auth';
import { getGigs } from '@/lib/data';

export default async function Home() {
  const session = await getSession();
  if (session?.role === 'admin') redirect('/dashboard');

  const gigs = getGigs();
  return <HomeFeed initial={gigs} />;
}
