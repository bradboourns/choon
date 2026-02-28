import type { ReactNode } from 'react';
import BottomTabBar from '@/components/shell/BottomTabBar';
import type { TabItem } from '@/components/shell/types';

const tabs = [
  { href: '/artist/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/artist/shows', label: 'Shows', icon: 'shows' },
  { href: '/artist/post', label: 'Post', icon: 'post' },
  { href: '/artist/messages', label: 'Messages', icon: 'messages' },
  { href: '/artist/profile', label: 'Profile', icon: 'profile' },
] satisfies TabItem[];

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      {children}
      <BottomTabBar items={tabs} />
    </div>
  );
}
