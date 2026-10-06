/* Scroll reveals for the whole page.
   [data-reveal]      fade + rise
   [data-split]       heading lines rise out of a mask, then the selection runs
   [data-reveal-img]  image frame opens up and the picture settles */
import { gsap, ScrollTrigger, SplitText, $$, reduceMotion } from './core';
import { select } from './selection';

export function revealHeading(el: HTMLElement, delay = 0) {
  el.style.visibility = 'visible';
  const sel = el.querySelector<HTMLElement>('[data-sel]');
  const strike = el.querySelector<HTMLElement>('[data-strike]');

  if (reduceMotion) {
    if (sel) select(sel);
    if (strike) strike.style.setProperty('--strike', '1');
    return;
  }

  const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
  const stagger = .11;
  const lines = gsap.from(split.lines, { yPercent: 115, rotate: 2.5, transformOrigin: '0% 0%', duration: 1.35, stagger, ease: 'expo.out', paused: true });
  // Undo the split once the lines have visually landed (expo.out is ~99% done by then),
  // so the selection handles aren't clipped by the line masks.
  const settle = stagger * (split.lines.length - 1) + 1;
  const tl = gsap.timeline({ delay });
  // revert() can restore fresh nodes, so look the targets up again afterwards
  tl.add(lines.play(), 0)
    .add(() => {
      lines.kill();
      split.revert();
      const s = el.querySelector<HTMLElement>('[data-strike]');
      const h = el.querySelector<HTMLElement>('[data-sel]');
      if (s) gsap.to(s, { '--strike': 1, duration: .9, ease: 'power3.inOut' } as gsap.TweenVars);
      if (h) select(h, s ? .55 : 0);
    }, settle);
  return tl;
}

export function initReveals() {
  // generic fade-ups, batched so siblings stagger naturally
  const items = $$('[data-reveal]').filter((el) => !el.closest('[data-hero-skip]'));
  if (reduceMotion) {
    gsap.set(items, { opacity: 1, y: 0 });
  } else {
    ScrollTrigger.batch(items, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: .09, overwrite: true }),
    });
  }

  // headings (hero handles its own)
  $$('[data-split]').forEach((el) => {
    if (el.closest('.hero')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true, onEnter: () => revealHeading(el) });
  });

  // image frames
  $$('[data-reveal-img]').forEach((el) => {
    const img = el.querySelectorAll('img, video');
    if (reduceMotion) { gsap.set(el, { clipPath: 'none' }); gsap.set(img, { scale: 1 }); return; }
    // The clip opens PAST the edges (negative inset), so the element's drop shadow grows in
    // with the frame instead of popping in when the clip is removed at the end.
    const h = (el as HTMLElement).offsetHeight, w = (el as HTMLElement).offsetWidth;
    const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 28;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    tl.fromTo(el,
      { clipPath: `inset(${h * .12}px ${w * .06}px ${h * .12}px ${w * .06}px round ${r}px)` },
      { clipPath: `inset(-140px -140px -140px -140px round ${r + 140}px)`, duration: 1.6, ease: 'expo.out' });
    if (img.length) tl.to(img, { scale: el.hasAttribute('data-parallax') ? 1.12 : 1, duration: 2, ease: 'expo.out' }, 0);
    tl.add(() => { (el as HTMLElement).style.clipPath = ''; el.removeAttribute('data-reveal-img'); });
  });
}
