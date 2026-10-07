import { gsap, ScrollTrigger, refreshSoon, $, $$, reduceMotion } from './core';

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

  const close = ({ btn, panel }: (typeof items)[number]) => {
    if (btn.getAttribute('aria-expanded') !== 'true') return;
    btn.setAttribute('aria-expanded', 'false');
    gsap.to(panel, { height: 0, opacity: 0, duration: reduceMotion ? 0 : .5, ease: 'power3.inOut', overwrite: true, onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'height,opacity' }); refreshSoon(); } });
  };
  const open = ({ btn, panel }: (typeof items)[number]) => {
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: reduceMotion ? 0 : .6, ease: 'power3.out', overwrite: true, onComplete: () => { gsap.set(panel, { clearProps: 'height' }); refreshSoon(); } });
    gsap.fromTo(panel.querySelector('p'), { y: 14 }, { y: 0, duration: 1, ease: 'expo.out', delay: .15 });
  };

  items.forEach((it) => it.btn.addEventListener('click', () => {
    const isOpen = it.btn.getAttribute('aria-expanded') === 'true';
    items.forEach((o) => o !== it && close(o));
    isOpen ? close(it) : open(it);
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
  const them = $$('[data-vs-them]', table);
  const links = $$('[data-vs-link] i', table);
  const me = $$('[data-vs-me]', table);
  // hovering any part of a row lights up both answers of that row
  if (matchMedia('(hover: hover)').matches) {
    const rows = them.map((t, i) => [t, links[i].parentElement!, me[i]]);
    rows.forEach((row) => row.forEach((el) => {
      el.addEventListener('pointerenter', () => row.forEach((r) => r.classList.add('is-hot')));
      el.addEventListener('pointerleave', () => row.forEach((r) => r.classList.remove('is-hot')));
    }));
  }
  if (reduceMotion) { gsap.set([...them, ...me], { opacity: 1 }); gsap.set(links, { scaleX: 1 }); return; }
  const tl = gsap.timeline({ paused: true });
  them.forEach((t, i) => {
    const at = i * .14;
    tl.fromTo(t, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: .7, ease: 'expo.out' }, at)
      .fromTo(links[i], { scaleX: 0 }, { scaleX: 1, duration: .55, ease: 'power3.inOut' }, at + .15)
      .fromTo(me[i], { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: .7, ease: 'expo.out' }, at + .45)
      .fromTo(me[i].querySelector('.vs__check'), { scale: 0 }, { scale: 1, duration: .5, ease: 'back.out(2.4)' }, at + .5);
  });
  ScrollTrigger.create({ trigger: table, start: 'top 75%', once: true, onEnter: () => tl.play() });
}
