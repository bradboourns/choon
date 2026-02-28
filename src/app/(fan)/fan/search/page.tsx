import ScreenTemplate from '@/components/shell/ScreenTemplate';
import SearchBar from '@/components/ui/SearchBar';
import Chip from '@/components/ui/Chip';
import Card from '@/components/ui/Card';

export default function FanSearchPage() {
  return (
    <ScreenTemplate title="Search">
      <SearchBar />
      <div className="flex gap-2 overflow-x-auto">
        <Chip active>Tonight</Chip><Chip>Free entry</Chip><Chip>Indie</Chip><Chip>Near me</Chip>
      </div>
      <Card><p className="text-sm text-[var(--color-text-secondary)]">Recent: The Triffid, LUCIA, Jazz @ Miami Marketta</p></Card>
    </ScreenTemplate>
  );
}
