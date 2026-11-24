/* Black Friday countdown (see `ends` in src/data/store.ts). Loaded at the top of every page while an offer runs.
   Before the end: fills the countdown in the bar over the nav. From the end on: hides the bar and the offer bits
   ([data-sale], hidden by CSS) and swaps the offer price for the later one, so the site is right even before it is rebuilt. */
(function () {
  var s = document.currentScript, d = document.documentElement;
  var end = Date.parse(s && s.dataset.ends), now = s && s.dataset.now, later = s && s.dataset.later;
  if (!end) return;
  function over() {
    d.classList.remove('has-sbar');
    d.classList.add('sale-over');
    if (!now || !later) return;
    // every offer price on the page ("$29") becomes the later one ("$39") (text and labels)
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), t;
    while ((t = w.nextNode())) if (t.nodeValue.indexOf(now) > -1) t.nodeValue = t.nodeValue.split(now).join(later);
    var a = document.querySelectorAll('[aria-label*="' + now + '"]');
    for (var i = 0; i < a.length; i++) a[i].setAttribute('aria-label', a[i].getAttribute('aria-label').split(now).join(later));
  }
  if (Date.now() >= end) {
    d.classList.remove('has-sbar');
    d.classList.add('sale-over');
    document.addEventListener('DOMContentLoaded', over);
    return;
  }
  function two(x) { return (x < 10 ? '0' : '') + x; }
  document.addEventListener('DOMContentLoaded', function () {
    var c = document.querySelector('[data-sbar-clock]'), t;
    function tick() {
      var left = Math.max(0, Math.floor((end - Date.now()) / 1000));
      if (!left) { clearInterval(t); over(); return; }
      var dd = Math.floor(left / 86400), h = Math.floor(left / 3600) % 24, m = Math.floor(left / 60) % 60, sec = left % 60;
      if (c) c.textContent = (dd ? dd + 'd ' : '') + two(h) + ':' + two(m) + ':' + two(sec);
    }
    tick();
    t = setInterval(tick, 1000);
  });
})();
