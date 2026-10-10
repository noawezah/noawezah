import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const display = localFont({
  src: [
    { path: '../../public/fonts/neue-machina-light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/neue-machina-regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/neue-machina-ultrabold.otf', weight: '800', style: 'normal' },
  ], variable: '--font-display', display: 'swap', preload: false,
});
const body = localFont({ src: '../../public/fonts/satoshi-variable.woff2', weight: '300 900', variable: '--font-body', display: 'swap' });
export const metadata: Metadata = {
  metadataBase: new URL('https://noawezah.ro'),
  title: { default: 'noawezah — Local business. Uncommon websites.', template: '%s — noawezah' },
  description: 'Independent web design and development by Ahad Zaidi. Websites with character for cafés, bars, and businesses with a world of their own.',
  openGraph: { title: 'noawezah — Local business. Uncommon websites.', description: 'Your place has character. Your website should, too.', type: 'website', locale: 'en_GB' },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>;
}
