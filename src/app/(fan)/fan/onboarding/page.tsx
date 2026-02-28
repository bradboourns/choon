import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function OnboardingPage() {
  return (
    <ScreenTemplate title="Onboarding">
      <Card>
        <h2 className="text-base font-semibold">Choose account type</h2>
        <div className="mt-3 grid gap-2"><Button>Fan</Button><Button variant="secondary">Artist</Button><Button variant="secondary">Venue</Button></div>
      </Card>
      <Card><h3 className="text-sm font-semibold">Location permission</h3><Input placeholder="Suburb or city" className="mt-2" /></Card>
      <Card><h3 className="text-sm font-semibold">Preferences</h3><p className="mt-1 text-sm text-[var(--color-text-secondary)]">Genres, price range, and vibe tuning.</p></Card>
    </ScreenTemplate>
  );
}
