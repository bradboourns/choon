'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const GigMap = dynamic(() => import('./GigMap'), { ssr: false });

function distanceKm(a:any,b:any){const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;return (R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1)}

export default function HomeFeed({ initial }: { initial: any[] }) {
  const [tab, setTab] = useState<'list'|'map'>('list');
  const [search, setSearch] = useState('');
  const [price, setPrice] = useState('');
  const [loc, setLoc] = useState<any>(null);

  const gigs = useMemo(() => initial.filter((g) => {
    const m = `${g.artist_name} ${g.venue_name} ${g.suburb} ${g.city}`.toLowerCase().includes(search.toLowerCase());
    return m && (!price || g.price_type === price);
  }), [initial, search, price]);

  return <div className='space-y-4'>
    <section className='rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-700 p-6'>
      <h1 className='text-3xl font-bold'>Find gigs with the right vibe.</h1>
      <p className='opacity-90'>Tonight. This weekend. Next 7 days.</p>
      <div className='mt-4 flex flex-wrap gap-2'>
        <input placeholder='Search suburb, artist, venue' className='rounded px-3 py-2 text-black' value={search} onChange={(e)=>setSearch(e.target.value)} />
        <select className='rounded px-3 py-2 text-black' value={price} onChange={e=>setPrice(e.target.value)}><option value=''>All prices</option><option>Free</option><option>Door</option><option>Ticketed</option></select>
        <button className='rounded bg-black/30 px-3' onClick={()=>navigator.geolocation.getCurrentPosition((p)=>setLoc({lat:p.coords.latitude,lng:p.coords.longitude}))}>Use my location</button>
      </div>
    </section>
    <div className='flex gap-2'><button className='rounded border px-3 py-1' onClick={()=>setTab('list')}>List</button><button className='rounded border px-3 py-1' onClick={()=>setTab('map')}>Map</button></div>
    {tab==='map'?<GigMap gigs={gigs}/>:<div className='grid gap-3'>
      {gigs.map((g)=><Link href={`/gigs/${g.id}`} key={g.id} className='rounded-xl border border-zinc-800 p-4 hover:bg-zinc-900'>
        <p className='text-lg font-semibold'>{g.artist_name}</p><p>{g.venue_name} · {g.suburb}</p>
        <p>{g.date} · {g.start_time} · {g.price_type}</p>
        <div className='flex gap-2 text-xs'>{JSON.parse(g.genres).map((x:string)=><span key={x} className='rounded bg-zinc-800 px-2 py-1'>{x}</span>)}{JSON.parse(g.vibe_tags).map((x:string)=><span key={x} className='rounded bg-fuchsia-900/40 px-2 py-1'>{x}</span>)}</div>
        {loc && <p className='text-sm text-zinc-400'>{distanceKm(loc,{lat:g.lat,lng:g.lng})} km away</p>}
      </Link>)}
    </div>}
  </div>;
}
