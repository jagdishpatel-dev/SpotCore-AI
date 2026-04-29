import type { Metadata } from 'next';
import './globals.css';
import ClientNav from '@/lib/components/ClientNav';
import ThemeShell from '@/lib/components/ThemeShell';

export const metadata: Metadata = {
  title: 'GeoScore AI',
  description: 'GeoScore AI — evaluate a NYC-area retail location in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas text-ink antialiased">
        <ThemeShell>
          <ClientNav />
          {children}
        </ThemeShell>
      </body>
    </html>
  );
}
