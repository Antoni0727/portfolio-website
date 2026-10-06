import { gsap, ScrollTrigger, $, $$, reduceMotion, finePointer, isLite } from './core';
import { revealHeading } from './reveal';
import { playInline, stopInline } from './player';

type Clip = { id: string; title: string; meta: string; start: number; end: number };

export function initHero() {
  const hero = $('.hero');
  if (!hero) return;

  /* ---- intro ---- */
  const title = $('[data-hero-title]', hero)!;
  const items = $$('[data-hero-item]', hero);
  const editor = $('[data-editor]', hero);

  const run = () => {
    if (reduceMotion) { gsap.set(items, { opacity: 1 }); revealHeading(title); return; }
    gsap.set(items, { opacity: 0, y: 28 });
    const tl = gsap.timeline({ delay: .1 });
    tl.to(items[0], { opacity: 1, y: 0, duration: 1.2 })
      .add(() => { revealHeading(title); }, .1)
      .to(items[1], { opacity: 1, y: 0, duration: 1.3 }, .55)
      .fromTo(editor, { opacity: 0, y: 90, rotateX: 14, scale: .94 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 2, ease: 'expo.out' }, .7)
      .to(items.slice(3), { opacity: 1, y: 0, duration: 1.2 }, 1.2);
  };
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 800))]).then(() => requestAnimationFrame(run));

  /* ---- soft aurora drift + scroll fade ---- */
  if (!reduceMotion) {
    const drift = $$('[data-aura]', hero).map((el, i) =>
      gsap.to(el, { xPercent: i ? -14 : 10, yPercent: i ? 12 : 8, duration: 14 + i * 4, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onToggle: (s) => drift.forEach((t) => (s.isActive && !isLite ? t.play() : t.pause())) });
    document.addEventListener('perf:lite', () => drift.forEach((t) => t.pause()));
    gsap.to('.hero__aurora', { opacity: 0, yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  if (editor) initEditor(editor);
}

function initEditor(editor: HTMLElement) {
  const clips: Clip[] = JSON.parse($('[data-ed-clips]', editor)!.textContent || '[]');
  const area = $('[data-tl-area]', editor)!;
  const head = $('[data-tl-head]', editor)!;
  const ghost = $('[data-tl-ghost]', editor)!;
  const viewer = $('[data-ed-viewer]', editor)!;
  const frames = $$('[data-ed-frame]', editor);
  const clipBtns = $$('[data-tl-clip]', editor);
  const titleEl = $('[data-ed-title]', editor)!;
  const metaEl = $('[data-ed-meta]', editor)!;
  const playBtn = $('[data-ed-play]', editor)!;
  const stopBtn = $('[data-ed-stop]', editor)!;
  const prevBtn = $('[data-ed-prev]', editor);
  const nextBtn = $('[data-ed-next]', editor);
  const countEl = $('[data-ed-count]', editor);

  const LOOP = 22;                 // seconds for one pass over all clips
  const state = { p: 0 };
  let width = area.clientWidth;
  let active = -1;
  let auto = !reduceMotion;
  let visible = true;
  let resumeTimer: number | undefined;
  let playing = false;

  const setHead = gsap.quickSetter(head, 'x', 'px');
  const setGhost = gsap.quickSetter(ghost, 'x', 'px');

  const indexAt = (p: number) => Math.max(0, clips.findIndex((c) => p >= c.start && p < c.end));

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    frames.forEach((f, j) => f.classList.toggle('is-active', j === i));
    clipBtns.forEach((b, j) => b.classList.toggle('is-active', j === i));
    if (countEl) countEl.textContent = `${i + 1} / ${clips.length}`;
    // swap the text right away (never depends on an animation finishing), then fade it in
    const c = clips[i];
    titleEl.textContent = c.title;
    metaEl.textContent = c.meta;
    if (!playing) playBtn.setAttribute('aria-label', `Play ${c.title}`);
    gsap.fromTo([titleEl, metaEl], { opacity: .2 }, { opacity: 1, duration: .6, ease: 'power2.out', overwrite: true });
  };

  let lock = -1; // while jumping to a clip, keep that clip active (don't flicker through the ones in between)
  const render = () => {
    const p = state.p;
    setHead(p * width);
    setActive(lock >= 0 ? lock : indexAt(p));
  };

  let lastP = -1;
  const tick = (_: number, dt: number) => {
    if (!visible) return;
    if (auto && !playing) state.p = (state.p + dt / 1000 / LOOP) % 1;
    if (state.p !== lastP) { lastP = state.p; render(); }
  };
  gsap.ticker.add(tick);

  ScrollTrigger.create({ trigger: editor, start: 'top bottom', end: 'bottom top', onToggle: (s) => { visible = s.isActive; } });
  new ResizeObserver(() => { width = area.clientWidth; render(); }).observe(area);

  /* scrubbing */
  const pFromEvent = (e: PointerEvent) => {
    const r = area.getBoundingClientRect();
    return Math.min(.9999, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const pauseAuto = () => { auto = false; clearTimeout(resumeTimer); };
  const resumeAutoLater = () => {
    clearTimeout(resumeTimer);
    if (!reduceMotion) resumeTimer = window.setTimeout(() => { if (!playing) auto = true; }, 2600);
  };
  let glide: gsap.core.Tween | null = null;
  const glideTo = (p: number, hold = -1) => {
    glide?.kill();                                   // kill the old jump first, then set the new lock
    lock = hold;
    glide = gsap.to(state, { p, duration: .9, ease: 'expo.out', overwrite: true, onComplete: () => { lock = -1; } });
    return glide;
  };

  let dragging = false;
  area.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('[data-tl-clip]') && e.pointerType !== 'mouse') return;
    dragging = true;
    area.setPointerCapture(e.pointerId);
    pauseAuto();
    if (playing) stopInline();
    glideTo(pFromEvent(e));
  });
  area.addEventListener('pointermove', (e) => {
    setGhost(pFromEvent(e) * width);
    if (dragging) { lock = -1; glide?.kill(); gsap.to(state, { p: pFromEvent(e), duration: .35, ease: 'power3.out', overwrite: true }); }
  });
  const end = () => { if (!dragging) return; dragging = false; resumeAutoLater(); };
  area.addEventListener('pointerup', end);
  area.addEventListener('pointercancel', end);

  /* play inline in the viewer */
  const play = (i = active) => {
    if (playing) return;
    const c = clips[i] ?? clips[0];
    playing = true;
    auto = false;
    playBtn.classList.add('is-playing');
    playBtn.setAttribute('aria-label', 'Pause');
    playInline(viewer, c.id, c.title, () => {
      playing = false;
      playBtn.classList.remove('is-playing');
      playBtn.setAttribute('aria-label', `Play ${clips[active].title}`);
      resumeAutoLater();
    });
  };

  /* jump to a clip; if a video is playing, keep playing the new one */
  const goToClip = (i: number) => {
    const n = (i + clips.length) % clips.length;
    const wasPlaying = playing;
    if (playing) stopInline();
    pauseAuto();
    glideTo(clips[n].start + .002, n);
    setActive(n);
    if (wasPlaying) play(n);
    else resumeAutoLater();
  };

  clipBtns.forEach((b, i) => b.addEventListener('click', () => goToClip(i)));
  prevBtn?.addEventListener('click', () => goToClip(active - 1));
  nextBtn?.addEventListener('click', () => goToClip(active + 1));
  playBtn.addEventListener('click', () => (playing ? stopInline() : play()));

  viewer.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-ed-stop]')) return;
    play();
  });
  stopBtn.addEventListener('click', (e) => { e.stopPropagation(); stopInline(); });

  /* gentle 3D tilt toward the cursor (desktop) */
  if (finePointer && !reduceMotion) {
    const rx = gsap.quickTo(editor, 'rotateX', { duration: 1.2, ease: 'power3.out' });
    const ry = gsap.quickTo(editor, 'rotateY', { duration: 1.2, ease: 'power3.out' });
    editor.addEventListener('pointermove', (e) => {
      if (dragging || playing || isLite) return;
      const r = editor.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - .5) * 3);
      rx(-((e.clientY - r.top) / r.height - .5) * 3);
    });
    editor.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  render();
}
