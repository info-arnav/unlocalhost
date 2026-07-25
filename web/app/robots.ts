import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/denied', '/connect'],
    },
    sitemap: `${site.origin}/sitemap.xml`,
  };
}
