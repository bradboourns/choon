import ScreenTemplate from '@/components/shell/ScreenTemplate';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AuthPage() {
  return (
    <ScreenTemplate title="Sign in" backHref="/fan/onboarding">
      <Card>
        <div className="space-y-2"><Input placeholder="Email" type="email" /><Button>Continue with email</Button></div>
      </Card>
      <Button variant="secondary">Continue with Apple</Button>
      <Button variant="secondary">Continue with Google</Button>
    </ScreenTemplate>
  );
}
