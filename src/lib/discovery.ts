// Discovery helpers shared by cards, filters, the search index and the home page.
// Everything here is derived from listing data; nothing is estimated or invented.
import { site } from '../../site.config';
import { regionCode, termLabel } from './core';
import type { Listing, ListingData } from './types';

const primary = () => site.taxonomies.find((t) => t.segment === site.primaryTaxonomy) ?? site.taxonomies[0];

/** Term keys of the primary taxonomy (e.g. styles) on a listing. */
export const primaryTerms = (l: ListingData): string[] => (l.attributes[primary().attribute] as string[] | undefined) ?? [];
export const primaryLabel = (term: string) => termLabel(primary().attribute, term);
export const shortLabel = (term: string) => site.termShort[term] ?? primaryLabel(term);

/** All terms defined for the primary taxonomy, in config order. */
export function allPrimaryTerms(): [string, string][] {
  const def = site.attributes.find((a) => a.key === primary().attribute);
  return def?.type === 'multi' ? Object.entries(def.options) : [];
}

export const filterKeys = (l: ListingData) => site.filters.filter((f) => f.test(l)).map((f) => f.key);

/** Two letters for the photo placeholder. */
export function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w && !/^(the|and|of|&)$/i.test(w));
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '·';
}

export const place = (l: Listing) => `${l.address.city}, ${regionCode(l.regionSlug)}`;

/** Terms of the primary taxonomy present in these listings, most common first. */
export function termsIn(listings: Listing[]): { term: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const l of listings) for (const t of primaryTerms(l)) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].map(([term, count]) => ({ term, label: primaryLabel(term), count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Filters that at least one of these listings matches. */
export const filtersIn = (listings: Listing[]) => site.filters.filter((f) => listings.some(f.test));

/** Where a term link goes: its category page when one exists (3+ listings), otherwise search. */
export const termHref = (term: string, pageUrls: Set<string>) => {
  const url = `/${primary().segment}/${term}/`;
  return pageUrls.has(url) ? url : `/studios/?style=${encodeURIComponent(term)}`;
};
