import Link from 'next/link';
import type { ReactNode } from 'react';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

type RoleType = 'admin' | 'artist' | 'venue_admin' | 'user';

const roleLabel: Record<RoleType, string> = {
  admin: 'Platform admin',
  artist: 'Artist',
  venue_admin: 'Venue',
  user: 'Fan',
};

const roleBadgeClass: Record<RoleType, string> = {
  admin: 'border-amber-400/50 bg-amber-500/10 text-amber-100',
  artist: 'border-violet-400/50 bg-violet-500/10 text-violet-100',
  venue_admin: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100',
  user: 'border-sky-400/50 bg-sky-500/10 text-sky-100',
};

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getSession();

  const account = db.prepare(`
    SELECT users.id, users.username, users.email, users.role, users.created_at,
      user_profiles.display_name, user_profiles.bio, user_profiles.location
    FROM users
    LEFT JOIN user_profiles ON user_profiles.user_id = users.id
    WHERE users.username = ?
  `).get(username) as {
    id: number;
    username: string;
    email: string;
    role: RoleType;
    created_at: string;
    display_name: string;
    bio: string;
    location: string;
  } | undefined;

  if (!account) return <p>Profile not found.</p>;

  const canViewEmail = session?.role === 'admin' || session?.username === account.username;
  const isOwner = session?.username === account.username;
  const displayName = account.display_name || account.username;
  const profileCompletion = [account.display_name, account.bio, account.location].filter(Boolean).length;
  const completionPercent = Math.round((profileCompletion / 3) * 100);

  const fanUpcoming = account.role === 'user'
    ? db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.date, gigs.start_time, venues.name venue_name, venues.suburb, venues.city, gig_interest.status
      FROM gig_interest
      JOIN gigs ON gigs.id = gig_interest.gig_id
      JOIN venues ON venues.id = gigs.venue_id
      WHERE gig_interest.user_id = ? AND gig_interest.status IN ('going', 'interested') AND gigs.status = 'approved' AND gigs.date >= date('now')
      ORDER BY gigs.date ASC, gigs.start_time ASC
      LIMIT 8`).all(account.id) as Array<{ id: number; artist_name: string; date: string; start_time: string; venue_name: string; suburb: string; city: string; status: 'going' | 'interested' }>
    : [];

  const fanSaved = account.role === 'user'
    ? db.prepare(`SELECT artists.id, artists.display_name, artists.instagram
      FROM artist_follows
      JOIN artists ON artists.id = artist_follows.artist_id
      WHERE artist_follows.user_id = ?
      ORDER BY artist_follows.created_at DESC
      LIMIT 6`).all(account.id) as Array<{ id: number; display_name: string; instagram: string | null }>
    : [];

  const fanVenues = account.role === 'user'
    ? db.prepare(`SELECT venues.id, venues.name, venues.suburb, venues.city
      FROM venue_follows
      JOIN venues ON venues.id = venue_follows.venue_id
      WHERE venue_follows.user_id = ?
      ORDER BY venue_follows.created_at DESC
      LIMIT 6`).all(account.id) as Array<{ id: number; name: string; suburb: string; city: string }>
    : [];

  const fanCommunity = account.role === 'user'
    ? db.prepare(`SELECT
        (SELECT COUNT(*) FROM gig_interest WHERE user_id = ? AND status = 'going') AS gigs_attended,
        (SELECT COUNT(DISTINCT gigs.venue_id) FROM gig_interest JOIN gigs ON gigs.id = gig_interest.gig_id WHERE gig_interest.user_id = ? AND gig_interest.status = 'going') AS regular_venues
      `).get(account.id, account.id) as { gigs_attended: number; regular_venues: number }
    : null;

  const artistProfile = account.role === 'artist'
    ? db.prepare('SELECT id, display_name, instagram, spotify_monthly_listeners, show_spotify_monthly_listeners FROM artists WHERE created_by_user_id = ?').get(account.id) as { id: number; display_name: string; instagram: string; spotify_monthly_listeners: number; show_spotify_monthly_listeners: number } | undefined
    : undefined;

  const artistUpcomingShows = artistProfile
    ? db.prepare(`SELECT gigs.id, gigs.date, gigs.start_time, gigs.price_type, gigs.ticket_url, venues.id venue_id, venues.name venue_name, venues.suburb, venues.city
      FROM gigs
      JOIN venues ON venues.id = gigs.venue_id
      WHERE gigs.artist_id = ? AND gigs.status = 'approved' AND gigs.date >= date('now')
      ORDER BY gigs.date ASC, gigs.start_time ASC
      LIMIT 8`).all(artistProfile.id) as Array<{ id: number; date: string; start_time: string; price_type: string; ticket_url: string | null; venue_id: number; venue_name: string; suburb: string; city: string }>
    : [];

  const artistHistory = artistProfile
    ? db.prepare(`SELECT venues.id, venues.name, venues.suburb, venues.city, MAX(gigs.date) last_played, COUNT(*) show_count
      FROM gigs
      JOIN venues ON venues.id = gigs.venue_id
      WHERE gigs.artist_id = ? AND gigs.status = 'approved' AND gigs.date < date('now')
      GROUP BY venues.id
      ORDER BY last_played DESC
      LIMIT 8`).all(artistProfile.id) as Array<{ id: number; name: string; suburb: string; city: string; last_played: string; show_count: number }>
    : [];

  const artistGenreSnapshot = artistProfile
    ? db.prepare(`SELECT gigs.genres
      FROM gigs
      WHERE gigs.artist_id = ? AND gigs.status = 'approved'
      ORDER BY gigs.date DESC
      LIMIT 24`).all(artistProfile.id) as Array<{ genres: string }>
    : [];

  const artistTopGenres = parseTopGenres(artistGenreSnapshot.map((row) => row.genres)).slice(0, 3);

  const managedVenues = account.role === 'venue_admin'
    ? db.prepare(`
      SELECT venues.id, venues.name, venues.suburb, venues.city, venues.website,
        COUNT(gigs.id) AS total_gigs,
        SUM(CASE WHEN gigs.date >= date('now') AND gigs.status = 'approved' THEN 1 ELSE 0 END) AS upcoming_gigs
      FROM venue_memberships
      JOIN venues ON venues.id = venue_memberships.venue_id
      LEFT JOIN gigs ON gigs.venue_id = venues.id AND gigs.status != 'removed'
      WHERE venue_memberships.user_id = ? AND venue_memberships.approved = 1
      GROUP BY venues.id
      ORDER BY venues.name ASC
    `).all(account.id) as Array<{ id: number; name: string; suburb: string; city: string; website: string | null; total_gigs: number; upcoming_gigs: number }>
    : [];

  const featuredVenue = managedVenues[0];

  const venueUpcoming = featuredVenue
    ? db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.date, gigs.start_time, gigs.price_type, gigs.ticket_url, gigs.genres
      FROM gigs
      WHERE gigs.venue_id = ? AND gigs.status = 'approved' AND gigs.date >= date('now')
      ORDER BY gigs.date ASC, gigs.start_time ASC
      LIMIT 8`).all(featuredVenue.id) as Array<{ id: number; artist_name: string; date: string; start_time: string; price_type: string; ticket_url: string | null; genres: string }>
    : [];

  const venuePast = featuredVenue
    ? db.prepare(`SELECT gigs.id, gigs.artist_name, gigs.date
      FROM gigs
      WHERE gigs.venue_id = ? AND gigs.status = 'approved' AND gigs.date < date('now')
      ORDER BY gigs.date DESC
      LIMIT 10`).all(featuredVenue.id) as Array<{ id: number; artist_name: string; date: string }>
    : [];

  const venueGenreRows = featuredVenue
    ? db.prepare(`SELECT genres FROM gigs WHERE venue_id = ? AND status = 'approved' ORDER BY date DESC LIMIT 32`).all(featuredVenue.id) as Array<{ genres: string }>
    : [];
  const venueTopGenres = parseTopGenres(venueGenreRows.map((row) => row.genres)).slice(0, 4);

  const venueRegulars = featuredVenue
    ? db.prepare(`SELECT artist_name, COUNT(*) appearances
      FROM gigs
      WHERE venue_id = ? AND status = 'approved'
      GROUP BY artist_name
      HAVING COUNT(*) > 1
      ORDER BY appearances DESC, artist_name ASC
      LIMIT 3`).all(featuredVenue.id) as Array<{ artist_name: string; appearances: number }>
    : [];

  return <div className='space-y-4 pb-6'>
    <Link href='/' className='text-sm text-zinc-300 hover:text-zinc-100'>← Back</Link>

    <section className='rounded-2xl border border-zinc-700 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 p-4 sm:p-6'>
      <div className='space-y-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 items-start gap-3'>
            <div className='grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-zinc-700 bg-zinc-800/80 text-sm font-bold'>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className='space-y-2'>
              <h1 className='text-2xl font-bold leading-tight sm:text-3xl'>{displayName}</h1>
              <div className='flex flex-wrap items-center gap-2'>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${roleBadgeClass[account.role]}`}>{roleLabel[account.role]}</span>
                <span className='text-sm text-zinc-300'>{account.location || 'Gold Coast, AU'}</span>
              </div>
              <p className='max-w-2xl text-sm text-zinc-200'>{account.bio || fallbackBio(account.role)}</p>
              {canViewEmail && <p className='text-xs text-zinc-400'>Contact: {account.email}</p>}
            </div>
          </div>
        </div>

        <div className='sticky bottom-3 z-10 rounded-xl border border-zinc-700 bg-zinc-950/90 p-3 backdrop-blur'>
          <p className='text-[11px] uppercase tracking-wide text-zinc-500'>Primary action</p>
          <div className='mt-2 flex flex-wrap gap-2'>
            {primaryCta(account.role, account.username, artistProfile?.id, featuredVenue?.id)}
            {secondaryCtas(account.role, account.username, isOwner, featuredVenue?.id)}
          </div>
        </div>
      </div>
    </section>

    {isOwner && <section className='rounded-2xl border border-zinc-700 bg-zinc-900/40 p-4'>
      <div className='flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400'>
        <span>Profile completeness</span>
        <span>{completionPercent}%</span>
      </div>
      <div className='mt-2 h-2 overflow-hidden rounded-full bg-zinc-800'>
        <div className='h-full rounded-full bg-violet-500' style={{ width: `${completionPercent}%` }} />
      </div>
      <p className='mt-2 text-xs text-zinc-400'>Add display name, bio, and location in settings to strengthen trust signals.</p>
    </section>}

    {account.role === 'venue_admin' && (
      <>
        <CollapsibleSection title='Upcoming gigs timeline' subtitle='Time and place first: fans can plan in one tap.' defaultOpen>
          {venueUpcoming.length === 0
            ? <p className='text-sm text-zinc-400'>No upcoming gigs listed yet.</p>
            : <div className='space-y-2'>{venueUpcoming.map((gig) => <TimelineCard key={gig.id}
              title={gig.artist_name}
              href={`/gigs/${gig.id}`}
              lineOne={`${formatDateDDMMYYYY(gig.date)} · ${formatTime(gig.start_time, '12h')}`}
              lineTwo={`${gig.price_type}${gig.ticket_url ? ' · Ticketed' : ''}`}
              tags={parseTopGenres([gig.genres]).slice(0, 2)}
              actionLabel='Add to calendar'
            />)}</div>}
        </CollapsibleSection>

        <CollapsibleSection title='Venue vibe snapshot' subtitle='A quick operational read for artists considering a booking.'>
          <div className='grid gap-2 text-sm text-zinc-300'>
            <p><span className='text-zinc-500'>Venue:</span> {featuredVenue ? `${featuredVenue.name} · ${featuredVenue.suburb}, ${featuredVenue.city}` : 'No managed venue yet'}</p>
            <p><span className='text-zinc-500'>Common genres:</span> {venueTopGenres.join(' · ') || 'To be discovered from upcoming lineups'}</p>
            <p><span className='text-zinc-500'>Typical crowd signal:</span> {featuredVenue ? `${featuredVenue.upcoming_gigs || 0} gigs currently scheduled` : 'Awaiting events'}</p>
            <p><span className='text-zinc-500'>Best nights:</span> Thu / Fri / Sat (editable in booking notes)</p>
            <p><span className='text-zinc-500'>Sound:</span> Artist-provided + house reinforcement depending on event format.</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title='Past gigs / history' subtitle='Social proof from real artists who have already played here.'>
          {venuePast.length === 0 ? <p className='text-sm text-zinc-400'>No past gigs on record yet.</p> : <div className='grid gap-2'>
            {venuePast.map((gig) => <Link key={gig.id} href={`/gigs/${gig.id}`} className='rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 text-sm hover:bg-zinc-900'>
              <p className='font-medium'>{gig.artist_name}</p>
              <p className='text-zinc-400'>{formatDateDDMMYYYY(gig.date)}</p>
            </Link>)}
          </div>}
        </CollapsibleSection>

        <CollapsibleSection title='Artist booking info' subtitle='Reduces booking friction by stating fit and availability up front.'>
          <ul className='space-y-2 text-sm text-zinc-300'>
            <li>Preferred genres: {venueTopGenres.join(', ') || 'Indie, electronic, jazz, local mixed bills'}.</li>
            <li>Available nights: Wed–Sun, with priority on Fri/Sat headline slots.</li>
            <li>PA provided: Partial (confirm per night via message).</li>
            <li>Booking contact: <Link href='/request-venue' className='text-violet-300 hover:text-violet-200'>Book This Venue</Link>.</li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title='Community signals' subtitle='Trust cues over vanity metrics.'>
          <div className='grid gap-2 text-sm text-zinc-300'>
            <p>Known for: Emerging Artists · Local Scene Nights · Repeat Events.</p>
            <p>Returning artists: {venueRegulars.length ? venueRegulars.map((artist) => `${artist.artist_name} (${artist.appearances})`).join(' · ') : 'No repeat artists yet'}</p>
            <p>Managed venues in this account: {managedVenues.length}</p>
          </div>
        </CollapsibleSection>
      </>
    )}

    {account.role === 'artist' && (
      <>
        <CollapsibleSection title='Upcoming shows' subtitle='Fast scan by date, venue, and ticket status.' defaultOpen>
          {artistUpcomingShows.length === 0
            ? <p className='text-sm text-zinc-400'>No live dates announced yet.</p>
            : <div className='space-y-2'>{artistUpcomingShows.map((show) => <TimelineCard key={show.id}
              title={show.venue_name}
              href={`/gigs/${show.id}`}
              lineOne={`${formatDateDDMMYYYY(show.date)} · ${formatTime(show.start_time, '12h')}`}
              lineTwo={`${show.suburb}, ${show.city} · ${show.price_type}`}
              actionLabel={show.ticket_url ? 'Tickets' : 'Going / Interested'}
            />)}</div>}
        </CollapsibleSection>

        <CollapsibleSection title='Sound preview' subtitle='Utility-first listening without autoplay.'>
          <div className='space-y-2 text-sm text-zinc-300'>
            <p>Embed up to 3 tracks from Spotify or SoundCloud.</p>
            <ul className='list-disc space-y-1 pl-5 text-zinc-400'>
              <li>Track 1 — Featured live set opener</li>
              <li>Track 2 — Audience favourite</li>
              <li>Track 3 — New release preview</li>
            </ul>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title='Artist bio (short + human)' subtitle='Focused on live feel, not accolades.'>
          <p className='text-sm text-zinc-300'>{account.bio || `${displayName} is a local live act built around dynamic sets and direct crowd connection.`}</p>
          <p className='mt-2 text-sm text-zinc-400'>Genres: {artistTopGenres.join(' · ') || 'Indie · Alt-pop · Electronic crossover'}</p>
        </CollapsibleSection>

        <CollapsibleSection title='Live history' subtitle='Booking credibility through real venues played.'>
          {artistHistory.length === 0 ? <p className='text-sm text-zinc-400'>No completed shows listed yet.</p> : <div className='grid gap-2'>
            {artistHistory.map((show) => <Link key={show.id} href={`/venues/${show.id}`} className='rounded-lg border border-zinc-700 bg-zinc-950/60 p-3 text-sm hover:bg-zinc-900'>
              <p className='font-medium'>{show.name}</p>
              <p className='text-zinc-400'>{show.suburb}, {show.city} · {show.show_count} shows · Last played {formatDateDDMMYYYY(show.last_played)}</p>
            </Link>)}
          </div>}
        </CollapsibleSection>

        <CollapsibleSection title='Availability & booking' subtitle='Everything a venue needs to book quickly.'>
          <ul className='space-y-2 text-sm text-zinc-300'>
            <li>Available days: Thu–Sun evenings.</li>
            <li>Set length: 45–90 minutes depending on bill.</li>
            <li>Equipment needs: 2 vocal mics, DI lines, foldback monitoring.</li>
            <li>Contact: {artistProfile?.instagram ? `@${artistProfile.instagram.replace('@', '')}` : 'Message via Choon profile CTA'}.</li>
          </ul>
        </CollapsibleSection>
      </>
    )}

    {account.role === 'user' && (
      <>
        <CollapsibleSection title='My upcoming gigs' subtitle='Your live calendar for what is next.' defaultOpen>
          {fanUpcoming.length === 0
            ? <p className='text-sm text-zinc-400'>No gigs marked yet. Use “Find Gigs Near Me” to build your calendar.</p>
            : <div className='space-y-2'>{fanUpcoming.map((gig) => <TimelineCard key={gig.id}
              title={gig.artist_name}
              href={`/gigs/${gig.id}`}
              lineOne={`${formatDateDDMMYYYY(gig.date)} · ${formatTime(gig.start_time, '12h')}`}
              lineTwo={`${gig.venue_name} · ${gig.suburb}, ${gig.city}`}
              tags={[gig.status === 'going' ? 'Going' : 'Interested']}
            />)}</div>}
        </CollapsibleSection>

        <CollapsibleSection title='Taste profile' subtitle='Powers recommendations without public scoring.'>
          <div className='grid gap-2 text-sm text-zinc-300'>
            <p>Preferred genres: {parseTopGenres(fanUpcoming.map((gig) => JSON.stringify([gig.artist_name]))).slice(0, 3).join(' · ') || 'Indie · Soul · Electronic'}.</p>
            <p>Typical nights out: Thu to Sat.</p>
            <p>Travel distance: Up to 25km from {account.location || 'home base'}.</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title='Saved & followed' subtitle='Quick access to artists and venues you track.'>
          <div className='grid gap-2 sm:grid-cols-2'>
            <div className='rounded-lg border border-zinc-700 bg-zinc-950/50 p-3'>
              <p className='text-xs uppercase tracking-wide text-zinc-500'>Artists followed</p>
              {fanSaved.length === 0 ? <p className='mt-1 text-sm text-zinc-400'>None yet.</p> : <ul className='mt-1 space-y-1 text-sm'>
                {fanSaved.map((artist) => <li key={artist.id}><Link className='hover:text-violet-300' href={`/artists/${artist.id}`}>{artist.display_name}</Link></li>)}
              </ul>}
            </div>
            <div className='rounded-lg border border-zinc-700 bg-zinc-950/50 p-3'>
              <p className='text-xs uppercase tracking-wide text-zinc-500'>Venues followed</p>
              {fanVenues.length === 0 ? <p className='mt-1 text-sm text-zinc-400'>None yet.</p> : <ul className='mt-1 space-y-1 text-sm'>
                {fanVenues.map((venue) => <li key={venue.id}><Link className='hover:text-violet-300' href={`/venues/${venue.id}`}>{venue.name}</Link></li>)}
              </ul>}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title='Community activity' subtitle='Soft social proof with no leaderboards.'>
          <p className='text-sm text-zinc-300'>Gigs attended: {fanCommunity?.gigs_attended || 0} · Regular venues: {fanCommunity?.regular_venues || 0}</p>
        </CollapsibleSection>
      </>
    )}

    {account.role === 'admin' && <section className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-lg font-semibold'>Admin profile</h2>
      <p className='mt-2 text-sm text-zinc-400'>Platform admin profiles retain moderation controls in the admin dashboard.</p>
      <Link href='/admin' className='mt-3 inline-flex rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500'>Open moderation dashboard</Link>
    </section>}
  </div>;
}

function CollapsibleSection({ title, subtitle, children, defaultOpen = false }: { title: string; subtitle: string; children: ReactNode; defaultOpen?: boolean }) {
  return <details open={defaultOpen} className='rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 open:pb-4'>
    <summary className='cursor-pointer list-none'>
      <p className='text-lg font-semibold'>{title}</p>
      <p className='mt-0.5 text-xs uppercase tracking-wide text-zinc-500'>{subtitle}</p>
    </summary>
    <div className='mt-3'>{children}</div>
  </details>;
}

function TimelineCard({
  title,
  href,
  lineOne,
  lineTwo,
  tags = [],
  actionLabel,
}: {
  title: string;
  href: string;
  lineOne: string;
  lineTwo: string;
  tags?: string[];
  actionLabel?: string;
}) {
  return <Link href={href} className='block rounded-xl border border-zinc-700 bg-zinc-950/60 p-3 hover:bg-zinc-900'>
    <div className='flex items-start justify-between gap-2'>
      <p className='font-semibold'>{title}</p>
      {actionLabel && <span className='rounded-full border border-violet-400/40 px-2 py-0.5 text-[11px] text-violet-200'>{actionLabel}</span>}
    </div>
    <p className='mt-1 text-sm text-zinc-300'>{lineOne}</p>
    <p className='text-sm text-zinc-400'>{lineTwo}</p>
    {tags.length > 0 && <div className='mt-2 flex flex-wrap gap-1.5'>
      {tags.map((tag) => <span key={tag} className='rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300'>{tag}</span>)}
    </div>}
  </Link>;
}

function fallbackBio(role: RoleType) {
  if (role === 'venue_admin') return 'Venue account focused on discoverable, bookable live nights.';
  if (role === 'artist') return 'Artist profile focused on upcoming shows and booking readiness.';
  if (role === 'user') return 'Live music fan profile designed for local gig discovery.';
  return 'Community account.';
}

function parseTopGenres(values: string[]) {
  const tally = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    let parsed: string[] = [];
    try {
      const candidate = JSON.parse(value);
      if (Array.isArray(candidate)) parsed = candidate.map((item) => String(item));
    } catch {
      parsed = value.split(',');
    }

    for (const item of parsed) {
      const normalized = item.trim();
      if (!normalized) continue;
      tally.set(normalized, (tally.get(normalized) || 0) + 1);
    }
  }

  return [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

function primaryCta(role: RoleType, username: string, artistId?: number, venueId?: number) {
  if (role === 'venue_admin') {
    return <Link href={venueId ? `/venues/${venueId}` : '/dashboard'} className='rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500'>View Upcoming Gigs</Link>;
  }
  if (role === 'artist') {
    return <Link href={artistId ? `/artists/${artistId}` : `/profiles/${username}`} className='rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500'>See Live Dates</Link>;
  }
  if (role === 'user') {
    return <Link href='/' className='rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500'>Find Gigs Near Me</Link>;
  }
  return <Link href='/admin' className='rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500'>Open Admin</Link>;
}

function secondaryCtas(role: RoleType, username: string, isOwner: boolean, venueId?: number) {
  if (role === 'venue_admin') {
    return <>
      <Link href='/request-venue' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Book This Venue</Link>
      <Link href={venueId ? `/venues/${venueId}` : `/profiles/${username}`} className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Follow Venue</Link>
      <Link href='/dashboard' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Message Venue</Link>
      {isOwner && <Link href='/settings' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Edit profile</Link>}
    </>;
  }

  if (role === 'artist') {
    return <>
      <Link href={`/profiles/${username}`} className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Listen</Link>
      <Link href='/dashboard' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Message</Link>
      <Link href={`/profiles/${username}`} className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Follow</Link>
      {isOwner && <Link href='/settings' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Edit profile</Link>}
    </>;
  }

  if (role === 'user') {
    return <>
      <Link href='/my-gigs' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>My Calendar</Link>
      <Link href='/saved?tab=artists' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Saved Artists</Link>
      <Link href='/saved?tab=venues' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Saved Venues</Link>
      {isOwner && <Link href='/settings' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Edit profile</Link>}
    </>;
  }

  return isOwner
    ? <Link href='/settings' className='rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>Edit profile</Link>
    : null;
}
