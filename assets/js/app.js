/* Maruf Al Misbah portfolio: shared behaviour for every page. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = '+8801844876116', WA = '8801844876116', MAIL = 'almisbahmaruf@gmail.com';

  var toast = $('#toast'), tt;
  function say(m) {
    if (!toast) return;
    toast.textContent = m; toast.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- theme: dark / light ---------- */
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function eff() { return root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light'); }
  function syncEff() { root.setAttribute('data-eff', eff()); }
  syncEff();
  if (mq && mq.addEventListener) mq.addEventListener('change', syncEff);
  var themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var n = eff() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n); syncEff(); store('mp-theme', n);
  });

  /* ---------- accent colors ---------- */
  var pal = $('#pal'), palBtn = $('#palBtn'), sw = $$('#sw button');
  function setAccent(c) {
    if (c === 'orange') root.removeAttribute('data-accent'); else root.setAttribute('data-accent', c);
    sw.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.c === c); });
  }
  setAccent(root.getAttribute('data-accent') || 'orange');
  function togglePal(open) { if (!pal) return; pal.hidden = !open; palBtn.setAttribute('aria-expanded', open); }
  if (palBtn) palBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePal(pal.hidden); });
  sw.forEach(function (b) {
    b.addEventListener('click', function () { setAccent(b.dataset.c); store('mp-accent', b.dataset.c === 'orange' ? '' : b.dataset.c); });
  });
  document.addEventListener('click', function (e) { if (pal && !pal.hidden && !pal.contains(e.target)) togglePal(false); });

  /* ---------- typing animation (home hero) ---------- */
  var t1 = $('#t1'), t2 = $('#t2');
  if (t1 && t2 && !reduce) {
    var roles = ['Developer', 'Engineer', 'Builder'], ri = 0;
    var typeInto = function (el, text, done) {
      var i = 0;
      (function s() {
        el.textContent = text.slice(0, i); i++;
        if (i <= text.length) setTimeout(s, 65 + Math.random() * 55); else if (done) done();
      })();
    };
    var eraseFrom = function (el, done) {
      var s = el.textContent;
      (function e() {
        s = s.slice(0, -1); el.textContent = s;
        if (s.length) setTimeout(e, 38); else if (done) done();
      })();
    };
    var loop = function () {
      setTimeout(function () {
        eraseFrom(t2, function () {
          ri = (ri + 1) % roles.length;
          setTimeout(function () { typeInto(t2, roles[ri], loop); }, 220);
        });
      }, 2400);
    };
    t1.textContent = ''; t2.textContent = '';
    setTimeout(function () {
      typeInto(t1, 'Full Stack', function () {
        setTimeout(function () { typeInto(t2, roles[0], loop); }, 180);
      });
    }, 500);
  }

  /* ---------- scroll reveals ---------- */
  $$('.rv').forEach(function (el) {
    var sibs = $$(':scope > .rv', el.parentNode), i = sibs.indexOf(el);
    el.style.transitionDelay = Math.min(i, 5) * 110 + 'ms';
  });
  var items = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target; el.classList.add('in'); io.unobserve(el);
          setTimeout(function () { el.style.transitionDelay = '0ms'; }, 1400);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('in'); });

  /* ---------- mobile menu sheet ---------- */
  var sheet = $('#sheet'), sbg = $('#sheetBg'), menuBtn = $('#menuBtn');
  function sheetSet(o) {
    if (!sheet) return;
    sheet.classList.toggle('open', o); sbg.classList.toggle('open', o);
    menuBtn.setAttribute('aria-expanded', o); sheet.setAttribute('aria-hidden', !o);
    document.body.classList.toggle('lock', o);
    sheet.style.transform = ''; sheet.style.transition = '';
    $$('a,button', sheet).forEach(function (el) { el.tabIndex = o ? 0 : -1; });
  }
  if (sheet) {
    sheetSet(false);
    menuBtn.addEventListener('click', function () { togglePal(false); sheetSet(!sheet.classList.contains('open')); });
    $('#sheetX').addEventListener('click', function () { sheetSet(false); });
    sbg.addEventListener('click', function () { sheetSet(false); });
    var grab = $('#grab'), sy = 0, dy = 0, drag = false;
    grab.addEventListener('pointerdown', function (e) { drag = true; sy = e.clientY; dy = 0; grab.setPointerCapture(e.pointerId); sheet.style.transition = 'none'; });
    grab.addEventListener('pointermove', function (e) {
      if (!drag) return; dy = Math.max(0, e.clientY - sy); sheet.style.transform = 'translateY(' + dy + 'px)';
    });
    var endDrag = function () {
      if (!drag) return; drag = false; sheet.style.transition = '';
      if (dy > 90) sheetSet(false); else sheet.style.transform = '';
    };
    grab.addEventListener('pointerup', endDrag); grab.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', function () { if (window.innerWidth > 760 && sheet.classList.contains('open')) sheetSet(false); });
  }

  /* ---------- FAQ accordion ---------- */
  $$('.qb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var qa = btn.closest('.qa'), open = !qa.classList.contains('open');
      qa.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- project filters ---------- */
  var fb = $$('.fbtn');
  if (fb.length) {
    fb.forEach(function (b) {
      b.addEventListener('click', function () {
        fb.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var f = b.dataset.f;
        $$('.proj[data-kind]').forEach(function (p) {
          var show = f === 'all' || p.dataset.kind.split(' ').indexOf(f) > -1;
          p.classList.toggle('hide', !show);
          if (show) p.classList.add('in');
        });
      });
    });
  }

  /* ---------- hero parallax + background canvas ---------- */
  var stage = $('#stage'), hero = $('#home');
  if (stage && hero && !reduce) {
    var layers = $$('.layer', stage);
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      layers.forEach(function (l) { var d = +l.dataset.d; l.style.transform = 'translate(' + (x * d).toFixed(1) + 'px,' + (y * d).toFixed(1) + 'px)'; });
    });
    hero.addEventListener('pointerleave', function () { layers.forEach(function (l) { l.style.transform = ''; }); });
  }

  (function () {
    var cv = $('#fx'); if (!cv || !cv.getContext) return;
    var cx = cv.getContext('2d'), W = 0, H = 0, P = [], col = '255,107,44', dark = true, mx = -999, my = -999, run = true;
    var G = ['{ }', '</>', '=>', '01', '()', '[]', '&&', '#', 'fn', '</'];
    function colors() { col = (getComputedStyle(root).getPropertyValue('--ar') || '255,107,44').trim(); dark = eff() === 'dark'; }
    function make() {
      var n = W < 760 ? 24 : 56; P = [];
      for (var i = 0; i < n; i++) {
        P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
          r: Math.random() * 1.5 + .8, g: i % 7 === 0 ? G[i % G.length] : null, s: 12 + Math.random() * 9 });
      }
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); make();
    }
    function frame(move) {
      cx.clearRect(0, 0, W, H);
      var la = dark ? .5 : .42, da = dark ? .55 : .5, ga = dark ? .22 : .3;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (move) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -30) p.x = W + 30; if (p.x > W + 30) p.x = -30;
          if (p.y < -30) p.y = H + 30; if (p.y > H + 30) p.y = -30;
        }
        if (p.g) { cx.font = '500 ' + p.s + 'px JetBrains Mono, monospace'; cx.fillStyle = 'rgba(' + col + ',' + ga + ')'; cx.fillText(p.g, p.x, p.y); continue; }
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fillStyle = 'rgba(' + col + ',' + da + ')'; cx.fill();
        for (var j = i + 1; j < P.length; j++) {
          var q = P[j]; if (q.g) continue;
          var dx = p.x - q.x, dy2 = p.y - q.y, d = dx * dx + dy2 * dy2;
          if (d < 16900) { cx.strokeStyle = 'rgba(' + col + ',' + (la * (1 - d / 16900)).toFixed(3) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); }
        }
        var ex = p.x - mx, ey = p.y - my, ed = ex * ex + ey * ey;
        if (ed < 22500) { cx.strokeStyle = 'rgba(' + col + ',' + (.6 * (1 - ed / 22500)).toFixed(3) + ')'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(mx, my); cx.stroke(); }
      }
    }
    function loop() { if (run) frame(true); requestAnimationFrame(loop); }
    colors(); size();
    if (reduce) frame(false);
    else {
      loop();
      document.addEventListener('visibilitychange', function () { run = !document.hidden; });
      window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
      window.addEventListener('pointerleave', function () { mx = my = -999; });
    }
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (reduce) frame(false); }, 150); });
    if (window.MutationObserver) new MutationObserver(function () { colors(); if (reduce) frame(false); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-accent', 'data-eff'] });
  })();

  /* ---------- floating contact button ---------- */
  var fab = $('#fab'), fabBtn = $('#fabBtn'), fabItems = $$('.fab-i');
  function fabSet(o) {
    fab.classList.toggle('open', o); fabBtn.setAttribute('aria-expanded', o);
    fabItems.forEach(function (a) { a.tabIndex = o ? 0 : -1; });
  }
  if (fab) {
    fabSet(false);
    fabBtn.addEventListener('click', function (e) { e.stopPropagation(); fabSet(!fab.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!fab.contains(e.target)) fabSet(false); });
    var fc = $('#fabCall'); if (fc) fc.addEventListener('click', function () { say('Calling ' + PHONE); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (fab) fabSet(false); togglePal(false); sheetSet(false); }
  });

  /* ---------- scroll: sticky nav state, back to top, progress ring ---------- */
  var nav = $('#nav'), top = $('#top'), prg = $('#prg'), tick = false;
  function onScroll() {
    var y = window.scrollY || 0, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (top) top.classList.toggle('show', y > 520);
    if (fab) fab.classList.toggle('up', y > 520);
    if (prg) prg.style.strokeDashoffset = (132 * (1 - Math.min(1, y / max))).toFixed(1);
    if (stage && !reduce) stage.style.transform = 'translateY(' + (Math.min(y, 900) * -.08).toFixed(1) + 'px)';
    tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- project images: try assets/images/<name>.jpg, .png, .webp, .jpeg ---------- */
  $$('.shot img[data-img]').forEach(function (img) {
    var exts = ['jpg', 'png', 'webp', 'jpeg'], i = 0, base = 'assets/images/' + img.getAttribute('data-img') + '.';
    function next() { if (i >= exts.length) { img.remove(); return; } img.src = base + exts[i++]; }
    img.addEventListener('error', next);
    img.addEventListener('load', function () { img.classList.add('ok'); });
    next();
  });

  /* ---------- copy buttons ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = btn.dataset.copy;
      var fallback = function () {
        var n = btn.closest('.cc, span, div'), tgt = n && $('b', n);
        if (tgt) { var r = document.createRange(); r.selectNodeContents(tgt); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        say('Press Ctrl+C to copy');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { say('Copied ' + v); }, fallback);
      else fallback();
    });
  });

  /* ---------- contact form: opens email or WhatsApp with the message ---------- */
  var form = $('#form');
  if (form) {
    var note = $('#note');
    var data = function () {
      var n = $('#fn').value.trim(), e = $('#fe').value.trim(), m = $('#fm').value.trim();
      return { n: n, e: e, body: 'Name: ' + n + '\nEmail: ' + e + '\n\n' + m };
    };
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = data();
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Portfolio enquiry from ' + d.n) + '&body=' + encodeURIComponent(d.body);
      if (note) note.textContent = 'Your email app should open with the message ready. If it does not, write to ' + MAIL + '.';
    });
    var wa = $('#formWa');
    if (wa) wa.addEventListener('click', function () {
      if (!form.reportValidity()) return;
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(data().body), '_blank', 'noopener');
    });
  }

  /* ---------- page transitions ---------- */
  if (!reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      if (!/^(https?:|file:)$/.test(a.protocol)) return;
      if (a.origin !== location.origin) return;
      if (a.pathname === location.pathname && a.hash) return;
      if (a.href === location.href) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 220);
    });
    window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
  }
})();
