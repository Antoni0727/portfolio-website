import { siDavinciresolve, siX, siInstagram, siYoutube, siTiktok, siGoogledrive } from 'simple-icons';

const brand = (path: string, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;

export const icons = {
  x: (s?: number) => brand(siX.path, s ?? 16),
  instagram: (s?: number) => brand(siInstagram.path, s),
  youtube: (s?: number) => brand(siYoutube.path, s),
  tiktok: (s?: number) => brand(siTiktok.path, s),
  drive: (s?: number) => brand(siGoogledrive.path, s),
  resolve: (s?: number) => brand(siDavinciresolve.path, s),
  /* Official Figma mark, full color */
  figma: (s = 22) =>
    `<svg viewBox="0 0 38 57" width="${(s * 38) / 57}" height="${s}" aria-hidden="true"><path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>`,
  mail: (s = 18) =>
    `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  calendar: (s = 18) =>
    `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  arrow: (s = 16) =>
    `<svg viewBox="0 0 16 16" width="${s}" height="${s}" aria-hidden="true"><path d="M3 8h9.5M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  play: (s = 20) =>
    `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="M6.9 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L8.1 4.5A.8.8 0 0 0 6.9 5.2z" fill="currentColor"/></svg>`,
  close: (s = 14) =>
    `<svg viewBox="0 0 16 16" width="${s}" height="${s}" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  chevron: (s = 14) =>
    `<svg viewBox="0 0 16 16" width="${s}" height="${s}" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: (s = 12) =>
    `<svg viewBox="0 0 16 16" width="${s}" height="${s}" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  copy: (s = 14) =>
    `<svg viewBox="0 0 16 16" width="${s}" height="${s}" aria-hidden="true"><rect x="5" y="5" width="8.5" height="8.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 10.5V4a1.5 1.5 0 0 1 1.5-1.5H11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  pin: (s = 14) =>
    `<svg viewBox="0 0 16 16" width="${s}" height="${s}" aria-hidden="true"><path d="M8 14.5s4.8-4.4 4.8-8.1A4.8 4.8 0 0 0 3.2 6.4c0 3.7 4.8 8.1 4.8 8.1z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.4" r="1.7" fill="currentColor"/></svg>`,
};
