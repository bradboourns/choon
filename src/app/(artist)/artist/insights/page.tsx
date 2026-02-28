import ScreenTemplate from '@/components/shell/ScreenTemplate';
import StateCard from '@/components/ui/StateCard';

export default function ArtistInsightsPage() {
  return <ScreenTemplate title="Insights" backHref="/artist/dashboard"><StateCard state="offline" title="Offline mode" body="Cached metrics from your last sync are shown." /></ScreenTemplate>;
}
