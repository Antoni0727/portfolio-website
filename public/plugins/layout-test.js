/* Home layout test (see src/data/layout-test.ts). Loaded at the top of /plugins/ only while the test is on:
   picks a layout for a new visitor, remembers it, and opens that page before the home is shown. */
(function () {
  var s = document.currentScript, list = (s && s.dataset.layouts || '').split(','), v;
  try { v = localStorage.getItem('tjLayout'); } catch (e) {}
  if (list.indexOf(v) < 0) {
    v = list[Math.floor(Math.random() * list.length)];
    try { localStorage.setItem('tjLayout', v); } catch (e) {}
  }
  if (!v) return;
  document.documentElement.style.visibility = 'hidden';
  location.replace('/plugins/home/' + v + '/' + location.search + location.hash);
})();
