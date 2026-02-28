import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Landing() {
  return (
    <main className="app-shell app-content page-transition space-y-4">
      <Card>
        <p className="text-xs text-[var(--color-text-secondary)]">Choon beta</p>
        <h1 className="mt-2 text-2xl font-bold">Live music discovery, built for mobile-first flow.</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Choose a native-like account experience.</p>
      </Card>
      <Link href="/fan/onboarding"><Button>Fan onboarding</Button></Link>
      <Link href="/artist/dashboard"><Button variant="secondary">Artist dashboard</Button></Link>
      <Link href="/venue-admin/calendar"><Button variant="secondary">Venue calendar</Button></Link>
      <Link href="/docs/mobile-architecture"><Button variant="ghost">Architecture output</Button></Link>
    </main>
  );
}
