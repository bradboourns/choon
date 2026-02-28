import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';

export default function VenueCalendarPage() {
  return <ScreenTemplate title="Calendar"><Tabs items={['List', 'Month']} active="List" renderPanel={<Card><p className="text-sm text-[var(--color-text-secondary)]">Venue calendar with conflict and capacity indicators.</p></Card>} /></ScreenTemplate>;
}
