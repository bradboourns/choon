import type { Metadata, Viewport } from 'next';
import './globals.css';
import ScrollRestoration from '@/components/shell/ScrollRestoration';

export const metadata: Metadata = {
  title: 'Choon',
  description: 'Live music for fans, artists, and venues.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Choon' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0d12',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
