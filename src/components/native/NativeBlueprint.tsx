'use client';

import { useMemo, useState } from 'react';
import tokens from '@/design/tokens.json';

type Role = 'fan' | 'artist' | 'venue';
type StateTone = 'loading' | 'empty' | 'error' | 'offline';

type IconName =
  | 'home' | 'search' | 'map' | 'saved' | 'profile' | 'ticket' | 'calendar' | 'location' | 'filter' | 'share'
  | 'bookmark' | 'message' | 'notification' | 'add' | 'settings' | 'close' | 'more';

const iconPaths: Record<IconName, string> = {
  home: 'M4 11 12 4l8 7v9H4z M9 20v-6h6v6', search: 'm20 20-4.2-4.2 M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
  map: 'M3 6.2 9 4l6 2 6-2v13.8L15 20l-6-2-6 2z M9 4v14 M15 6v14', saved: 'M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 20a8 8 0 0 1 16 0', ticket: 'M3 10V7a2 2 0 0 1 2-2h14v3a2 2 0 0 0 0 4v3H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z',
  calendar: 'M4 8h16 M7 3v3 M17 3v3 M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z', location: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z M12 10h.01',
  filter: 'M4 6h16 M7 12h10 M10 18h4', share: 'M16 8a3 3 0 1 0-2.7-4.3l-5.4 2.7a3 3 0 1 0 0 7.2l5.4 2.7A3 3 0 1 0 15 14',
  bookmark: 'M8 3h8a1 1 0 0 1 1 1v17l-5-3-5 3V4a1 1 0 0 1 1-1Z', message: 'M4 6h16v10H8l-4 4z', notification: 'M6 9a6 6 0 1 1 12 0v5l2 2H4l2-2z M10 20a2 2 0 0 0 4 0',
  add: 'M12 5v14 M5 12h14', settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M19 12l2-1-1-3-2 .2a7 7 0 0 0-1.5-1.5l.2-2-3-1-1 2a7 7 0 0 0-2 0l-1-2-3 1 .2 2A7 7 0 0 0 6.6 7L4.7 6.8 3.7 9.7l2 1a7 7 0 0 0 0 2l-2 1 1 3 1.9-.2a7 7 0 0 0 1.5 1.5l-.2 2 3 1 1-2a7 7 0 0 0 2 0l1 2 3-1-.2-2a7 7 0 0 0 1.5-1.5l2 .2 1-3-2-1a7 7 0 0 0 0-2Z',
  close: 'M6 6l12 12 M18 6 6 18', more: 'M5 12h.01 M12 12h.01 M19 12h.01'
};

function Icon({ name }: { name: IconName }) {
  return <svg aria-hidden viewBox="0 0 24 24" className="cb-icon"><path d={iconPaths[name]} /></svg>;
}

function Button({ label, tone = 'primary', loading }: { label: string; tone?: 'primary' | 'secondary' | 'ghost' | 'destructive'; loading?: boolean }) {
  return <button aria-label={label} className={`cb-btn cb-btn-${tone}`}>{loading ? 'Loading…' : label}</button>;
}

function ToneState({ tone }: { tone: StateTone }) {
  const copy = {
    loading: { title: 'Syncing fresh gigs', text: 'Pull to refresh keeps your queue current.', cta: 'Loading…' },
    empty: { title: 'No events in this filter', text: 'Try nearby suburbs or switch to map mode.', cta: 'Reset filters' },
    error: { title: 'Couldn’t load this view', text: 'Server timeout. Your saved plans are still safe.', cta: 'Try again' },
    offline: { title: 'You’re offline right now', text: 'Showing cached artists and your saved plans.', cta: 'Retry network' }
  }[tone];

  return <article className={`cb-state cb-${tone}`}><p>{copy.title}</p><small>{copy.text}</small><Button label={copy.cta} tone={tone === 'error' ? 'destructive' : 'secondary'} loading={tone === 'loading'} /></article>;
}

function ScreenSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="cb-screen"><header><h3>{title}</h3></header>{children}<div className="cb-states"><ToneState tone="loading" /><ToneState tone="empty" /><ToneState tone="error" /><ToneState tone="offline" /></div></section>;
}

