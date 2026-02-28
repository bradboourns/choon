import ScreenTemplate from '@/components/shell/ScreenTemplate';
import ListRow from '@/components/ui/ListRow';

export default function VenueLineupsPage() {
  return <ScreenTemplate title="Lineups"><div className="space-y-2"><ListRow title="Friday Electric" subtitle="4 artists confirmed" /><ListRow title="Sunday Jazz" subtitle="2 slots open" /></div></ScreenTemplate>;
}
