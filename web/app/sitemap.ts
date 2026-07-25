import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date('2026-07-26');

  return [
    {
      url: site.origin,
      lastModified: updated,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${site.origin}/docs`,
      lastModified: updated,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${site.origin}/privacy`,
      lastModified: updated,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${site.origin}/terms`,
      lastModified: updated,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