export default function NativeBlueprint() {
  const [role, setRole] = useState<Role>('fan');
  const [tab, setTab] = useState(0);
  const nav = useMemo(() => ({
    fan: ['Home', 'Search', 'Map', 'Saved', 'Profile'],
    artist: ['Dashboard', 'Shows', 'Post', 'Messages', 'Profile'],
    venue: ['Calendar', 'Lineups', 'Create Event', 'Messages', 'Venue']
  }), []);

  return (
    <div className="cb-app">
      <header className="cb-topbar"><p>Choon Native Blueprint</p><div><Button label="Auth" tone="ghost" /><Button label="Settings" tone="secondary" /></div></header>

      <div className="cb-pills" role="tablist" aria-label="Account type switcher">{(['fan', 'artist', 'venue'] as Role[]).map((item) => <button key={item} className={`cb-pill ${role === item ? 'is-active' : ''}`} onClick={() => { setRole(item); setTab(0); }}>{item}</button>)}</div>

      <ScreenSection title="Onboarding + Authentication">
        <div className="cb-grid">
          <article className="cb-card"><h4>Choose account type</h4><p>Fan • Artist • Venue with location + genre preferences.</p><div className="cb-chip-row"><span>Indie</span><span>Funk</span><span>House</span></div></article>
          <article className="cb-card"><h4>Sign in</h4><p>Email, Apple, Google, Spotify with passkey option.</p><Button label="Continue with Apple" /><Button label="Email link" tone="secondary" /></article>
        </div>
      </ScreenSection>

      <ScreenSection title="Shared core screens">
        <div className="cb-grid">
          <article className="cb-event"><strong>Home feed event card</strong><p>Riverstage Sessions • Tonight 8:30 PM</p><small>2.1km • $28 • Alt-pop</small><div className="cb-chip-row"><span>Live now</span><span>Indoor</span><span>Friends going</span></div></article>
          <article className="cb-card"><h4>Search</h4><p>Recent terms, chips, map/list toggle, neighbourhood filters.</p><div className="cb-chip-row"><span>Under $40</span><span>This weekend</span><span>Near me</span></div></article>
          <article className="cb-card"><h4>Event detail</h4><p>Hero media, ticket CTA, lineup, venue info, share + bookmark.</p><div className="cb-actions"><Button label="Buy ticket" /><Button label="Share" tone="ghost" /></div></article>
          <article className="cb-card"><h4>Profiles + messaging</h4><p>Artist and venue pages, message list + thread, notifications, settings.</p><div className="cb-actions"><Button label="Follow" tone="secondary" /><Button label="Message" tone="ghost" /></div></article>
        </div>
      </ScreenSection>

      <ScreenSection title={`${role[0].toUpperCase()}${role.slice(1)} role screens`}>
        {role === 'fan' && <div className="cb-grid"><article className="cb-card"><h4>Saved events</h4><p>Offline cache + reminder badges.</p></article><article className="cb-card"><h4>Plans flow</h4><p>Invite friends, shared chat, add to calendar.</p></article><article className="cb-card"><h4>Ticket checkout</h4><p>Native sheet with Apple/Google Pay and backup web checkout.</p></article></div>}
        {role === 'artist' && <div className="cb-grid"><article className="cb-card"><h4>Post a show</h4><p>Step flow: details, pricing, media, publish.</p></article><article className="cb-card"><h4>Manage lineup</h4><p>Drag order, set durations, save drafts.</p></article><article className="cb-card"><h4>Insights</h4><p>Reach, saves, ticket conversion, fan cities.</p></article></div>}
        {role === 'venue' && <div className="cb-grid"><article className="cb-card"><h4>Calendar</h4><p>Month/list toggle without dashboard bloat.</p></article><article className="cb-card"><h4>Create event</h4><p>Venue templates + promoter assignment.</p></article><article className="cb-card"><h4>Analytics</h4><p>Capacity, ticket velocity, repeat attendance.</p></article></div>}
      </ScreenSection>

      <ScreenSection title="Reusable component library">
        <div className="cb-grid">
          <article className="cb-card"><h4>Buttons</h4><div className="cb-actions"><Button label="Primary" /><Button label="Secondary" tone="secondary" /><Button label="Ghost" tone="ghost" /><Button label="Delete" tone="destructive" /></div></article>
          <article className="cb-card"><h4>Inputs</h4><input aria-label="Text input" placeholder="Text input" /><input aria-label="Search input" placeholder="Search input" /><div className="cb-chip-row"><span>Multi</span><span>Select</span><span>Chips</span></div></article>
          <article className="cb-card"><h4>Navigation + feedback</h4><p>Top app bar, bottom tabs, modal sheet, toast/snackbar, back button, floating CTA.</p><div className="cb-chip-row"><span>Badge</span><span>Avatar</span><span>Tag</span><span>Filter</span><span>Icon button</span></div></article>
        </div>
      </ScreenSection>

      <ScreenSection title="Deliverables: interaction, navigation, responsive, icon guide">
        <div className="cb-grid">
          <article className="cb-card"><h4>Interaction spec</h4><p>Tap feedback 200ms, save/follow 260ms, page transitions 260ms, bottom-sheet and toast 320ms, pull-to-refresh dampened spring.</p></article>
          <article className="cb-card"><h4>Navigation diagram</h4><p>{`App Shell → (${nav[role].join(' → ')})`} with thread/event detail as pushed routes.</p></article>
          <article className="cb-card"><h4>Responsive behaviour</h4><p>Mobile single-column up to 600px, centered tablet/desktop rail up to 960px, optional side filters beyond 1024px while preserving IA.</p></article>
          <article className="cb-card"><h4>Icon usage guide</h4><p>Single 24px stroke icon family (1.8 stroke), consistent outline style, ARIA labels on actionable icons, no mixed fill styles.</p><div className="cb-icons">{(Object.keys(iconPaths) as IconName[]).map((name) => <span key={name}><Icon name={name} />{name}</span>)}</div></article>
          <article className="cb-card cb-code"><h4>Design tokens (JSON)</h4><pre>{JSON.stringify(tokens, null, 2)}</pre></article>
        </div>
      </ScreenSection>

      <nav className="cb-bottom" aria-label="Primary">
        {nav[role].map((label, idx) => <button key={label} onClick={() => setTab(idx)} className={tab === idx ? 'is-active' : ''}><Icon name={(['home','search','map','saved','profile'] as IconName[])[idx] || 'more'} /><span>{label}</span></button>)}
      </nav>
    </div>
  );
}
