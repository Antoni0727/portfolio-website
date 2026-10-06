/* Site chrome: nav, progress, background, cursor, contact window, anchor links */
import { gsap, ScrollTrigger, $, $$, reduceMotion, finePointer, isTouch, scrollToTarget, pauseScroll, resumeScroll } from './core';

export function initNav() {
  const nav = $('[data-nav]');
  const bar = $('.progress__bar');
  if (!nav) return;
  let hidden = false;

  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 16);
      if (bar) gsap.set(bar, { scaleX: self.progress });
      const shouldHide = self.direction === 1 && y > 600 && !nav.classList.contains('is-open');
      if (shouldHide !== hidden && !reduceMotion) {
        hidden = shouldHide;
        gsap.to(nav, { yPercent: hidden ? -130 : 0, duration: hidden ? .6 : .8, ease: hidden ? 'power3.in' : 'expo.out' });
      }
    },
  });

  // phone menu
  const menuBtn = $('[data-menu]', nav);
  const setMenu = (open: boolean) => {
    nav.classList.toggle('is-open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
  };
  menuBtn?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('[data-sheet-link]', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  let menuY = 0;
  window.addEventListener('scroll', () => {
    if (!nav.classList.contains('is-open')) { menuY = window.scrollY; return; }
    if (Math.abs(window.scrollY - menuY) > 40) setMenu(false);
  }, { passive: true });

  // active link
  const links = $$<HTMLAnchorElement>('.nav__links a');
  links.forEach((a) => {
    const id = a.getAttribute('href')!.split('#')[1];
    const section = id && document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({ trigger: section, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
  });

  // smooth anchor links on this page
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const hash = href.startsWith('/#') ? href.slice(1) : href.startsWith('#') ? href : '';
    if (!hash || location.pathname !== '/') return;
    const target = hash === '#main' ? 0 : document.querySelector<HTMLElement>(hash);
    if (target === null) return;
    e.preventDefault();
    scrollToTarget(target);
    history.replaceState(null, '', hash === '#main' ? '/' : hash);
  });
}

/* Page-wide background: a soft light follows the cursor (transform only) */
export function initBackground() {
  const spot = $('[data-bg-spot]');
  if (!spot || !finePointer || reduceMotion) return;
  const x = gsap.quickTo(spot, 'x', { duration: 1.2, ease: 'power3.out' });
  const y = gsap.quickTo(spot, 'y', { duration: 1.2, ease: 'power3.out' });
  gsap.set(spot, { x: innerWidth / 2, y: innerHeight * .3 });
  let shown = false;
  window.addEventListener('pointermove', (e) => {
    x(e.clientX); y(e.clientY);
    if (!shown) { shown = true; gsap.to(spot, { opacity: 1, duration: 1.4, ease: 'power2.out' }); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { shown = false; gsap.to(spot, { opacity: 0, duration: 1, ease: 'power2.out' }); });
}

/* Videos: a soft purple glow sits under the cursor (set directly, so it never lags) */
export function initVideoGlow() {
  if (!finePointer) return;
  $$('[data-glow]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${e.clientX - r.left}px`);
      el.style.setProperty('--gy', `${e.clientY - r.top}px`);
    }, { passive: true });
  });
}

/* Contact window: macOS-style, opens from any [data-cta] */
export function initContactWindow() {
  const dlg = $<HTMLDialogElement>('#contact-window');
  if (!dlg || !dlg.showModal) return;
  const win = $('[data-win]', dlg)!;
  const opts = $$('[data-opt]', dlg);
  let closing = false;

  let opener: HTMLElement | null = null;
  let savedY = 0;
  const open = (from?: HTMLElement | null) => {
    if (dlg.open) return;
    opener = from ?? null;
    savedY = window.scrollY;
    dlg.showModal();
    pauseScroll();
    requestAnimationFrame(() => dlg.classList.add('is-open'));
    if (reduceMotion) return;
    if (isTouch) {
      // phones: one simple, GPU-only move (no 3D, no per-item stagger)
      gsap.fromTo(win, { opacity: 0, y: 28, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out', force3D: true });
      return;
    }
    gsap.fromTo(win, { opacity: 0, y: 40, scale: .9, rotateX: 10, transformPerspective: 1200 }, { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: .9, ease: 'expo.out' });
    gsap.fromTo(opts, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .8, stagger: .06, ease: 'expo.out', delay: .12 });
  };
  const close = () => {
    if (!dlg.open || closing) return;
    closing = true;
    dlg.classList.remove('is-open');
    const done = () => {
      // closing a dialog moves focus back to the button that opened it, which can nudge the
      // page; put the scroll position back and refocus without scrolling
      dlg.close();
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
      opener?.focus({ preventScroll: true });
      closing = false;
      resumeScroll();
      gsap.set(win, { clearProps: 'all' });
    };
    if (reduceMotion) return done();
    gsap.to(win, { opacity: 0, y: 18, scale: .96, duration: isTouch ? .25 : .38, ease: 'power3.in', onComplete: done });
  };

  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-cta]');
    if (trigger) { e.preventDefault(); open(trigger); }
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || (e.target as HTMLElement).closest('[data-close]')) close();
  });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
}

/* Dark / light theme: follows the device until the visitor picks one with the switch */
export function initTheme() {
  const root = document.documentElement;
  const btn = $('[data-theme-toggle]');
  const sys = window.matchMedia('(prefers-color-scheme: dark)');
  const saved = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
  const label = () => btn?.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  const apply = (t: string) => { root.dataset.theme = t; label(); };
  label();

  sys.addEventListener('change', (e) => { if (!saved()) apply(e.matches ? 'dark' : 'light'); });

  btn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch {}
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || reduceMotion) { apply(next); return; }
    // circular reveal from the switch
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(() => apply(next)).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.16, 1, .3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  });
}
