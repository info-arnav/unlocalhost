import type { Metadata, Viewport } from 'next';
import { Analytics } from '@/components/analytics';
import { site } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'share localhost',
    'ngrok alternative with authentication',
    'deploy from Claude',
    'deploy from Cursor',
    'MCP deploy',
    'open source Vercel alternative',
    'password protect a website',
    'self hosted PaaS',
  ],
  authors: [{ name: 'Arnav Gupta', url: site.repo }],
  creator: 'Arnav Gupta',
  openGraph: {
    type: 'website',
    url: site.origin,
    siteName: site.name,
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} · ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f16' },
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: site.name,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  url: site.origin,
  description: site.description,
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'Arnav Gupta', url: site.repo },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <Analytics id={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
