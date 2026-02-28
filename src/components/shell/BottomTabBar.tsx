'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Search, Map, Bookmark, UserRound, LayoutDashboard, CalendarDays, PlusCircle, MessageCircle, Calendar, ListMusic, Building2 } from 'lucide-react';
import type { TabItem } from './types';

interface BottomTabBarProps {
  items: TabItem[];
}

const iconMap = {
  home: House,
  search: Search,
  map: Map,
  saved: Bookmark,
  profile: UserRound,
  dashboard: LayoutDashboard,
  shows: CalendarDays,
  post: PlusCircle,
  messages: MessageCircle,
  calendar: Calendar,
  lineups: ListMusic,
  create: PlusCircle,
  venue: Building2,
};

export default function BottomTabBar({ items }: BottomTabBarProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Bottom tabs" className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[640px] border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-2 pb-[calc(var(--space-2)+var(--safe-bottom))] backdrop-blur">
      <div className="grid grid-cols-5 gap-1 pt-2">
        {items.map(({ href, label, icon }) => {
          const Icon = iconMap[icon];
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] text-[10px] transition active:scale-[0.98] ${active ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
