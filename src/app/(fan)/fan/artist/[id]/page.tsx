import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ArtistProfilePage() {
  return (
    <ScreenTemplate title="Artist" backHref="/fan/search">
      <Card><h2 className="text-lg font-semibold">LUCIA</h2><p className="text-sm text-[var(--color-text-secondary)]">Media clips, upcoming gigs, fan affinity data.</p></Card>
      <Button>Follow artist</Button>
    </ScreenTemplate>
  );
}
