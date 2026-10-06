/* Before/after wipe.
   Video mode: ONE side-by-side clip (left = raw, right = edit) drawn into a canvas,
   so both sides are always perfectly in sync and only one video is decoded.
   Sound: the clip's LEFT channel is the raw audio and the RIGHT channel is the edit audio;
   Web Audio picks one or the other depending on which side fills more of the frame. */
import { gsap, ScrollTrigger, $, reduceMotion } from './core';

export function initCompare() {
  const box = $('[data-compare]');
  if (!box) return;
  const range = $<HTMLInputElement>('input[type="range"]', box)!;
  const handle = $('.cmp__handle', box)!;
  const state = { pos: 50 };
  let width = box.clientWidth;
  let touched = false;
  let dragging = false;

  const canvas = $<HTMLCanvasElement>('[data-cmp-canvas]', box);
  const video = $<HTMLVideoElement>('[data-cmp-stack]', box);
  const soundBtn = $('[data-cmp-sound]', box);
  const soundLabel = $('[data-cmp-sound-label]', box);

  /* ---------- drawing ---------- */
  const ctx = canvas?.getContext('2d', { alpha: false }) ?? null;
  const small = window.matchMedia('(max-width: 760px)').matches;
  const poster = new Image();
  let posterReady = false;
  if (video) {
    poster.decoding = 'async';
    poster.onload = () => { posterReady = true; draw(); };
  }

  const sizeCanvas = () => {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
  };

  function draw() {
    if (!ctx || !canvas || !video) return;
    const useVideo = video.readyState >= 2;
    const src: CanvasImageSource | null = useVideo ? video : posterReady ? poster : null;
    if (!src) return;
    const sw = useVideo ? video.videoWidth : poster.naturalWidth;
    const sh = useVideo ? video.videoHeight : poster.naturalHeight;
    if (!sw || !sh) return;
    const W = canvas.width, H = canvas.height;
    // "object-fit: cover" for each half
    const halfW = sw / 2;
    const target = W / H, source = halfW / sh;
    let cw = halfW, ch = sh, cx = 0, cy = 0;
    if (target < source) { cw = sh * target; cx = (halfW - cw) / 2; } else { ch = halfW / target; cy = (sh - ch) / 2; }
    // edit (right half) fills the frame
    ctx.drawImage(src, halfW + cx, cy, cw, ch, 0, 0, W, H);
    // raw (left half) up to the handle
    const cut = Math.round((state.pos / 100) * W);
    if (cut > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, cut, H); ctx.clip();
      ctx.drawImage(src, cx, cy, cw, ch, 0, 0, W, H);
      ctx.restore();
    }
  }

  // redraw on every new video frame (falls back to rAF where the API is missing)
  let looping = false;
  const frameLoop = () => {
    if (!video || !looping) return;
    draw();
    const v = video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(frameLoop);
    else requestAnimationFrame(frameLoop);
  };
  const startLoop = () => { if (!looping) { looping = true; frameLoop(); } };
  const stopLoop = () => { looping = false; };

  /* ---------- sound ----------
     The video always stays muted. The audio (L = raw, R = edit) is a small separate file,
     decoded once and played with Web Audio, scheduled against the video's playhead and
     corrected for the device's output latency. Routing the video element's own sound
     through Web Audio added a noticeable delay on iPhone. */
  const audioUrl = video?.dataset.audio;
  let ac: AudioContext | null = null;
  let buffer: AudioBuffer | null = null;
  let loading: Promise<void> | null = null;
  let gains: { raw: GainNode; edit: GainNode } | null = null;
  let source: AudioBufferSourceNode | null = null;
  let srcStartCtx = 0, srcStartOffset = 0;
  let soundOn = false;
  let driftTimer: number | undefined;

  const latency = () => (ac ? ((ac as AudioContext & { outputLatency?: number }).outputLatency || 0) + (ac.baseLatency || 0) : 0);
  const ensureAudio = () => {
    if (!audioUrl) return Promise.resolve();
    if (!ac) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ac = new AC({ latencyHint: 'interactive' });
      const split = ac.createChannelSplitter(2);
      const merge = ac.createChannelMerger(2);
      const raw = ac.createGain(), edit = ac.createGain();
      raw.gain.value = 0; edit.gain.value = 0;
      split.connect(raw, 0); split.connect(edit, 1);
      raw.connect(merge, 0, 0); raw.connect(merge, 0, 1);
      edit.connect(merge, 0, 0); edit.connect(merge, 0, 1);
      merge.connect(ac.destination);
      gains = { raw, edit };
      (ac as AudioContext & { _split?: ChannelSplitterNode })._split = split;
    }
    if (!loading) {
      loading = fetch(audioUrl).then((r) => r.arrayBuffer()).then((d) => new Promise<AudioBuffer>((res, rej) => ac!.decodeAudioData(d, res, rej))).then((b) => { buffer = b; });
    }
    return loading;
  };

  const stopSource = () => { if (source) { try { source.stop(); } catch {} source.disconnect(); source = null; } };
  const startSource = () => {
    if (!ac || !buffer || !video || video.paused || !soundOn) return;
    stopSource();
    const dur = buffer.duration;
    const offset = (video.currentTime + latency()) % dur;
    source = ac.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect((ac as AudioContext & { _split?: ChannelSplitterNode })._split!);
    source.start(0, offset);
    srcStartCtx = ac.currentTime; srcStartOffset = offset;
  };
  // keep the audio locked to the picture: re-sync if it drifts more than ~50ms (or after a loop/seek)
  const checkDrift = () => {
    if (!ac || !buffer || !source || !video || video.paused) return;
    const dur = buffer.duration;
    const heard = (srcStartOffset + (ac.currentTime - srcStartCtx)) % dur;
    const want = (video.currentTime + latency()) % dur;
    let d = Math.abs(heard - want);
    d = Math.min(d, dur - d);
    if (d > .05) startSource();
  };

  const setAudible = (instant = false) => {
    if (!gains || !ac) return;
    const rawOn = soundOn && state.pos >= 50;
    const editOn = soundOn && state.pos < 50;
    const t = ac.currentTime;
    gains.raw.gain.setTargetAtTime(rawOn ? 1 : 0, t, instant ? 0.001 : 0.02);
    gains.edit.gain.setTargetAtTime(editOn ? 1 : 0, t, instant ? 0.001 : 0.02);
  };

  /* ---------- handle ---------- */
  const apply = () => {
    box.style.setProperty('--pos', `${state.pos}%`);
    handle.style.setProperty('--px', `${(state.pos / 100) * width}px`);
    range.value = String(Math.round(state.pos));
    setAudible();
    draw();
  };
  const goTo = (pos: number, d = .55) => gsap.to(state, { pos, duration: reduceMotion ? 0 : d, ease: 'power3.out', overwrite: true, onUpdate: apply });
  new ResizeObserver(() => { width = box.clientWidth; sizeCanvas(); apply(); draw(); }).observe(box);
  sizeCanvas();
  apply();

  const fromEvent = (e: PointerEvent) => {
    const r = box.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
  };
  box.addEventListener('dragstart', (e) => e.preventDefault());
  box.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('[data-cmp-sound]')) return;
    e.preventDefault();
    touched = true; dragging = true;
    box.setPointerCapture(e.pointerId);
    box.classList.add('is-dragging');
    if (video?.paused && inView) video.play().catch(() => {});   // a tap also starts it if the phone blocked autoplay
    goTo(fromEvent(e), .7);
  });
  box.addEventListener('pointermove', (e) => { if (dragging) goTo(fromEvent(e), .45); });
  const end = () => { dragging = false; box.classList.remove('is-dragging'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  range.addEventListener('input', () => { touched = true; goTo(Number(range.value), .4); });

  /* ---------- loading + playback ---------- */
  let inView = false;
  if (video) {
    const src = small ? video.dataset.srcSm! : video.dataset.src!;
    poster.src = small ? video.dataset.posterSm! : video.dataset.poster!;
    video.addEventListener('loadeddata', draw);
    video.addEventListener('play', startLoop);
    video.addEventListener('pause', () => { stopLoop(); draw(); });
    video.addEventListener('seeked', draw);

    ScrollTrigger.create({
      trigger: box, start: 'top bottom+=600', once: true,
      onEnter: () => { video.src = src; video.preload = 'auto'; video.load(); },
    });
    ScrollTrigger.create({
      trigger: box, start: 'top 90%', end: 'bottom 10%',
      onToggle: (s) => {
        inView = s.isActive;
        if (inView) video.play().catch(() => {});
        else video.pause();
      },
    });

    video.addEventListener('play', () => { startSource(); });
    video.addEventListener('pause', () => { stopSource(); });
    video.addEventListener('seeked', () => { startSource(); });

    soundBtn?.addEventListener('click', async () => {
      soundOn = !soundOn;
      soundBtn.setAttribute('aria-pressed', String(soundOn));
      if (soundLabel) soundLabel.textContent = soundOn ? 'Sound on' : 'Sound off';
      if (soundOn) {
        await ensureAudio();
        await ac?.resume();
        if (video.paused) await video.play().catch(() => {});
        setAudible(true);
        startSource();
        clearInterval(driftTimer);
        driftTimer = window.setInterval(checkDrift, 500);
      } else {
        setAudible(true);
        stopSource();
        clearInterval(driftTimer);
      }
    });
    // fetch the (small) audio file ahead of time so the first "Sound on" is instant
    // (an AudioContext may be created before a tap; it just stays suspended until "Sound on")
    ScrollTrigger.create({ trigger: box, start: 'top bottom+=200', once: true, onEnter: () => { ensureAudio().catch(() => {}); } });
  }

  /* one gentle hint so people know it moves */
  if (reduceMotion) return;
  ScrollTrigger.create({
    trigger: box, start: 'top 65%', once: true,
    onEnter: () => {
      const tl = gsap.timeline({ delay: .6, onUpdate: () => { if (touched) tl.kill(); } });
      tl.to(state, { pos: 30, duration: 1, ease: 'power3.inOut', onUpdate: apply })
        .to(state, { pos: 70, duration: 1.3, ease: 'power3.inOut', onUpdate: apply })
        .to(state, { pos: 50, duration: 1, ease: 'power3.inOut', onUpdate: apply });
    },
  });
}
