import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';

export default function ArtistProfilePage() {
  return <ScreenTemplate title="Profile"><Card><p className="text-sm text-[var(--color-text-secondary)]">Media clips, bio, socials, and booking CTA.</p></Card></ScreenTemplate>;
}
