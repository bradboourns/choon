'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

const GigMap = dynamic(() => import('./GigMap'), { ssr: false });
const defaultMapCenter = { lat: -28.0167, lng: 153.4 };

type Gig = {
  id: number;
  artist_name: string;
  venue_name: string;
  suburb: string;
  city: string;
  date: string;
  start_time: string;
  price_type: string;
  genres: string;
  vibe_tags: string;
  lat: number;
  lng: number;
};

type LocationOption = {
  display_name: string;
  lat: string;
  lon: string;
};

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))).toFixed(1);
}

const dateTabs = [
  { key: 'all', label: 'All Dates' },
  { key: 'tonight', label: 'Tonight' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend', label: 'This Weekend' },
  { key: 'next7', label: 'Next 7 Days' },
] as const;

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export default function HomeFeed({ initial }: { initial: Gig[] }) {
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('Gold Coast');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationOption[]>([]);
  const [price, setPrice] = useState('');
  const [dateRange, setDateRange] = useState<(typeof dateTabs)[number]['key']>('next7');
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const gigs = useMemo(
    () =>
      initial.filter((g) => {
        const text = `${g.artist_name} ${g.venue_name} ${g.suburb} ${g.city}`.toLowerCase();
        const matchesSearch = text.includes(search.toLowerCase());
        const matchesPrice = !price || g.price_type === price;

        const gigDate = parseLocalDate(g.date);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const day = gigDate.getDay();
        const isWeekend = day === 5 || day === 6;

        let matchesDate = true;
        if (dateRange === 'tonight') matchesDate = gigDate.getTime() === today.getTime();
        if (dateRange === 'tomorrow') matchesDate = gigDate.getTime() === tomorrow.getTime();
        if (dateRange === 'weekend') matchesDate = isWeekend && gigDate >= today;
        if (dateRange === 'next7') matchesDate = gigDate >= today && gigDate <= nextWeek;

        return matchesSearch && matchesPrice && matchesDate;
      }),
    [initial, search, price, dateRange, today],
  );

  async function searchLocations(query: string) {
    setLocationSearch(query);
    if (query.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`,
      );
      const items = (await response.json()) as LocationOption[];
      setLocationSuggestions(items);
    } catch {
      setLocationSuggestions([]);
    }
  }

  function selectLocation(option: LocationOption) {
    setLocationSearch(option.display_name);
    setLocationSuggestions([]);
    setMapCenter({ lat: Number(option.lat), lng: Number(option.lon) });
    setTab('map');
  }

  async function submitLocationSearch(event: FormEvent) {
    event.preventDefault();
    if (locationSuggestions[0]) {
      selectLocation(locationSuggestions[0]);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-zinc-900 via-zinc-900 to-violet-950/70 p-5 shadow-2xl shadow-violet-900/10 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950/70 p-3">
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
                setTab('map');
              })
            }
          >
            Use my location
          </button>
        </div>

        <form onSubmit={submitLocationSearch} className="relative mt-3">
          <input
            placeholder="Search location (auto-predict enabled)"
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950/70 p-3 text-base outline-none"
            value={locationSearch}
            onChange={(e) => searchLocations(e.target.value)}
          />
          {locationSuggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
              {locationSuggestions.map((option) => (
                <li key={`${option.lat}-${option.lon}`}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-800"
                    onClick={() => selectLocation(option)}
                  >
                    {option.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

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
          <select
            className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          >
            <option value="">🎟️ All prices</option>
            <option value="Free">🟢 Free</option>
            <option value="Door">🚪 At the door</option>
            <option value="Ticketed">🎫 Ticketed</option>
          </select>
          <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-300">✨ Vibe</span>
          <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-300">📍 Distance</span>
        </div>
      </section>

      <div className="flex justify-between gap-2">
        <p className="text-sm text-zinc-400">{gigs.length} gigs found</p>
        <div className="flex rounded-2xl border border-zinc-700 bg-zinc-900 p-1">
          <button
            className={`rounded-xl px-3 py-1.5 text-sm ${tab === 'list' ? 'bg-violet-600 font-semibold' : 'text-zinc-300'}`}
            onClick={() => setTab('list')}
          >
            List
          </button>
          <button
            className={`rounded-xl px-3 py-1.5 text-sm ${tab === 'map' ? 'bg-violet-600 font-semibold' : 'text-zinc-300'}`}
            onClick={() => setTab('map')}
          >
            Map
          </button>
        </div>
      </div>

      {tab === 'map' ? (
        <GigMap gigs={gigs} center={mapCenter} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gigs.map((g) => {
            const genres = JSON.parse(g.genres) as string[];
            const vibes = JSON.parse(g.vibe_tags) as string[];

            return (
              <Link
                href={`/gigs/${g.id}`}
                key={g.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 transition hover:-translate-y-0.5 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-900/20"
              >
                <div className="relative h-40 border-b border-zinc-800 bg-gradient-to-br from-violet-950/70 via-zinc-900 to-fuchsia-950/50 p-4">
                  <span className="rounded-lg bg-black/45 px-2.5 py-1 text-xs font-semibold text-zinc-200">{g.date}</span>
                  <span className="absolute bottom-4 right-4 rounded-lg border border-violet-400/40 bg-violet-600/30 px-2.5 py-1 text-xs font-semibold text-violet-100">
                    {g.price_type === 'Door' ? '🚪 At door' : g.price_type === 'Free' ? '🟢 Free' : '🎫 Tickets'}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-2xl font-bold leading-tight">{g.artist_name}</p>
                  <p className="text-zinc-300">📍 {g.venue_name} · {g.suburb}</p>
                  <p className="text-zinc-400">🕒 {g.start_time}</p>
                  {loc && (
                    <p className="text-sm text-zinc-400">{distanceKm(loc, { lat: g.lat, lng: g.lng })} km away from you</p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    {genres.map((x) => (
                      <span key={x} className="rounded-lg border border-zinc-700 bg-zinc-800/70 px-2 py-1 text-zinc-200">
                        {x}
                      </span>
                    ))}
                    {vibes.map((x) => (
                      <span key={x} className="rounded-lg border border-violet-500/40 bg-violet-600/20 px-2 py-1 text-violet-200">
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
