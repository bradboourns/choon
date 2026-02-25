import { NextResponse } from 'next/server';

type NominatimResult = {
  display_name?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
};

function pickAddressPart(address?: Record<string, string>) {
  if (!address) return { suburb: '', city: '', state: '', postcode: '' };
  return {
    suburb: address.suburb || address.neighbourhood || address.town || '',
    city: address.city || address.town || address.municipality || '',
    state: address.state || '',
    postcode: address.postcode || '',
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get('q') || '').trim();
  const city = String(searchParams.get('city') || '').trim();
  const state = String(searchParams.get('state') || '').trim();

  if (!q) {
    return NextResponse.json({}, { status: 400 });
  }

  const query = [q, city, state, 'Australia'].filter(Boolean).join(', ');
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&limit=1&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'choon-dev-venue-lookup/1.0',
        Accept: 'application/json',
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return NextResponse.json({}, { status: 502 });
    }

    const results = (await response.json()) as NominatimResult[];
    const first = results[0];
    if (!first) {
      return NextResponse.json({});
    }

    const address = first.address || {};
    const streetAddress = [address.house_number, address.road].filter(Boolean).join(' ').trim() || address.road || '';
    const parts = pickAddressPart(first.address);
    const tags = first.extratags || {};

    return NextResponse.json({
      address: streetAddress,
      suburb: parts.suburb,
      city: parts.city,
      state: parts.state,
      postcode: parts.postcode,
      website: tags['contact:website'] || tags.website || tags.url || '',
      instagram: tags['contact:instagram'] || tags.instagram || '',
      description: first.display_name || '',
    });
  } catch {
    return NextResponse.json({});
  }
}
