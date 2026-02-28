'use client';

import { useMemo, useState, type ReactElement } from 'react';

type Props = {
  gigId: number;
  artistName: string;
  venueName: string;
};

type SocialTarget = {
  name: string;
  href: string;
  icon: ReactElement;
  external?: boolean;
};

function buildQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-4 w-4 fill-current'>
      <path d={path} />
    </svg>
  );
}

export default function GigShareActions({ gigId, artistName, venueName }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/gigs/${gigId}`;
    return `${window.location.origin}/gigs/${gigId}`;
  }, [gigId]);

  const shareText = `Check out ${artistName} at ${venueName} on Choon`;
  const emailSubject = `Gig recommendation: ${artistName}`;
  const emailBody = `${shareText}\n\n${shareUrl}`;

  const socialTargets = useMemo<SocialTarget[]>(() => [
    {
      name: 'Text message',
      href: `sms:?${buildQuery({ body: `${shareText}: ${shareUrl}` })}`,
      icon: <Icon path='M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 8H6V8h12zm-4 3H6v-2h8z' />,
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?${buildQuery({ text: `${shareText} ${shareUrl}` })}`,
      icon: <Icon path='M20.52 3.48A11.8 11.8 0 0 0 12.05 0C5.56 0 .28 5.28.28 11.77c0 2.07.54 4.1 1.57 5.89L0 24l6.53-1.81a11.7 11.7 0 0 0 5.52 1.4h.01c6.49 0 11.77-5.28 11.77-11.77 0-3.14-1.22-6.09-3.31-8.34zM12.06 21.6h-.01a9.7 9.7 0 0 1-4.94-1.35l-.35-.2-3.88 1.08 1.04-3.78-.22-.39a9.76 9.76 0 1 1 8.36 4.64zm5.35-7.33c-.29-.15-1.7-.84-1.96-.93-.26-.1-.45-.15-.64.15-.19.29-.74.93-.91 1.12-.17.19-.34.22-.63.08-.29-.15-1.23-.45-2.34-1.44-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.44.13-.59.13-.13.29-.34.43-.5.14-.17.19-.29.29-.49.1-.19.05-.37-.02-.52-.08-.15-.64-1.56-.88-2.14-.23-.56-.47-.48-.64-.49-.17-.01-.37-.01-.57-.01-.19 0-.52.07-.79.37-.27.29-1.03 1-1.03 2.43s1.05 2.81 1.2 3c.15.19 2.06 3.15 4.99 4.42.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.56-.34z' />,
      external: true,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?${buildQuery({ u: shareUrl })}`,
      icon: <Icon path='M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07c0 5.03 3.66 9.2 8.44 9.93v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.56v1.9h2.78l-.44 2.9h-2.34V22c4.78-.73 8.44-4.9 8.44-9.93z' />,
      external: true,
    },
    {
      name: 'X',
      href: `https://x.com/intent/tweet?${buildQuery({ text: shareText, url: shareUrl })}`,
      icon: <Icon path='M18.9 2H22l-6.77 7.74L23 22h-6.1l-4.78-6.26L6.68 22H3.57l7.24-8.28L1 2h6.25l4.32 5.7L18.9 2zm-1.07 18h1.69L6.33 3.9H4.52L17.83 20z' />,
      external: true,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?${buildQuery({ url: shareUrl })}`,
      icon: <Icon path='M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.48v6.26zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22 0H2C.9 0 0 .87 0 1.94v20.12C0 23.13.9 24 2 24h20c1.1 0 2-.87 2-1.94V1.94C24 .87 23.1 0 22 0z' />,
      external: true,
    },
    {
      name: 'Email',
      href: `mailto:?${buildQuery({ subject: emailSubject, body: emailBody })}`,
      icon: <Icon path='M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-.4 4L12 12.25 4.4 8h15.2zM4 18V9.4l7.5 4.2a1 1 0 0 0 1 0L20 9.4V18H4z' />,
    },
  ], [emailBody, emailSubject, shareText, shareUrl]);

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
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button type='button' onClick={handleNativeShare} className='inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-4 py-2'>
            <Icon path='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.9 2.9 0 0 0 0-1.39l7-4.11A2.99 2.99 0 1 0 14 5a3 3 0 0 0 .04.49l-7.01 4.12a3 3 0 1 0 0 4.78l7.05 4.14A3 3 0 1 0 18 16.08z' />
            Share…
          </button>
        )}
        <button type='button' onClick={handleCopy} className='inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-4 py-2'>
          <Icon path='M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z' />
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        {socialTargets.map((target) => (
          <a
            key={target.name}
            className='inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-4 py-2'
            href={target.href}
            target={target.external ? '_blank' : undefined}
            rel={target.external ? 'noreferrer' : undefined}
            aria-label={`Share via ${target.name}`}
          >
            {target.icon}
            {target.name}
          </a>
        ))}
      </div>
      <p className='text-xs text-zinc-400'>Share through your preferred app, including phone messages and social platforms.</p>
    </div>
  );
}
