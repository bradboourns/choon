import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import StateCard from '@/components/ui/StateCard';

export default function ArtistDashboardPage() {
  return (
    <ScreenTemplate title="Artist dashboard">
      <Card><h2 className="text-base font-semibold">Follower growth + ticket referrals</h2><p className="text-sm text-[var(--color-text-secondary)]">Fast glance KPIs tailored for mobile.</p></Card>
      <StateCard state="error" title="Insights unavailable" body="We could not sync analytics right now." />
    </ScreenTemplate>
  );
}
