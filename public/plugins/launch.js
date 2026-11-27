/* The TJ Quick Paste launch (`launch` in src/data/store.ts). Loaded at the top of every page until it's out.
   Before the launch Quick Paste is a secret: the home is a locked icon with the time left, its page and the layout
   pages are closed (data-closed: sent to the home), its name and buy buttons are hidden ([data-when], store.css).
   - Open or not is decided by the SERVER's clock (/plugins/api/launch, netlify/functions/plugins-launch.mjs): this
     device's clock is corrected by it (tjSkew), so changing the computer's clock opens nothing, and the checkout
     links come only from the server, only once it's open.
   - At the launch: the teaser home reloads (the layout test then opens a layout), a visitor sent home from the Quick
     Paste page goes back to it, other pages swap their hidden halves in place.
   - If the server can't be reached after the time, the buttons open the Gumroad page, so nobody is stuck.
   Fills [data-launch-clock] (07:22:41) and [data-launch-when] ("long" = "on Friday 27 November at 17:00 CET",
   "short" = "Fri 17:00"), in the visitor's own time. */
(function () {
  var s = document.currentScript, d = document.documentElement;
  var opens = Date.parse(s && s.dataset.opens);
  if (!opens) return;
  var CLOSED = s.dataset.closed === '1', API = '/plugins/api/launch', PROFILE = s.dataset.fallback || '';

  function get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }

  var skew = +get('tjSkew') || 0;   // the server's clock minus this device's (ms), from the last answer in this tab
  var said = get('tjOpen') === '1' || window.name === 'tjOpen';   // the server already said it's open
  if (window.name === 'tjOpen') window.name = '';
  function now() { return Date.now() + skew; }
  function openNow() { return said || now() >= opens; }

  // a closed page before the launch: straight to the teaser home (remember where they wanted to go)
  if (CLOSED && !openNow()) {
    d.style.visibility = 'hidden';
    put('tjWant', location.pathname + location.search + location.hash);
    location.replace('/plugins/');
    return;
  }
  d.classList.toggle('qp-open', openNow());
  var loadedLocked = !openNow();   // this page came up locked (so the layout test didn't hop either)

  var heard = false, links, fails = 0, retry = 0, lastAsk = 0, dom = false, waiting = null;
  var timer = 0, seen = false, painted = '', whenMin = -1, zeroAt = 0, resync = false;
  function isOpen() { return d.classList.contains('qp-open'); }

  /* ---------- the server ---------- */
  function ask() {
    clearTimeout(retry);
    var gap = performance.now() - lastAsk;
    if (lastAsk && gap < 1500) { retry = setTimeout(ask, 1500 - gap + Math.random() * 600); return; }
    lastAsk = performance.now();
    var t0 = Date.now();
    fetch(API, { cache: 'no-store', credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .then(function (j) {
        if (typeof j.now !== 'number' || typeof j.opens !== 'number') throw 'bad';
        skew = j.now - (t0 + Date.now()) / 2;
        opens = j.opens;
        heard = true; fails = 0;
        put('tjSkew', String(Math.round(skew)));
        if (j.open) { said = true; put('tjOpen', '1'); unlock(j.links || {}); }
        else { said = false; put('tjOpen', null); lock(); }
      })
      .catch(function () {
        fails++;
        // past the time and the server won't answer: open with the Gumroad page rather than leave people stuck
        // (never heard from it: this device's clock; heard before: its own clock, 15 s after the time)
        if (links === undefined && (heard ? now() >= opens + 15000 : Date.now() >= opens)) unlock(null);
        // around the launch keep trying every few seconds, otherwise back off to half a minute
        var near = Math.abs(opens - now()) < 120000;
        retry = setTimeout(ask, Math.min(near ? 4000 : 30000, 1500 * fails * fails));
      });
  }

  function lock() {
    if (CLOSED) { put('tjWant', location.pathname + location.search + location.hash); location.replace('/plugins/'); return; }
    d.classList.remove('qp-open');
    links = undefined; waiting = null;
    var els = document.querySelectorAll('[data-gate]');
    for (var i = 0; i < els.length; i++) {
      els[i].removeAttribute('href'); els[i].setAttribute('aria-disabled', 'true');
      els[i].setAttribute('role', 'link'); els[i].setAttribute('tabindex', '0');
    }
    if (dom) { fillWhen(true); start(); }
  }

  function unlock(l) {
    // someone watching it reach zero: hold 00:00:00 for a beat, then open
    var hold = zeroAt && dom && seen && !isOpen() ? 1000 - (Date.now() - zeroAt) : 0;
    zeroAt = 0;
    if (hold > 0) { setTimeout(function () { unlock(l); }, hold); return; }
    if (l || links === undefined) links = l;
    stop();
    if (dom && reveal()) return;
    if (dom && seen && !isOpen()) {
      d.classList.add('qp-unlocking');
      setTimeout(function () { d.classList.remove('qp-unlocking'); }, 1800);
      var st = document.querySelector('[data-toast]');
      if (st) st.textContent = 'TJ Quick Paste is out.';   // read out by screen readers (role=status)
    }
    d.classList.add('qp-open');
    if (dom) wire();
  }

  // the teaser home has no open half: once the server says it's open, load it again (the layout test then opens a
  // layout) or go back to the page they were sent away from. Only if it came up locked, so it can't loop.
  function reveal() {
    if (!said || !document.querySelector('[data-mystery]')) return false;
    var want = get('tjWant');
    if (!loadedLocked && !want) return false;
    put('tjWant', null);
    window.name = 'tjOpen';   // in case this browser keeps nothing in sessionStorage
    if (want) location.replace(want); else location.reload();
    return true;
  }

  /* ---------- links ---------- */
  function wire() {
    var o = document.querySelectorAll('[data-open-href]');
    for (var k = 0; k < o.length; k++) o[k].setAttribute('href', o[k].getAttribute('data-open-href'));
    if (links === undefined) return;
    var els = document.querySelectorAll('[data-gate]');
    for (var i = 0; i < els.length; i++) {
      var a = els[i], href = links ? links[a.getAttribute('data-gate')] : PROFILE;
      a.removeAttribute('aria-disabled'); a.removeAttribute('role'); a.removeAttribute('tabindex');
      if (href) { a.setAttribute('href', href); a.removeAttribute('data-buy-missing'); }
      else { a.setAttribute('href', '#'); a.setAttribute('data-buy-missing', ''); }   // no id yet: "checkout opens in a moment" (scripts/sections.ts)
    }
    if (waiting) {
      var w = waiting; waiting = null;
      var h = w.getAttribute('href');
      if (h && h !== '#') location.assign(h);
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-gate]');
    if (!a) return;
    if (!isOpen()) { e.preventDefault(); return; }
    if (!a.getAttribute('href')) { e.preventDefault(); waiting = a; ask(); }   // open, link still on its way
  }, true);

  /* ---------- the clock: hours, minutes, seconds ---------- */
  function two(x) { return (x < 10 ? '0' : '') + x; }
  function paint(left) {
    var t = Math.floor(left / 1000);
    var v = two(Math.floor(t / 3600)) + ':' + two(Math.floor(t / 60) % 60) + ':' + two(t % 60);
    if (v !== painted) {
      var c = document.querySelectorAll('[data-launch-clock]');
      for (var i = 0; i < c.length; i++) c[i].textContent = v;
      // the teaser home's clock keeps its parts (the seconds carry the selection): fill each one
      var p = v.split(':'), u = ['h', 'm', 's'], g = document.querySelectorAll('[data-launch-hms]');
      for (var j = 0; j < g.length; j++) {
        for (var n = 0; n < 3; n++) { var e = g[j].querySelector('[data-u="' + u[n] + '"]'); if (e && e.textContent !== p[n]) e.textContent = p[n]; }
        g[j].classList.add('is-set');
      }
      painted = v;
    }
    fillWhen();
  }
  function tick() {
    timer = 0;
    var left = opens - now();
    if (left <= 0) { paint(0); if (!zeroAt) zeroAt = Date.now(); ask(); return; }   // the server says when it's really open
    if (left < 60000 && !resync) { resync = true; ask(); }   // one more look at the server's clock before zero
    paint(left);
    timer = setTimeout(tick, (left % 1000) + 8);
  }
  function start() { if (!timer && !isOpen()) { seen = true; tick(); } }
  function stop() { clearTimeout(timer); timer = 0; }

  /* "on Friday 27 November at 17:00 CET" / "Fri 17:00", in the visitor's own time zone and clock style */
  function when(long) {
    var h12 = false;
    try { h12 = !!new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12; } catch (e) {}
    var loc = h12 ? 'en-US' : 'en-GB';
    var a = new Date(now()), b = new Date(opens);
    var day = Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
    if (long) return (day === 0 ? 'today at ' : day === 1 ? 'tomorrow at ' : 'on ' + new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' }).format(opens) + ' at ') +
      new Intl.DateTimeFormat(loc, { hour: 'numeric', minute: '2-digit', hour12: h12, timeZoneName: 'short' }).format(opens);
    return (day === 0 ? 'at ' : day === 1 ? 'tomorrow ' : new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(opens) + ' ') +
      new Intl.DateTimeFormat(loc, { hour: 'numeric', minute: '2-digit', hour12: h12 }).format(opens);
  }
  function fillWhen(force) {
    var min = Math.floor(now() / 60000);
    if (min === whenMin && !force) return;
    whenMin = min;
    var w = document.querySelectorAll('[data-launch-when]'), L, S;
    try { L = when(true); S = when(false); } catch (e) { return; }
    for (var i = 0; i < w.length; i++) {
      var v = w[i].getAttribute('data-launch-when') === 'short' ? S : L;
      if (w[i].textContent !== v) w[i].textContent = v;
    }
  }

  // as soon as the page is parsed: before the page's own scripts run, so the clock never shows 00:00:00 first
  function ready() {
    if (dom || document.readyState === 'loading') return;
    dom = true;
    fillWhen(true);
    if (isOpen()) { if (!reveal()) wire(); } else start();
  }
  document.addEventListener('readystatechange', ready);
  document.addEventListener('DOMContentLoaded', ready);

  // back from another tab, from sleep or from the back button: check the server's clock again
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !(heard && isOpen() && links)) ask(); });
  addEventListener('pageshow', function (e) { if (e.persisted) ask(); });

  ask();
})();
