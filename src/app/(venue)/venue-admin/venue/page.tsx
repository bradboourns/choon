import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';

export default function VenueProfileAdminPage() {
  return <ScreenTemplate title="Venue profile"><Card><p className="text-sm text-[var(--color-text-secondary)]">Manage photos, address, accessibility attributes, and featured events.</p></Card></ScreenTemplate>;
}
