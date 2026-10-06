import type { APIRoute } from 'astro';
import { site } from '../../../site.config';
import { basicBullets, howToSteps, onSale, payLabel, payLink, plansFaqs, plansIntro, price, soonText, verifiedBullets } from '../../lib/copy';
import { faqsMd, mdResponse } from '../../lib/markdown';

export const GET: APIRoute = () =>
  mdResponse(`# List your ${site.entity.one}: Basic or Verified

${plansIntro}

## Basic: Free

${basicBullets.map((b) => `- ${b}`).join('\n')}

## Verified: ${price}

${verifiedBullets.map((b) => `- ${b}`).join('\n')}

${
  onSale
    ? `## How to get a Verified listing

${howToSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

- Send your ${site.entity.one}’s details: ${site.url}/add-your-business/?tier=verified
- ${payLabel}: ${payLink}`
    : `## Verified is coming soon

${soonText}

- Add your ${site.entity.one} free: ${site.url}/add-your-business/`
}
${faqsMd(plansFaqs)}`);
