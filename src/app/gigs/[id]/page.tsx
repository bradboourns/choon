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

  return <article className='space-y-5'>
    <img src={gig.poster_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200'} alt={gig.artist_name} className='h-64 w-full rounded-2xl object-cover'/>

    <section className='space-y-2'>
      <h1 className='text-4xl font-bold'>{gig.artist_name}</h1>
      <p className='text-2xl text-zinc-400'>
        <Link href={`/venues/${gig.venue_id}`} className='text-zinc-300 hover:text-violet-300'>{gig.venue_name}</Link>
      </p>
      {gig.popup_collective_name && <p className='text-sm text-zinc-300'>Presented by <span className='font-medium text-violet-300'>{gig.popup_collective_name}</span></p>}
      {gig.artist_id && <p><Link href={`/artists/${gig.artist_id}`} className='text-violet-300 hover:text-violet-200'>View artist information page</Link></p>}
    </section>

    <section className='grid gap-3 sm:grid-cols-2'>
      <div className='rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5'>
        <p className='text-sm uppercase tracking-wide text-violet-300'>Date</p>
        <p className='mt-2 text-3xl font-semibold'>{formatDateDDMMYYYY(gig.date)}</p>
      </div>
      <div className='rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5'>
        <p className='text-sm uppercase tracking-wide text-violet-300'>Time</p>
        <p className='mt-2 text-3xl font-semibold'>{formatTime(gig.start_time, '12h')}</p>
      </div>
    </section>

    <section className='space-y-3'>
      <div className='flex flex-wrap gap-2'>
        {JSON.parse(gig.genres).map((x: string) => <span key={x} className='rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 py-1.5'>{x}</span>)}
        {JSON.parse(gig.vibe_tags).map((x: string) => <span key={x} className='rounded-xl border border-violet-700/80 bg-violet-900/20 px-3 py-1.5 text-violet-200'>{x}</span>)}
      </div>
      <h2 className='text-2xl font-semibold'>About</h2>
      <p className='text-lg text-zinc-300'>{gig.description}</p>
    </section>

    {session && <section className='flex flex-wrap gap-2'>
      <form action='/api/save' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='action' value={isSaved ? 'unsave' : 'save'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className={`rounded-xl px-4 py-2 font-medium ${isSaved ? 'bg-zinc-100 text-zinc-900' : 'border border-zinc-600 text-zinc-100'}`}>{isSaved ? 'Saved ✓' : 'Save gig'}</button>
      </form>
      <form action='/api/gig-interest' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='status' value={interest === 'interested' ? 'none' : 'interested'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className={`rounded-xl px-4 py-2 font-medium ${interest === 'interested' ? 'bg-violet-600 text-white' : 'border border-zinc-600 text-zinc-100'}`}>✨ {interest === 'interested' ? 'Interested ✓' : 'Interested'}</button>
      </form>
      <form action='/api/gig-interest' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='status' value={interest === 'going' ? 'none' : 'going'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className={`rounded-xl px-4 py-2 font-medium ${interest === 'going' ? 'bg-emerald-600 text-white' : 'border border-zinc-600 text-zinc-100'}`}>✅ {interest === 'going' ? 'Going ✓' : 'Going'}</button>
      </form>
      {gig.artist_id && <form action='/api/follow-artist' method='post'>
        <input type='hidden' name='artist_id' value={gig.artist_id} />
        <input type='hidden' name='follow' value={followsArtist ? '0' : '1'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className='rounded-xl border border-zinc-600 px-4 py-2'>🎤 {followsArtist ? 'Following artist' : 'Follow artist'}</button>
      </form>}
    </section>}
    {!session && <Link href='/login'>Log in to save this gig</Link>}

    <section className='rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5'>
      <h2 className='text-2xl font-semibold'>Venue</h2>
      <p className='mt-3 text-2xl font-semibold'>{gig.venue_name}</p>
      <p className='text-zinc-400'>{gig.address}, {gig.suburb} {gig.postcode}</p>
      {gig.ticket_url && (
        <a className='mt-5 block rounded-2xl border border-violet-600 bg-violet-900/30 p-4 text-center text-2xl font-bold text-violet-200 hover:bg-violet-800/40' href={gig.ticket_url}>
          🎟️ Tickets
        </a>
      )}
      <div className='mt-4 flex flex-wrap gap-2'>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://maps.google.com/?q=${encodeURIComponent(`${gig.address}, ${gig.suburb}, ${gig.city}`)}`}>Get directions</a>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://wa.me/?text=${encodeURIComponent('Check out this gig on Choon: '+process.env.NEXT_PUBLIC_BASE_URL+'/gigs/'+gig.id)}`}>Share</a>
      </div>
    </section>
  </article>;
}
