import Card from './Card';
import Button from './Button';

interface StateCardProps {
  state: 'loading' | 'empty' | 'error' | 'offline';
  title: string;
  body: string;
}

export default function StateCard({ state, title, body }: StateCardProps) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">{state}</p>
      <h3 className="mt-1 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{body}</p>
      {state !== 'loading' && <Button variant="secondary" className="mt-3">Retry</Button>}
      {state === 'loading' && <div className="mt-3 h-11 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-elevated)]" />}
    </Card>
  );
}
