import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function TicketFlowPage() {
  return (
    <ScreenTemplate title="Ticket options" backHref="/fan/event/1">
      <Card><p className="text-sm text-[var(--color-text-secondary)]">CTA hierarchy: Primary ticket partner, secondary alternatives, then reminders.</p></Card>
      <Button>Open primary ticket partner</Button>
      <Button variant="secondary">Compare options</Button>
    </ScreenTemplate>
  );
}
