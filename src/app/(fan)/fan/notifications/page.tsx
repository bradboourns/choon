import ScreenTemplate from '@/components/shell/ScreenTemplate';
import ListRow from '@/components/ui/ListRow';

export default function NotificationsPage() {
  return (
    <ScreenTemplate title="Notifications" backHref="/fan/profile">
      <div className="space-y-2"><ListRow title="Plan updated" subtitle="3 friends confirmed Friday" /><ListRow title="Price drop" subtitle="Midnight Echoes now $24" /></div>
    </ScreenTemplate>
  );
}
