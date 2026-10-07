import { gsap, ScrollTrigger, refreshSoon, lenis, $, $$, reduceMotion } from './core';

/* Chat: typing dots, then each message appears */
export function initChat() {
  const chat = $('[data-chat]');
  if (!chat) return;
  const msgs = $$('[data-msg]', chat);
  if (reduceMotion) { gsap.set([...msgs, ...$$('[data-comment]')], { opacity: 1 }); return; }

  const tl = gsap.timeline({ paused: true });
  msgs.forEach((m) => {
    const typing = $('[data-typing]', m)!;
    const bubble = $('[data-bubble]', m)!;
    const dots = typing.querySelectorAll('i');
    tl.set(bubble, { display: 'none' })
      .set(typing, { display: 'flex' })
      .fromTo(m, { opacity: 0, y: 24, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'back.out(1.6)' })
      .to(dots, { y: -4, opacity: 1, duration: .28, ease: 'sine.inOut', stagger: { each: .12, repeat: 3, yoyo: true } }, '<')
      .set(typing, { display: 'none' })
      .set(bubble, { display: 'block' })
      .fromTo(bubble, { opacity: 0, scale: .9, transformOrigin: m.classList.contains('msg--me') ? '100% 100%' : '0% 100%' }, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.8)' })
      .to({}, { duration: .2 });
  });
  ScrollTrigger.create({ trigger: chat, start: 'top 70%', once: true, onEnter: () => tl.play() });

  const items = $$('[data-comment]');
  if (items.length) {
    ScrollTrigger.create({
      trigger: '[data-comments]', start: 'top 70%', once: true,
      onEnter: () => gsap.fromTo(items, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .35, delay: .6 }),
    });
  }
}

/* About: photo drifts inside its frame, journey line fills as you scroll */
export function initAbout() {
  const photo = $('[data-parallax]');
  if (photo && !reduceMotion) {
    const img = photo.querySelector('img');
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
  }
  const fill = $('[data-journey-fill]');
  if (fill) {
    if (reduceMotion) gsap.set(fill, { scaleX: 1, scaleY: 1 });
    else {
      const vertical = window.matchMedia('(max-width: 620px), (min-width: 901px) and (max-width: 1080px)').matches;
      gsap.fromTo(fill, vertical ? { scaleY: 0, scaleX: 1 } : { scaleX: 0 }, {
        ...(vertical ? { scaleY: 1 } : { scaleX: 1 }), ease: 'none',
        scrollTrigger: { trigger: '[data-journey]', start: 'top 85%', end: 'bottom 55%', scrub: 1 },
      });
    }
  }
}

/* FAQ: one open at a time, smooth height */
export function initFaq() {
  const list = $('[data-faq]');
  if (!list) return;
  const items = $$('.qa', list).map((li) => ({ btn: $<HTMLButtonElement>('.qa__q', li)!, panel: $('.qa__a', li)! }));
  const isOpen = (it: (typeof items)[number]) => it.btn.getAttribute('aria-expanded') === 'true';
  const dur = reduceMotion ? 0 : .5;
  const ease = 'power3.inOut';

  const close = ({ btn, panel }: (typeof items)[number]) => {
    btn.setAttribute('aria-expanded', 'false');
    gsap.to(panel, { height: 0, opacity: 0, duration: dur, ease, overwrite: true, onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'height,opacity' }); } });
  };
  const open = ({ btn, panel }: (typeof items)[number]) => {
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: dur, ease, overwrite: true, onComplete: () => { gsap.set(panel, { clearProps: 'height' }); } });
  };
  // when an answer above collapses, keep the tapped question still on screen instead of letting it jump up
  const pin = (el: HTMLElement) => {
    const top = el.getBoundingClientRect().top;
    const hold = () => {
      const d = el.getBoundingClientRect().top - top;
      if (Math.abs(d) < .5) return;
      if (lenis) lenis.scrollTo(window.scrollY + d, { immediate: true, force: true });
      else window.scrollTo(0, window.scrollY + d);
    };
    gsap.ticker.add(hold);
    gsap.delayedCall(dur + .05, () => { gsap.ticker.remove(hold); refreshSoon(); });
  };

  items.forEach((it) => it.btn.addEventListener('click', () => {
    const was = isOpen(it);
    const above = items.some((o) => o !== it && isOpen(o) && (o.btn.compareDocumentPosition(it.btn) & Node.DOCUMENT_POSITION_FOLLOWING));
    items.forEach((o) => o !== it && isOpen(o) && close(o));
    was ? close(it) : open(it);
    if (above) pin(it.btn); else gsap.delayedCall(dur + .05, refreshSoon);
  }));
}

