import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';

export default function FanSavedPage() {
  return (
    <ScreenTemplate title="Saved">
      <Tabs items={['Events', 'Artists', 'Venues', 'Plans']} active="Events" renderPanel={<Card><p className="text-sm text-[var(--color-text-secondary)]">No saved events yet. Tap bookmark on any listing.</p></Card>} />
    </ScreenTemplate>
  );
}
