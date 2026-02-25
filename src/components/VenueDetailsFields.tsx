'use client';

import { useMemo, useState } from 'react';

type VenueAutofillResponse = {
  address?: string;
  suburb?: string;
  postcode?: string;
  city?: string;
  state?: string;
  website?: string;
  instagram?: string;
  description?: string;
};

function normalizeInstagram(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.includes('instagram.com/')) {
    const handle = trimmed.split('instagram.com/')[1]?.split('/')[0] || '';
    return handle.replace('@', '');
  }
  return trimmed.replace('@', '');
}

export default function VenueDetailsFields({
  showContainer = false,
  required = true,
  defaultCity = 'Gold Coast',
  defaultState = 'QLD',
}: {
  showContainer?: boolean;
  required?: boolean;
  defaultCity?: string;
  defaultState?: string;
}) {
  const [venueName, setVenueName] = useState('');
  const [abn, setAbn] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [state, setState] = useState(defaultState);
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerClassName = useMemo(
    () => (showContainer ? 'space-y-2 rounded border border-zinc-800 p-3' : 'space-y-3'),
    [showContainer],
  );

  async function runAutofill() {
    if (!venueName.trim()) {
      setStatus('Enter a venue name first.');
      return;
    }

    setIsLoading(true);
    setStatus('Searching public place data...');

    try {
      const params = new URLSearchParams({ q: venueName, city, state });
      const response = await fetch(`/api/venue-lookup?${params.toString()}`);
      if (!response.ok) {
        setStatus('Could not auto-fill right now. You can still enter details manually.');
        return;
      }
      const payload = (await response.json()) as VenueAutofillResponse;
      if (!payload.address && !payload.website && !payload.instagram) {
        setStatus('No reliable match found. Please enter details manually.');
        return;
      }

      if (payload.address && !address) setAddress(payload.address);
      if (payload.suburb && !suburb) setSuburb(payload.suburb);
      if (payload.postcode && !postcode) setPostcode(payload.postcode);
      if (payload.city && (!city || city === defaultCity)) setCity(payload.city);
      if (payload.state && (!state || state === defaultState)) setState(payload.state);
      if (payload.website && !website) setWebsite(payload.website);
      if (payload.instagram && !instagram) setInstagram(normalizeInstagram(payload.instagram));
      if (payload.description && !notes) setNotes(payload.description);

      setStatus('Auto-fill complete. Please review before submitting.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={containerClassName}>
      {showContainer && <p className='text-sm font-semibold'>Venue details</p>}
      <div className='flex flex-wrap items-center gap-2'>
        <input
          name='venue_name'
          required={required}
          placeholder='Venue name'
          className='min-w-72 flex-1 rounded bg-zinc-900 p-2'
          value={venueName}
          onChange={(event) => setVenueName(event.target.value)}
        />
        <button
          type='button'
          onClick={runAutofill}
          disabled={isLoading}
          className='rounded border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isLoading ? 'Checking...' : 'Auto-fill from web'}
        </button>
      </div>
      <p className='text-xs text-zinc-500'>Best-effort lookup via open public map data. Website/Instagram/about may be unavailable.</p>
      {status && <p className='text-xs text-zinc-400'>{status}</p>}

      <input name='abn' required={required} placeholder='ABN' className='w-full rounded bg-zinc-900 p-2' value={abn} onChange={(event) => setAbn(event.target.value)} />
      <input name='address' required={required} placeholder='Street address' className='w-full rounded bg-zinc-900 p-2' value={address} onChange={(event) => setAddress(event.target.value)} />
      <div className='grid grid-cols-2 gap-2'>
        <input name='suburb' required={required} placeholder='Suburb' className='rounded bg-zinc-900 p-2' value={suburb} onChange={(event) => setSuburb(event.target.value)} />
        <input name='postcode' required={required} placeholder='Postcode' className='rounded bg-zinc-900 p-2' value={postcode} onChange={(event) => setPostcode(event.target.value)} />
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <input name='city' required={required} placeholder='City' className='rounded bg-zinc-900 p-2' value={city} onChange={(event) => setCity(event.target.value)} />
        <input name='state' required={required} placeholder='State' className='rounded bg-zinc-900 p-2' value={state} onChange={(event) => setState(event.target.value)} />
      </div>
      <input name='website' placeholder='Website (optional)' className='w-full rounded bg-zinc-900 p-2' value={website} onChange={(event) => setWebsite(event.target.value)} />
      <input name='instagram' placeholder='Instagram handle (optional)' className='w-full rounded bg-zinc-900 p-2' value={instagram} onChange={(event) => setInstagram(event.target.value)} />
      <textarea name='notes' placeholder='Notes for admin (optional)' className='w-full rounded bg-zinc-900 p-2' value={notes} onChange={(event) => setNotes(event.target.value)} />
    </div>
  );
}
