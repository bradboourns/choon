'use client';

import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
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
  return (
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
            <p className="font-semibold">{gig.artist_name}</p>
            <p>{gig.venue_name}</p>
            <Link href={`/gigs/${gig.id}`} className="text-blue-500">View details</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
