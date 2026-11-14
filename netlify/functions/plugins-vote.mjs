/* The home layout vote (data/layout-test.ts, components/HomePicker.astro).
   Lives here with the store's code; `npm run to-portfolio` copies it into the portfolio's netlify/functions/,
   because the portfolio repo is what Netlify deploys. Storage: Netlify Blobs (built into the site, nothing to set up).

   POST /plugins/api/vote   layout=a..e|none, first=a..e, voter=random code   (sent by the vote button)
     One entry per voter: key "<layout>/<first>/<voter>". A changed vote replaces the old one, "none" removes it.
     Nothing personal is stored: no IP, no name, no email. Netlify's rate limit (per IP, not saved) stops floods.
   GET  /plugins/api/vote?key=...                                           (read by /plugins/votes/)
     The counts. The key is checked against its sha256 below, so this public repo never holds the key itself.
     New key: printf %s 'newkey' | shasum -a 256, paste it into KEY_SHA256, redeploy.
   Wipe all votes: Netlify > the site > Blobs > store "layout-votes" > delete, or a new STORE name below. */
import { getStore } from '@netlify/blobs';

const STORE = 'layout-votes';
const KEY_SHA256 = '7e403a5795580b42bede28b41b2263995aab64a116900a0d41649fe7af518e69';
const LAYOUTS = ['a', 'b', 'c', 'd', 'e'];

export const config = {
  path: '/plugins/api/vote',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

const sha256 = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))]
  .map((b) => b.toString(16).padStart(2, '0')).join('');

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export default async (req) => {
  const store = getStore(STORE);

  if (req.method === 'POST') {
    // only from this site's own pages
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: 'origin' }, 403);
    let form;
    try { form = new URLSearchParams(await req.text()); } catch { return json({ error: 'body' }, 400); }
    const layout = form.get('layout') ?? '';
    const first = form.get('first') || '-';
    const voter = form.get('voter') ?? '';
    if (!/^[a-z0-9]{4,16}$/.test(voter)) return json({ error: 'voter' }, 400);
    if (layout !== 'none' && !LAYOUTS.includes(layout)) return json({ error: 'layout' }, 400);
    if (first !== '-' && !LAYOUTS.includes(first)) return json({ error: 'first' }, 400);
    await Promise.all(LAYOUTS.filter((l) => l !== layout).map((l) => store.delete(`${l}/${first}/${voter}`)));
    if (layout !== 'none') await store.set(`${layout}/${first}/${voter}`, String(Date.now()));
    return json({ ok: true });
  }

  if (req.method === 'GET') {
    const key = new URL(req.url).searchParams.get('key') ?? '';
    if (!key || (await sha256(key)) !== KEY_SHA256) return json({ error: 'key' }, 403);
    const { blobs } = await store.list();
    const layouts = Object.fromEntries(LAYOUTS.map((l) => [l, { votes: 0, first: {} }]));
    for (const { key: k } of blobs) {
      const [l, f] = k.split('/');
      if (!layouts[l]) continue;
      layouts[l].votes++;
      layouts[l].first[f] = (layouts[l].first[f] ?? 0) + 1;
    }
    return json({ total: blobs.length, layouts });
  }

  return json({ error: 'method' }, 405);
};
