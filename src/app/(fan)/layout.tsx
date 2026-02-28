import type { ReactNode } from 'react';
import BottomTabBar from '@/components/shell/BottomTabBar';
import type { TabItem } from '@/components/shell/types';

const fanTabs = [
  { href: '/fan/home', label: 'Home', icon: 'home' },
  { href: '/fan/search', label: 'Search', icon: 'search' },
  { href: '/fan/map', label: 'Map', icon: 'map' },
  { href: '/fan/saved', label: 'Saved', icon: 'saved' },
  { href: '/fan/profile', label: 'Profile', icon: 'profile' },
] satisfies TabItem[];

export default function FanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      {children}
      <BottomTabBar items={fanTabs} />
    </div>
  );
}
