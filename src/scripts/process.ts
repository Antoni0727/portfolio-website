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
  whyStory();
  whyCraft();
  whyCreator();
  whyClean();
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

/* Why: key phrases get highlighted */
function whyStory() {
  const card = $('[data-tile="story"]');
  if (!card) return;
  const marks = $$('[data-mark]', card);
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
  tl.to(marks, { backgroundSize: '100% 100%', duration: 1, ease: 'power3.inOut', stagger: .8 })
    .to({}, { duration: 2.2 })
    .to(marks, { backgroundSize: '0% 100%', duration: .7, ease: 'power2.in' });
  loopWhenVisible(card, tl);
}

/* Why: sound meter dances, color knob slides into the grade, motion curve draws */
function whyCraft() {
  const card = $('[data-tile="craft"]');
  if (!card) return;
  const meters = $$('[data-meter]', card);
  const knob = $('[data-grade-knob]', card)!;
  const curve = $<SVGPathElement>('[data-curve]', card)!;
  const len = curve.getTotalLength();
  gsap.set(curve, { strokeDasharray: len, strokeDashoffset: len });
  const tl = gsap.timeline({ repeat: -1, repeatDelay: .4 });
  const track = knob.parentElement!;
  tl.to(knob, { x: () => track.clientWidth * .72, duration: 2.2, ease: 'expo.inOut' }, .3)
    .to(curve, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, .8)
    .to({}, { duration: 2.4 })
    .to(knob, { x: 0, duration: 1.4, ease: 'expo.inOut' })
    .to(curve, { strokeDashoffset: len, duration: 1, ease: 'power2.in' }, '<');
  void meters; // meter animates in CSS (cheaper), see .is-live
  loopWhenVisible(card, tl);
}

/* Why: subscribe toggles on the channel card */
function whyCreator() {
  const card = $('[data-tile="creator"]');
  if (!card) return;
  const sub = $('[data-sub]', card)!;
  const tl = gsap.timeline({ repeat: -1 });
  tl.call(() => sub.classList.add('is-on'), [], 1.4).call(() => sub.classList.remove('is-on'), [], 4.4).to({}, { duration: 1 }, 4.4);
  loopWhenVisible(card, tl);
}

/* Why: a short burst of "other editors" chaos, it freezes and fades back,
   then my side takes over for most of the loop: slow push-in, clean caption,
   and one smooth punch-in on the last word. */
function whyClean() {
  const card = $('[data-tile="clean"]');
  if (!card) return;
  const them = $('[data-them]', card)!;
  const me = $('[data-me]', card)!;
  const dim = $('[data-them-dim]', card)!;
  const zoom = $('[data-me-zoom]', card)!;
  const words = $$('[data-word]', card);
  const reset = () => { card.classList.add('is-chaos'); words.forEach((w) => w.classList.remove('is-on')); };

  const tl = gsap.timeline({ repeat: -1, onRepeat: reset });
  reset();
  const punchAt = 2.4 + (words.length - 1) * .5;
  tl.set(them, { opacity: 1, scale: 1 })
    .set(dim, { opacity: 0 })
    .set(me, { opacity: .35, scale: .95 })
    .set(zoom, { scale: 1 })
    // 1) the mess, briefly (~1.6s)
    .to({}, { duration: 1.6 })
    // 2) it freezes on this frame and steps back, at the same moment
    .call(() => card.classList.remove('is-chaos'))
    .to(dim, { opacity: 1, duration: .5, ease: 'power2.out' })
    .to(them, { opacity: .5, scale: .94, duration: .8, ease: 'expo.out' }, '<')
    // 3) my side takes over and holds for most of the loop
    .to(me, { opacity: 1, scale: 1.05, duration: .9, ease: 'expo.out' }, '<.05')
    .to(zoom, { scale: 1.12, duration: 2.6, ease: 'power1.inOut' }, '<');
  words.forEach((w, i) => tl.call(() => w.classList.add('is-on'), [], 2.4 + i * .5));
  tl.to(zoom, { scale: 1.3, duration: .9, ease: 'expo.inOut' }, punchAt)
    .to({}, { duration: 2.6 })
    // 4) gentle reset for the next loop
    .to(me, { opacity: .35, scale: .95, duration: .6, ease: 'power2.inOut' })
    .to(zoom, { scale: 1, duration: .6, ease: 'power2.inOut' }, '<')
    .to(them, { opacity: 1, scale: 1, duration: .6, ease: 'power2.inOut' }, '<')
    .to(dim, { opacity: 0, duration: .6 }, '<');
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
