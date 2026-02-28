import Card from '@/components/ui/Card';
import ScreenTemplate from '@/components/shell/ScreenTemplate';

const componentLibrary = [
  { name: 'Button', props: 'variant, loading, iconLeft, disabled, onClick' },
  { name: 'Tabs', props: 'items, active, renderPanel' },
  { name: 'Sheet', props: 'title, children' },
  { name: 'Toast', props: 'message' },
  { name: 'Card', props: 'children' },
  { name: 'ListRow', props: 'title, subtitle, leading, trailing' },
  { name: 'Avatar', props: 'name' },
  { name: 'Chip', props: 'active, onClick' },
  { name: 'Input', props: 'all native input props' },
  { name: 'SearchBar', props: 'placeholder' },
];

export default function MobileArchitectureDocPage() {
  return (
    <ScreenTemplate title="Implementation output" backHref="/">
      <Card>
        <h2 className="text-base font-semibold">App Router route structure</h2>
        <pre className="mt-2 overflow-x-auto text-xs text-[var(--color-text-secondary)]">{`src/app
├─ (fan)/fan/{home,search,map,saved,profile,onboarding,auth,event/[id],artist/[id],venue/[id],messages,notifications,settings,plan,tickets}
├─ (artist)/artist/{dashboard,shows,post,messages,profile,insights}
├─ (venue)/venue-admin/{calendar,lineups,create-event,messages,venue,insights}
└─ docs/mobile-architecture`}</pre>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Component library + props</h2>
        <ul className="mt-2 space-y-2 text-sm text-[var(--color-text-secondary)]">
          {componentLibrary.map((item) => (
            <li key={item.name}><span className="font-semibold text-white">{item.name}</span> — {item.props}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Design tokens</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">CSS variables in globals.css map to Tailwind arbitrary usage: colors (bg/surface/elevated/text/border/accent/success/warn/error), typography scale, 8pt spacing, radius, elevation, safe-area insets.</p>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Screen-by-screen implementation plan</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]">
          <li>Finish each account type tab set with production data fetching and optimistic interactions.</li>
          <li>Add loading.tsx, error.tsx, and offline caches per route group.</li>
          <li>Implement bottom-sheet modal routes for filters/share/tickets.</li>
          <li>Wire auth and onboarding profile creation to role-based redirects.</li>
          <li>Add notifications grouping/actions and messaging threads with real-time updates.</li>
        </ol>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Key Next.js patterns used</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]">
          <li>Route groups to separate fan/artist/venue shells while keeping clean URLs.</li>
          <li>Nested layouts for persistent bottom tab bars.</li>
          <li>Metadata + manifest route for installable PWA behavior.</li>
          <li>Client scroll restoration helper for native-like back navigation.</li>
          <li>Composable server/client components enabling React Native-friendly primitives.</li>
        </ul>
      </Card>
    </ScreenTemplate>
  );
}
