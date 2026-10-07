import { gsap, ScrollTrigger, refreshSoon, $, $$, reduceMotion } from './core';
import { playInline, stopInline } from './player';

export function initWork() {
  // thumbnails fade in once decoded instead of popping in mid-reveal
  document.querySelectorAll<HTMLImageElement>('.vcard__media img').forEach((img) => {
    const show = () => img.classList.add('is-in');
    if (img.complete && img.naturalWidth) show();
    else { img.addEventListener('load', () => (img.decode ? img.decode().catch(() => {}).then(show) : show()), { once: true }); img.addEventListener('error', show, { once: true }); }
  });
  initTabs();
  $$('[data-more]').forEach(initMore);
  initCards();
}

/* Long-form / Reels. The container keeps its height while panels crossfade,
   then glides to the new height, so nothing below jumps or re-renders. */
function initTabs() {
  const seg = $('[data-seg]');
  const wrap = $('[data-panels]');
  if (!seg || !wrap) return;
  const tabs = $$<HTMLButtonElement>('[role="tab"]', seg);
  const thumb = $('.seg__thumb', seg)!;
  const seen = new Set<string>([tabs[0].id]);
  let busy: gsap.core.Timeline | null = null;

  const moveThumb = (tab: HTMLElement, instant = false) =>
    gsap.to(thumb, { x: tab.offsetLeft, width: tab.offsetWidth, duration: instant ? 0 : .8, ease: 'expo.out', overwrite: true });

  const activate = (tab: HTMLButtonElement, focus = false) => {
    const prev = tabs.find((t) => t.getAttribute('aria-selected') === 'true')!;
    if (prev === tab) return;
    stopInline();
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    moveThumb(tab);
    if (focus) tab.focus();

    const from = document.getElementById(prev.getAttribute('aria-controls')!)!;
    const to = document.getElementById(tab.getAttribute('aria-controls')!)!;
    const swap = () => { from.hidden = true; to.hidden = false; gsap.set(from, { clearProps: 'opacity,transform' }); };

    busy?.progress(1);
    if (reduceMotion) { swap(); refreshSoon(); return; }

    const startH = wrap.offsetHeight;
    gsap.set(wrap, { height: startH, overflow: 'clip' });
    const firstTime = !seen.has(tab.id);
    seen.add(tab.id);

    busy = gsap.timeline({
      onComplete: () => { gsap.set(wrap, { clearProps: 'height,overflow' }); busy = null; refreshSoon(); },
    });
    busy.to(from, { opacity: 0, y: -10, duration: .3, ease: 'power2.in' })
      .add(() => {
        swap();
        const endH = to.offsetHeight;
        gsap.to(wrap, { height: endH, duration: .75, ease: 'expo.inOut' });
      })
      .fromTo(to, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', clearProps: 'transform' }, '+=.02');
    if (firstTime) {
      busy.fromTo(to.querySelectorAll(':scope > .grid > *'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: .06, ease: 'expo.out', clearProps: 'transform' }, '<');
    }
    busy.to({}, { duration: .3 });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      activate(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true);
    });
  });

  const sync = () => moveThumb(tabs.find((t) => t.getAttribute('aria-selected') === 'true')!, true);
  sync();
  document.fonts?.ready.then(sync);
  window.addEventListener('resize', sync, { passive: true });
}

/* Show more / less with a smooth height animation */
function initMore(btn: HTMLElement) {
  const wrap = document.getElementById(btn.getAttribute('aria-controls')!);
  if (!wrap) return;
  const label = $('.more__label', btn)!;
  const cards = wrap.querySelectorAll('.grid > *');
  let open = false;
  let tl: gsap.core.Timeline | null = null;

  btn.addEventListener('click', () => {
    open = !open;
    btn.setAttribute('aria-expanded', String(open));
    tl?.kill();
    gsap.to(label, {
      yPercent: -60, opacity: 0, duration: .2, ease: 'power2.in', overwrite: true,
      onComplete: () => {
        label.textContent = open ? 'Show less' : 'Show more';
        gsap.fromTo(label, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: 'expo.out' });
      },
    });

    const d = reduceMotion ? 0 : 1;
    tl = gsap.timeline({ onComplete: () => refreshSoon() });
    if (open) {
      tl.to(wrap, { height: 'auto', duration: 1.1 * d, ease: 'expo.inOut' })
        .fromTo(cards, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 * d, stagger: .06, ease: 'expo.out', clearProps: 'transform' }, .2 * d);
    } else {
      stopInline();
      tl.to(cards, { opacity: 0, y: 16, duration: .3 * d, stagger: .02, ease: 'power2.in' })
        .to(wrap, { height: 0, duration: .9 * d, ease: 'expo.inOut' }, .1 * d);
    }
  });
}

/* Play inside the card + a soft purple shockwave when the pointer arrives */
function initCards() {
  $$('[data-video]').forEach((media) => {
    const id = media.dataset.video!;
    const title = media.closest('.vcard')?.querySelector('.vcard__title')?.textContent ?? 'Video';
    const ring = $('[data-ring]', media);
    if (ring && !reduceMotion) {
      media.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || media.classList.contains('is-playing')) return;
        const r = media.getBoundingClientRect();
        gsap.fromTo(ring,
          { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2, scale: .3, opacity: .8 },
          { x: 0, y: 0, scale: Math.max(r.width, r.height) / 55, opacity: 0, duration: 2.2, ease: 'power2.out', overwrite: true });
      });
    }
    const play = () => { if (!media.classList.contains('is-playing')) playInline(media, id, title); };
    media.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-stop]')) { e.stopPropagation(); stopInline(); return; }
      play();
    });
    media.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  });
}
