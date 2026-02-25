import { getGig } from '@/lib/data';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';
import db from '@/lib/db';

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const gig = getGig(Number(p.id));
  const session = await getSession();

  if (!gig) return <p>Gig not found.</p>;

  const isSaved = session
    ? Boolean(db.prepare('SELECT 1 FROM saved_gigs WHERE user_id = ? AND gig_id = ?').get(session.id, gig.id))
    : false;
  const interest = session
    ? ((db.prepare("SELECT status FROM gig_interest WHERE user_id = ? AND gig_id = ?").get(session.id, gig.id) as { status?: 'interested' | 'going' } | undefined)
        ?.status || 'none')
    : 'none';
  const followsArtist = session && gig.artist_id
    ? Boolean(db.prepare('SELECT 1 FROM artist_follows WHERE user_id = ? AND artist_id = ?').get(session.id, gig.artist_id))
    : false;

  return <article className='space-y-4'>
    <img src={gig.poster_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200'} alt={gig.artist_name} className='h-64 w-full rounded-2xl object-cover'/>
    <h1 className='text-3xl font-bold'>{gig.artist_name}</h1>
    <p><Link href={`/venues/${gig.venue_id}`} className='text-violet-300 hover:text-violet-200'>{gig.venue_name}</Link> · {gig.address}, {gig.suburb} {gig.postcode}</p>
    {gig.artist_id && <p><Link href={`/artists/${gig.artist_id}`} className='text-violet-300 hover:text-violet-200'>View artist information page</Link></p>}
    <p>{formatDateDDMMYYYY(gig.date)} at {formatTime(gig.start_time, '12h')}</p>
    <p>{gig.price_type === 'Free' ? 'Free entry' : `Ticket price: $${Number(gig.ticket_price || 0).toFixed(2)}`}</p>
    <p>{gig.description}</p>
    <div className='flex gap-2'>{JSON.parse(gig.genres).map((x:string)=><span key={x} className='rounded bg-zinc-800 px-2 py-1'>{x}</span>)}</div>
    <div className='flex flex-wrap gap-3'>
      <a className='rounded bg-violet-600 px-3 py-2' href={`https://maps.google.com/?q=${encodeURIComponent(`${gig.address}, ${gig.suburb}, ${gig.city}`)}`}>Get directions</a>
      {gig.ticket_url && <a className='rounded border px-3 py-2' href={gig.ticket_url}>Tickets</a>}
      <a className='rounded border px-3 py-2' href={`https://wa.me/?text=${encodeURIComponent('Check out this gig on Choon: '+process.env.NEXT_PUBLIC_BASE_URL+'/gigs/'+gig.id)}`}>Share</a>
    </div>
    {session && <div className='flex flex-wrap gap-2'>
      <form action='/api/save' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='action' value={isSaved ? 'unsave' : 'save'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className='rounded bg-zinc-100 px-3 py-2 text-zinc-900'>{isSaved ? 'Saved ✓' : 'Save gig'}</button>
      </form>
      <form action='/api/gig-interest' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='status' value={interest === 'interested' ? 'none' : 'interested'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className='rounded border border-zinc-600 px-3 py-2'>✨ Interested</button>
      </form>
      <form action='/api/gig-interest' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='status' value={interest === 'going' ? 'none' : 'going'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className='rounded border border-zinc-600 px-3 py-2'>✅ Going</button>
      </form>
      {gig.artist_id && <form action='/api/follow-artist' method='post'>
        <input type='hidden' name='artist_id' value={gig.artist_id} />
        <input type='hidden' name='follow' value={followsArtist ? '0' : '1'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className='rounded border border-zinc-600 px-3 py-2'>🎤 {followsArtist ? 'Following artist' : 'Follow artist'}</button>
      </form>}
    </div>}
    {!session && <Link href='/login'>Log in to save this gig</Link>}
  </article>;
}
