import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function PlanFlowPage() {
  return (
    <ScreenTemplate title="Plan flow" backHref="/fan/saved">
      <Card><p className="text-sm text-[var(--color-text-secondary)]">Invite friends, share link, add to calendar in one sheet-first flow.</p></Card>
      <Button>Invite and share</Button>
    </ScreenTemplate>
  );
}
