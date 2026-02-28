import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function EventDetailPage() {
  return (
    <ScreenTemplate title="Event details" backHref="/fan/home">
      <Card>
        <p className="text-xs text-[var(--color-text-secondary)]">WHERE · Miami Marketta</p>
        <h2 className="mt-1 text-lg font-semibold">Midnight Echoes + Luna Drift</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">WHEN Fri 8:30 PM · PRICE from $28 · VIBE Dream-pop, immersive visuals.</p>
      </Card>
      <div className="grid grid-cols-2 gap-2"><Button>Buy ticket</Button><Button variant="secondary">Share</Button></div>
    </ScreenTemplate>
  );
}
