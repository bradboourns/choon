import ScreenTemplate from '@/components/shell/ScreenTemplate';
import ListRow from '@/components/ui/ListRow';

export default function ArtistShowsPage() {
  return <ScreenTemplate title="Shows"><div className="space-y-2"><ListRow title="Miami Marketta" subtitle="Fri 8:30 PM · Draft" /><ListRow title="The Triffid" subtitle="Sat 9:00 PM · Live" /></div></ScreenTemplate>;
}
