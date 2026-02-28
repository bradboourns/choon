import ScreenTemplate from '@/components/shell/ScreenTemplate';
import ListRow from '@/components/ui/ListRow';

export default function FanSettingsPage() {
  return (
    <ScreenTemplate title="Settings" backHref="/fan/profile">
      <div className="space-y-2"><ListRow title="Account" /><ListRow title="Accessibility" /><ListRow title="Privacy" /><ListRow title="Offline downloads" /></div>
    </ScreenTemplate>
  );
}
