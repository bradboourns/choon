import { getGig } from '@/lib/data';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { formatDateDDMMYYYY, formatTime } from '@/lib/format';
import db from '@/lib/db';
import { updateGigDetailsAction } from '@/app/actions';
import GigInterestButtons from '@/components/GigInterestButtons';
import SaveGigButton from '@/components/SaveGigButton';
import FollowArtistButton from '@/components/FollowArtistButton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const gig = getGig(Number(p.id));
  const session = await getSession();

  if (!gig) return <p>Gig not found.</p>;

  const isSaved = session ? Boolean(db.prepare('SELECT 1 FROM saved_gigs WHERE user_id = ? AND gig_id = ?').get(session.id, gig.id)) : false;
  const interest = session ? ((db.prepare("SELECT status FROM gig_interest WHERE user_id = ? AND gig_id = ?").get(session.id, gig.id) as { status?: 'interested' | 'going' } | undefined)?.status || 'none') : 'none';
  const followsArtist = session && gig.artist_id ? Boolean(db.prepare('SELECT 1 FROM artist_follows WHERE user_id = ? AND artist_id = ?').get(session.id, gig.artist_id)) : false;
  const canEditGig = session ? gig.created_by_user_id === session.id || (session.role === 'venue_admin' && Boolean(db.prepare('SELECT 1 FROM venue_memberships WHERE user_id = ? AND venue_id = ? AND approved = 1').get(session.id, gig.venue_id))) : false;

  const artistFollowers = gig.artist_id ? Number((db.prepare('SELECT COUNT(*) AS total FROM artist_follows WHERE artist_id = ?').get(gig.artist_id) as { total: number }).total || 0) : 0;

  return <article className='space-y-5'>
    <Card variant='glass' className='overflow-hidden p-0'>
      <img src={gig.poster_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200'} alt={gig.artist_name} className='h-64 w-full object-cover md:h-80' />
      <div className='space-y-4 p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]'>Live event</p>
            <h1 className='text-4xl font-bold'>{gig.artist_name}</h1>
            <p className='text-sm text-[var(--text-secondary)]'>at <Link href={`/venues/${gig.venue_id}`} className='hover:text-violet-200'>{gig.venue_name}</Link></p>
          </div>
          {canEditGig && <details className='group rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2'>
            <summary className='cursor-pointer list-none rounded-md px-3 py-1 text-sm text-[var(--text-secondary)] hover:text-white'>Edit</summary>
            <form action={updateGigDetailsAction} className='mt-3 grid gap-2 sm:w-[36rem] sm:grid-cols-2'>
              <input type='hidden' name='gig_id' value={gig.id} />
              <input type='hidden' name='return_to' value={`/gigs/${gig.id}`} />
              <Input name='artist_name' defaultValue={gig.artist_name} required />
              <Input type='date' name='date' defaultValue={gig.date} required />
              <Input type='time' name='start_time' defaultValue={gig.start_time} required />
              <Input type='time' name='end_time' defaultValue={gig.end_time || ''} />
              <Select name='price_type' defaultValue={gig.price_type}><option>Free</option><option>Door</option><option>Ticketed</option></Select>
              <Input type='number' min='0' step='0.01' name='ticket_price' defaultValue={gig.ticket_price ?? 0} />
              <Input name='ticket_url' defaultValue={gig.ticket_url || ''} className='sm:col-span-2' placeholder='Ticket URL' />
              <Textarea name='description' defaultValue={gig.description || ''} className='sm:col-span-2' placeholder='Description' />
              <Input name='poster_url' defaultValue={gig.poster_url || ''} className='sm:col-span-2' placeholder='Poster image URL' />
              <Button type='submit' variant='primary' className='sm:col-span-2'>Save</Button>
            </form>
          </details>}
        </div>

        <div className='flex flex-wrap gap-2'>
          {JSON.parse(gig.genres).map((x: string) => <Badge key={x} variant='genre'>{x}</Badge>)}
          {JSON.parse(gig.vibe_tags).map((x: string) => <Badge key={x} variant='vibe'>{x}</Badge>)}
        </div>
      </div>
    </Card>

    <section className='grid gap-3 sm:grid-cols-2'>
      <Card variant='elevated' className='rounded-3xl'><p className='text-sm uppercase tracking-wide text-violet-300'>Date</p><p className='mt-2 text-3xl font-semibold'>{formatDateDDMMYYYY(gig.date)}</p></Card>
      <Card variant='elevated' className='rounded-3xl'><p className='text-sm uppercase tracking-wide text-violet-300'>Time</p><p className='mt-2 text-3xl font-semibold'>{formatTime(gig.start_time, '12h')}</p></Card>
    </section>

    <section className='grid gap-3 sm:grid-cols-2'>
      {gig.artist_id && <Card variant='muted' className='rounded-2xl'><p className='text-xs uppercase tracking-wide text-[var(--text-tertiary)]'>Artist followers on Choon</p><p className='mt-1 text-2xl font-semibold'>{artistFollowers}</p></Card>}
      {gig.artist_show_spotify_monthly_listeners === 1 && <Card variant='muted' className='rounded-2xl'><p className='text-xs uppercase tracking-wide text-[var(--text-tertiary)]'>Spotify monthly listeners</p><p className='mt-1 text-2xl font-semibold'>{Number(gig.artist_spotify_monthly_listeners || 0).toLocaleString()}</p></Card>}
    </section>

    <Card variant='default' className='space-y-3'>
      <h2 className='text-2xl font-semibold'>About</h2>
      <p className='text-lg text-[var(--text-secondary)]'>{gig.description}</p>
      {gig.popup_collective_name && <p className='text-sm text-[var(--text-secondary)]'>Presented by {gig.popup_collective_slug ? <Link href={`/collectives/${gig.popup_collective_slug}`} className='text-zinc-200 hover:text-violet-300'>{gig.popup_collective_name}</Link> : <span className='text-zinc-300'>{gig.popup_collective_name}</span>}</p>}
      {gig.artist_id && <p><Link href={`/artists/${gig.artist_id}`} className='text-violet-300 hover:text-violet-200'>View artist information page</Link></p>}
    </Card>

    {session && <section className='flex flex-wrap gap-2'>
      <SaveGigButton gigId={gig.id} initiallySaved={isSaved} />
      <GigInterestButtons gigId={gig.id} initialStatus={interest as 'interested' | 'going' | 'none'} />
      {gig.artist_id && <FollowArtistButton artistId={gig.artist_id} initiallyFollowing={followsArtist} />}
    </section>}

    {!session && <Card variant='muted' className='border-violet-500/30 bg-violet-900/20'>
      <p className='text-sm text-violet-100'>Searching is totally free. Create an account if you want to save this gig, mark interest, or follow the venue so Choon can track it for you.</p>
      <div className='mt-3 flex flex-wrap gap-2'>
        <Link href={`/register?intent=interested&gig=${gig.id}`} className='rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500'>I&apos;m interested</Link>
        <Link href={`/register?intent=follow-venue&venue=${gig.venue_id}`} className='rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm hover:bg-[var(--surface-muted)]'>Follow venue</Link>
        <Link href='/login' className='rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm hover:bg-[var(--surface-muted)]'>Already have an account? Log in</Link>
      </div>
    </Card>}

    <Card variant='elevated'>
      <h2 className='text-2xl font-semibold'>Venue</h2>
      <p className='mt-2 text-2xl font-semibold'><Link href={`/venues/${gig.venue_id}`} className='hover:text-violet-300'>{gig.venue_name}</Link></p>
      <p className='text-[var(--text-secondary)]'>{gig.address}, {gig.suburb} {gig.postcode}</p>
      {gig.ticket_url && <a className='mt-5 block rounded-2xl border border-violet-600 bg-violet-900/30 p-4 text-center text-2xl font-bold text-violet-200 hover:bg-violet-800/40' href={gig.ticket_url}>Tickets</a>}
      <Link href={`/venues/${gig.venue_id}`} className='mt-4 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-[var(--text-secondary)] transition hover:border-violet-400/60 hover:bg-[var(--surface-muted)] hover:text-zinc-100'><span className='text-sm'>Explore venue profile</span><svg aria-hidden viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current stroke-2'><path d='m9 6 6 6-6 6' /></svg></Link>
    </Card>
  </article>;
}
