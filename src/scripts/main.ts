import { initSmoothScroll, ScrollTrigger } from './core';
import { initReveals } from './reveal';
import { initHero } from './hero';
import { initWork } from './work';
import { initCompare } from './compare';
import { initProcess } from './process';
import { initChat, initAbout, initFaq, initCtaGlow, initCopy, initWhyTable } from './sections';
import { initNav, initBackground, initVideoGlow, initContactWindow, initTheme } from './chrome';
import { initLabels } from './labels';
import { initFpsMeter } from './fps';

initTheme();
initSmoothScroll();
initNav();
initBackground();
initVideoGlow();
initContactWindow();
initHero();
initReveals();
initWork();
initCompare();
initProcess();
initWhyTable();
initChat();
initAbout();
initFaq();
initCtaGlow();
initCopy();
initLabels();
initFpsMeter();

// late-loading images/fonts can shift layout; re-measure once everything is in
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
