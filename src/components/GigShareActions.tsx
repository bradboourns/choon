'use client';

import { useMemo, useState } from 'react';

type Props = {
  gigId: number;
  artistName: string;
  venueName: string;
};

export default function GigShareActions({ gigId, artistName, venueName }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/gigs/${gigId}`;
    return `${window.location.origin}/gigs/${gigId}`;
  }, [gigId]);

  const shareText = `Check out ${artistName} at ${venueName} on Choon`;
  const encodedText = encodeURIComponent(`${shareText}: ${shareUrl}`);
  const encodedSubject = encodeURIComponent(`Gig recommendation: ${artistName}`);

  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `${artistName} at ${venueName}`,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // user cancelled share sheet
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className='mt-4 space-y-3'>
      <div className='flex flex-wrap gap-2'>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button type='button' onClick={handleNativeShare} className='rounded-xl border border-zinc-600 px-4 py-2'>Share…</button>
        )}
        <button type='button' onClick={handleCopy} className='rounded-xl border border-zinc-600 px-4 py-2'>
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`sms:?body=${encodedText}`}>Text message</a>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://wa.me/?text=${encodedText}`} target='_blank' rel='noreferrer'>WhatsApp</a>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target='_blank' rel='noreferrer'>Facebook</a>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://x.com/intent/tweet?text=${encodedText}`} target='_blank' rel='noreferrer'>X</a>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target='_blank' rel='noreferrer'>LinkedIn</a>
        <a className='rounded-xl border border-zinc-600 px-4 py-2' href={`mailto:?subject=${encodedSubject}&body=${encodedText}`}>Email</a>
      </div>
      <p className='text-xs text-zinc-400'>Share through your preferred app, including phone messages and social platforms.</p>
    </div>
  );
}
