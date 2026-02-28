import ScreenTemplate from '@/components/shell/ScreenTemplate';
import ListRow from '@/components/ui/ListRow';
import Avatar from '@/components/ui/Avatar';

export default function FanMessagesPage() {
  return (
    <ScreenTemplate title="Messages" backHref="/fan/profile">
      <div className="space-y-2"><ListRow title="LUCIA" subtitle="Tickets drop in 20 mins" leading={<Avatar name="LUCIA" />} /><ListRow title="The Triffid" subtitle="Doors now at 8:15pm" leading={<Avatar name="The Triffid" />} /></div>
    </ScreenTemplate>
  );
}
