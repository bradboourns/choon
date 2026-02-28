import ScreenTemplate from '@/components/shell/ScreenTemplate';
import StateCard from '@/components/ui/StateCard';

export default function VenueInsightsPage() {
  return <ScreenTemplate title="Insights" backHref="/venue-admin/calendar"><StateCard state="empty" title="No data yet" body="Insights will appear after your first published event." /></ScreenTemplate>;
}
