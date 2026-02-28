import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function VenueCreatePage() {
  return <ScreenTemplate title="Create event"><Card><div className="space-y-2"><Input placeholder="Event name" /><Input placeholder="Date" /><Input placeholder="Door price" /></div></Card><Button>Create event</Button></ScreenTemplate>;
}
