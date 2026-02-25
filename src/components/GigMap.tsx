'use client';

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect } from 'react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);

  return null;
}

export default function GigMap({ gigs, center }: { gigs: any[]; center: { lat: number; lng: number } }) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={11} className="h-[420px] w-full rounded-2xl z-0">
      <RecenterMap center={center} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {gigs.map((gig) => (
        <Marker key={gig.id} position={[gig.lat, gig.lng]}>
          <Popup>
            <p className="font-semibold">{gig.artist_name}</p>
            <p>{gig.venue_name}</p>
            <Link href={`/gigs/${gig.id}`} className="text-blue-500">View details</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
