// Compact search index for /studios/. Same order as the site's lists (Verified first, then most complete).
import type { APIRoute } from 'astro';
import { site } from '../../../site.config';
import { regionName } from '../../lib/core';
import { loadAll } from '../../lib/data';
import { allPrimaryTerms, filterKeys, initials, place, primaryTerms } from '../../lib/discovery';
import { photos } from '../../lib/images';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

export const GET: APIRoute = async () => {
  const { listings } = await loadAll();
  const rows = await Promise.all(
    listings.map(async (l) => {
      const [cover] = await photos(l, [400, 640, 960], 1);
      return {
        n: l.name,
        u: l.url,
        p: place(l),
        h: ` ${norm([l.name, l.address.street, l.address.city, l.address.region, regionName(l.regionSlug), l.address.postalCode].join(' '))}`,
        t: primaryTerms(l),
        f: filterKeys(l),
        ...(l.effectiveTier === 'verified' && { v: 1 }),
        fl: site.cardFlags(l).slice(0, 3),
        in: initials(l.name),
        ...(cover && { i: { src: cover.src, srcset: cover.srcset, w: cover.width, h: cover.height, alt: cover.alt } }),
      };
    }),
  );
  const body = {
    one: site.ui.one,
    many: site.ui.many,
    terms: Object.fromEntries(allPrimaryTerms()),
    syn: site.termSynonyms,
    filters: Object.fromEntries(site.filters.map((f) => [f.key, f.label])),
    fwords: Object.fromEntries(site.filters.map((f) => [f.key, f.words])),
    stop: [...new Set([...site.ui.searchStopwords, ...norm(`${site.entity.one} ${site.entity.many} ${site.ui.one} ${site.ui.many}`).split(' '), 'near', 'me', 'in', 'the', 'a', 'an', 'for', 'and', 'of', 'best', 'top', 'shop', 'shops', 'studio', 'studios'])],
    rows,
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
