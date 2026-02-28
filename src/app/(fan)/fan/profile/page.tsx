import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Avatar from '@/components/ui/Avatar';
import ListRow from '@/components/ui/ListRow';

export default function FanProfilePage() {
  return (
    <ScreenTemplate title="Profile">
      <div className="flex items-center gap-3"><Avatar name="Fan User" /><div><p className="text-sm font-semibold">Fan User</p><p className="text-xs text-[var(--color-text-secondary)]">Gold Coast</p></div></div>
      <div className="space-y-2"><ListRow title="Notifications" subtitle="Grouped and actionable" /><ListRow title="Settings" subtitle="Privacy, accessibility, account" /></div>
    </ScreenTemplate>
  );
}
