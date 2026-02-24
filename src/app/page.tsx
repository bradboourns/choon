import HomeFeed from '@/components/HomeFeed';
import { getGigs } from '@/lib/data';

export default function Home() {
  const gigs = getGigs();
  return <HomeFeed initial={gigs} />;
}
