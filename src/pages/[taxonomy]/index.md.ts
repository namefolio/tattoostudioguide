import type { APIRoute } from 'astro';
import { site } from '../../../site.config';
import { loadAll } from '../../lib/data';
import { allPrimaryTerms, primaryTerms } from '../../lib/discovery';
import { mdResponse } from '../../lib/markdown';

export const getStaticPaths = () => [{ params: { taxonomy: site.primaryTaxonomy } }];
export const GET: APIRoute = async () => {
  const { listings } = await loadAll();
  const rows = allPrimaryTerms().map(([k, label]) => {
    const n = listings.filter((l) => primaryTerms(l).includes(k)).length;
    return `- **${label}** (${n} listed): ${site.termIntros[k] ?? ''}`;
  });
  return mdResponse(`# ${site.ui.termsH1}\n\nCanonical URL: ${site.url}/${site.primaryTaxonomy}/\n\n${rows.join('\n')}`);
};
