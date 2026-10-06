const el = document.getElementById('fps');
let frames = 0, start = performance.now(), worst = 0, last = start, best = 0;
function loop(now) {
  frames++; worst = Math.max(worst, now - last); last = now;
  if (now - start >= 1000) {
    const fps = Math.round(frames * 1000 / (now - start));
    best = Math.max(best, fps);
    el.textContent = fps + ' fps · slowest ' + Math.round(worst) + 'ms';
    el.style.background = fps >= 55 ? '#127846' : fps >= 40 ? '#B4780A' : '#BE2832';
    document.getElementById('hz').textContent = best >= 100 ? '120 Hz (ProMotion)' : best >= 55 ? '60 Hz' : 'capped at ~' + best + ' fps by the browser';
    frames = 0; worst = 0; start = now;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
