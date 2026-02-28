import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Choon | Native Blueprint',
  description: 'Mobile-first live music discovery and event coordination platform.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
