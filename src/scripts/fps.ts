/* Performance helpers.
   1) Adaptive: after the intro settles, watch the real frame rate for a few seconds.
      If the browser/device can't keep up, switch to lite mode (native scrolling,
      decorative loops off). Fast devices never notice anything.
   2) Optional meter: add ?fps to the URL to see frames per second (?fps&full forces full mode,
      ?lite forces lite mode, for testing). */
import { enableLite, reduceMotion } from './core';

export function initFpsMeter() {
  const params = new URLSearchParams(location.search);
  if (params.has('lite') || reduceMotion) enableLite();
  const adaptive = !params.has('full');

  let el: HTMLDivElement | null = null;
  if (params.has('fps')) {
    el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;padding:8px 12px;border-radius:10px;background:rgba(18,17,22,.82);color:#fff;font:600 12px/1.4 ui-monospace,Menlo,monospace;pointer-events:none;white-space:pre';
    document.body.appendChild(el);
  }

  let frames = 0, worst = 0, last = performance.now(), start = last, slowSeconds = 0, checked = 0;
  const begin = performance.now() + 2500;   // ignore the intro + first image decodes
  const sectionNow = () => {
    const s = [...document.querySelectorAll('main section')].find((x) => { const r = x.getBoundingClientRect(); return r.top < innerHeight / 2 && r.bottom > innerHeight / 2; });
    return s?.id || s?.className.toString().split(' ')[0] || '-';
  };
  const loop = (now: number) => {
    frames++; worst = Math.max(worst, now - last); last = now;
    if (now - start >= 1000) {
      const fps = Math.round((frames * 1000) / (now - start));
      if (el) {
        el.textContent = `${fps} fps · slowest ${Math.round(worst)}ms\n${sectionNow()}${document.documentElement.classList.contains('is-lite') ? ' · lite' : ''}`;
        el.style.background = fps >= 55 ? 'rgba(18,120,70,.85)' : fps >= 40 ? 'rgba(180,120,10,.88)' : 'rgba(190,40,50,.88)';
      }
      if (adaptive && now > begin && !document.hidden && checked < 5) {
        checked++;
        slowSeconds = fps < 45 ? slowSeconds + 1 : 0;
        if (slowSeconds >= 2) enableLite();
      }
      frames = 0; worst = 0; start = now;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
