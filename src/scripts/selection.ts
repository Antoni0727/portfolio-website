/* iOS-style text selection: handle appears, then the highlight and the
   end handle sweep across the word together. */
import { gsap, reduceMotion } from './core';

function build(el: HTMLElement) {
  if (el.dataset.selBuilt) return;
  el.dataset.selBuilt = '1';
  const box = document.createElement('span');
  box.className = 'sel__box';
  const start = document.createElement('span');
  start.className = 'sel__h sel__h--start';
  const end = document.createElement('span');
  end.className = 'sel__h sel__h--end';
  [box, start, end].forEach((n) => n.setAttribute('aria-hidden', 'true'));
  el.prepend(box);
  el.append(start, end);
}

export function select(el: HTMLElement, delay = 0) {
  build(el);
  const box = el.querySelector<HTMLElement>('.sel__box')!;
  const start = el.querySelector<HTMLElement>('.sel__h--start')!;
  const end = el.querySelector<HTMLElement>('.sel__h--end')!;

  if (reduceMotion) { el.classList.add('is-static'); return gsap.timeline(); }

  const w = el.offsetWidth;
  const tl = gsap.timeline({ delay });
  tl.set(end, { x: -w })
    .fromTo(start, { opacity: 0, scaleY: 0, transformOrigin: '50% 0%' }, { opacity: 1, scaleY: 1, duration: .45, ease: 'back.out(2)' })
    .set(end, { opacity: 1 }, '<.15')
    .fromTo(box, { scaleX: 0 }, { scaleX: 1, duration: 1.05, ease: 'power3.inOut' }, '<')
    .to(end, { x: 0, duration: 1.05, ease: 'power3.inOut' }, '<');
  return tl;
}

/** Static final state (used when a heading is re-laid out) */
export function selectNow(el: HTMLElement) {
  build(el);
  el.classList.add('is-static');
}
