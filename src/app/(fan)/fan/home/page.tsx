import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StateCard from '@/components/ui/StateCard';

export default function FanHomePage() {
  return (
    <ScreenTemplate title="Home">
      <Card>
        <h2 className="text-lg font-semibold">Tonight in Gold Coast</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Who · Where · When · Price · Vibe are surfaced within first card fold.</p>
        <Button className="mt-3">Get tickets</Button>
      </Card>
      <StateCard state="loading" title="Personalized feed" body="Building your recommendations from follows, plans, and venue trends." />
    </ScreenTemplate>
  );
}
