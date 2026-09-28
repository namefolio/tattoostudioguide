# TattooStudioGuide.com

A static directory of US tattoo shops. Astro (static output, zero client JS) served by Cloudflare Workers static assets; one tiny Worker handles the "Add your business" form. Listings are JSON files, so an AI agent can maintain them: see [UPDATING.md](UPDATING.md). Research and design decisions: [docs/BRIEF.md](docs/BRIEF.md).

## Develop

```sh
npm install
npm run dev            # includes demo listings
npm run check          # types + content schema (warns while PLACEHOLDER values remain)
npm test               # form handler + Verified expiry tests
npm run build          # production build (demo listings excluded)
npm run build:demo     # build with demo listings
npm run check:wording  # after a build: no "verified" wording outside the Verified tier copy
npm run lighthouse     # after build:demo: mobile Lighthouse on home, a city and a listing; fails below 100
npm run preview        # build:demo + wrangler dev (form works locally with .dev.vars test keys)
```

For the form locally, copy `.dev.vars.example` to `.dev.vars` (Turnstile test keys).

## Deploy

`.github/workflows/deploy.yml` checks, tests, builds and runs `wrangler deploy` on every push to `main` and once a day (so expired Verified listings drop to Basic). It needs repo secrets `CLOUDFLARE_API_TOKEN` (Workers edit permission) and `CLOUDFLARE_ACCOUNT_ID`. Set the repo variable `INCLUDE_DEMO=1` while there is no real data. Manual: `npm run deploy` (or `npm run deploy:demo`).

One-time Cloudflare setup:
1. Add the custom domain to the Worker (Workers → tattoostudioguide → Settings → Domains).
2. Enable Email Routing on the domain and verify the submissions inbox as a destination address; put that address in `wrangler.jsonc` (`send_email.destination_address` and `SUBMISSIONS_TO`).
3. Create a Turnstile widget for the domain; put the site key in `wrangler.jsonc` (`TURNSTILE_SITE_KEY`) and run `npx wrangler secret put TURNSTILE_SECRET`. Without the secret the form fails closed.
4. Set the payment link's success URL (e.g. back to `/listing-plans/`).
5. In AI Crawl Control, make sure AI crawlers are allowed; optionally enable Markdown for Agents.

## Start the next domain from this repo

The engine (`src/lib`, `src/pages`, `src/components`, `src/styles`, `src/worker.ts`, `src/form.ts`) holds no niche words. For a new site change only:

- `site.config.ts`: name, domain, placeholders, entity nouns, URL hub, schema.org type, credential check, regions, attributes, taxonomies, card facts, FAQs and title templates.
- `src/theme.css`: palette, font and feel (and swap `public/fonts/`, `public/favicon.svg`).
- `docs/BRIEF.md`: the new keyword research and design direction.
- `src/content/listings/**`: the listing files (`npm run remove-demo`, then `npm run import-csv`).
- `wrangler.jsonc` and `astro.config.mjs`: the Worker name and site URL.
