/* Looping illustrations in the Process and Why sections.
   Each loop only runs while visible, and speeds up gently when you hover its card. */
import { gsap, ScrollTrigger, $, $$, reduceMotion, finePointer } from './core';

function loopWhenVisible(card: HTMLElement, tl: gsap.core.Timeline) {
  tl.pause();
  ScrollTrigger.create({
    trigger: card, start: 'top bottom', end: 'bottom top',
    onToggle: (s) => { card.classList.toggle('is-live', s.isActive); s.isActive ? tl.play() : tl.pause(); },
  });
  if (finePointer) {
    card.addEventListener('pointerenter', () => gsap.to(tl, { timeScale: 1.6, duration: .8, ease: 'power2.out' }));
    card.addEventListener('pointerleave', () => gsap.to(tl, { timeScale: 1, duration: 1, ease: 'power2.out' }));
  }
}

export function initProcess() {
  if (reduceMotion) return staticStates();
  stepDrop();
  stepUpdates();
  stepPolish();
  stepPublish();
}

/* 01: files fall into the shared folder */
function stepDrop() {
  const card = $('[data-step="drop"]');
  if (!card) return;
  const files = $$('[data-file]', card);
  const bar = $('[data-bar]', card)!;
  const count = $('[data-count]', card)!;
  const offsets = [-118, -40, 44];
  gsap.set(files, { x: (i) => offsets[i] });
  const tl = gsap.timeline({ repeat: -1, repeatDelay: .8 });
  tl.set(bar, { scaleX: 0 }).call(() => { count.textContent = '0 files'; });
  files.forEach((f, i) => {
    const at = i * .55;
    tl.fromTo(f, { opacity: 0, y: -26, rotate: -8, scale: 1 }, { opacity: 1, y: 0, rotate: i % 2 ? 3 : -3, duration: .9, ease: 'back.out(1.5)' }, at)
      .to(f, { y: 92, x: offsets[i] * .2, scale: .55, opacity: 0, rotate: 0, duration: .9, ease: 'power3.in' }, at + 1.3)
      .call(() => { count.textContent = `${i + 1} file${i ? 's' : ''}`; }, [], at + 2.15)
      .to(bar, { scaleX: (i + 1) / 3, duration: .8, ease: 'expo.out' }, at + 2.15);
  });
  tl.to({}, { duration: 1.6 });
  loopWhenVisible(card, tl);
}

/* 03: the cut arrives, gets watched, the client replies, then clicks Approve */
function stepUpdates() {
  const card = $('[data-step="updates"]');
  if (!card) return;
  const msg = $('[data-rv-msg]', card)!;
  const play = $('[data-rv-play]', card)!;
  const react = $('[data-rv-react]', card)!;
  const reply = $('[data-rv-reply]', card)!;
  const dots = $('[data-rv-dots]', card)!;
  const txt = $('[data-rv-txt]', card)!;
  const btn = $('[data-rv-btn]', card)!;
  const label = $('[data-rv-label]', card)!;
  const cursor = $('[data-rv-cursor]', card)!;
  const art = card.querySelector<HTMLElement>('.rv')!;
  const target = () => {
    const a = art.getBoundingClientRect(), b = btn.getBoundingClientRect();
    return { x: b.left - a.left + b.width * .62, y: b.top - a.top + b.height * .55 };
  };
  const tl = gsap.timeline({ repeat: -1, repeatDelay: .4 });
  tl.call(() => { label.textContent = 'Approve'; btn.classList.remove('is-done'); })
    .set(btn, { clearProps: 'backgroundColor,color,transform' })
    .set([msg, reply, react, txt, cursor], { opacity: 0 })
    .set(dots, { opacity: 1 })
    .set(play, { scaleX: 0 })
    .fromTo(msg, { y: 14, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'back.out(1.6)' }, .2)
    .to(play, { scaleX: 1, duration: 1.8, ease: 'none' }, .8)
    .fromTo(react, { scale: 0, rotate: -30 }, { opacity: 1, scale: 1, rotate: 0, duration: .55, ease: 'back.out(3)' }, 2.5)
    .fromTo(reply, { scale: .6, y: 6 }, { opacity: 1, scale: 1, y: 0, duration: .5, ease: 'back.out(2)' }, 2.7)
    .to(dots, { opacity: 0, duration: .2 }, 3.7)
    .fromTo(txt, { y: 4 }, { opacity: 1, y: 0, duration: .45, ease: 'expo.out' }, 3.8)
    .fromTo(cursor, { x: () => target().x + 110, y: () => target().y + 60 }, { x: () => target().x, y: () => target().y, opacity: 1, duration: 1, ease: 'expo.out' }, 4.4)
    .to(btn, { scale: .9, duration: .12, ease: 'power2.in' })
    .call(() => { label.textContent = 'Approved'; btn.classList.add('is-done'); })
    .to(btn, { scale: 1, backgroundColor: '#22A565', color: '#fff', duration: .6, ease: 'back.out(3)' })
    .to(cursor, { x: '+=50', y: '+=60', opacity: 0, duration: .8, ease: 'power2.in' }, '<.2')
    .to({}, { duration: 2 })
    .to([msg, reply], { opacity: 0, y: -6, duration: .45, ease: 'power2.in', stagger: .06 });
  loopWhenVisible(card, tl);
}

