// Filters and search for results pages. Progressive: without JS the server-rendered list shows in full.
// Two modes on a [data-results] element:
//  - in-page (city, state, style pages): filter the cards already on the page.
//  - index (data-src, /studios/): fetch the search index and render matching cards.

interface Row { n: string; u: string; p: string; h: string; t: string[]; f: string[]; v?: 1; fl: string[]; in: string; i?: { src: string; srcset: string; w: number; h: number; alt: string } }
interface Index { terms: Record<string, string>; filters: Record<string, string>; syn: Record<string, string[]>; fwords: Record<string, string[]>; stop: string[]; one: string; many: string; rows: Row[] }
interface State { q: string; style: string; v: boolean; f: Set<string> }

const PAGE = 24;
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

/** Turns "fine line tattoo brooklyn walk ins" into a style, filters and leftover words. */
export function parse(q: string, ix: Pick<Index, 'terms' | 'syn' | 'fwords' | 'stop'>) {
  let s = ` ${norm(q)} `;
  const styles: string[] = [];
  const flags: string[] = [];
  let v = false;
  const phrases: [string, (k: string) => void, string][] = [];
  for (const [k, label] of Object.entries(ix.terms)) for (const p of new Set([norm(label), norm(k), ...(ix.syn[k] ?? []).map(norm)])) phrases.push([p, (x) => styles.push(x), k]);
  for (const [k, words] of Object.entries(ix.fwords)) for (const p of words) phrases.push([norm(p), (x) => flags.push(x), k]);
  phrases.sort((a, b) => b[0].length - a[0].length);
  for (const [p, add, k] of phrases) if (p && s.includes(` ${p} `)) { add(k); s = s.replace(` ${p} `, ' '); }
  if (/ verified /.test(s)) { v = true; s = s.replace(/ verified /g, ' '); }
  const words = s.split(' ').filter((w) => w && !ix.stop.includes(w));
  return { styles: [...new Set(styles)], flags: [...new Set(flags)], v, words };
}

// appendChild rather than append: the Worker's HTMLRewriter types also declare Element.append.
const add = (parent: Node, ...kids: Node[]) => { for (const k of kids) parent.appendChild(k); };

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
};

/** Same markup as src/components/ListingCard.astro. */
function renderCard(r: Row, ix: Index, badge: HTMLTemplateElement | null): HTMLLIElement {
  const li = el('li', r.v ? 'card is-verified' : 'card');
  const media = el('div', 'card-media');
  if (r.i) {
    const img = el('img');
    Object.assign(img, { src: r.i.src, srcset: r.i.srcset, width: r.i.w, height: r.i.h, alt: r.i.alt, loading: 'lazy', decoding: 'async' });
    img.sizes = '(min-width: 80rem) 24rem, (min-width: 40rem) 45vw, 100vw';
    add(media, img);
  } else {
    const ph = el('div', 'ph');
    ph.setAttribute('aria-hidden', 'true');
    add(ph, el('span', '', r.in));
    add(media, ph);
  }
  const h = el('h3', 'card-title');
  const a = el('a', '', r.n);
  a.href = r.u;
  add(h, a);
  add(li, media, h, el('p', 'card-loc', r.p));
  if (r.v && badge) add(li, badge.content.cloneNode(true));
  if (r.t.length) add(li, el('p', 'card-styles', r.t.slice(0, 3).map((t) => ix.terms[t] ?? t).join(' · ')));
  if (r.fl.length) add(li, el('p', 'card-flags', r.fl.slice(0, 3).join(' · ')));
  const cta = el('p', 'card-cta', `View ${ix.one} `);
  cta.setAttribute('aria-hidden', 'true');
  add(cta, el('span', '', '→'));
  add(li, cta);
  return li;
}

