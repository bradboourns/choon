import { getGig } from '@/lib/data';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';
import db from '@/lib/db';
import { updateGigDetailsAction } from '@/app/actions';

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
  const canEditGig = session
    ? gig.created_by_user_id === session.id || (session.role === 'venue_admin' && Boolean(db.prepare('SELECT 1 FROM venue_memberships WHERE user_id = ? AND venue_id = ? AND approved = 1').get(session.id, gig.venue_id)))
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
        <button className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-medium ${isSaved ? 'bg-zinc-100 text-zinc-900' : 'border border-zinc-600 text-zinc-100'}`}>
          <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z' /></svg>
          {isSaved ? 'Saved' : 'Save gig'}
        </button>
      </form>
      <form action='/api/gig-interest' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='status' value={interest === 'interested' ? 'none' : 'interested'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-medium ${interest === 'interested' ? 'bg-violet-600 text-white' : 'border border-zinc-600 text-zinc-100'}`}>
          <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.1L12 17.2 6.4 20l1.1-6.1L3 9.5l6.2-.9L12 3Z' /></svg>
          {interest === 'interested' ? 'Interested' : 'Mark interested'}
        </button>
      </form>
      <form action='/api/gig-interest' method='post'>
        <input type='hidden' name='gig_id' value={gig.id}/>
        <input type='hidden' name='status' value={interest === 'going' ? 'none' : 'going'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-medium ${interest === 'going' ? 'bg-emerald-600 text-white' : 'border border-zinc-600 text-zinc-100'}`}>
          <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='m5 12 4 4L19 6' /></svg>
          {interest === 'going' ? 'Going' : 'Mark going'}
        </button>
      </form>
      {gig.artist_id && <form action='/api/follow-artist' method='post'>
        <input type='hidden' name='artist_id' value={gig.artist_id} />
        <input type='hidden' name='follow' value={followsArtist ? '0' : '1'} />
        <input type='hidden' name='redirect_to' value={`/gigs/${gig.id}`} />
        <button className='inline-flex items-center gap-1.5 rounded-xl border border-zinc-600 px-4 py-2'>
          <svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><circle cx='9' cy='8' r='3' /><path d='M4 19c1.5-3 3.8-5 6.5-5' /><path d='M16 7v8M12 11h8' /></svg>
          {followsArtist ? 'Following artist' : 'Follow artist'}
        </button>
      </form>}
    </section>}
    {!session && <Link href='/login'>Log in to save this gig</Link>}

    {canEditGig && <section className='space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4'>
      <h2 className='text-xl font-semibold'>Edit this gig</h2>
      <p className='text-sm text-zinc-400'>You manage this venue/gig, so you can update the event details directly from this page.</p>
      <form action={updateGigDetailsAction} className='grid gap-2 sm:grid-cols-2'>
        <input type='hidden' name='gig_id' value={gig.id} />
        <input type='hidden' name='return_to' value={`/gigs/${gig.id}`} />
        <input name='artist_name' defaultValue={gig.artist_name} required className='rounded bg-zinc-950 p-2' />
        <input type='date' name='date' defaultValue={gig.date} required className='rounded bg-zinc-950 p-2' />
        <input type='time' name='start_time' defaultValue={gig.start_time} required className='rounded bg-zinc-950 p-2' />
        <input type='time' name='end_time' defaultValue={gig.end_time || ''} className='rounded bg-zinc-950 p-2' />
        <select name='price_type' defaultValue={gig.price_type} className='rounded bg-zinc-950 p-2'>
          <option>Free</option>
          <option>Door</option>
          <option>Ticketed</option>
        </select>
        <input type='number' min='0' step='0.01' name='ticket_price' defaultValue={gig.ticket_price ?? 0} className='rounded bg-zinc-950 p-2' />
        <input name='ticket_url' defaultValue={gig.ticket_url || ''} className='rounded bg-zinc-950 p-2 sm:col-span-2' placeholder='Ticket URL' />
        <textarea name='description' defaultValue={gig.description || ''} className='rounded bg-zinc-950 p-2 sm:col-span-2' placeholder='Description' />
        <input name='poster_url' defaultValue={gig.poster_url || ''} className='rounded bg-zinc-950 p-2 sm:col-span-2' placeholder='Poster image URL' />
        <button className='rounded bg-violet-600 px-4 py-2 font-medium text-white sm:col-span-2'>Save gig updates</button>
      </form>
    </section>}

    <section className='rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5'>
      <h2 className='text-2xl font-semibold'>Venue</h2>
      <p className='mt-3 text-2xl font-semibold'>{gig.venue_name}</p>
      <p className='text-zinc-400'>{gig.address}, {gig.suburb} {gig.postcode}</p>
      {gig.ticket_url && (
        <a className='mt-5 block rounded-2xl border border-violet-600 bg-violet-900/30 p-4 text-center text-2xl font-bold text-violet-200 hover:bg-violet-800/40' href={gig.ticket_url}>
          Tickets
        </a>
      )}
      <div className='mt-4 flex flex-wrap gap-2'>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://maps.google.com/?q=${encodeURIComponent(`${gig.address}, ${gig.suburb}, ${gig.city}`)}`}>Get directions</a>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://wa.me/?text=${encodeURIComponent('Check out this gig on Choon: '+process.env.NEXT_PUBLIC_BASE_URL+'/gigs/'+gig.id)}`}>Share</a>
      </div>
    </section>
  </article>;
}