/* Contact CTA: glow follows the cursor inside the card */
export function initCtaGlow() {
  const card = $('[data-cta-card]');
  const glow = $('[data-cta-glow]');
  if (!card || !glow || reduceMotion) return;
  const x = gsap.quickTo(glow, 'x', { duration: 1.6, ease: 'expo.out' });
  const y = gsap.quickTo(glow, 'y', { duration: 1.6, ease: 'expo.out' });
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    x(e.clientX - r.left - r.width / 2);
    y(e.clientY - r.top - r.height / 2);
  });
  card.addEventListener('pointerleave', () => { x(0); y(0); });
}

/* Copy email buttons */
export function initCopy() {
  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-label]', btn) ?? $('.copy__state', btn) ?? $('.copy__text', btn);
    const original = label?.textContent ?? '';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy!);
        btn.classList.add('is-copied');
        if (label) label.textContent = label.classList.contains('copy__text') ? 'Copied to clipboard' : 'Copied';
        setTimeout(() => { btn.classList.remove('is-copied'); if (label) label.textContent = original; }, 2200);
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  });
}

/* Why me: each row reveals left to right: their answer, the link draws across, mine lights up */
export function initWhyTable() {
  const table = $('[data-vs]');
  if (!table) return;
  const panels = $$('[data-vs-panel]', table);
  const heads = $$('[data-vs-head]', table);
  const them = $$('[data-vs-them]', table);
  const links = $$('[data-vs-link] i', table);
  const me = $$('[data-vs-me]', table);
  const shine = $('[data-vs-shine]', table);
  // hovering any part of a row lights up both answers of that row (tracked per row, so moving
  // across the row never flickers off and on)
  if (matchMedia('(hover: hover)').matches) {
    const rows = them.map((t, i) => [t, links[i].parentElement!, me[i]]);
    const rowOf = new Map<Element, number>();
    rows.forEach((row, i) => row.forEach((el) => rowOf.set(el, i)));
    let hot = -1;
    const setHot = (i: number) => {
      if (i === hot) return;
      if (hot > -1) rows[hot].forEach((el) => el.classList.remove('is-hot'));
      hot = i;
      if (hot > -1) rows[hot].forEach((el) => el.classList.add('is-hot'));
    };
    table.addEventListener('pointerover', (e) => {
      const el = (e.target as Element).closest('[data-vs-them], [data-vs-link], [data-vs-me]');
      setHot(el ? rowOf.get(el) ?? -1 : -1);
    });
    table.addEventListener('pointerleave', () => setHot(-1));
  }
  if (reduceMotion) { gsap.set([...panels, ...heads, ...them, ...me], { opacity: 1 }); gsap.set(links, { scaleX: 1 }); return; }

  // panels rise in, titles settle, then each row reads left to right; one soft light sweep at the end
  const ease = 'power3.out';
  const tl = gsap.timeline({ paused: true, defaults: { ease } });
  tl.fromTo(panels[0], { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.1 }, 0)
    .fromTo(panels[1], { opacity: 0, y: 46, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: 1.3 }, .12)
    .fromTo(heads, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .9, stagger: .12 }, .35);
  them.forEach((t, i) => {
    const at = .6 + i * .11;
    tl.fromTo(t, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .9 }, at)
      .fromTo(links[i], { scaleX: 0 }, { scaleX: 1, duration: .7, ease: 'power2.inOut' }, at + .12)
      .fromTo(me[i], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .9 }, at + .3)
      .fromTo(me[i].querySelector('.vs__check'), { scale: .4 }, { scale: 1, duration: .7, ease: 'back.out(2)' }, at + .34);
  });
  if (shine) tl.fromTo(shine, { xPercent: 0, opacity: 1 }, { xPercent: 290, duration: 1.6, ease: 'power2.inOut' }, '-=.5').set(shine, { opacity: 0 });
  // clear transforms when done so hover glows sit on a clean layer
  tl.add(() => gsap.set([...panels, ...heads, ...them, ...me], { clearProps: 'transform' }));
  ScrollTrigger.create({ trigger: table, start: 'top 78%', once: true, onEnter: () => tl.play() });
}
