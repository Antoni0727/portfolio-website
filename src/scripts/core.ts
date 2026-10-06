import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

export { gsap, ScrollTrigger, SplitText };

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
/* Phones/tablets: native scrolling, no blur, snappier taps (see .is-touch in global.css) */
export const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
if (isTouch) {
  document.documentElement.classList.add('is-touch');
  // iOS only shows :active (pressed) styles when a touch listener exists
  document.addEventListener('touchstart', () => {}, { passive: true });
}

export const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* One shared easing language for the whole site */
gsap.defaults({ ease: 'expo.out', duration: 1.1 });

export let lenis: Lenis | null = null;

export function initSmoothScroll() {
  // smooth-wheel scrolling only helps mice/trackpads; phones scroll natively (smoother, no extra work)
  if (reduceMotion || isTouch) return;
  lenis = new Lenis({
    lerp: 0.12,            // lower = silkier but slower to respond; 0.12 balances both
    wheelMultiplier: 1.05,
    smoothWheel: true,
    syncTouch: false,      // keep native momentum on phones
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(lenisTick);
  gsap.ticker.lagSmoothing(0);
}
const lenisTick = (t: number) => lenis?.raf(t * 1000);

/* Lite mode: native scrolling + no purely decorative loops. Turned on automatically
   when the device/browser can't keep up (see perf.ts). */
export let isLite = false;
export function enableLite() {
  if (isLite) return;
  isLite = true;
  document.documentElement.classList.add('is-lite');
  if (lenis) { gsap.ticker.remove(lenisTick); lenis.destroy(); lenis = null; }
  document.dispatchEvent(new CustomEvent('perf:lite'));
  ScrollTrigger.refresh();
}

export function scrollToTarget(target: string | HTMLElement | number) {
  const offset = -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76) - 8;
  if (lenis) lenis.scrollTo(target as any, { offset: typeof target === 'number' ? 0 : offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    const top = typeof el === 'number' ? el : el ? el.getBoundingClientRect().top + window.scrollY + offset : 0;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}

/* Re-measure scroll animations once motion has settled (never mid-animation, never twice in a row) */
let refreshTimer: number | undefined;
export const refreshSoon = (delay = 160) => {
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
};

export const pauseScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();
