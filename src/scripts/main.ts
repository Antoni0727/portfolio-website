import { initSmoothScroll, ScrollTrigger } from './core';
import { initReveals } from './reveal';
import { initHero } from './hero';
import { initWork } from './work';
import { initCompare } from './compare';
import { initProcess } from './process';
import { initChat, initAbout, initFaq, initCtaGlow, initCopy } from './sections';
import { initNav, initBackground, initVideoGlow, initContactWindow } from './chrome';
import { initLabels } from './labels';
import { initFpsMeter } from './fps';

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
