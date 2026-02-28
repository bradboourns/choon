import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';

export default function FanMapPage() {
  return (
    <ScreenTemplate title="Map">
      <Card>
        <div className="h-64 rounded-[var(--radius-md)] bg-[var(--color-elevated)] p-3 text-sm text-[var(--color-text-secondary)]">Map preview with tappable venue pins and sheet-on-select behavior.</div>
      </Card>
    </ScreenTemplate>
  );
}
