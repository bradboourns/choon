import type { ReactNode } from 'react';
import BottomTabBar from '@/components/shell/BottomTabBar';
import type { TabItem } from '@/components/shell/types';

const tabs = [
  { href: '/venue-admin/calendar', label: 'Calendar', icon: 'calendar' },
  { href: '/venue-admin/lineups', label: 'Lineups', icon: 'lineups' },
  { href: '/venue-admin/create-event', label: 'Create', icon: 'create' },
  { href: '/venue-admin/messages', label: 'Messages', icon: 'messages' },
  { href: '/venue-admin/venue', label: 'Venue', icon: 'venue' },
] satisfies TabItem[];

export default function VenueLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      {children}
      <BottomTabBar items={tabs} />
    </div>
  );
}
