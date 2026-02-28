import { ChevronLeft, Bell } from 'lucide-react';
import Link from 'next/link';

interface AppTopBarProps {
  title: string;
  backHref?: string;
}

export default function AppTopBar({ title, backHref }: AppTopBarProps) {
  return (
    <header className="sticky top-0 z-10 mb-4 flex min-h-12 items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-bg)]/85 px-1 backdrop-blur">
      {backHref ? (
        <Link href={backHref} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)]" aria-label="Go back">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="w-11" />
      )}
      <h1 className="text-sm font-semibold">{title}</h1>
      <Link href="/notifications" aria-label="Notifications" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-[var(--color-text-secondary)]">
        <Bell className="h-5 w-5" />
      </Link>
    </header>
  );
}
