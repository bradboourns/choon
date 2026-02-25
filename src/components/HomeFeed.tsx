'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

const GigMap = dynamic(() => import('./GigMap'), { ssr: false });
const defaultMapCenter = { lat: -28.0167, lng: 153.4 };

type Gig = {
  id: number;
  artist_id?: number | null;
  artist_name: string;
  venue_name: string;
  address: string;
  suburb: string;
  city: string;
  date: string;
  start_time: string;
  end_time: string;
  price_type: string;
  ticket_price: number | null;
  genres: string;
  vibe_tags: string;
  lat: number;
  lng: number;
};

type Props = {
  initial: Gig[];
  isLoggedIn: boolean;
  savedGigIds: number[];
  interestByGig: Record<number, 'interested' | 'going'>;
  followedArtistIds: number[];
};

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const dateTabs = [
  { key: 'all', label: 'All Dates' },
  { key: 'live', label: 'Live now' },
  { key: 'tonight', label: 'Tonight' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend', label: 'This Weekend' },
  { key: 'next7', label: 'Next 7 Days' },
] as const;

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time || '00:00'}`);
}

export default function HomeFeed({ initial, isLoggedIn, savedGigIds, interestByGig, followedArtistIds }: Props) {
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [price, setPrice] = useState('');
  const [dateRange, setDateRange] = useState<(typeof dateTabs)[number]['key']>('next7');
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);
  const [distanceRangeKm, setDistanceRangeKm] = useState(25);
  const [distanceSort, setDistanceSort] = useState<'date' | 'closest' | 'furthest'>('date');

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const gigs = useMemo(() => {
    const withDistance = initial.map((g) => {
      const origin = loc || mapCenter;
      const distance = distanceKm(origin, { lat: g.lat, lng: g.lng });
      return { ...g, distance };
    });

    const filtered = withDistance.filter((g) => {
      const text = `${g.artist_name} ${g.venue_name} ${g.suburb} ${g.city}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesPrice = !price || g.price_type === price;

      const gigDate = parseLocalDate(g.date);
      const now = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const day = gigDate.getDay();
      const isWeekend = day === 5 || day === 6;

      const startsAt = parseDateTime(g.date, g.start_time);
      const endsAt = g.end_time ? parseDateTime(g.date, g.end_time) : new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
      const isLiveNow = now >= startsAt && now <= endsAt;

      let matchesDate = true;
      if (dateRange === 'live') matchesDate = isLiveNow;
      if (dateRange === 'tonight') matchesDate = gigDate.getTime() === today.getTime();
      if (dateRange === 'tomorrow') matchesDate = gigDate.getTime() === tomorrow.getTime();
      if (dateRange === 'weekend') matchesDate = isWeekend && gigDate >= today;
      if (dateRange === 'next7') matchesDate = gigDate >= today && gigDate <= nextWeek;

      const matchesDistance = g.distance <= distanceRangeKm;
      return matchesSearch && matchesPrice && matchesDate && matchesDistance;
    });

    if (distanceSort === 'closest') {
      return [...filtered].sort((a, b) => a.distance - b.distance);
    }
    if (distanceSort === 'furthest') {
      return [...filtered].sort((a, b) => b.distance - a.distance);
    }
    return [...filtered].sort((a, b) => {
      const da = `${a.date} ${a.start_time}`;
      const db = `${b.date} ${b.start_time}`;
      return da.localeCompare(db);
    });
  }, [initial, search, price, dateRange, today, loc, mapCenter, distanceRangeKm, distanceSort]);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-zinc-900 via-zinc-900 to-violet-950/70 p-5 shadow-2xl shadow-violet-900/10 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 rounded-2xl bg-zinc-950/70 p-3 ring-1 ring-inset ring-white/10 transition focus-within:ring-violet-400/60">
            <input
              placeholder="Search venues, artists, suburbs..."
              className="w-full bg-transparent text-base outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm hover:bg-zinc-800"
            onClick={() =>
              navigator.geolocation.getCurrentPosition((p) => {
                const current = { lat: p.coords.latitude, lng: p.coords.longitude };
                setLoc(current);
                setMapCenter(current);
              })
            }
          >
            Use my location
          </button>
        </div>

        <p className="mt-3 text-sm text-zinc-300">{loc ? 'Distances are calculated from your current location.' : 'Enable location for precise distance to each gig.'}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {dateTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setDateRange(item.key)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                dateRange === item.key
                  ? 'border-violet-400 bg-violet-600 font-semibold text-white'
                  : 'border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm" value={price} onChange={(e) => setPrice(e.target.value)}>
            <option value="">🎟️ All prices</option>
            <option value="Free">🟢 Free</option>
            <option value="Door">🚪 At the door</option>
            <option value="Ticketed">🎫 Ticketed</option>
          </select>
          <label className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-300">
            📍 Within
            <select className="rounded bg-zinc-800 px-2 py-1" value={distanceRangeKm} onChange={(e) => setDistanceRangeKm(Number(e.target.value))}>
              {[5, 10, 15, 25, 40, 60, 100].map((km) => (
                <option key={km} value={km}>{km} km</option>
              ))}
            </select>
          </label>
          <select className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm" value={distanceSort} onChange={(e) => setDistanceSort(e.target.value as 'date' | 'closest' | 'furthest')}>
            <option value="date">Sort: Soonest</option>
            <option value="closest">Sort: Closest</option>
            <option value="furthest">Sort: Furthest</option>
          </select>
        </div>
      </section>

      <div className="flex justify-between gap-2">
        <p className="text-sm text-zinc-400">{gigs.length} gigs found</p>
        <div className="flex rounded-2xl border border-zinc-700 bg-zinc-900 p-1">
          <button className={`rounded-xl px-3 py-1.5 text-sm ${tab === 'list' ? 'bg-violet-600 font-semibold' : 'text-zinc-300'}`} onClick={() => setTab('list')}>List</button>
          <button className={`rounded-xl px-3 py-1.5 text-sm ${tab === 'map' ? 'bg-violet-600 font-semibold' : 'text-zinc-300'}`} onClick={() => setTab('map')}>Map</button>
        </div>
      </div>

      {tab === 'map' ? (
        <GigMap gigs={gigs} center={loc || mapCenter} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gigs.map((g) => {
            const genres = JSON.parse(g.genres) as string[];
            const vibes = JSON.parse(g.vibe_tags) as string[];
            const saved = savedGigIds.includes(g.id);
            const interest = interestByGig[g.id] || 'none';
            const followingArtist = g.artist_id ? followedArtistIds.includes(g.artist_id) : false;

            return (
              <div key={g.id} className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 transition hover:-translate-y-0.5 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-900/20">
                <Link href={`/gigs/${g.id}`} className="block">
                  <div className="relative h-40 border-b border-zinc-800 bg-gradient-to-br from-violet-950/70 via-zinc-900 to-fuchsia-950/50 p-4">
                    <span className="rounded-lg bg-black/45 px-2.5 py-1 text-xs font-semibold text-zinc-200">{formatDateDDMMYYYY(g.date)}</span>
                    <span className="absolute bottom-4 right-4 rounded-lg border border-violet-400/40 bg-violet-600/30 px-2.5 py-1 text-xs font-semibold text-violet-100">
                      {g.price_type === 'Door' ? `🚪 $${(g.ticket_price ?? 0).toFixed(2)} at door` : g.price_type === 'Free' ? '🟢 Free' : `🎫 From $${(g.ticket_price ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-2xl font-bold leading-tight">{g.artist_name}</p>
                    <p className="text-zinc-300">📍 {g.venue_name} · {g.suburb}</p>
                    <p className="text-zinc-400">🕒 {formatTime(g.start_time, '12h')}</p>
                    <p className="text-sm text-zinc-400">{g.distance.toFixed(1)} km away</p>
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {genres.map((x) => (<span key={x} className="rounded-lg border border-zinc-700 bg-zinc-800/70 px-2 py-1 text-zinc-200">{x}</span>))}
                      {vibes.map((x) => (<span key={x} className="rounded-lg border border-violet-500/40 bg-violet-600/20 px-2 py-1 text-violet-200">{x}</span>))}
                    </div>
                  </div>
                </Link>

                <div className="flex flex-wrap gap-2 border-t border-zinc-800 px-4 py-3 text-sm">
                  <a className="rounded border border-zinc-600 px-2.5 py-1.5 hover:bg-zinc-800" href={`https://maps.google.com/?q=${encodeURIComponent(`${g.address}, ${g.suburb}, ${g.city}`)}`} target="_blank" rel="noreferrer">🧭 Directions</a>
                  {isLoggedIn ? (
                    <>
                      <form action="/api/save" method="post">
                        <input type="hidden" name="gig_id" value={g.id} />
                        <input type="hidden" name="action" value={saved ? 'unsave' : 'save'} />
                        <input type="hidden" name="redirect_to" value="/" />
                        <button className="rounded border border-zinc-600 px-2.5 py-1.5 hover:bg-zinc-800">{saved ? 'Saved ✓' : 'Save gig'}</button>
                      </form>
                      <form action="/api/gig-interest" method="post">
                        <input type="hidden" name="gig_id" value={g.id} />
                        <input type="hidden" name="status" value={interest === 'interested' ? 'none' : 'interested'} />
                        <input type="hidden" name="redirect_to" value="/" />
                        <button className={`rounded border px-2.5 py-1.5 ${interest === 'interested' ? 'border-violet-400 bg-violet-600/40' : 'border-zinc-600 hover:bg-zinc-800'}`}>✨ Interested</button>
                      </form>
                      <form action="/api/gig-interest" method="post">
                        <input type="hidden" name="gig_id" value={g.id} />
                        <input type="hidden" name="status" value={interest === 'going' ? 'none' : 'going'} />
                        <input type="hidden" name="redirect_to" value="/" />
                        <button className={`rounded border px-2.5 py-1.5 ${interest === 'going' ? 'border-emerald-400 bg-emerald-500/30' : 'border-zinc-600 hover:bg-zinc-800'}`}>✅ Going</button>
                      </form>
                      {g.artist_id && (
                        <form action="/api/follow-artist" method="post">
                          <input type="hidden" name="artist_id" value={g.artist_id} />
                          <input type="hidden" name="follow" value={followingArtist ? '0' : '1'} />
                          <input type="hidden" name="redirect_to" value="/" />
                          <button className={`rounded border px-2.5 py-1.5 ${followingArtist ? 'border-fuchsia-400 bg-fuchsia-500/20' : 'border-zinc-600 hover:bg-zinc-800'}`}>🎤 Follow artist</button>
                        </form>
                      )}
                    </>
                  ) : (
                    <Link className="rounded border border-zinc-600 px-2.5 py-1.5 hover:bg-zinc-800" href="/login">Log in to save / follow</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
