'use client';

import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function RecenterMap({ center, radiusKm }: { center: { lat: number; lng: number }; radiusKm: number }) {
  const map = useMap();

  useEffect(() => {
    const latDelta = radiusKm / 111;
    const safeCos = Math.max(0.2, Math.abs(Math.cos((center.lat * Math.PI) / 180)));
    const lngDelta = radiusKm / (111 * safeCos);
    const bounds = L.latLngBounds(
      [center.lat - latDelta, center.lng - lngDelta],
      [center.lat + latDelta, center.lng + lngDelta],
    );
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [center, radiusKm, map]);

  return null;
}

export default function GigMap({ gigs, center, radiusKm }: { gigs: any[]; center: { lat: number; lng: number }; radiusKm: number }) {
  const [selectedGig, setSelectedGig] = useState<any | null>(null);

  const priceLabel = useMemo(() => {
    if (!selectedGig) return '';
    if (selectedGig.price_type === 'Free') return 'Free entry';
    if (selectedGig.price_type === 'Door') return `$${(selectedGig.ticket_price ?? 0).toFixed(2)} at the door`;
    return `From $${(selectedGig.ticket_price ?? 0).toFixed(2)}`;
  }, [selectedGig]);

  return (
    <>
      <MapContainer center={[center.lat, center.lng]} zoom={11} className="h-[420px] w-full rounded-2xl z-0">
        <RecenterMap center={center} radiusKm={radiusKm} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle
          center={[center.lat, center.lng]}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.08, weight: 1.5 }}
        />
        {gigs.map((gig) => (
          <Marker key={gig.id} position={[gig.lat, gig.lng]}>
            <Popup>
              <button onClick={() => setSelectedGig(gig)} className="text-left">
                <p className="font-semibold text-violet-300 hover:text-violet-200">{gig.artist_name}</p>
                <p>{gig.venue_name}</p>
                <p className="text-xs text-zinc-600">Tap for expanded details</p>
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedGig && <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4'>
        <div className='w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h3 className='text-2xl font-bold text-zinc-100'>{selectedGig.artist_name}</h3>
              <p className='text-zinc-300'>{selectedGig.venue_name} · {selectedGig.suburb}</p>
            </div>
            <button onClick={() => setSelectedGig(null)} className='rounded-lg border border-zinc-600 px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-800'>Close</button>
          </div>
          <div className='mt-4 grid gap-3 sm:grid-cols-3'>
            <div className='rounded-xl border border-zinc-700 bg-zinc-950/70 p-3'>
              <p className='text-xs uppercase tracking-wide text-zinc-400'>Date</p>
              <p className='mt-1 font-semibold'>{formatDateDDMMYYYY(selectedGig.date)}</p>
            </div>
            <div className='rounded-xl border border-zinc-700 bg-zinc-950/70 p-3'>
              <p className='text-xs uppercase tracking-wide text-zinc-400'>Time</p>
              <p className='mt-1 font-semibold'>{formatTime(selectedGig.start_time, '12h')}</p>
            </div>
            <div className='rounded-xl border border-zinc-700 bg-zinc-950/70 p-3'>
              <p className='text-xs uppercase tracking-wide text-zinc-400'>Price</p>
              <p className='mt-1 font-semibold'>{priceLabel}</p>
            </div>
          </div>
          <p className='mt-4 text-zinc-300'>{selectedGig.address}, {selectedGig.suburb} {selectedGig.city}</p>
          <div className='mt-5 flex flex-wrap gap-2'>
            <a className='rounded-xl border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800' href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedGig.address}, ${selectedGig.suburb}, ${selectedGig.city}`)}`} target='_blank' rel='noreferrer'>Get directions</a>
            <Link href={`/venues/${selectedGig.venue_id}`} className='rounded-xl border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800'>View venue</Link>
            <Link href={`/gigs/${selectedGig.id}`} className='rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500'>More details</Link>
          </div>
        </div>
      </div>}
    </>
  );
}