function setup(root: HTMLElement) {
  const $ = <T,>(s: string) => root.querySelector(s) as T | null;
  const list = $<HTMLUListElement>('[data-list]')!;
  const count = $<HTMLElement>('[data-count]');
  const empty = $<HTMLElement>('[data-empty]');
  const more = $<HTMLButtonElement>('[data-more]');
  const select = $<HTMLSelectElement>('[data-style]');
  const input = $<HTMLInputElement>('input[name="q"]');
  const toggles = [...root.querySelectorAll('[data-toggle]')] as HTMLButtonElement[];
  const clears = [...root.querySelectorAll('[data-clear]')] as HTMLButtonElement[];
  const badge = $<HTMLTemplateElement>('[data-badge]');
  const one = root.dataset.one ?? 'result';
  const many = root.dataset.many ?? 'results';
  const src = root.dataset.src;
  const params = new URLSearchParams(location.search);

  const state: State = {
    q: params.get('q') ?? '',
    style: params.get('style') ?? '',
    v: params.get('v') === '1',
    f: new Set((params.get('f') ?? '').split(',').filter(Boolean)),
  };
  const active = () => !!(state.q.trim() || state.style || state.v || state.f.size);
  const plural = (n: number) => `${n} ${n === 1 ? one : many}`;

  function syncControls() {
    if (select) select.value = state.style;
    if (input && document.activeElement !== input) input.value = state.q;
    for (const b of toggles) {
      const k = b.dataset.toggle!;
      b.setAttribute('aria-pressed', String(k === 'v' ? state.v : state.f.has(k)));
    }
    for (const c of clears) if (!c.closest('[data-empty]')) c.hidden = !active();
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q.trim()) p.set('q', state.q.trim());
    if (state.style) p.set('style', state.style);
    if (state.v) p.set('v', '1');
    if (state.f.size) p.set('f', [...state.f].join(','));
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  let apply: () => void = () => {};

  if (!src) {
    // In-page mode.
    const cards = [...list.querySelectorAll(':scope > .card')] as HTMLLIElement[];
    const total = cards.length;
    apply = () => {
      let shown = 0;
      for (const c of cards) {
        const t = (c.dataset.t ?? '').split(' ');
        const f = (c.dataset.f ?? '').split(' ');
        const ok = (!state.style || t.includes(state.style)) && (!state.v || c.dataset.v === '1') && [...state.f].every((k) => f.includes(k));
        c.hidden = !ok;
        if (ok) shown++;
      }
      if (count) count.textContent = active() ? `Showing ${shown} of ${plural(total)}` : plural(total);
      if (empty) empty.hidden = shown > 0;
      list.hidden = shown === 0;
      syncControls();
    };
  } else {
    let ix: Index | undefined;
    let matches: Row[] = [];
    let shown = 0;
    const renderMore = () => {
      const frag = document.createDocumentFragment();
      for (const r of matches.slice(shown, shown + PAGE)) add(frag, renderCard(r, ix!, badge));
      add(list, frag);
      shown = Math.min(matches.length, shown + PAGE);
      if (more) more.hidden = shown >= matches.length;
    };
    apply = () => {
      if (!ix) return;
      const p = parse(state.q, ix);
      const styles = [...new Set([...p.styles, ...(state.style ? [state.style] : [])])];
      const flags = [...new Set([...p.flags, ...state.f])];
      const v = p.v || state.v;
      matches = ix.rows.filter((r) => styles.every((s) => r.t.includes(s)) && flags.every((k) => r.f.includes(k)) && (!v || r.v) && p.words.every((w) => r.h.includes(` ${w}`)));
      list.replaceChildren();
      shown = 0;
      renderMore();
      const q = state.q.trim();
      const bits = [...(state.style ? [ix!.terms[state.style] ?? state.style] : []), ...[...state.f].map((k) => ix!.filters[k] ?? k), ...(state.v ? ['Verified'] : []), ...(q ? [`“${q}”`] : [])];
      if (count) count.textContent = active() ? `${plural(matches.length)}${bits.length ? ` for ${bits.join(' · ')}` : ''}` : `${plural(ix.rows.length)} listed`;
      if (empty) empty.hidden = matches.length > 0;
      list.hidden = matches.length === 0;
      syncControls();
    };
    more?.addEventListener('click', renderMore);
    fetch(src)
      .then((r) => r.json() as Promise<Index>)
      .then((data: Index) => {
        ix = data;
        if (active()) apply();
        else {
          // Server already rendered the first page in the same order; just continue from it.
          matches = ix.rows;
          shown = list.children.length;
          if (more) more.hidden = shown >= matches.length;
          syncControls();
        }
      })
      .catch(() => {});
    root.querySelector('form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      state.q = input?.value ?? '';
      syncUrl();
      apply();
      list.scrollIntoView({ block: 'nearest' });
    });
    let timer = 0;
    input?.addEventListener('input', () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => { state.q = input.value; syncUrl(); apply(); }, 180);
    });
  }

  select?.addEventListener('change', () => { state.style = select.value; syncUrl(); apply(); });
  for (const b of toggles)
    b.addEventListener('click', () => {
      const k = b.dataset.toggle!;
      if (k === 'v') state.v = !state.v;
      else if (state.f.has(k)) state.f.delete(k);
      else state.f.add(k);
      syncUrl();
      apply();
    });
  for (const c of clears)
    c.addEventListener('click', () => {
      state.q = ''; state.style = ''; state.v = false; state.f.clear();
      if (input) input.value = '';
      syncUrl();
      apply();
    });

  (root.querySelectorAll('[data-js]') as NodeListOf<HTMLElement>).forEach((e) => (e.hidden = false));
  if (!src && active()) apply();
  else syncControls();
}

(document.querySelectorAll('[data-results]') as NodeListOf<HTMLElement>).forEach(setup);
