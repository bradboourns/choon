import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ArtistPostPage() {
  return (
    <ScreenTemplate title="Post a show">
      <Card><div className="space-y-2"><Input placeholder="Show title" /><Input placeholder="Venue" /><Input placeholder="Date + Time" /><Input placeholder="Price" /></div></Card>
      <Button>Publish show</Button>
    </ScreenTemplate>
  );
}
