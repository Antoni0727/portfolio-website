/* Home layout test (see src/data/layout-test.ts). Loaded at the top of /plugins/ only while the test is on:
   picks a layout for a new visitor, remembers it, and opens that page before the home is shown. */
(function () {
  var s = document.currentScript, list = (s && s.dataset.layouts || '').split(','), v;
  // before TJ Quick Paste launches the home is the locked teaser (public/launch.js): no hop until then.
  // Same test as launch.js: the server said it's open (tjOpen), else this device's clock corrected by the server's.
  var opens = Date.parse(s && s.dataset.opens || '');
  if (opens) {
    var open = window.name === 'tjOpen';
    try { open = open || sessionStorage.getItem('tjOpen') === '1' || Date.now() + (+sessionStorage.getItem('tjSkew') || 0) >= opens; }
    catch (e) { open = open || Date.now() >= opens; }
    if (!open) return;
  }
  try { v = localStorage.getItem('tjLayout'); } catch (e) {}
  if (list.indexOf(v) < 0) {
    v = list[Math.floor(Math.random() * list.length)];
    try { localStorage.setItem('tjLayout', v); } catch (e) {}
  }
  if (!v) return;
  document.documentElement.style.visibility = 'hidden';
  // the visit counter (scripts/visit.ts) should see where the visitor came from, not this hop
  try { sessionStorage.setItem('tjRef', document.referrer || ''); } catch (e) {}
  location.replace('/plugins/home/' + v + '/' + location.search + location.hash);
})();
