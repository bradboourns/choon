'use client';

import { useMemo, useState } from 'react';
import { createGigAction } from '@/app/actions';

type Venue = { id: number; name: string; suburb: string; city: string; state: string; approved: number };
type PartnerArtist = { id: number; display_name: string };
type PopupCollective = { id: number; name: string; region: string };

export default function CreateGigForm({ venues, preferredVenueId, error, lead, genres, vibes, partneredArtists = [], popupCollectives = [], role }: {
  venues: Venue[];
  preferredVenueId?: number;
  error?: string;
  lead?: string;
  genres: string[];
  vibes: string[];
  partneredArtists?: PartnerArtist[];
  popupCollectives?: PopupCollective[];
  role: string;
}) {
  const [priceType, setPriceType] = useState('Free');
  const selectedVenue = useMemo(() => venues.find((v) => v.id === preferredVenueId) || venues[0], [venues, preferredVenueId]);

  return (
    <form action={createGigAction} className='space-y-4 rounded-xl border border-zinc-700 p-4'>
      <h1 className='text-2xl font-bold'>Post a gig</h1>
      <p className='text-sm text-zinc-400'>Share complete event details so fans can discover and attend your gig.</p>
      {error === 'venue-permission' && <p className='rounded bg-amber-900/50 p-2 text-sm text-amber-200'>You can only post gigs for venues linked to your account.</p>}
      {error === 'missing-venue' && <p className='rounded bg-amber-900/50 p-2 text-sm text-amber-200'>Choose a venue before publishing.</p>}
      {error === 'missing-venue-contact' && <p className='rounded bg-amber-900/50 p-2 text-sm text-amber-200'>Please add a venue name and contact email so we can onboard them.</p>}
      {lead === 'requested' && <p className='rounded bg-emerald-900/40 p-2 text-sm text-emerald-200'>Thanks — we logged this venue lead and will contact them to establish them as a customer.</p>}

      <p className='text-sm text-zinc-400'>Venue / Location</p>
      {venues.length === 0 ? (
        <p className='rounded bg-zinc-900 p-3 text-zinc-300'>No venues are available yet.</p>
      ) : venues.length === 1 ? (
        <>
          <div className='rounded border border-zinc-700 bg-zinc-900 p-3 text-sm'>
            <p className='font-semibold'>{selectedVenue.name}</p>
            <p className='text-zinc-400'>{selectedVenue.suburb}, {selectedVenue.city} {selectedVenue.state}</p>
            {!selectedVenue.approved && <p className='mt-1 text-amber-300'>This venue is pending approval. Gig will auto-post once approved.</p>}
          </div>
          <input type='hidden' name='venue_id' value={selectedVenue.id} />
        </>
      ) : (
        <select name='venue_id' defaultValue={preferredVenueId && venues.some((v) => v.id === preferredVenueId) ? String(preferredVenueId) : ''} className='w-full rounded bg-zinc-900 p-2'>
          <option value=''>Select a venue</option>
          {venues.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.suburb}){!v.approved ? ' · Pending approval' : ''}</option>)}
        </select>
      )}

      {popupCollectives.length > 0 && (
        <div className='rounded border border-zinc-700 bg-zinc-900/40 p-3 text-sm'>
          <p className='font-medium text-zinc-200'>Presented by pop-up collective (optional)</p>
          <p className='mb-2 text-zinc-400'>Use this when your event brand rotates between host venues.</p>
          <select name='popup_collective_id' defaultValue='' className='w-full rounded bg-zinc-950 p-2'>
            <option value=''>No pop-up collective</option>
            {popupCollectives.map((collective) => (
              <option key={collective.id} value={collective.id}>{collective.name} · {collective.region}</option>
            ))}
          </select>
        </div>
      )}

      {role === 'artist' && (
        <div className='rounded border border-zinc-700 bg-zinc-900/40 p-3 text-sm'>
          <p className='font-medium text-zinc-200'>Can’t find the venue?</p>
          <p className='mb-2 text-zinc-400'>Share details and we’ll contact them so we can establish them as a customer.</p>
          <div className='grid gap-2 sm:grid-cols-2'>
            <input name='missing_venue_name' placeholder='Missing venue name' className='rounded bg-zinc-950 p-2' />
            <input name='missing_venue_contact_email' type='email' placeholder='Venue contact email' className='rounded bg-zinc-950 p-2' />
          </div>
          <textarea name='missing_venue_note' placeholder='Optional note (who to contact, city, etc.)' className='mt-2 w-full rounded bg-zinc-950 p-2' />
        </div>
      )}

      <input name='artist_name' required placeholder='Artist/band name' className='w-full rounded bg-zinc-900 p-2'/>
      {partneredArtists.length > 0 && (
        <div className='rounded border border-zinc-700 bg-zinc-900/60 p-3 text-sm'>
          <p className='mb-1 text-zinc-300'>Use a partnered artist (optional):</p>
          <select
            name='artist_id'
            className='w-full rounded bg-zinc-950 p-2'
            defaultValue=''
            onChange={(event) => {
              const nameInput = document.querySelector("input[name='artist_name']") as HTMLInputElement | null;
              const option = event.currentTarget.options[event.currentTarget.selectedIndex];
              if (nameInput && option?.dataset.artistName) nameInput.value = option.dataset.artistName;
            }}
          >
            <option value=''>No partnered artist selected</option>
            {partneredArtists.map((artist) => (
              <option key={artist.id} value={artist.id} data-artist-name={artist.display_name}>{artist.display_name}</option>
            ))}
          </select>
        </div>
      )}
      <div className='grid grid-cols-2 gap-2'><input type='date' name='date' required className='rounded bg-zinc-900 p-2'/><input type='time' name='start_time' required className='rounded bg-zinc-900 p-2'/></div>
      <input type='time' name='end_time' className='w-full rounded bg-zinc-900 p-2' placeholder='End time'/>
      <select name='price_type' required value={priceType} onChange={(e) => setPriceType(e.target.value)} className='w-full rounded bg-zinc-900 p-2'><option>Free</option><option>Door</option><option>Ticketed</option></select>
      {priceType !== 'Free' && <input type='number' min='0' step='0.01' name='ticket_price' required placeholder='Ticket price' className='w-full rounded bg-zinc-900 p-2'/>}
      <input name='ticket_url' placeholder='Ticket link (optional)' className='w-full rounded bg-zinc-900 p-2'/>
      <textarea name='description' placeholder='Description (optional)' className='w-full rounded bg-zinc-900 p-2'/>
      <input name='poster_url' placeholder='Poster image URL (optional)' className='w-full rounded bg-zinc-900 p-2'/>
      <fieldset><legend className='mb-1'>Genres</legend><div className='flex flex-wrap gap-2'>{genres.map((g) => <label key={g} className='rounded bg-zinc-800 px-2 py-1 text-sm'><input type='checkbox' name='genres' value={g} className='mr-1'/>{g}</label>)}</div></fieldset>
      <fieldset><legend className='mb-1'>Vibe tags</legend><div className='flex flex-wrap gap-2'>{vibes.map((v) => <label key={v} className='rounded bg-fuchsia-900/50 px-2 py-1 text-sm'><input type='checkbox' name='vibe_tags' value={v} className='mr-1'/>{v}</label>)}</div></fieldset>
      <button className='rounded bg-violet-600 px-4 py-2'>Publish gig</button>
    </form>
  );
}
