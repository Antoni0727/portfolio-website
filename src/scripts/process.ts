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
  stepStory();
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

/* 02: storyboard frames appear, get connected, the plan is sent and approved */
function stepStory() {
  const card = $('[data-step="story"]');
  if (!card) return;
  const frames = $$('[data-frame]', card);
  const link = $<SVGPathElement>('[data-link]', card)!;
  const msg = $('[data-msg-plan]', card)!;
  const text = $('[data-msg-text]', card)!;
  const tl = gsap.timeline({ repeat: -1, repeatDelay: .8 });
  tl.call(() => { msg.classList.remove('is-approved'); text.textContent = 'Plan sent to you'; })
    .set(msg, { opacity: 0, y: 10 })
    .set(link, { strokeDashoffset: 0, opacity: 0 })
    .fromTo(frames, { opacity: 0, y: 16, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.6)', stagger: .3 }, .3)
    .fromTo(link, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.inOut' }, '-=.3')
    .to(msg, { opacity: 1, y: 0, duration: .7, ease: 'back.out(1.8)' }, '+=.1')
    .call(() => { msg.classList.add('is-approved'); text.textContent = 'Approved ✓'; }, [], '+=1.1')
    .fromTo(msg, { scale: .94 }, { scale: 1, duration: .5, ease: 'back.out(3)' }, '<')
    .to({}, { duration: 2 })
    .to([...frames, msg, link], { opacity: 0, y: -8, duration: .5, ease: 'power2.in', stagger: .04 });
  loopWhenVisible(card, tl);
}

/* 03: the look and sound come together as the playhead passes:
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
  $$('[data-msg-plan], [data-cap]').forEach((el) => (el.style.opacity = '1'));
  $$('[data-bar], [data-progress]').forEach((b) => gsap.set(b, { scaleX: 1 }));
  $$('[data-mark]').forEach((m) => (m.style.backgroundSize = '100% 100%'));
  $$('[data-grade]').forEach((g) => (g.style.opacity = '.95'));
  $$('[data-meter]').forEach((b, i) => gsap.set(b, { scaleY: .3 + .5 * Math.abs(Math.sin(i * .7)) }));
  $$('[data-word]').forEach((w) => w.classList.add('is-on'));
}
