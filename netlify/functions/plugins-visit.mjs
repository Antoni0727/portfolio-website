/* A simple visit counter for the store, read only by Tony at /plugins/stats/ (same key as the votes).
   Lives here with the store's code; `npm run to-portfolio` copies it into the portfolio's netlify/functions/.
   Storage: Netlify Blobs, store "store-visits". Nothing personal: no IP, no cookie, no ID, no browser details.

   POST /plugins/api/visit   page=home-c, kind=v|p, from=youtube.com|direct|-, dev=m|d   (sent by scripts/visit.ts)
     One empty entry per page view, all the facts in its key: "<YYYYMMDDHH UTC>/<page>/<kind>/<from>/<dev>/<random>".
     kind v = a new visit (came from outside the site), p = another page inside the same visit.
   GET  /plugins/api/visit?key=...&hours=24                                  (read by /plugins/stats/)
     The counts for the last N hours (max 90 days). The key is checked against its sha256 below.
   Wipe: Netlify > the site > Blobs > store "store-visits" > delete. */
import { getStore } from '@netlify/blobs';

const STORE = 'store-visits';
const KEY_SHA256 = '7e403a5795580b42bede28b41b2263995aab64a116900a0d41649fe7af518e69'; // same key as the votes

export const config = {
  path: '/plugins/api/visit',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

const sha256 = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))]
  .map((b) => b.toString(16).padStart(2, '0')).join('');

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

const hourKey = (t) => new Date(t).toISOString().slice(0, 13).replace(/[-T]/g, ''); // 2026112614

export default async (req) => {
  const store = getStore({ name: STORE });

  if (req.method === 'POST') {
    const origin = req.headers.get('origin');
    if (!origin || new URL(origin).host !== new URL(req.url).host) return json({ error: 'origin' }, 403);
    let form;
    try { form = new URLSearchParams(await req.text()); } catch { return json({ error: 'body' }, 400); }
    const page = form.get('page') ?? '';
    const kind = form.get('kind') ?? '';
    const from = (form.get('from') || '-').toLowerCase();
    const dev = form.get('dev') ?? '';
    if (!/^[a-z0-9-]{1,40}$/.test(page) || !/^[vp]$/.test(kind) || !/^[md]$/.test(dev) || !/^[a-z0-9.-]{1,60}$/.test(from)) return json({ error: 'bad' }, 400);
    await store.set(`${hourKey(Date.now())}/${page}/${kind}/${from}/${dev}/${Math.random().toString(36).slice(2, 10)}`, '');
    return json({ ok: true });
  }

  if (req.method === 'GET') {
    const u = new URL(req.url);
    const key = u.searchParams.get('key') ?? '';
    if (!key || (await sha256(key)) !== KEY_SHA256) return json({ error: 'key' }, 403);
    const hours = Math.min(24 * 90, Math.max(1, Math.round(+u.searchParams.get('hours') || 24)));
    const now = Date.now(), since = hourKey(now - (hours - 1) * 3600e3);
    // one listing per UTC day in the range (keys start with the hour, so a day is a prefix)
    const days = new Set();
    for (let t = now - (hours - 1) * 3600e3; t <= now + 3600e3; t += 3600e3) days.add(hourKey(t).slice(0, 8));
    const lists = await Promise.all([...days].map((d) => store.list({ prefix: d })));
    const out = { hours, visits: 0, views: 0, pages: {}, from: {}, devices: { m: 0, d: 0 }, byHour: {} };
    for (const { blobs } of lists) for (const { key: k } of blobs) {
      const [h, page, kind, from, dev] = k.split('/');
      if (h < since) continue;
      out.views++;
      out.pages[page] = (out.pages[page] ?? 0) + 1;
      out.byHour[h] = (out.byHour[h] ?? 0) + (kind === 'v' ? 1 : 0);
      if (kind === 'v') {
        out.visits++;
        out.from[from] = (out.from[from] ?? 0) + 1;
        if (dev in out.devices) out.devices[dev]++;
      }
    }
    return json(out);
  }

  return json({ error: 'method' }, 405);
};
