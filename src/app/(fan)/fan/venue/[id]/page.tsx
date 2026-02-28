import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';

export default function VenueProfilePage() {
  return (
    <ScreenTemplate title="Venue" backHref="/fan/map">
      <Card><h2 className="text-lg font-semibold">The Triffid</h2><p className="text-sm text-[var(--color-text-secondary)]">Photos, accessibility notes, address, upcoming events.</p></Card>
    </ScreenTemplate>
  );
}
