'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function GigMap({ gigs }: { gigs: any[] }) {
  return (
    <MapContainer center={[-37.81, 144.96]} zoom={11} className="h-[420px] w-full rounded-2xl z-0">
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
