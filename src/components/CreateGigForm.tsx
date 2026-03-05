'use client';

import { useMemo, useState } from 'react';
import { createGigAction } from '@/app/actions';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';

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
    <form action={createGigAction} className='space-y-5'>
      <PageHeader title='Post a gig' description='Share complete event details so fans can discover and attend your gig.' />

      {error && <Card variant='muted' className='border-amber-500/30 bg-amber-500/10 py-3 text-sm text-amber-100'>
        {error === 'venue-permission' && 'You can only post gigs for venues linked to your account.'}
        {error === 'missing-venue' && 'Choose a venue before publishing.'}
        {error === 'missing-venue-contact' && 'Please add a venue name and contact email so we can onboard them.'}
      </Card>}
      {lead === 'requested' && <Card variant='muted' className='border-emerald-500/30 bg-emerald-500/10 py-3 text-sm text-emerald-100'>Thanks — we logged this venue lead and will contact them to establish them as a customer.</Card>}

      <Section title='Venue and location' kicker='Step 1'>
        {venues.length === 0 ? <p className='rounded-2xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]'>No venues are available yet.</p> : venues.length === 1 ? (
          <>
            <div className='rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-sm'>
              <p className='font-semibold'>{selectedVenue.name}</p>
              <p className='text-[var(--text-secondary)]'>{selectedVenue.suburb}, {selectedVenue.city} {selectedVenue.state}</p>
              {!selectedVenue.approved && <p className='mt-1 text-amber-300'>This venue is pending approval. Gig will auto-post once approved.</p>}
            </div>
            <input type='hidden' name='venue_id' value={selectedVenue.id} />
          </>
        ) : (
          <Select name='venue_id' defaultValue={preferredVenueId && venues.some((v) => v.id === preferredVenueId) ? String(preferredVenueId) : ''}>
            <option value=''>Select a venue</option>
            {venues.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.suburb}){!v.approved ? ' · Pending approval' : ''}</option>)}
          </Select>
        )}

        {popupCollectives.length > 0 && <div className='space-y-2'>
          <p className='text-sm text-[var(--text-secondary)]'>Presented by pop-up collective (optional)</p>
          <Select name='popup_collective_id' defaultValue=''>
            <option value=''>No pop-up collective</option>
            {popupCollectives.map((collective) => <option key={collective.id} value={collective.id}>{collective.name} · {collective.region}</option>)}
          </Select>
        </div>}

        {role === 'artist' && <Card variant='muted' className='space-y-2 rounded-2xl p-4'>
          <p className='font-medium'>Can’t find the venue?</p>
          <p className='text-sm text-[var(--text-secondary)]'>Share details and we’ll contact them so we can establish them as a customer.</p>
          <div className='grid gap-2 sm:grid-cols-2'>
            <Input name='missing_venue_name' placeholder='Missing venue name' />
            <Input name='missing_venue_contact_email' type='email' placeholder='Venue contact email' />
          </div>
          <Textarea name='missing_venue_note' placeholder='Optional note (who to contact, city, etc.)' className='min-h-20' />
        </Card>}
      </Section>

      <Section title='Gig details' kicker='Step 2'>
        <Input name='artist_name' required placeholder='Artist/band name' />
        {partneredArtists.length > 0 && <div className='space-y-2'>
          <p className='text-sm text-[var(--text-secondary)]'>Use a partnered artist (optional)</p>
          <Select
            name='artist_id'
            defaultValue=''
            onChange={(event) => {
              const nameInput = document.querySelector("input[name='artist_name']") as HTMLInputElement | null;
              const option = event.currentTarget.options[event.currentTarget.selectedIndex];
              if (nameInput && option?.dataset.artistName) nameInput.value = option.dataset.artistName;
            }}
          >
            <option value=''>No partnered artist selected</option>
            {partneredArtists.map((artist) => <option key={artist.id} value={artist.id} data-artist-name={artist.display_name}>{artist.display_name}</option>)}
          </Select>
        </div>}

        <div className='grid grid-cols-2 gap-2'>
          <Input type='date' name='date' required />
          <Input type='time' name='start_time' required />
        </div>
        <Input type='time' name='end_time' placeholder='End time' />
        <Select name='price_type' required value={priceType} onChange={(e) => setPriceType(e.target.value)}><option>Free</option><option>Door</option><option>Ticketed</option></Select>
        {priceType !== 'Free' && <Input type='number' min='0' step='0.01' name='ticket_price' required placeholder='Ticket price' />}
        <Input name='ticket_url' placeholder='Ticket link (optional)' />
        <Textarea name='description' placeholder='Description (optional)' />
        <Input name='poster_url' placeholder='Poster image URL (optional)' />
      </Section>

      <Section title='Genres and vibe tags' kicker='Step 3'>
        <fieldset className='space-y-2'>
          <legend className='text-sm text-[var(--text-secondary)]'>Genres</legend>
          <div className='flex flex-wrap gap-2'>
            {genres.map((g) => <label key={g} className='cursor-pointer'><input type='checkbox' name='genres' value={g} className='peer sr-only' /><Badge variant='genre' className='peer-checked:border-violet-400/70 peer-checked:bg-violet-500/20 peer-checked:text-violet-100'>{g}</Badge></label>)}
          </div>
        </fieldset>
        <fieldset className='space-y-2'>
          <legend className='text-sm text-[var(--text-secondary)]'>Vibe tags</legend>
          <div className='flex flex-wrap gap-2'>
            {vibes.map((v) => <label key={v} className='cursor-pointer'><input type='checkbox' name='vibe_tags' value={v} className='peer sr-only' /><Badge variant='vibe' className='peer-checked:border-violet-300/70 peer-checked:bg-violet-400/30'>{v}</Badge></label>)}
          </div>
        </fieldset>
      </Section>

      <Button type='submit' variant='primary' size='lg'>Publish gig</Button>
    </form>
  );
}
