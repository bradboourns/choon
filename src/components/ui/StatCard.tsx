import Card from './Card';

export default function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card variant='muted' className='rounded-2xl p-4'>
      <p className='text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]'>{label}</p>
      <p className='mt-2 text-3xl font-semibold leading-none'>{value}</p>
      {hint && <p className='mt-2 text-xs text-[var(--text-muted)]'>{hint}</p>}
    </Card>
  );
}
