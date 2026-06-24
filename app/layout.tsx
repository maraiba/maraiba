import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AlarmProvider } from '../components/AlarmProvider';

export const metadata: Metadata = {
  title: 'Ébresztő',
  description: 'Ébresztő alkalmazás fotóval',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ébresztő',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-bg text-white min-h-screen">
        <AlarmProvider>{children}</AlarmProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');`,
          }}
        />
      </body>
    </html>
  );
}
