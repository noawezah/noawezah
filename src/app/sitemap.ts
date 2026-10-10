import type { MetadataRoute } from 'next';
import { projects } from '@/lib/projects';
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: 'https://noawezah.ro', priority: 1 }, ...projects.map(p => ({ url: `https://noawezah.ro/work/${p.slug}`, priority: .7 }))]; }
