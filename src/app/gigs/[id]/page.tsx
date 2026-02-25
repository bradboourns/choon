import { getGig } from '@/lib/data';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const gig = getGig(Number(p.id));
  const session = await getSession();
  if (!gig) return <p>Gig not found.</p>;
  return <article className='space-y-4'>
    <img src={gig.poster_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200'} alt={gig.artist_name} className='h-64 w-full rounded-2xl object-cover'/>
    <h1 className='text-3xl font-bold'>{gig.artist_name}</h1>
    <p><Link href={`/venues/${gig.venue_id}`} className='text-violet-300 hover:text-violet-200'>{gig.venue_name}</Link> · {gig.address}, {gig.suburb} {gig.postcode}</p>
    {gig.artist_id && <p><Link href={`/artists/${gig.artist_id}`} className='text-violet-300 hover:text-violet-200'>View artist information page</Link></p>}
    <p>{formatDateDDMMYYYY(gig.date)} at {formatTime(gig.start_time, '12h')}</p>
    <p>{gig.price_type === 'Free' ? 'Free entry' : `Ticket price: $${Number(gig.ticket_price || 0).toFixed(2)}`}</p>
    <p>{gig.description}</p>
    <div className='flex gap-2'>{JSON.parse(gig.genres).map((x:string)=><span key={x} className='rounded bg-zinc-800 px-2 py-1'>{x}</span>)}</div>
    <div className='flex gap-3'>
      <a className='rounded bg-violet-600 px-3 py-2' href={`https://maps.google.com/?q=${encodeURIComponent(gig.address)}`}>Get directions</a>
      {gig.ticket_url && <a className='rounded border px-3 py-2' href={gig.ticket_url}>Tickets</a>}
      <a className='rounded border px-3 py-2' href={`https://wa.me/?text=${encodeURIComponent('Check out this gig on Choon: '+process.env.NEXT_PUBLIC_BASE_URL+'/gigs/'+gig.id)}`}>Share</a>
    </div>
    {session && <form action='/api/save' method='post'><input type='hidden' name='gig_id' value={gig.id}/><button className='rounded bg-zinc-100 px-3 py-2 text-zinc-900'>Save gig</button></form>}
    {!session && <Link href='/login'>Log in to save this gig</Link>}
  </article>;
}
