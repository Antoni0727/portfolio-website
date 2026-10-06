/* Inline YouTube playback: the video plays right where the thumbnail was.
   Only one plays at a time; starting another stops the previous one. */

type Playing = { host: HTMLElement; frame: HTMLIFrameElement; onStop?: () => void };
let current: Playing | null = null;

export function playInline(host: HTMLElement, id: string, title = 'Video', onStop?: () => void) {
  stopInline();
  const frame = document.createElement('iframe');
  frame.className = 'yt-frame';
  // phones block autoplay with sound inside embeds; muted autoplay starts instantly (tap the video to unmute)
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1&modestbranding=1${touch ? '&mute=1' : ''}`;
  frame.title = title;
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.style.opacity = '0';
  frame.style.transition = 'opacity .6s cubic-bezier(.16,1,.3,1)';
  frame.addEventListener('load', () => { frame.style.opacity = '1'; }, { once: true });
  host.appendChild(frame);
  host.classList.add('is-playing');
  current = { host, frame, onStop };
}

export function stopInline() {
  if (!current) return;
  const { host, frame, onStop } = current;
  current = null;
  frame.style.opacity = '0';
  host.classList.remove('is-playing');
  setTimeout(() => frame.remove(), 400);
  onStop?.();
}

export const isPlayingIn = (host: HTMLElement) => current?.host === host;
