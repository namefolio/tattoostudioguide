import type { APIRoute } from 'astro';
import { site } from '../../../site.config';
import { loadAll } from '../../lib/data';
import { listingTable, mdResponse } from '../../lib/markdown';

export const getStaticPaths = () => [{ params: { browse: site.ui.many } }];
export const GET: APIRoute = async () => {
  const { listings } = await loadAll();
  return mdResponse(`# ${site.ui.Many}\n\nEvery listing on ${site.name}. Canonical URL: ${site.url}/${site.ui.many}/\n\n${listingTable(listings, true)}`);
};
