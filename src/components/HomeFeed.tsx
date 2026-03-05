'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';
import GigInterestButtons from '@/components/GigInterestButtons';
import SaveGigButton from '@/components/SaveGigButton';
import FollowArtistButton from '@/components/FollowArtistButton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Select from '@/components/ui/Select';

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
  defaultCity: string;
};

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function Icon({ path }: { path: string }) {
  return <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d={path} /></svg>;
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

function cityDefaultCenter(city: string) {
  const key = city.trim().toLowerCase();
  const centers: Record<string, { lat: number; lng: number }> = {
    'gold coast': { lat: -28.0167, lng: 153.4 },
    brisbane: { lat: -27.4698, lng: 153.0251 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    melbourne: { lat: -37.8136, lng: 144.9631 },
  };
  return centers[key] || defaultMapCenter;
}

export default function HomeFeed({ initial, isLoggedIn, savedGigIds, interestByGig, followedArtistIds, defaultCity }: Props) {
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState(defaultCity);
  const [price, setPrice] = useState('');
  const [dateRange, setDateRange] = useState<(typeof dateTabs)[number]['key']>('all');
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const mapCenter = useMemo(() => cityDefaultCenter(defaultCity), [defaultCity]);
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

    if (distanceSort === 'closest') return [...filtered].sort((a, b) => a.distance - b.distance);
    if (distanceSort === 'furthest') return [...filtered].sort((a, b) => b.distance - a.distance);
    return [...filtered].sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));
  }, [initial, search, price, dateRange, today, loc, mapCenter, distanceRangeKm, distanceSort]);

  return (
    <div className='space-y-5'>
      <Card variant='glass' className='space-y-4 bg-gradient-to-r from-violet-950/30 via-transparent to-fuchsia-950/20'>
        <div className='grid gap-3 md:grid-cols-[1fr_auto]'>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search artists, venues, suburbs or city' />
          <Button variant='subtle' onClick={() => navigator.geolocation.getCurrentPosition((p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }))}>
            Use my location
          </Button>
        </div>

        <div className='flex flex-wrap gap-2'>
          {dateTabs.map((item) => (
            <button key={item.key} onClick={() => setDateRange(item.key)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${dateRange === item.key ? 'border-violet-400/60 bg-violet-500/20 text-violet-100' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className='grid gap-2 md:grid-cols-3'>
          <Select value={price} onChange={(e) => setPrice(e.target.value)}>
            <option value=''>All prices</option><option value='Free'>Free</option><option value='Door'>At the door</option><option value='Ticketed'>Ticketed</option>
          </Select>
          <Select value={distanceRangeKm} onChange={(e) => setDistanceRangeKm(Number(e.target.value))}>
            {[5, 10, 15, 25, 40, 60, 100].map((km) => <option key={km} value={km}>Within {km} km</option>)}
          </Select>
          <Select value={distanceSort} onChange={(e) => setDistanceSort(e.target.value as 'date' | 'closest' | 'furthest')}>
            <option value='date'>Sort: Soonest</option><option value='closest'>Sort: Closest</option><option value='furthest'>Sort: Furthest</option>
          </Select>
        </div>
      </Card>

      <div className='flex items-center justify-between gap-3'>
        <p className='text-sm text-[var(--text-secondary)]'>{gigs.length} gigs found</p>
        <SegmentedControl value={tab} onChange={setTab} items={[{ key: 'list', label: 'List' }, { key: 'map', label: 'Map' }]} />
      </div>

      {tab === 'map' ? (
        <GigMap gigs={gigs} center={loc || mapCenter} radiusKm={distanceRangeKm} />
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {gigs.map((g) => {
            const genres = JSON.parse(g.genres) as string[];
            const vibes = JSON.parse(g.vibe_tags) as string[];
            const saved = savedGigIds.includes(g.id);
            const interest = interestByGig[g.id] || 'none';
            const followingArtist = g.artist_id ? followedArtistIds.includes(g.artist_id) : false;

            return (
              <Card key={g.id} variant='elevated' className='overflow-hidden p-0 transition hover:-translate-y-0.5 hover:border-violet-400/40'>
                <Link href={`/gigs/${g.id}`} className='block'>
                  <div className='relative h-40 border-b border-[var(--border-subtle)] bg-gradient-to-br from-violet-900/40 via-zinc-900 to-fuchsia-900/30 p-4'>
                    <Badge variant='status'>{formatDateDDMMYYYY(g.date)}</Badge>
                    <span className='absolute bottom-4 right-4 rounded-full border border-violet-300/30 bg-violet-600/25 px-3 py-1 text-xs font-semibold text-violet-100'>
                      {g.price_type === 'Door' ? `$${(g.ticket_price ?? 0).toFixed(2)} at door` : g.price_type === 'Free' ? 'Free' : `From $${(g.ticket_price ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                  <div className='space-y-3 p-4'>
                    <div>
                      <p className='text-2xl font-bold leading-tight'>{g.artist_name}</p>
                      <p className='text-sm text-[var(--text-secondary)]'>{g.venue_name} · {g.suburb}</p>
                    </div>
                    <div className='flex items-center justify-between text-sm text-[var(--text-tertiary)]'>
                      <span>{formatTime(g.start_time, '12h')}</span>
                      <span>{g.distance.toFixed(1)} km away</span>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {genres.map((x) => <Badge key={x} variant='genre'>{x}</Badge>)}
                      {vibes.map((x) => <Badge key={x} variant='vibe'>{x}</Badge>)}
                    </div>
                  </div>
                </Link>
                <div className='flex flex-wrap gap-2 border-t border-[var(--border-subtle)] px-4 py-3 text-sm'>
                  <a className='inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 hover:bg-[var(--surface-muted)]' href={`https://maps.google.com/?q=${encodeURIComponent(`${g.address}, ${g.suburb}, ${g.city}`)}`} target='_blank' rel='noreferrer'><Icon path='M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z M12 10h.01' />Directions</a>
                  {isLoggedIn ? (
                    <>
                      <SaveGigButton gigId={g.id} initiallySaved={saved} compact />
                      <GigInterestButtons gigId={g.id} initialStatus={interest as 'interested' | 'going' | 'none'} compact />
                      {g.artist_id && <FollowArtistButton artistId={g.artist_id} initiallyFollowing={followingArtist} compact />}
                    </>
                  ) : (
                    <Link className='rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 hover:bg-[var(--surface-muted)]' href='/login'>Log in to save / follow</Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