/* 02: the look and sound come together as the playhead passes:
   title snaps in, the grade lands, captions pop, music fades up, audio breathes */
function stepPolish() {
  const card = $('[data-step="polish"]');
  if (!card) return;
  const lane = $('[data-lane]', card)!;
  const head = $('[data-sweep]', card)!;
  const t2 = $('[data-t2]', card)!;
  const grade = $('[data-grade]', card)!;
  const cap = $('[data-cap]', card)!;
  const m = $$('[data-m1], [data-m2]', card);
  const eq = $$('[data-eq]', card);

  const tl = gsap.timeline({ repeat: -1, repeatDelay: .6 });
  tl.set([grade, cap], { opacity: 0 })
    .set(t2, { x: 30, opacity: .35 })
    .set(m, { scaleX: 0, transformOrigin: 'left' })
    .fromTo(head, { x: 0 }, { x: () => lane.clientWidth - 2, duration: 7, ease: 'none' }, 0)
    .to(m[0], { scaleX: 1, duration: 1.2, ease: 'expo.out' }, .4)
    .to(t2, { x: 0, opacity: 1, duration: .8, ease: 'back.out(1.8)' }, 1.4)
    .to(grade, { opacity: .95, duration: .55, ease: 'power2.out' }, 2.2)
    .fromTo(cap, { opacity: 0, y: 6, scale: .92 }, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.8)' }, 3)
    .to(m[1], { scaleX: 1, duration: 1.2, ease: 'expo.out' }, 3.6);
  void eq; // bars animate in CSS (cheaper), see .is-live
  loopWhenVisible(card, tl);
}

/* 04: upload progress, cursor clicks Publish, it turns into "Published" */
function stepPublish() {
  const card = $('[data-step="publish"]');
  if (!card) return;
  const progress = $('[data-progress]', card)!;
  const status = $('[data-status]', card)!;
  const btn = $('[data-btn]', card)!;
  const label = $('[data-btn-label]', card)!;
  const cursor = $('[data-cursor-arrow]', card)!;
  const art = card.querySelector<HTMLElement>('.up')!;
  const target = () => {
    const a = art.getBoundingClientRect(), b = btn.getBoundingClientRect();
    return { x: b.left - a.left + b.width * .6, y: b.top - a.top + b.height * .55 };
  };
  const p = { v: 0 };
  const tl = gsap.timeline({ repeat: -1, repeatDelay: .6 });
  tl.call(() => { label.textContent = 'Publish'; status.textContent = 'Uploading… 0%'; })
    .set(btn, { backgroundColor: '#6B4BFF', scale: 1 })
    .set(progress, { scaleX: 0, backgroundColor: '#6B4BFF' })
    .set(p, { v: 0 })
    .set(cursor, { opacity: 0 })
    .to(p, { v: 100, duration: 2.6, ease: 'power1.inOut', onUpdate: () => { status.textContent = `Uploading… ${Math.round(p.v)}%`; gsap.set(progress, { scaleX: p.v / 100 }); } })
    .call(() => { status.textContent = 'Upload complete'; })
    .fromTo(cursor, { x: () => target().x + 120, y: () => target().y + 70, opacity: 0 }, { x: () => target().x, y: () => target().y, opacity: 1, duration: 1.1, ease: 'expo.out' }, '+=.2')
    .to(btn, { scale: .9, duration: .12, ease: 'power2.in' })
    .call(() => { label.textContent = 'Published ✓'; status.textContent = 'Live on your channel'; })
    .to(btn, { scale: 1, backgroundColor: '#22A565', duration: .6, ease: 'back.out(3)' })
    .to(progress, { backgroundColor: '#22A565', duration: .4 }, '<')
    .to(cursor, { x: '+=50', y: '+=60', opacity: 0, duration: .8, ease: 'power2.in' }, '<.2')
    .to({}, { duration: 2 });
  loopWhenVisible(card, tl);
}

function staticStates() {
  $$('[data-file]').forEach((f) => (f.style.opacity = '0'));
  $$('[data-rv-msg], [data-rv-reply], [data-rv-txt], [data-rv-react], [data-cap]').forEach((el) => (el.style.opacity = '1'));
  $$('[data-rv-dots]').forEach((d) => (d.style.opacity = '0'));
  $$('[data-bar], [data-progress], [data-rv-play]').forEach((b) => gsap.set(b, { scaleX: 1 }));
  $$('[data-mark]').forEach((m) => (m.style.backgroundSize = '100% 100%'));
  $$('[data-grade]').forEach((g) => (g.style.opacity = '.95'));
  $$('[data-meter]').forEach((b, i) => gsap.set(b, { scaleY: .3 + .5 * Math.abs(Math.sin(i * .7)) }));
  $$('[data-word]').forEach((w) => w.classList.add('is-on'));
}
