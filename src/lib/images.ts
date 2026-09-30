// Listing photos live in src/assets/listings/{slug}/ and are resized to WebP at build time.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { ListingData } from './types';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/listings/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}', { eager: true });

export interface Photo { src: string; srcset: string; width: number; height: number; alt: string }

/** Responsive WebP versions of a listing's photos (first is the cover). Fails the build if a file is missing. */
export async function photos(l: Pick<ListingData, 'slug' | 'images'>, widths = [480, 800, 1200], limit = 12): Promise<Photo[]> {
  const out: Photo[] = [];
  for (const img of (l.images ?? []).slice(0, limit)) {
    const mod = files[`/src/assets/listings/${l.slug}/${img.file}`];
    if (!mod) throw new Error(`Listing ${l.slug}: photo ${img.file} not found in src/assets/listings/${l.slug}/`);
    const meta = mod.default;
    const ws = widths.filter((w) => w < meta.width).concat(Math.min(meta.width, widths[widths.length - 1]));
    const res = await getImage({ src: meta, widths: [...new Set(ws)], format: 'webp', quality: 78 });
    out.push({ src: res.src, srcset: res.srcSet.attribute, width: meta.width, height: meta.height, alt: img.alt });
  }
  return out;
}
