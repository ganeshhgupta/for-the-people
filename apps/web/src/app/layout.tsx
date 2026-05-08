import type { Metadata } from 'next';
import { Playfair_Display, Crimson_Text } from 'next/font/google';
import './globals.css';
import { SplashScreen } from '../components/SplashScreen';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const crimson  = Crimson_Text({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-crimson', display: 'swap' });

export const metadata: Metadata = {
  title: 'For the People',
  description: 'Indian news, synthesized without spin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${crimson.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try { var t=localStorage.getItem('ftp-theme'); if(t) document.documentElement.setAttribute('data-theme',t); } catch(e){}
        ` }} />
      </head>
      <body suppressHydrationWarning>
        <SplashScreen />
        <main style={{ maxWidth: '760px', margin: '0 auto', padding: '0 0 5rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
