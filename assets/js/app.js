/* Maruf Al Misbah portfolio: shared behaviour for every page. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* send a form to Formspree when assets/js/config.js has an ID; otherwise the caller falls back to email or WhatsApp */
  function sendForm(obj) {
    var id = window.SITE && window.SITE.formspree;
    if (!id || !window.fetch) return Promise.reject(new Error('no-backend'));
    return fetch('https://formspree.io/f/' + id, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(obj) })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); });
  }
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

  /* ---------- project filters (Shuffle.js on the projects page, plain toggle elsewhere) ---------- */
  var fb = $$('.fbtn'), grid = $('#pgrid'), shuffle = null;
  if (grid && window.Shuffle) {
    shuffle = new Shuffle(grid, { itemSelector: '.pitem', speed: reduce ? 0 : 450, easing: 'cubic-bezier(.22,1,.36,1)', gutterWidth: 22, buffer: 1 });
    $$('.pitem .proj').forEach(function (p) { p.classList.add('in'); });
    window.addEventListener('load', function () { shuffle.update(); });
  }
  if (fb.length) {
    fb.forEach(function (b) {
      b.addEventListener('click', function () {
        fb.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var f = b.dataset.f;
        if (shuffle) { shuffle.filter(f === 'all' ? Shuffle.ALL_ITEMS : f); return; }
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
    function loop() { if (run && !root.hasAttribute('data-eco')) frame(true); requestAnimationFrame(loop); }
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
    if (stage && !reduce && !window.gsap) stage.style.transform = 'translateY(' + (Math.min(y, 900) * -.08).toFixed(1) + 'px)';
    tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- project images: try assets/images/<name>.webp, .jpg, .png, .jpeg; click opens a lightbox ---------- */
  var vbReady = false;
  function lightbox() {
    if (!window.VenoBox) return;
    if (vbReady) { return; }
    vbReady = true;
    new VenoBox({ selector: '.vbx', numeration: true, infinigall: true, share: false, spinner: 'plane', titleattr: 'data-title', maxWidth: '1100px' });
  }
  $$('.shot img[data-img]').forEach(function (img) {
    var exts = ['webp', 'jpg', 'png', 'jpeg'], i = 0, base = 'assets/images/' + img.getAttribute('data-img') + '.';
    function next() { if (i >= exts.length) { img.remove(); return; } img.src = base + exts[i++]; }
    img.addEventListener('error', next);
    img.addEventListener('load', function () {
      img.classList.add('ok');
      var shot = img.parentNode;
      if (window.VenoBox && shot && !shot.querySelector('.vbx')) {
        var card = img.closest('.proj'), t = card && card.querySelector('h3');
        var a = document.createElement('a');
        a.className = 'vbx'; a.href = img.src; a.setAttribute('data-gall', 'projects');
        a.setAttribute('data-title', t ? t.textContent : 'Project'); a.setAttribute('aria-label', 'View larger image');
        shot.appendChild(a);
      }
      clearTimeout(img._t); window.__vbt = setTimeout(function () { vbReady = false; lightbox(); }, 250);
    });
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
      if (window.SITE && window.SITE.formspree) {
        if (note) note.textContent = 'Sending...';
        sendForm({ name: d.n, email: d.e, message: d.body, _subject: 'Portfolio enquiry from ' + d.n }).then(function () {
          if (note) note.textContent = 'Thank you! Your message was sent. I will reply soon.'; form.reset();
        }, function () {
          if (note) note.textContent = 'Could not send it from here. Please email ' + MAIL + ' instead.';
        });
        return;
      }
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Portfolio enquiry from ' + d.n) + '&body=' + encodeURIComponent(d.body);
      if (note) note.textContent = 'Your email app should open with the message ready. If it does not, write to ' + MAIL + '.';
    });
    var wa = $('#formWa');
    if (wa) wa.addEventListener('click', function () {
      if (!form.reportValidity()) return;
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(data().body), '_blank', 'noopener');
    });
  }

  /* ---------- plugins: Swiper, Counter Up, Chart.js, GSAP ---------- */
  if (window.Swiper) {
    var common = { speed: 650, grabCursor: true, spaceBetween: 22, a11y: { enabled: true } };
    if ($('.pswiper')) new Swiper('.pswiper', Object.assign({}, common, {
      slidesPerView: 1, breakpoints: { 700: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } },
      navigation: { nextEl: '.pswiper-next', prevEl: '.pswiper-prev' },
      pagination: { el: '.pswiper-pg', clickable: true },
      autoplay: reduce ? false : { delay: 4200, disableOnInteraction: true, pauseOnMouseEnter: true }
    }));
    if ($('.tswiper')) new Swiper('.tswiper', Object.assign({}, common, {
      slidesPerView: 1, breakpoints: { 760: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } },
      pagination: { el: '.tswiper-pg', clickable: true }
    }));
  }

  /* counterup2 reads the number from the element and animates it from 0 when it scrolls into view */
  $$('.count').forEach(function (el) {
    el.textContent = el.dataset.n;
    if (window.counterUp && !reduce) window.counterUp.default(el, { duration: 1600, delay: 20 });
  });

  var cc = $('#skillChart');
  if (cc && window.Chart) {
    var skillChart = null;
    var draw = function () {
      var cs = getComputedStyle(root), ar = (cs.getPropertyValue('--ar') || '255,107,44').trim(), d = eff() === 'dark';
      var txt = d ? 'rgba(255,255,255,.78)' : 'rgba(20,12,8,.78)', grd = d ? 'rgba(255,255,255,.12)' : 'rgba(20,12,8,.14)';
      if (skillChart) skillChart.destroy();
      skillChart = new Chart(cc, {
        type: 'radar',
        data: { labels: JSON.parse(cc.dataset.labels), datasets: [{ label: 'Skill level', data: JSON.parse(cc.dataset.values),
          backgroundColor: 'rgba(' + ar + ',.25)', borderColor: 'rgb(' + ar + ')', borderWidth: 2, pointBackgroundColor: 'rgb(' + ar + ')', pointRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: reduce ? false : { duration: 1400, easing: 'easeOutQuart' },
          plugins: { legend: { display: false } },
          scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 25 }, grid: { color: grd }, angleLines: { color: grd },
            pointLabels: { color: txt, font: { size: 12, family: 'Inter, system-ui, sans-serif' } } } } }
      });
    };
    if ('IntersectionObserver' in window) {
      var chio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { chio.disconnect(); draw(); } }, { threshold: .25 });
      chio.observe(cc);
    } else draw();
    if (window.MutationObserver) new MutationObserver(function () { if (skillChart) draw(); })
      .observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-accent', 'data-eff'] });
  }

  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    var sp = $('#sp');
    if (sp) gsap.to(sp, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
    if (stage) gsap.to(stage, { y: -70, ease: 'none', scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: .8 } });
    gsap.utils.toArray('.head h2, .phead h1, .band h2').forEach(function (h) {
      if (h.children.length) return;
      var words = h.textContent.trim().split(/\s+/);
      h.innerHTML = words.map(function (w) { return '<span class="wd"><span>' + w + '</span></span>'; }).join(' ');
      gsap.from($$('.wd > span', h), { yPercent: 110, duration: .9, ease: 'power4.out', stagger: .07, scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
    });
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      $$('.btn:not(.sm)').forEach(function (b) {
        b.classList.add('mag');
        var xt = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' }), yt = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' });
        b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); xt((e.clientX - r.left - r.width / 2) * .22); yt((e.clientY - r.top - r.height / 2) * .3); });
        b.addEventListener('pointerleave', function () { xt(0); yt(0); });
      });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- preloader, card spotlight, custom cursor ---------- */
  (function () {
    var pre = $('#pre');
    if (pre) {
      var hide = function () { pre.classList.add('done'); };
      if (document.readyState === 'complete') setTimeout(hide, 500); else window.addEventListener('load', function () { setTimeout(hide, 500); });
      setTimeout(hide, 2500);
    }
    document.addEventListener('pointermove', function (e) {
      var g = e.target.closest && e.target.closest('.glass'); if (!g) return;
      var r = g.getBoundingClientRect();
      g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
    if (reduce || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var ring = document.createElement('div'), dot = document.createElement('div');
    ring.className = 'cur'; dot.className = 'curd'; document.body.appendChild(ring); document.body.appendChild(dot);
    var x = 0, y = 0, rx = 0, ry = 0, on = false;
    document.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!on) { on = true; rx = x; ry = y; ring.classList.add('on'); dot.classList.add('on'); }
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      ring.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,.vbx,.qb')));
    }, { passive: true });
    document.addEventListener('mouseleave', function () { ring.classList.remove('on'); dot.classList.remove('on'); on = false; });
    (function loop() { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)'; requestAnimationFrame(loop); })();
  })();

  /* ====================================================================
     New features: language switch, spotlight, command palette, terminal,
     GitHub live data, 3D tilt, before/after slider, process timeline
     ==================================================================== */
  var PROJECTS = [{"t": "Furniture Store Website", "gh": "Furniture-Store-Website", "live": "https://marufalmisbah.github.io/Furniture-Store-Website/"}, {"t": "Kids Online MCQ Exam Portal", "gh": "Kids-Online-MCQ-Examination-Portal", "live": "https://marufalmisbah.github.io/Kids-Online-MCQ-Examination-Portal/"}, {"t": "Painting Contractor Website", "gh": "Painting-Contractor-Website", "live": "https://marufalmisbah.github.io/Painting-Contractor-Website/"}, {"t": "Window and Door Company Website", "gh": "Window-Door-Company-Website", "live": "https://marufalmisbah.github.io/Window-Door-Company-Website/"}, {"t": "Sheba Info BD", "gh": "sheba-info-bd", "live": "https://marufalmisbah.github.io/sheba-info-bd/"}, {"t": "Portfolio Website", "gh": "marufProtfolio", "live": "https://marufalmisbah.github.io/marufProtfolio/"}];
  var BN = {"Home": "হোম", "Skills": "স্কিলস", "Experience": "অভিজ্ঞতা", "Projects": "প্রজেক্ট", "Contact": "যোগাযোগ", "Download Resume": "রিজিউমে ডাউনলোড", "Download": "ডাউনলোড", "Accent color": "রঙের থিম", "Spotlight mode": "স্পটলাইট মোড", "Menu": "মেনু", "Full-stack web developer and UI/UX designer building scalable, high-converting web apps for clients worldwide, with React, Next.js, Laravel, PHP and Figma.": "ফুল-স্ট্যাক ওয়েব ডেভেলপার ও UI/UX ডিজাইনার। React, Next.js, Laravel, PHP ও Figma দিয়ে বিশ্বজুড়ে ক্লায়েন্টদের জন্য দ্রুত ও কার্যকর ওয়েব অ্যাপ বানাই।", "Hire Me": "আমাকে নিয়োগ দিন", "Download CV": "সিভি ডাউনলোড", "Scroll": "স্ক্রল", "About me": "আমার সম্পর্কে", "Building things people use every day.": "যা মানুষ প্রতিদিন ব্যবহার করে, তা-ই বানাই।", "Based in": "থাকি", "Jashore, Bangladesh": "যশোর, বাংলাদেশ", "Role": "পদ", "Full-stack developer": "ফুল-স্ট্যাক ডেভেলপার", "Stack": "স্ট্যাক", "Design": "ডিজাইন", "Studying": "পড়ছি", "B.Sc. Environmental Sciences": "বি.এসসি. পরিবেশ বিজ্ঞান", "Developer console": "ডেভেলপার কনসোল", "Ask my terminal.": "আমার টার্মিনালকে জিজ্ঞেস করুন।", "Type a command or tap a chip. Try help to see everything.": "কমান্ড লিখুন বা নিচের বাটনে চাপ দিন। সব দেখতে help লিখুন।", "Technical skills": "টেকনিক্যাল স্কিল", "The toolkit I reach for.": "যে টুলস নিয়ে কাজ করি।", "Frontend": "ফ্রন্টএন্ড", "Backend": "ব্যাকএন্ড", "Wireframes and prototypes": "ওয়্যারফ্রেম ও প্রোটোটাইপ", "See all skills": "সব স্কিল দেখুন", "Professional experience": "পেশাগত অভিজ্ঞতা", "Where I've shipped.": "যেখানে কাজ পৌঁছে দিয়েছি।", "Freelance Full-Stack Developer and UI/UX Designer": "ফ্রিল্যান্স ফুল-স্ট্যাক ডেভেলপার ও UI/UX ডিজাইনার", "PRESENT": "চলমান", "See full experience": "পুরো অভিজ্ঞতা দেখুন", "How I work": "আমি যেভাবে কাজ করি", "From idea to launch.": "আইডিয়া থেকে লঞ্চ পর্যন্ত।", "Four clear steps, so you always know what comes next.": "চারটি পরিষ্কার ধাপ, যাতে আপনি সবসময় জানেন এরপর কী হবে।", "Discover": "বোঝা", "We talk about your goal, your users and your deadline. I ask the questions that save time later.": "আপনার লক্ষ্য, ব্যবহারকারী ও সময়সীমা নিয়ে কথা বলি। পরে সময় বাঁচবে এমন প্রশ্নগুলো আগেই করি।", "I sketch the layout and design the screens in Figma, so you see the site before any code is written.": "Figma-তে লেআউট ও স্ক্রিন ডিজাইন করি, যাতে কোড লেখার আগেই আপনি সাইটটা দেখতে পান।", "Build": "তৈরি", "I turn the design into clean, responsive code with HTML, CSS, JavaScript, React, Next.js, PHP or Laravel.": "ডিজাইনটাকে পরিষ্কার, রেসপন্সিভ কোডে রূপ দিই HTML, CSS, JavaScript, React, Next.js, PHP বা Laravel দিয়ে।", "Launch": "লঞ্চ", "I test on real devices, fix the rough edges, publish the site and stay around for support.": "আসল ডিভাইসে টেস্ট করি, ছোটখাটো ত্রুটি ঠিক করি, সাইট প্রকাশ করি এবং পরেও পাশে থাকি।", "Featured projects": "নির্বাচিত প্রজেক্ট", "Selected work.": "বাছাই করা কাজ।", "Real projects from my GitHub. Click an image to see it full size.": "আমার GitHub থেকে আসল প্রজেক্ট। বড় করে দেখতে ছবিতে ক্লিক করুন।", "Business website": "বিজনেস ওয়েবসাইট", "Furniture Store Website": "ফার্নিচার স্টোর ওয়েবসাইট", "A front-end website for a furniture store with a product-led homepage layout.": "ফার্নিচার দোকানের জন্য ফ্রন্ট-এন্ড ওয়েবসাইট, পণ্যকেন্দ্রিক হোমপেজ লেআউটসহ।", "Web app": "ওয়েব অ্যাপ", "Kids Online MCQ Exam Portal": "শিশুদের অনলাইন MCQ পরীক্ষা পোর্টাল", "An online multiple-choice examination portal made for kids.": "শিশুদের জন্য বানানো অনলাইন বহুনির্বাচনী পরীক্ষার পোর্টাল।", "Painting Contractor Website": "পেইন্টিং কন্ট্রাক্টর ওয়েবসাইট", "A business website for a painting contractor, built to present services and win enquiries.": "পেইন্টিং কন্ট্রাক্টরের বিজনেস ওয়েবসাইট, সেবা তুলে ধরতে ও নতুন অনুসন্ধান পেতে বানানো।", "Window and Door Company Website": "জানালা ও দরজা কোম্পানির ওয়েবসাইট", "A company website for a window and door business.": "জানালা ও দরজার ব্যবসার জন্য কোম্পানি ওয়েবসাইট।", "Information site": "তথ্যভিত্তিক সাইট", "Sheba Info BD": "সেবা ইনফো বিডি", "A Bengali guide to Bangladeshi government services: NID, passport, birth certificate, driving licence, e-mutation and more.": "বাংলাদেশের সরকারি সেবার বাংলা গাইড: NID, পাসপোর্ট, জন্ম নিবন্ধন, ড্রাইভিং লাইসেন্স, ই-মিউটেশনসহ আরও অনেক কিছু।", "Portfolio": "পোর্টফোলিও", "Portfolio Website": "পোর্টফোলিও ওয়েবসাইট", "My personal portfolio site, published live on GitHub Pages.": "আমার ব্যক্তিগত পোর্টফোলিও সাইট, GitHub Pages-এ লাইভ।", "View on GitHub": "GitHub-এ দেখুন", "Live Demo": "লাইভ ডেমো", "View all projects": "সব প্রজেক্ট দেখুন", "GitHub live": "GitHub লাইভ", "My coding activity.": "আমার কোডিং কার্যকলাপ।", "Numbers pulled live from my public GitHub profile every time you visit.": "আপনি যতবার আসবেন, আমার পাবলিক GitHub প্রোফাইল থেকে সরাসরি সংখ্যা আনা হয়।", "Public repositories": "পাবলিক রিপোজিটরি", "Followers": "ফলোয়ার", "Last push": "সর্বশেষ পুশ", "Top languages": "সবচেয়ে বেশি ব্যবহৃত ভাষা", "Recently updated": "সম্প্রতি আপডেট", "Contribution graph": "কন্ট্রিবিউশন গ্রাফ", "Loading live data from GitHub...": "GitHub থেকে লাইভ তথ্য আনা হচ্ছে...", "Open my GitHub profile": "আমার GitHub প্রোফাইল খুলুন", "Live data from the GitHub public API.": "GitHub পাবলিক API থেকে সরাসরি পাওয়া তথ্য।", "Services": "সেবা", "How I can help.": "আমি যেভাবে সাহায্য করতে পারি।", "Web Applications": "ওয়েব অ্যাপ্লিকেশন", "Product-grade apps with clean structure and room to grow.": "পরিষ্কার কাঠামোর প্রোডাক্ট-মানের অ্যাপ, যা ভবিষ্যতে বাড়ানো যায়।", "Back-end Development": "ব্যাক-এন্ড ডেভেলপমেন্ট", "Laravel and PHP back ends with clean REST APIs.": "পরিষ্কার REST API সহ Laravel ও PHP ব্যাক-এন্ড।", "UI/UX Design": "UI/UX ডিজাইন", "Figma wireframes and prototypes that become clean, responsive interfaces.": "Figma ওয়্যারফ্রেম ও প্রোটোটাইপ, যা পরিষ্কার ও রেসপন্সিভ ইন্টারফেসে রূপ নেয়।", "Business Websites": "বিজনেস ওয়েবসাইট", "Fast, sharp-looking company sites that work on every screen.": "দ্রুত ও দেখতে ঝকঝকে কোম্পানি সাইট, যা সব স্ক্রিনে ঠিকমতো চলে।", "Education and certifications": "শিক্ষা ও সার্টিফিকেট", "Always learning.": "সবসময় শিখছি।", "Education": "শিক্ষা", "B.Sc. in Environmental Sciences": "বি.এসসি. পরিবেশ বিজ্ঞান", "University of Chittagong": "চট্টগ্রাম বিশ্ববিদ্যালয়", "Higher Secondary Certificate": "উচ্চ মাধ্যমিক সনদ (HSC)", "Cantonment College Jashore": "ক্যান্টনমেন্ট কলেজ যশোর", "Secondary School Certificate": "মাধ্যমিক স্কুল সনদ (SSC)", "Jashore Zilla School": "যশোর জিলা স্কুল", "Certifications": "সার্টিফিকেশন", "Web Design Level 3": "ওয়েব ডিজাইন লেভেল ৩", "National Skills Development Authority": "ন্যাশনাল স্কিলস ডেভেলপমেন্ট অথরিটি (NSDA)", "Front-End Developer Certificate": "ফ্রন্ট-এন্ড ডেভেলপার সার্টিফিকেট", "Creative IT Institute Chattogram Campus": "ক্রিয়েটিভ আইটি ইনস্টিটিউট, চট্টগ্রাম ক্যাম্পাস", "Web Design and Development for Freelancing Level 3": "ফ্রিল্যান্সিংয়ের জন্য ওয়েব ডিজাইন ও ডেভেলপমেন্ট লেভেল ৩", "Retail Sales Operation Level 3": "রিটেইল সেলস অপারেশন লেভেল ৩", "See the full timeline": "পুরো টাইমলাইন দেখুন", "Testimonials": "ক্লায়েন্টদের কথা", "Kind words.": "মিষ্টি কিছু কথা।", "These three cards are placeholders. Replace them with real feedback from your clients, or delete this section.": "এই তিনটি কার্ড নমুনা মাত্র। এগুলোর জায়গায় ক্লায়েন্টদের আসল মতামত বসান, অথবা সেকশনটি মুছে দিন।", "Sample": "নমুনা", "Client name": "ক্লায়েন্টের নাম", "Company or role": "কোম্পানি বা পদ", "Replace this with a real review from a client. Short quotes about communication, speed and quality work best.": "এখানে ক্লায়েন্টের আসল রিভিউ বসান। যোগাযোগ, গতি ও কাজের মান নিয়ে ছোট মন্তব্য সবচেয়ে ভালো।", "FAQ": "সাধারণ প্রশ্ন", "Questions, answered.": "প্রশ্ন ও উত্তর।", "Can't find what you need? Send a message and I'll get back to you.": "যা খুঁজছেন পাচ্ছেন না? একটি বার্তা পাঠান, আমি উত্তর দেব।", "What kind of projects do you take on?": "কোন ধরনের প্রজেক্টে কাজ করেন?", "Business websites, landing pages, web apps and portals, built with HTML, CSS, JavaScript, React, Next.js, Laravel and PHP. I can also design the interface in Figma first.": "বিজনেস ওয়েবসাইট, ল্যান্ডিং পেজ, ওয়েব অ্যাপ ও পোর্টাল, HTML, CSS, JavaScript, React, Next.js, Laravel ও PHP দিয়ে। চাইলে আগে Figma-তে ইন্টারফেস ডিজাইনও করে দিই।", "How long does a project take?": "একটি প্রজেক্টে কতদিন লাগে?", "It depends on the size and the content. A simple website is quicker than a full web app. Once we have talked through the scope, I send an estimate with a timeline.": "এটা কাজের আকার ও কনটেন্টের উপর নির্ভর করে। সাধারণ ওয়েবসাইট পুরো ওয়েব অ্যাপের চেয়ে দ্রুত হয়। কাজের পরিধি নিয়ে কথা হলে আমি সময়সহ একটি আনুমানিক হিসাব পাঠাই।", "Are you available for freelance or full-time work?": "ফ্রিল্যান্স বা ফুল-টাইম কাজের জন্য কি পাওয়া যায়?", "Yes to freelance projects. I am also open to remote or hybrid roles. Send a message with a few details and we can take it from there.": "ফ্রিল্যান্স প্রজেক্টে হ্যাঁ। রিমোট বা হাইব্রিড চাকরির জন্যও প্রস্তুত। কিছু তথ্যসহ বার্তা পাঠান, সেখান থেকে এগোব।", "How do you price your work?": "কাজের মূল্য কীভাবে নির্ধারণ করেন?", "I quote per project after I understand what you need. Send me a short brief and I will reply with an estimate.": "আপনার চাহিদা বুঝে প্রজেক্ট ধরে দাম বলি। সংক্ষিপ্ত ব্রিফ পাঠান, আমি আনুমানিক দামসহ উত্তর দেব।", "Do you help after launch?": "লঞ্চের পরেও কি সহায়তা পাওয়া যায়?", "Yes. I can fix issues and make updates after launch. Tell me what you need when we agree the scope.": "হ্যাঁ। লঞ্চের পর সমস্যা ঠিক করে দিই ও আপডেট করি। কাজের পরিধি ঠিক করার সময় কী লাগবে জানাবেন।", "Can I download your CV?": "আপনার সিভি কি ডাউনলোড করা যায়?", "Yes. Use the Download CV button on the home page, or the Download Resume button in the top navigation bar.": "হ্যাঁ। হোম পেজের সিভি ডাউনলোড বাটন বা উপরের নেভিগেশন বারের রিজিউমে ডাউনলোড বাটন ব্যবহার করুন।", "Got a project in mind?": "মাথায় কোনো প্রজেক্ট আছে?", "Let's turn your idea into a product.": "আসুন আপনার আইডিয়াটাকে প্রোডাক্টে রূপ দিই।", "Tell me what you're building and I'll come back with a plan, a timeline and a clear price.": "কী বানাচ্ছেন জানান, আমি পরিকল্পনা, সময় ও পরিষ্কার দাম নিয়ে ফিরে আসব।", "Let's build something great.": "আসুন <span class=\"grad\">দারুণ</span> কিছু বানাই।", "Have a project, a role or just a question? Send a note and I'll get back to you.": "প্রজেক্ট, চাকরি বা শুধু একটা প্রশ্ন? একটি বার্তা পাঠান, আমি উত্তর দেব।", "Copy": "কপি", "Your name": "আপনার নাম", "Email": "ইমেইল", "Message": "বার্তা", "Send by email": "ইমেইলে পাঠান", "Send on WhatsApp": "WhatsApp-এ পাঠান", "Full-stack web developer and UI/UX designer from Jashore, Bangladesh.": "যশোর, বাংলাদেশের ফুল-স্ট্যাক ওয়েব ডেভেলপার ও UI/UX ডিজাইনার।", "© 2026 Maruf Al Misbah. All rights reserved.": "© ২০২৬ মারুফ আল মিসবাহ। সর্বস্বত্ব সংরক্ষিত।", "Explore": "ঘুরে দেখুন", "About Me": "আমার সম্পর্কে", "Call Me": "কল করুন", "Skills and tools": "স্কিলস ও <span class=\"grad\">টুলস</span>", "I design in Figma and build with HTML, CSS, JavaScript, React, Next.js, PHP and Laravel. Here is what I use and how I work.": "আমি Figma-তে ডিজাইন করি এবং HTML, CSS, JavaScript, React, Next.js, PHP ও Laravel দিয়ে বানাই। কী ব্যবহার করি ও কীভাবে কাজ করি, এখানে দেখুন।", "Skill overview": "স্কিল ওভারভিউ", "My skill map.": "আমার স্কিল ম্যাপ।", "A quick picture of where I am strongest. The detailed levels are below.": "কোথায় আমি সবচেয়ে শক্তিশালী তার সংক্ষিপ্ত ছবি। বিস্তারিত স্তর নিচে আছে।", "What I work with": "যা নিয়ে কাজ করি", "Four areas, one workflow.": "চারটি ক্ষেত্র, একটি ওয়ার্কফ্লো।", "Authentication and forms": "অথেনটিকেশন ও ফর্ম", "Responsive layouts": "রেসপন্সিভ লেআউট", "Workflow": "ওয়ার্কফ্লো", "Git and GitHub": "Git ও GitHub", "GitHub Pages deploys": "GitHub Pages ডিপ্লয়", "Browser debugging": "ব্রাউজার ডিবাগিং", "Performance basics": "পারফরম্যান্সের মূল বিষয়", "Tech stack": "টেক স্ট্যাক", "The tools in my daily kit.": "প্রতিদিনের ব্যবহারের টুলস।", "From brief to launch.": "ব্রিফ থেকে লঞ্চ পর্যন্ত।", "Understand": "বোঝা", "We talk through your goals, audience and content so the scope is clear before any design starts.": "ডিজাইন শুরুর আগে আপনার লক্ষ্য, দর্শক ও কনটেন্ট নিয়ে কথা বলি, যাতে কাজের পরিধি পরিষ্কার থাকে।", "I sketch the structure and design the key screens in Figma, so you can review before any code is written.": "কাঠামো এঁকে Figma-তে মূল স্ক্রিনগুলো ডিজাইন করি, যাতে কোড লেখার আগেই আপনি দেখে নিতে পারেন।", "I build responsive pages with HTML, CSS and JavaScript, and add React, Next.js, Laravel or PHP when the project needs them.": "HTML, CSS ও JavaScript দিয়ে রেসপন্সিভ পেজ বানাই, প্রয়োজনে React, Next.js, Laravel বা PHP যোগ করি।", "I test on real screen sizes, publish the site and fix what comes up after launch.": "আসল স্ক্রিন সাইজে টেস্ট করি, সাইট প্রকাশ করি এবং লঞ্চের পর যা আসে তা ঠিক করি।", "Need these skills on your project?": "আপনার প্রজেক্টে এই স্কিলগুলো দরকার?", "Tell me what you are building and I will reply with a plan and an estimate.": "কী বানাচ্ছেন জানান, আমি পরিকল্পনা ও আনুমানিক হিসাব নিয়ে উত্তর দেব।", "Experience and education": "অভিজ্ঞতা ও <span class=\"grad\">শিক্ষা</span>", "Freelance work, formal education and the certifications I earned in 2026.": "ফ্রিল্যান্স কাজ, প্রাতিষ্ঠানিক শিক্ষা এবং ২০২৬ সালে অর্জিত সার্টিফিকেট।", "GitHub repositories": "GitHub রিপোজিটরি", "Featured projects ": "নির্বাচিত প্রজেক্ট", "Certifications in 2026": "২০২৬ সালের সার্টিফিকেট", "Turn client briefs into clear page structures and Figma designs": "ক্লায়েন্টের ব্রিফকে পরিষ্কার পেজ কাঠামো ও Figma ডিজাইনে রূপ দেওয়া", "Build responsive front ends with HTML, CSS, JavaScript, React and Next.js": "HTML, CSS, JavaScript, React ও Next.js দিয়ে রেসপন্সিভ ফ্রন্ট-এন্ড তৈরি", "Build back ends with PHP and Laravel when a project needs accounts, forms or data": "অ্যাকাউন্ট, ফর্ম বা ডেটা লাগলে PHP ও Laravel দিয়ে ব্যাক-এন্ড তৈরি", "Publish static sites on GitHub Pages and keep them updated": "GitHub Pages-এ স্ট্যাটিক সাইট প্রকাশ ও আপডেট রাখা", "Where I studied.": "যেখানে পড়েছি।", "Skills I have certified.": "যে স্কিলের সনদ পেয়েছি।", "Want to work together?": "একসাথে কাজ করতে চান?", "Send me a few details about your project and I will get back to you.": "আপনার প্রজেক্টের কিছু তথ্য পাঠান, আমি উত্তর দেব।", "Selected projects": "নির্বাচিত <span class=\"grad\">প্রজেক্ট</span>", "Real websites and apps from my GitHub. Each card links to the code and to a live demo. Click an image to see it full size.": "আমার GitHub থেকে আসল ওয়েবসাইট ও অ্যাপ। প্রতিটি কার্ডে কোড ও লাইভ ডেমোর লিংক আছে। বড় করে দেখতে ছবিতে ক্লিক করুন।", "All": "সব", "Business sites": "বিজনেস সাইট", "Web apps": "ওয়েব অ্যাপ", "See all repositories on GitHub": "GitHub-এ সব রিপোজিটরি দেখুন", "Design to build": "ডিজাইন থেকে বিল্ড", "From wireframe to final.": "ওয়্যারফ্রেম থেকে চূড়ান্ত ডিজাইন।", "Drag the handle. Every site starts as a rough layout, then becomes a finished design.": "হ্যান্ডেল টানুন। প্রতিটি সাইট প্রথমে একটি কাঁচা লেআউট, পরে পূর্ণাঙ্গ ডিজাইন হয়ে ওঠে।", "Wireframe": "ওয়্যারফ্রেম", "Final design": "চূড়ান্ত ডিজাইন", "Have a project like these?": "এমন কোনো প্রজেক্ট আছে?", "Tell me what you need and I will reply with a plan and an estimate.": "কী দরকার জানান, আমি পরিকল্পনা ও আনুমানিক হিসাবসহ উত্তর দেব।", "Let's talk": "চলুন <span class=\"grad\">কথা বলি</span>", "Have a project, a role or a question? Pick the way that suits you and I will get back to you as soon as I can.": "প্রজেক্ট, চাকরি বা প্রশ্ন আছে? আপনার সুবিধামতো মাধ্যম বেছে নিন, আমি যত দ্রুত পারি উত্তর দেব।", "Write email": "ইমেইল লিখুন", "Open chat": "চ্যাট খুলুন", "Location": "অবস্থান", "Availability": "প্রাপ্যতা", "Open to freelance projects and remote or hybrid roles": "ফ্রিল্যান্স প্রজেক্ট এবং রিমোট বা হাইব্রিড চাকরির জন্য প্রস্তুত", "Send a message": "বার্তা পাঠান", "Tell me about your project.": "আপনার প্রজেক্ট সম্পর্কে বলুন।", "Fill in the form and choose email or WhatsApp. Your message opens ready to send, so nothing is sent until you press send there.": "ফর্ম পূরণ করে ইমেইল বা WhatsApp বেছে নিন। বার্তা তৈরি অবস্থায় খুলবে, তাই সেখানে send চাপার আগে কিছু পাঠানো হয় না।", "type a command, e.g. help": "কমান্ড লিখুন, যেমন help", "Science meets code": "বিজ্ঞান ও কোড", "Environment and the web.": "পরিবেশ ও ওয়েব।", "I study Environmental Sciences at the University of Chittagong. I care about climate, clean air and water, and I like building software that can help.": "আমি চট্টগ্রাম বিশ্ববিদ্যালয়ে পরিবেশ বিজ্ঞান পড়ছি। জলবায়ু, পরিষ্কার বাতাস ও পানি নিয়ে আমার আগ্রহ, আর এসবে কাজে লাগে এমন সফটওয়্যার বানাতে ভালোবাসি।", "Live in Jashore": "যশোরে এখন", "Temperature": "তাপমাত্রা", "Humidity": "আর্দ্রতা", "Wind": "বাতাস", "PM2.5": "PM2.5", "Real-time weather and air quality for my home city, from Open-Meteo.": "আমার নিজের শহরের রিয়েল-টাইম আবহাওয়া ও বায়ুর মান, Open-Meteo থেকে।", "This website's footprint": "এই ওয়েবসাইটের কার্বন ফুটপ্রিন্ট", "Page weight": "পেজের ওজন", "CO₂ per visit": "প্রতি ভিজিটে CO₂", "Estimated with the Sustainable Web Design model (0.81 kWh per GB, 442 g CO₂ per kWh). A static site with WebP images and no trackers keeps it small.": "Sustainable Web Design মডেলে হিসাব (প্রতি GB-তে ০.৮১ kWh, প্রতি kWh-এ ৪৪২ গ্রাম CO₂)। WebP ছবি ও ট্র্যাকারবিহীন স্ট্যাটিক সাইট হওয়ায় এটি অনেক কম।", "Climate and ecosystems": "জলবায়ু ও বাস্তুতন্ত্র", "How warming, forests, rivers and wildlife depend on each other.": "উষ্ণায়ন, বন, নদী ও বন্যপ্রাণী কীভাবে একে অপরের উপর নির্ভর করে।", "Air quality": "বায়ুর মান", "What is in the air we breathe and how cities can keep it clean.": "আমরা যে বাতাসে শ্বাস নিই তাতে কী আছে এবং শহর কীভাবে তা পরিষ্কার রাখতে পারে।", "Water and waste": "পানি ও বর্জ্য", "Clean water, safe disposal and the habits that protect both.": "পরিষ্কার পানি, নিরাপদ বর্জ্য ব্যবস্থাপনা এবং দুটোকেই রক্ষা করার অভ্যাস।", "Sustainability": "টেকসই উন্নয়ন", "Building things that last and cost the planet less.": "যা টেকে এবং পৃথিবীর ক্ষতি কম করে, তা-ই গড়া।", "Ideas I want to build": "যে আইডিয়াগুলো বানাতে চাই", "An air-quality tracker for Bangladeshi cities": "বাংলাদেশের শহরগুলোর জন্য বায়ুর মান ট্র্যাকার", "A community waste-reporting web app": "এলাকাবাসীর বর্জ্য রিপোর্টিং ওয়েব অ্যাপ", "A climate data dashboard built with open data and Chart.js": "ওপেন ডেটা ও Chart.js দিয়ে জলবায়ু ডেটা ড্যাশবোর্ড", "A low-carbon, eco-friendly web design checklist": "কম কার্বনের পরিবেশবান্ধব ওয়েব ডিজাইন চেকলিস্ট", "Periodic table of skills": "স্কিলের পর্যায় সারণি", "Every skill is an element.": "প্রতিটি স্কিল একেকটি মৌল।", "My skills laid out like a periodic table. The bar at the bottom of a tile shows my level.": "আমার স্কিলগুলো পর্যায় সারণির মতো সাজানো। প্রতিটি ঘরের নিচের দাগ আমার দক্ষতার স্তর দেখায়।", "Tools": "টুলস", "Science": "বিজ্ঞান", "What you get": "যা পাবেন", "Every project includes.": "প্রতিটি প্রজেক্টে থাকে।", "These come as standard, whatever the size of the project.": "প্রজেক্ট ছোট হোক বা বড়, এগুলো সবসময় থাকে।", "Mobile first": "মোবাইল ফার্স্ট", "Every page is built for phones first, then scaled up to tablets and desktops.": "প্রতিটি পেজ আগে ফোনের জন্য বানানো, তারপর ট্যাবলেট ও ডেস্কটপে বড় করা।", "Fast loading": "দ্রুত লোড", "Optimised images, light code and no bloat, so pages open quickly even on slow data.": "অপ্টিমাইজড ছবি, হালকা কোড ও বাড়তি বোঝা নেই, তাই ধীর নেটেও পেজ দ্রুত খোলে।", "SEO ready": "SEO প্রস্তুত", "Clean structure, proper headings and meta tags so Google can read your site.": "পরিষ্কার কাঠামো, সঠিক হেডিং ও মেটা ট্যাগ, যাতে গুগল আপনার সাইট বুঝতে পারে।", "Accessible": "সবার ব্যবহারযোগ্য", "Keyboard friendly, readable contrast and clear labels for everyone.": "কিবোর্ডে চলে, পড়ার মতো কনট্রাস্ট ও স্পষ্ট লেবেল, সবার জন্য।", "Clean code": "পরিষ্কার কোড", "Tidy, commented code that another developer can pick up without pain.": "গোছানো ও মন্তব্যসহ কোড, যা অন্য ডেভেলপার সহজেই বুঝে কাজ করতে পারে।", "Support after launch": "লঞ্চের পর সহায়তা", "Fixes and updates once the site is live. You are never left alone.": "সাইট চালু হওয়ার পর সমস্যা সমাধান ও আপডেট। আপনি কখনো একা পড়বেন না।", "Plan your project": "প্রজেক্ট পরিকল্পনা করুন", "Project planner": "প্রজেক্ট প্ল্যানার", "Plan your project in one minute.": "এক মিনিটে প্রজেক্ট পরিকল্পনা করুন।", "Pick what fits. I turn your choices into a clear brief that you can send me.": "যা মানায় বেছে নিন। আপনার পছন্দ থেকে আমি একটি পরিষ্কার ব্রিফ বানিয়ে দেব, যা আমাকে পাঠাতে পারবেন।", "What do you need?": "কী দরকার?", "Landing page": "ল্যান্ডিং পেজ", "Web app or portal": "ওয়েব অ্যাপ বা পোর্টাল", "Personal portfolio": "ব্যক্তিগত পোর্টফোলিও", "Redesign or UI/UX": "রিডিজাইন বা UI/UX", "Something else": "অন্য কিছু", "How big is it?": "কত বড়?", "1 page": "১ পেজ", "2 to 5 pages": "২ থেকে ৫ পেজ", "6 to 10 pages": "৬ থেকে ১০ পেজ", "More than 10 pages": "১০ পেজের বেশি", "Not sure yet": "এখনো নিশ্চিত না", "Features you want": "যে ফিচার চান", "Contact form": "কন্টাক্ট ফর্ম", "Blog": "ব্লগ", "Login and admin panel": "লগইন ও অ্যাডমিন প্যানেল", "Online payment": "অনলাইন পেমেন্ট", "Two languages": "দুই ভাষা", "SEO setup": "SEO সেটআপ", "Animations": "অ্যানিমেশন", "When do you need it?": "কবে দরকার?", "As soon as possible": "যত দ্রুত সম্ভব", "Within a month": "এক মাসের মধ্যে", "Flexible": "সময় নমনীয়", "Email or phone": "ইমেইল বা ফোন", "Budget (optional)": "বাজেট (ঐচ্ছিক)", "Anything else? (optional)": "আর কিছু? (ঐচ্ছিক)", "Brief ready": "ব্রিফ প্রস্তুত", "Copy brief": "ব্রিফ কপি করুন", "Nothing is sent until you press a button. Your choices stay in your browser.": "বাটন না চাপা পর্যন্ত কিছু পাঠানো হয় না। আপনার পছন্দ শুধু আপনার ব্রাউজারেই থাকে।", "My local time": "আমার এখানকার সময়", "Save my contact": "আমার কন্টাক্ট সেভ করুন", "Add me to your phone": "আমাকে আপনার ফোনে যোগ করুন", "Download vCard": "vCard ডাউনলোড", "Plan my project (planner)": "আমার প্রজেক্ট পরিকল্পনা (প্ল্যানার)", "Skill molecule": "স্কিল মলিকিউল", "Play with my stack.": "আমার স্ট্যাক নিয়ে খেলুন।", "Every skill is an atom and every bond is a way I use them together. Drag the atoms around and watch the molecule react.": "প্রতিটি স্কিল একটি পরমাণু আর প্রতিটি বন্ধন হলো সেগুলো একসাথে ব্যবহারের উপায়। পরমাণুগুলো টেনে সরান আর অণুটির প্রতিক্রিয়া দেখুন।", "Drag an atom": "একটি পরমাণু টানুন", "Eco mode": "ইকো মোড", "Try again": "আবার চেষ্টা করুন", "Showing my featured repositories instead.": "তার বদলে আমার নির্বাচিত রিপোজিটরি দেখানো হচ্ছে।", "Instant estimate": "তাৎক্ষণিক হিসাব", "Build your own quote.": "নিজের কোটেশন নিজে বানান।", "Choose what you need and watch the receipt grow. Tell me your budget and I will show what fits.": "যা দরকার বেছে নিন আর রসিদ বড় হতে দেখুন। বাজেট জানান, কোনটা মানাবে আমি দেখিয়ে দেব।", "What are you building?": "কী বানাচ্ছেন?", "Number of pages": "পেজের সংখ্যা", "Extras": "বাড়তি সুবিধা", "Rush delivery (faster, +25%)": "দ্রুত ডেলিভারি (+২৫%)", "My budget (optional)": "আমার বাজেট (ঐচ্ছিক)", "Not set": "দেওয়া হয়নি", "Move the budget slider and I will tell you what fits.": "বাজেট স্লাইডার সরান, কোনটা মানায় আমি বলে দেব।", "Request this quote": "এই কোটেশন চান", "Copy quote": "কোটেশন কপি", "A starting estimate only. The final price comes after we talk about the details.": "এটি শুধু শুরুর আনুমানিক হিসাব। বিস্তারিত কথা বলার পর চূড়ান্ত দাম জানানো হবে।", "Instant quote estimate": "তাৎক্ষণিক কোটেশন", "Worldwide": "বিশ্বজুড়ে", "Based in Jashore, working worldwide.": "যশোরে থাকি, কাজ করি বিশ্বজুড়ে।", "Drag the globe. The glowing arcs show how far a project can reach.": "গ্লোবটা টেনে ঘোরান। জ্বলন্ত আর্কগুলো দেখায় একটি প্রজেক্ট কত দূর পৌঁছাতে পারে।", "Remote friendly: I work with clients in any country": "রিমোট কাজে প্রস্তুত: যেকোনো দেশের ক্লায়েন্টের সাথে কাজ করি", "Time zone UTC+6, with easy overlap with Asia, Europe and the Middle East": "সময় অঞ্চল UTC+6, এশিয়া, ইউরোপ ও মধ্যপ্রাচ্যের সাথে সহজেই সময় মেলে", "Fast replies on WhatsApp or email": "WhatsApp বা ইমেইলে দ্রুত উত্তর", "Fly to Jashore": "যশোরে উড়ে যান", "Drag to spin": "টেনে ঘোরান", "Case studies": "কেস স্টাডি", "Case study": "কেস স্টাডি", "How I build things": "আমি যেভাবে বানাই", "The goal": "লক্ষ্য", "What I did": "আমি যা করেছি", "The result": "ফলাফল", "Book a call": "কল বুক করুন", "Pick a time that suits you.": "আপনার সুবিধামতো সময় বেছে নিন।", "Request this time": "এই সময় চাই", "Add to calendar": "ক্যালেন্ডারে যোগ করুন", "Leave a review": "রিভিউ দিন", "Worked with me? Tell others.": "আমার সাথে কাজ করেছেন? অন্যদের জানান।", "Send review": "রিভিউ পাঠান", "Your review": "আপনার রিভিউ", "Worked with me? Leave a review": "আমার সাথে কাজ করেছেন? রিভিউ দিন", "Environment": "পরিবেশ", "How is the air in Bangladesh right now?": "বাংলাদেশের বাতাস এখন কেমন?", "Refresh": "রিফ্রেশ", "Good": "ভালো", "Moderate": "মোটামুটি", "Unhealthy": "অস্বাস্থ্যকর", "Eco quiz": "ইকো কুইজ", "How green are your habits?": "আপনার অভ্যাস কতটা সবুজ?", "Copy my score": "স্কোর কপি করুন", "Your result": "আপনার ফলাফল", "Sky tonight": "আজ রাতের আকাশ", "Look up for a moment.": "একটু আকাশের দিকে তাকান।", "Daylight": "দিনের আলো", "Next full Moon": "পরের পূর্ণিমা", "Next new Moon": "পরের অমাবস্যা", "Moon lit": "চাঁদের আলোকিত অংশ", "My journey": "আমার যাত্রা", "From Jashore to the web.": "যশোর থেকে ওয়েবে।", "Started school": "স্কুল শুরু", "College": "কলেজ", "Print resume": "রিজিউমে প্রিন্ট", "Print or save as PDF": "প্রিন্ট বা PDF সংরক্ষণ", "Keyboard shortcuts": "কীবোর্ড শর্টকাট", "Road map": "রোড ম্যাপ", "From school to code, by helicopter.": "স্কুল থেকে কোডে, হেলিকপ্টারে চড়ে।", "Scroll down and follow the helicopter along the road of my journey.": "স্ক্রল করুন আর আমার যাত্রার পথে হেলিকপ্টারকে অনুসরণ করুন।", "Your project": "আপনার প্রজেক্ট", "Next": "পরবর্তী", "Read the full About section": "পুরো About সেকশন পড়ুন", "About": "আমার সম্পর্কে", "My story": "আমার গল্প", "A developer who studies the planet.": "একজন ডেভেলপার, যে পৃথিবী নিয়ে পড়াশোনা করে।", "What you can expect.": "আপনি যা আশা করতে পারেন।", "View resume": "রিজিউমে দেখুন", "See my work": "আমার কাজ দেখুন", "Read the full About page": "পুরো About পেজ পড়ুন", "Certificates": "সার্টিফিকেট", "Skills with proof.": "প্রমাণসহ দক্ষতা।", "Tech sphere": "টেক স্ফিয়ার", "My toolkit, in 3D.": "আমার টুলকিট, থ্রিডিতে।", "What it covers": "যা শেখানো হয়েছে", "Tap to flip": "উল্টাতে ট্যাপ করুন", "Who am I ?": "আমি কে?"};
  var PAGE_LIST = [['index.html', 'Home'], ['about.html', 'About'], ['skills.html', 'Skills'], ['experience.html', 'Experience'], ['project.html', 'Projects'], ['contact.html', 'Contact']];
  var RESUME_URL = 'assets/file/Maruf_Resume.pdf', CV_URL = 'assets/file/Maruf-CV.pdf';
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function go(url) { location.href = url; }
  function getDl(url, name) { var a = el('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  function copyText(v) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(function () { say('Copied ' + v); }, function () { say(v); });
    else say(v);
  }

  /* ---------- 8. English / Bangla ---------- */
  var lang = 'en', langBtn = $('#langBtn'), changed = [];
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function walk(node, fn) {
    if (node.nodeType !== 1) return;
    var t = node.tagName;
    if (t === 'SCRIPT' || t === 'STYLE' || t === 'SVG' || t === 'svg' || t === 'CANVAS' || t === 'INPUT' || t === 'TEXTAREA') return;
    if (node.id === 'termBody' || node.id === 'cmd' || node.classList.contains('mq-wrap')) return;
    var k = norm(node.textContent);
    if (k && BN[k] != null && fn(node, BN[k])) return;
    for (var c = node.firstElementChild; c; c = c.nextElementSibling) walk(c, fn);
  }
  function applyBn(node, tr) {
    if (node.querySelector('.wd')) { changed.push([node, 'html', node.innerHTML]); node.innerHTML = tr; return true; }
    if (!node.querySelector('svg,img,i,canvas') && !/</.test(tr)) { changed.push([node, 'html', node.innerHTML]); node.textContent = tr; return true; }
    if (!node.children.length) { changed.push([node, 'text', node.textContent]); node.textContent = tr; return true; }
    if (/</.test(tr)) { changed.push([node, 'html', node.innerHTML]); node.innerHTML = tr; return true; }
    var done = false;
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3 && n.data.trim()) {
        changed.push([n, 'node', n.data]);
        n.data = done ? '' : tr + ' '; done = true;
      }
    });
    return done;
  }
  function setLang(l, silent) {
    if (l === lang) return;
    if (l === 'bn') {
      lang = 'bn'; walk(document.body, applyBn);
      $$('[placeholder]').forEach(function (i) { var p = i.getAttribute('placeholder'); if (BN[p]) { changed.push([i, 'ph', p]); i.setAttribute('placeholder', BN[p]); } });
    } else {
      lang = 'en';
      changed.forEach(function (c) {
        if (c[1] === 'text') c[0].textContent = c[2]; else if (c[1] === 'html') c[0].innerHTML = c[2];
        else if (c[1] === 'node') c[0].data = c[2]; else c[0].setAttribute('placeholder', c[2]);
      });
      changed = [];
    }
    root.setAttribute('lang', l === 'bn' ? 'bn' : 'en');
    if (langBtn) langBtn.setAttribute('aria-pressed', l === 'bn');
    var sp = langBtn && langBtn.querySelector('span'); if (sp) sp.textContent = l === 'bn' ? 'EN' : 'বাং';
    store('mp-lang', l);
    if (!silent) say(l === 'bn' ? 'ভাষা: বাংলা' : 'Language: English');
  }
  if (langBtn) langBtn.addEventListener('click', function () { setLang(lang === 'bn' ? 'en' : 'bn'); });
  try { if (localStorage.getItem('mp-lang') === 'bn') window.addEventListener('load', function () { setLang('bn', true); }); } catch (e) {}

  /* ---------- 7. spotlight mode ---------- */
  var spotBtn = $('#spotBtn'), spot = el('div', 'spot'); spot.id = 'spot'; spot.setAttribute('aria-hidden', 'true'); document.body.appendChild(spot);
  function spotSet(on) {
    spot.classList.toggle('on', on);
    if (spotBtn) spotBtn.setAttribute('aria-pressed', on);
    if (on) say('Spotlight mode on. Move your mouse or finger.');
  }
  function spotMove(x, y) { spot.style.setProperty('--sx', x + 'px'); spot.style.setProperty('--sy', y + 'px'); }
  spotMove(window.innerWidth / 2, window.innerHeight / 2);
  window.addEventListener('pointermove', function (e) { if (spot.classList.contains('on')) spotMove(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (spot.classList.contains('on') && e.touches[0]) spotMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  if (spotBtn) spotBtn.addEventListener('click', function () { spotSet(!spot.classList.contains('on')); });

  /* ---------- terminal (ID: term) ---------- */
  var term = $('#term');
  var out = {};
  function runCommand(raw) { return out.run && out.run(raw); }
  if (term) (function () {
    var body = $('#termBody'), form = $('#termForm'), input = $('#termIn'), hist = [], hi = 0;
    function line(parts, cls) {
      var d = el('div', 'ln' + (cls ? ' ' + cls : ''));
      (Array.isArray(parts) ? parts : [parts]).forEach(function (p) {
        if (typeof p === 'string') d.appendChild(document.createTextNode(p));
        else { var a = el('a', '', p.t); a.href = p.a; if (/^https?:/.test(p.a)) { a.target = '_blank'; a.rel = 'noopener'; } d.appendChild(a); }
      });
      body.appendChild(d); body.scrollTop = body.scrollHeight; return d;
    }
    var COMMANDS = {
      help: function () {
        ['help       show this list', 'who am I ?  about me', 'skills     what I work with', 'projects   things I have built', 'github     live GitHub numbers',
          'contact    how to reach me', 'resume      download my resume', 'cv          download my CV', 'theme dark|light', 'goto home|skills|experience|projects|contact',
          'clear      clean the screen'].forEach(function (t) { line(t, 'dim'); });
      },
      whoami: function () {
        line('Maruf Al Misbah'); line('Full Stack Developer and UI/UX designer', 'dim'); line('');
        line("I'm a full-stack web developer and UI/UX designer from Jashore, Bangladesh. I work with React, Next.js, Laravel, PHP and Figma to build scalable, high-converting web apps for clients worldwide.", 'dim');
        line('Because I design and code, a project stays consistent from the first wireframe in Figma to the final deployed page.', 'dim'); line('');
        line('based in : Jashore, Bangladesh'); line('studying : B.Sc. Environmental Sciences, University of Chittagong'); line('stack    : React, Next.js, Laravel, PHP, Figma'); line('status   : open to freelance and remote work', 'ok');
        line([{ a: 'about.html', t: 'Read the full About page' }]);
      },
      skills: function () {
        line('frontend  : HTML5, CSS3, JavaScript, React, Next.js'); line('backend   : PHP, Laravel'); line('design    : Figma, UI/UX'); line('tools     : Git, GitHub', 'dim');
      },
      projects: function () {
        PROJECTS.forEach(function (p, i) { line([(i + 1) + '. ' + p.t + '  ', { a: p.live, t: 'live' }, ' ', { a: 'https://github.com/marufalmisbah/' + p.gh, t: 'code' }]); });
      },
      github: function () {
        var g = window.__gh;
        if (g) { line('public repos : ' + g.repos); line('followers    : ' + g.followers); line('last push    : ' + g.push, 'dim'); }
        else line('Live data is still loading or unavailable.', 'dim');
        line([{ a: 'https://github.com/marufalmisbah', t: 'github.com/marufalmisbah' }]);
      },
      contact: function () {
        line('email    : ' + MAIL); line('whatsapp : ' + PHONE);
        line([{ a: 'https://github.com/marufalmisbah', t: 'GitHub' }, '  ', { a: 'https://www.linkedin.com/in/almisbahmaruf', t: 'LinkedIn' }, '  ', { a: 'https://x.com/almisbahmaruf', t: 'X' }, '  ', { a: 'https://www.facebook.com/almisbahmaruf', t: 'Facebook' }]);
      },
      resume: function () { line('Downloading Maruf_Resume.pdf ...', 'ok'); getDl(RESUME_URL, 'Maruf_Resume.pdf'); },
      cv: function () { line('Downloading Maruf-CV.pdf ...', 'ok'); getDl(CV_URL, 'Maruf-CV.pdf'); },
      theme: function (a) {
        var want = a[0] === 'dark' || a[0] === 'light' ? a[0] : (eff() === 'dark' ? 'light' : 'dark');
        root.setAttribute('data-theme', want); syncEff(); store('mp-theme', want); line('theme set to ' + want, 'ok');
      },
      goto: function (a) {
        var m = { home: 'index.html', about: 'about.html', skills: 'skills.html', experience: 'experience.html', projects: 'project.html', contact: 'contact.html' }[a[0]];
        if (!m) return line('usage: goto home|skills|experience|projects|contact', 'dim');
        line('opening ' + a[0] + ' ...', 'ok'); setTimeout(function () { go(m); }, 350);
      },
      clear: function () { body.textContent = ''; }
    };
    out.run = function (raw) {
      var t = raw.trim(); if (!t) return;
      if (/^who\s*am\s*i\s*\??$/i.test(t) || /^about(\s+me)?$/i.test(t)) t = 'whoami';
      if (/^sudo\s+hire[\s-]?me$/i.test(t)) { line('Permission granted. Excellent choice.', 'ok'); setTimeout(function () { go('contact.html'); }, 700); return; }
      var parts = t.split(/\s+/), name = parts[0].toLowerCase();
      if (COMMANDS[name]) COMMANDS[name](parts.slice(1).map(function (x) { return x.toLowerCase(); }));
      else line('command not found: ' + name + '. Type help.', 'dim');
    };
    function submit(v) {
      var d = el('div', 'ln'); var p = el('span', 'p', '$ '); d.appendChild(p); d.appendChild(document.createTextNode(v)); body.appendChild(d);
      if (v.trim()) { hist.push(v); hi = hist.length; }
      out.run(v); body.scrollTop = body.scrollHeight;
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; submit(v); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi]; }
      if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
    });
    $$('.term-chips button').forEach(function (b) { b.addEventListener('click', function () { submit(b.dataset.cmd); }); });
    /* intro: types "who am I ?" once the terminal scrolls into view */
    var started = false;
    function intro() {
      if (started) return; started = true;
      var d = el('div', 'ln'), p = el('span', 'p', '$ '), t = el('span'); d.appendChild(p); d.appendChild(t); body.appendChild(d);
      var cmd = 'who am I ?', i = 0;
      (function s() {
        t.textContent = cmd.slice(0, i++);
        if (i <= cmd.length && !reduce) setTimeout(s, 90);
        else { t.textContent = cmd; COMMANDS.whoami(); line(''); line('Type help to see what else I can do.', 'dim'); }
      })();
    }
    if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { tio.disconnect(); intro(); } }, { threshold: .4 });
      tio.observe(term);
    } else intro();
  })();

  /* ---------- 2. command palette (Ctrl K) ---------- */
  (function () {
    var wrap = el('div', 'cmd'); wrap.id = 'cmd'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', 'Quick search');
    wrap.innerHTML = '<div class="cmd-box"><div class="cmd-top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="cmdIn" type="text" placeholder="Search pages, projects and actions" autocomplete="off" spellcheck="false" aria-label="Search"><kbd>Esc</kbd></div><ul class="cmd-list" id="cmdList" role="listbox"></ul><div class="cmd-foot"><span>Up / Down to move</span><span>Enter to open</span><span>Ctrl K to toggle</span></div></div>';
    document.body.appendChild(wrap);
    var inp = $('#cmdIn'), list = $('#cmdList'), sel = 0, shown = [], last = null;
    var items = [];
    PAGE_LIST.forEach(function (p) { items.push({ g: 'Pages', t: p[1], k: 'go page ' + p[1], d: '→', f: function () { go(p[0]); } }); });
    PROJECTS.forEach(function (p) {
      items.push({ g: 'Projects', t: p.t, k: 'project live demo ' + p.t, d: '↗', h: 'live demo', f: function () { window.open(p.live, '_blank', 'noopener'); } });
      items.push({ g: 'Projects', t: p.t + ' (code)', k: 'github code source ' + p.t, d: '</>', h: 'GitHub', f: function () { window.open('https://github.com/marufalmisbah/' + p.gh, '_blank', 'noopener'); } });
    });
    items = items.concat([
      { g: 'Actions', t: 'Road map (helicopter journey)', k: 'road map roadmap journey helicopter school', d: '✈', f: function () { go('index.html#roadmap'); } },
      { g: 'Actions', t: 'My certificates (3D flip cards)', k: 'certificates certificate nsda skills proof', d: '✓', f: function () { go('about.html#certs'); } },
      { g: 'Actions', t: 'Book a call', k: 'book call meeting schedule appointment', d: '☎', f: function () { go('contact.html#book'); } },
      { g: 'Pages', t: 'Case studies', k: 'case study studies projects details', d: '→', f: function () { go('case.html'); } },
      { g: 'Pages', t: 'Print resume', k: 'print resume cv pdf', d: '⎙', f: function () { go('resume.html'); } },
      { g: 'Actions', t: 'Leave a review', k: 'review testimonial feedback rate', d: '★', f: function () { go('contact.html#review'); } },
      { g: 'Actions', t: 'Air quality in Bangladesh (live)', k: 'air quality aqi weather environment dashboard cities', d: '≋', f: function () { go('index.html#envdash'); } },
      { g: 'Actions', t: 'Eco habits quiz', k: 'eco quiz green habits score', d: '❧', f: function () { go('index.html#ecoquiz'); } },
      { g: 'Actions', t: 'Sky tonight (Moon and Sun)', k: 'moon sun sky night sunrise sunset phase', d: '☾', f: function () { go('index.html#sky'); } },
      { g: 'Actions', t: 'Keyboard shortcuts', k: 'keyboard shortcuts keys help', d: '?', f: function () { if (window.mpShortcuts) window.mpShortcuts(); } },
      { g: 'Actions', t: 'Install as an app', k: 'install app pwa home screen offline', d: '⬇', f: function () { if (window.mpInstall) window.mpInstall(); } },
      { g: 'Actions', t: 'Download Resume', k: 'resume download pdf', d: '↓', f: function () { getDl(RESUME_URL, 'Maruf_Resume.pdf'); say('Downloading resume'); } },
      { g: 'Actions', t: 'Plan my project (planner)', k: 'planner brief project quote hire', d: '✎', f: function () { go('contact.html#planner'); } },
      { g: 'Actions', t: 'Save my contact (vCard)', k: 'vcard contact save phone', d: '☺', f: function () { getDl('assets/file/Maruf-Al-Misbah.vcf', 'Maruf-Al-Misbah.vcf'); say('Downloading contact card'); } },
      { g: 'Actions', t: 'Toggle eco mode (low energy)', k: 'eco green energy low power animation off', d: '❦', f: function () { var b = $('#ecoBtn'); if (b) b.click(); } },
      { g: 'Actions', t: 'Secret: matrix rain', k: 'matrix secret easter egg', d: '▓', f: function () { matrix(); } },
      { g: 'Actions', t: 'Instant quote estimate', k: 'price pricing cost quote budget estimate how much', d: '৳', f: function () { go('contact.html#estimate'); } },
      { g: 'Actions', t: 'Download CV', k: 'cv download pdf', d: '↓', f: function () { getDl(CV_URL, 'Maruf-CV.pdf'); say('Downloading CV'); } },
      { g: 'Actions', t: 'Toggle dark / light mode', k: 'theme dark light mode', d: '◐', f: function () { if (themeBtn) themeBtn.click(); } },
      { g: 'Actions', t: 'Toggle spotlight mode', k: 'spotlight flashlight dark', d: '◉', f: function () { spotSet(!spot.classList.contains('on')); } },
      { g: 'Actions', t: 'Switch language English / Bangla', k: 'language bangla bengali english বাংলা', d: 'বা', f: function () { setLang(lang === 'bn' ? 'en' : 'bn'); } },
      { g: 'Actions', t: 'Copy my email', k: 'email copy mail', d: '@', f: function () { copyText(MAIL); } },
      { g: 'Actions', t: 'Message me on WhatsApp', k: 'whatsapp chat message', d: '✆', f: function () { window.open('https://wa.me/' + WA, '_blank', 'noopener'); } },
      { g: 'Actions', t: 'Open my GitHub profile', k: 'github profile', d: '</>', f: function () { window.open('https://github.com/marufalmisbah', '_blank', 'noopener'); } },
      { g: 'Actions', t: 'Open my LinkedIn', k: 'linkedin', d: 'in', f: function () { window.open('https://www.linkedin.com/in/almisbahmaruf', '_blank', 'noopener'); } }
    ]);
    [['orange', 'Orange'], ['violet', 'Violet'], ['emerald', 'Emerald'], ['sky', 'Sky blue'], ['rose', 'Rose']].forEach(function (c) {
      items.push({ g: 'Accent color', t: c[1] + ' accent', k: 'color accent theme ' + c[1], d: '●', f: function () { setAccent(c[0]); store('mp-accent', c[0] === 'orange' ? '' : c[0]); } });
    });
    function render() {
      var q = inp.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      shown = items.filter(function (it) { var h = (it.t + ' ' + it.k).toLowerCase(); return q.every(function (w) { return h.indexOf(w) > -1; }); });
      list.textContent = ''; var g = '';
      if (!shown.length) { list.appendChild(el('li', 'cmd-empty', 'Nothing found. Try "projects" or "resume".')); return; }
      shown.forEach(function (it, i) {
        if (it.g !== g) { g = it.g; var h = el('li', 'cmd-g', g); h.setAttribute('role', 'presentation'); list.appendChild(h); }
        var li = el('li', 'cmd-i' + (i === sel ? ' on' : '')); li.setAttribute('role', 'option'); li.dataset.i = i;
        li.appendChild(el('span', 'd', it.d)); li.appendChild(el('b', '', it.t)); if (it.h) li.appendChild(el('small', '', it.h));
        list.appendChild(li);
      });
      var on = $('.cmd-i.on', list); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
    }
    function open() { last = document.activeElement; wrap.classList.add('open'); document.body.classList.add('lock'); inp.value = ''; sel = 0; render(); togglePal(false); inp.focus(); setTimeout(function () { inp.focus(); }, 60); setTimeout(function () { if (document.activeElement !== inp) inp.focus(); }, 300); }
    function close() { wrap.classList.remove('open'); document.body.classList.remove('lock'); if (last && last.focus) last.focus(); }
    function run(i) { var it = shown[i]; if (!it) return; close(); setTimeout(it.f, 60); }
    inp.addEventListener('input', function () { sel = 0; render(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    });
    list.addEventListener('click', function (e) { var li = e.target.closest('.cmd-i'); if (li) run(+li.dataset.i); });
    list.addEventListener('pointermove', function (e) { var li = e.target.closest('.cmd-i'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; $$('.cmd-i', list).forEach(function (x) { x.classList.toggle('on', +x.dataset.i === sel); }); } });
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    var cb = $('#cmdBtn'); if (cb) cb.addEventListener('click', open);
    document.addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName || '');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); wrap.classList.contains('open') ? close() : open(); }
      else if (e.key === 'Escape' && wrap.classList.contains('open')) close();
      else if (e.key === '/' && !typing && !wrap.classList.contains('open')) { e.preventDefault(); open(); }
    });
  })();

  /* ---------- 3. GitHub live data ---------- */
  var gh = $('#gh');
  if (gh) (function () {
    var user = gh.dataset.user, note = $('#ghNote'), chart = $('#ghChart');
    var COL = { JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#7a5cc4', PHP: '#8892bf', TypeScript: '#3178c6', Blade: '#f7523f', Python: '#3572A5', Java: '#b07219', SCSS: '#c6538c', Vue: '#41b883' };
    function hex() {
      var t = (getComputedStyle(root).getPropertyValue('--ar') || '255,107,44').trim().split(',');
      return t.map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('');
    }
    function setChart() { chart.src = 'https://ghchart.rshah.org/' + hex() + '/' + user; }
    chart.addEventListener('error', function () { chart.parentNode.textContent = 'The contribution graph could not be loaded. Open my GitHub profile to see it.'; });
    setChart();
    if (window.MutationObserver) new MutationObserver(function () { if (chart.parentNode) setChart(); }).observe(root, { attributes: true, attributeFilter: ['data-accent'] });
    function ago(iso) {
      var d = Math.max(0, (Date.now() - new Date(iso).getTime()) / 864e5);
      if (d < 1) return 'today'; if (d < 2) return 'yesterday'; if (d < 31) return Math.floor(d) + ' days ago';
      if (d < 365) { var m = Math.floor(d / 30); return m + (m > 1 ? ' months ago' : ' month ago'); } var y = Math.floor(d / 365); return y + (y > 1 ? ' years ago' : ' year ago');
    }
    function render(u, repos) {
      $('#ghRepos').textContent = u.public_repos; $('#ghFol').textContent = u.followers;
      var mine = repos.filter(function (r) { return !r.fork; });
      var last = mine[0] || repos[0];
      $('#ghPush').textContent = last ? ago(last.pushed_at) : '-';
      window.__gh = { repos: u.public_repos, followers: u.followers, push: last ? ago(last.pushed_at) : '-' };
      var cnt = {}, tot = 0;
      mine.forEach(function (r) { if (r.language) { cnt[r.language] = (cnt[r.language] || 0) + 1; tot++; } });
      var langs = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 5);
      var bar = $('#ghLang'), leg = $('#ghLeg'); bar.textContent = ''; leg.textContent = '';
      langs.forEach(function (l) {
        var c = COL[l] || 'rgb(' + (getComputedStyle(root).getPropertyValue('--ar') || '255,107,44').trim() + ')';
        var seg = el('i'); seg.style.flex = cnt[l]; seg.style.background = c; seg.title = l; bar.appendChild(seg);
        var li = el('li'); li.style.setProperty('--c', c); li.appendChild(document.createTextNode(l)); li.appendChild(el('span', '', Math.round(cnt[l] / tot * 100) + '%')); leg.appendChild(li);
      });
      var ul = $('#ghList'); ul.textContent = '';
      mine.slice(0, 5).forEach(function (r) {
        var li = el('li'), a = el('a'); a.href = r.html_url; a.target = '_blank'; a.rel = 'noopener';
        a.appendChild(el('b', '', r.name)); a.appendChild(el('small', '', (r.language ? r.language + ' · ' : '') + ago(r.pushed_at))); li.appendChild(a); ul.appendChild(li);
      });
      note.textContent = 'Live data from the GitHub public API.';
    }
    var why = '';
    function fail() {
      /* fallback: show the featured projects so the card is never empty */
      $('#ghRepos').textContent = '20+'; $('#ghFol').textContent = '-'; $('#ghPush').textContent = '-';
      var ul = $('#ghList'); ul.textContent = '';
      PROJECTS.slice(0, 5).forEach(function (p) {
        var li = el('li'), a = el('a'); a.href = 'https://github.com/marufalmisbah/' + p.gh; a.target = '_blank'; a.rel = 'noopener';
        a.appendChild(el('b', '', p.gh)); a.appendChild(el('small', '', 'featured')); li.appendChild(a); ul.appendChild(li);
      });
      $('#ghLeg').textContent = ''; $('#ghLang').textContent = '';
      var t = el('li'); t.textContent = 'Language numbers appear when the live data loads.'; $('#ghLeg').appendChild(t);
      note.textContent = 'Live numbers could not be loaded' + (why ? ' (' + why + ')' : '') + '. Showing my featured repositories instead. ';
      var rb = el('button', 'cp', 'Try again'); rb.type = 'button'; rb.addEventListener('click', function () { try { sessionStorage.removeItem('mp-gh'); } catch (e) {} note.textContent = 'Loading live data from GitHub...'; load(); });
      note.appendChild(rb);
    }
    var key = 'mp-gh', cached = null;
    function load() {
      try { cached = JSON.parse(sessionStorage.getItem(key)); } catch (e) {}
      if (cached && Date.now() - cached.t < 6e5) { render(cached.u, cached.r); return; }
      if (!window.fetch) { why = 'no fetch support'; return fail(); }
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 9000);
      function g(u) { return fetch(u, { signal: ctl ? ctl.signal : undefined, headers: { Accept: 'application/vnd.github+json' } }).then(function (r) { if (!r.ok) { why = 'HTTP ' + r.status + (r.status === 403 ? ', rate limit' : ''); throw 0; } return r.json(); }); }
      Promise.all([g('https://api.github.com/users/' + user), g('https://api.github.com/users/' + user + '/repos?per_page=100&sort=pushed')]).then(function (v) {
        clearTimeout(to); render(v[0], v[1]);
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), u: { public_repos: v[0].public_repos, followers: v[0].followers }, r: v[1].map(function (r) { return { name: r.name, html_url: r.html_url, language: r.language, pushed_at: r.pushed_at, fork: r.fork }; }) })); } catch (e) {}
      }).catch(function (e) { clearTimeout(to); if (!why) why = (e && e.name === 'AbortError') ? 'timeout' : 'network blocked'; fail(); });
    }
    load();
  })();

  /* ---------- 4. 3D tilt and glare on project cards ---------- */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.proj').forEach(function (card) {
      var g = el('span', 'glare'); g.setAttribute('aria-hidden', 'true'); card.appendChild(g);
      card.addEventListener('pointermove', function (e) {
        if (!card.classList.contains('in')) return;
        var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transition = 'transform .08s linear, border-color .3s, box-shadow .3s';
        card.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * 9).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 11).toFixed(2) + 'deg) translateZ(0)';
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); card.style.setProperty('--gy', (py * 100).toFixed(1) + '%'); card.classList.add('tilt');
      });
      card.addEventListener('pointerleave', function () { card.style.transition = ''; card.style.transform = ''; card.classList.remove('tilt'); });
    });
  }

  /* ---------- 5. before / after slider ---------- */
  var cmpBox = $('#cmpBox'), cmpRange = $('#cmpRange');
  if (cmpBox && cmpRange) {
    var setPos = function () { cmpBox.style.setProperty('--pos', cmpRange.value + '%'); };
    cmpRange.addEventListener('input', setPos);
    if (!reduce && 'IntersectionObserver' in window) {
      var cio2 = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; cio2.disconnect();
        var t0 = null; (function a(t) { if (t0 == null) t0 = t; var k = (t - t0) / 1400, v = k >= 1 ? 50 : 50 + Math.sin(k * Math.PI * 2) * 30 * (1 - k);
          cmpRange.value = v; setPos(); if (k < 1 && !cmpBox.dataset.touched) requestAnimationFrame(a); })(performance.now());
      }, { threshold: .6 });
      cio2.observe(cmpBox);
      cmpRange.addEventListener('pointerdown', function () { cmpBox.dataset.touched = 1; });
    }
  }

  /* ---------- 6. process timeline ---------- */
  var proc = $('#proc');
  if (proc) {
    var steps = $$('.proc-step', proc);
    var procUpdate = function () {
      var r = proc.getBoundingClientRect(), vh = window.innerHeight, mark = vh * .62;
      var p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
      proc.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      steps.forEach(function (s) { var sr = s.getBoundingClientRect(); s.classList.toggle('on', reduce || sr.top < mark); });
    };
    window.addEventListener('scroll', procUpdate, { passive: true }); window.addEventListener('resize', procUpdate); procUpdate();
  }

  /* ====================================================================
     v6: live environment, website carbon, local time, project planner
     ==================================================================== */

  /* ---------- live weather and air quality (Open-Meteo) ---------- */
  var envBox = $('#env');
  if (envBox) (function () {
    var LAT = 23.1667, LON = 89.2167;
    var WC = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
      61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm' };
    var LV = [[50, 'Good', 'Air quality is good. A fine day to be outside.'], [100, 'Moderate', 'Acceptable air. Very sensitive people may notice it.'],
      [150, 'Unhealthy for sensitive groups', 'Children, older people and people with asthma should take it easy outside.'],
      [200, 'Unhealthy', 'Everyone may feel effects. Limit long time outdoors.'], [300, 'Very unhealthy', 'Health warning. Stay indoors if you can.'], [9999, 'Hazardous', 'Emergency conditions. Avoid going out.']];
    function put(id, v) { var e = $('#' + id); if (e) e.textContent = v; }
    function show(w, a) {
      if (w && w.current) {
        var c = w.current;
        put('envT', Math.round(c.temperature_2m) + '°C'); put('envH', Math.round(c.relative_humidity_2m) + '%'); put('envW', Math.round(c.wind_speed_10m) + ' km/h');
        put('envCond', (WC[c.weather_code] || 'Weather') + ' now');
      } else put('envCond', 'Weather unavailable');
      if (a && a.current && a.current.us_aqi != null) {
        var aq = a.current.us_aqi, lv = LV.filter(function (l) { return aq <= l[0]; })[0];
        put('envP', Math.round(a.current.pm2_5) + ' µg/m³');
        put('aqiTxt', 'US AQI ' + Math.round(aq) + ', ' + lv[1] + '. ' + lv[2]);
        var m = $('#aqiMark'); if (m) setTimeout(function () { m.style.left = Math.min(100, aq / 300 * 100) + '%'; }, 200);
      } else put('aqiTxt', 'Air quality data is not available right now.');
    }
    var key = 'mp-env', cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key)); } catch (e) {}
    if (cached && Date.now() - cached.t < 9e5) { show(cached.w, cached.a); return; }
    if (!window.fetch) { show(null, null); return; }
    function get(u) { return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return null; }); }
    Promise.all([
      get('https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia%2FDhaka'),
      get('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + LAT + '&longitude=' + LON + '&current=pm2_5,us_aqi&timezone=Asia%2FDhaka')
    ]).then(function (v) {
      show(v[0], v[1]);
      if (v[0] || v[1]) try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), w: v[0], a: v[1] })); } catch (e) {}
    });
  })();

  /* ---------- website carbon estimate ---------- */
  if ($('#carbon')) window.addEventListener('load', function () {
    setTimeout(function () {
      var bytes = 0;
      try {
        performance.getEntriesByType('navigation').forEach(function (n) { bytes += n.transferSize || n.encodedBodySize || 0; });
        performance.getEntriesByType('resource').forEach(function (r) { bytes += r.transferSize || r.encodedBodySize || r.decodedBodySize || 0; });
      } catch (e) {}
      var kb = $('#cbKb'), g = $('#cbG'); if (!kb || !g) return;
      if (!bytes) { kb.textContent = 'n/a'; g.textContent = 'n/a'; return; }
      var co2 = bytes / 1e9 * 0.81 * 442;
      kb.textContent = bytes > 1048576 ? (bytes / 1048576).toFixed(2) + ' MB' : Math.round(bytes / 1024) + ' KB';
      g.textContent = co2 < .01 ? '<0.01 g' : co2.toFixed(2) + ' g';
    }, 1800);
  });

  /* ---------- my local time ---------- */
  var bdTime = $('#bdTime');
  if (bdTime) {
    var tick = function () {
      try {
        bdTime.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(new Date());
        var diff = (360 - (-new Date().getTimezoneOffset())) / 60, d = $('#bdDiff');
        if (d) d.textContent = (diff === 0 ? 'Same time zone as you.' : 'I am ' + Math.abs(diff) + (Math.abs(diff) === 1 ? ' hour ' : ' hours ') + (diff > 0 ? 'ahead of you.' : 'behind you.')) + ' (Bangladesh time, UTC+6)';
      } catch (e) { bdTime.textContent = 'Asia/Dhaka (UTC+6)'; }
    };
    tick(); setInterval(tick, 30000);
  }

  /* ---------- project planner ---------- */
  var planner = $('.planner');
  if (planner) (function () {
    var st = { type: '', size: '', feat: [], time: '' };
    var out = $('#plOut'), pct = $('#plPct'), bar = $('#plBar'), wa = $('#plWa'), mail = $('#plMail');
    function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
    function build() {
      var L = ['Hi Maruf, I would like to talk about a project.', ''];
      if (st.type) L.push('Project: ' + st.type);
      if (st.size) L.push('Size: ' + st.size);
      if (st.feat.length) L.push('Features: ' + st.feat.join(', '));
      if (st.time) L.push('Timeline: ' + st.time);
      if (val('plBudget')) L.push('Budget: ' + val('plBudget'));
      if (val('plNote')) L.push('Notes: ' + val('plNote'));
      L.push(''); if (val('plName')) L.push('Name: ' + val('plName')); if (val('plContact')) L.push('Contact: ' + val('plContact'));
      return L.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    function update() {
      var done = [st.type, st.size, st.feat.length, st.time, val('plName'), val('plContact')].filter(Boolean).length, p = Math.round(done / 6 * 100);
      pct.textContent = p + '%'; bar.style.width = p + '%';
      var t = build();
      out.textContent = st.type || st.size || st.feat.length || st.time ? t : 'Pick a few options and your brief appears here.';
      wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
      mail.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Project enquiry' + (st.type ? ': ' + st.type : '')) + '&body=' + encodeURIComponent(t);
    }
    $$('.pl-g', planner).forEach(function (g) {
      var key = g.dataset.g, multi = g.dataset.multi === '1';
      $$('.pc', g).forEach(function (b) {
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') !== 'true';
          if (multi) {
            b.setAttribute('aria-pressed', on);
            st[key] = $$('.pc[aria-pressed="true"]', g).map(function (x) { return x.dataset.v; });
          } else {
            $$('.pc', g).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
            b.setAttribute('aria-pressed', on); st[key] = on ? b.dataset.v : '';
          }
          update();
        });
      });
    });
    $$('input,textarea', planner).forEach(function (i) { i.addEventListener('input', update); });
    $('#plCopy').addEventListener('click', function () { if (!st.type) say('Pick a project type first'); else copyText(build()); });
    [wa, mail].forEach(function (a) { a.addEventListener('click', function (e) { if (!st.type) { e.preventDefault(); say('Pick a project type first'); } }); });
    update();
  })();

  /* ====================================================================
     v7: skill molecule (physics), eco mode, matrix easter egg
     ==================================================================== */

  /* ---------- eco mode ---------- */
  var ecoBtn = $('#ecoBtn');
  function ecoSet(on, quiet) {
    if (on) root.setAttribute('data-eco', ''); else root.removeAttribute('data-eco');
    if (ecoBtn) ecoBtn.setAttribute('aria-pressed', on);
    store('mp-eco', on ? '1' : '');
    var cb = $('#carbon'); if (cb) cb.classList.toggle('eco', on);
    if (!quiet) say(on ? 'Eco mode on: background and animations are off' : 'Eco mode off');
  }
  ecoSet(root.hasAttribute('data-eco'), true);
  if (ecoBtn) ecoBtn.addEventListener('click', function () { ecoSet(!root.hasAttribute('data-eco')); });

  /* ---------- matrix rain easter egg ---------- */
  var matrixOn = false;
  function matrix() {
    if (matrixOn) return; matrixOn = true;
    var c = el('canvas', 'matrix'), cx = c.getContext('2d'); document.body.appendChild(c);
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = c.width = innerWidth * dpr, H = c.height = innerHeight * dpr;
    var fs = 16 * dpr, cols = Math.ceil(W / fs), drops = [], chars = 'H He Li C N O Na Mg Al Si Fe Cu Zn 0 1 { } < > / ; = JS PHP CSS Ht Cs Rx Lv'.split(' ');
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    var col = (getComputedStyle(root).getPropertyValue('--ar') || '255,107,44').trim(), t0 = performance.now();
    function stop() { matrixOn = false; c.classList.add('out'); setTimeout(function () { c.remove(); }, 500); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') stop(); }
    document.addEventListener('keydown', esc); c.addEventListener('click', stop);
    say('Secret unlocked: welcome to the matrix. Press Esc to leave.');
    (function f(t) {
      if (!matrixOn) return;
      cx.fillStyle = 'rgba(8,8,8,.12)'; cx.fillRect(0, 0, W, H); cx.font = '700 ' + fs + 'px monospace';
      for (var i = 0; i < cols; i++) {
        cx.fillStyle = 'rgba(' + col + ',' + (.55 + Math.random() * .45).toFixed(2) + ')';
        cx.fillText(chars[(Math.random() * chars.length) | 0], i * fs, drops[i] * fs);
        if (drops[i] * fs > H && Math.random() > .975) drops[i] = 0; drops[i] += .6 + (i % 3) * .2;
      }
      if (t - t0 > 7000) return stop();
      requestAnimationFrame(f);
    })(t0);
  }
  var kon = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], kp = 0;
  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName || '')) return;
    kp = e.keyCode === kon[kp] ? kp + 1 : (e.keyCode === kon[0] ? 1 : 0);
    if (kp === kon.length) { kp = 0; matrix(); }
  });
  /* terminal: "matrix" command */
  var termForm = $('#termForm');
  if (termForm) termForm.addEventListener('submit', function () { var i = $('#termIn'); if (i && /^\s*matrix\s*$/i.test(i.value)) setTimeout(matrix, 80); }, true);

  /* ---------- skill molecule (draggable, spring physics) ---------- */
  var mol = $('#mol');
  if (mol) (function () {
    var nodes = JSON.parse(mol.dataset.nodes), links = JSON.parse(mol.dataset.links), cx = mol.getContext('2d');
    var W = 0, H = 0, dpr = 1, drag = null, hover = -1, running = false, vis = false, hint = $('#molHint');
    nodes.forEach(function (n, i) { n.path = new Path2D(n.p); n.x = Math.random() * 300 + 100; n.y = Math.random() * 200 + 80; n.vx = n.vy = 0; n.r = 30; });
    function size() {
      var r = mol.parentNode.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = Math.max(360, Math.min(520, r.width * .6)); mol.style.height = H + 'px'; mol.width = W * dpr; mol.height = H * dpr;
      nodes.forEach(function (n) { n.x = Math.min(W - 40, Math.max(40, n.x)); n.y = Math.min(H - 40, Math.max(40, n.y)); });
    }
    function ink() { return eff() === 'dark' ? '#f4ece6' : '#1a110c'; }
    function accent() { return 'rgb(' + (getComputedStyle(root).getPropertyValue('--ar') || '255,107,44').trim() + ')'; }
    function step() {
      var rest = Math.min(130, W / 5);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = 5200 / (d * d);
          if (d < 260) { a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f; }
        }
        a.vx += (W / 2 - a.x) * .0016; a.vy += (H / 2 - a.y) * .0016;
      }
      links.forEach(function (l) {
        var a = nodes[l[0]], b = nodes[l[1]], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - rest) * .018;
        a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
      });
      nodes.forEach(function (n) {
        if (n === drag) { n.vx = n.vy = 0; return; }
        n.vx *= .86; n.vy *= .86; n.x += n.vx; n.y += n.vy;
        n.x = Math.min(W - n.r, Math.max(n.r, n.x)); n.y = Math.min(H - n.r, Math.max(n.r, n.y));
      });
    }
    function draw() {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
      var ac = accent(), fg = ink();
      links.forEach(function (l) {
        var a = nodes[l[0]], b = nodes[l[1]], hot = hover === l[0] || hover === l[1] || (drag && (drag === a || drag === b));
        cx.strokeStyle = hot ? ac : (eff() === 'dark' ? 'rgba(255,255,255,.22)' : 'rgba(20,12,8,.22)'); cx.lineWidth = hot ? 3 : 2;
        cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
      });
      nodes.forEach(function (n, i) {
        var hot = hover === i || drag === n, r = n.r + (hot ? 5 : 0);
        cx.save(); cx.shadowColor = hot ? ac : 'rgba(0,0,0,.25)'; cx.shadowBlur = hot ? 22 : 10;
        cx.fillStyle = eff() === 'dark' ? '#1b1410' : '#ffffff'; cx.beginPath(); cx.arc(n.x, n.y, r, 0, 7); cx.fill(); cx.restore();
        cx.lineWidth = 2; cx.strokeStyle = hot ? ac : (n.c || fg); cx.beginPath(); cx.arc(n.x, n.y, r, 0, 7); cx.stroke();
        cx.save(); cx.translate(n.x - r * .55, n.y - r * .55); cx.scale(r * 1.1 / 24, r * 1.1 / 24); cx.fillStyle = n.c || fg; cx.fill(n.path); cx.restore();
        if (hot) { cx.font = '600 13px DM Sans, system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillStyle = fg; cx.fillText(n.n, n.x, n.y + r + 18); }
      });
    }
    function loop() {
      if (!vis || root.hasAttribute('data-eco')) { running = false; return; }
      step(); draw(); requestAnimationFrame(loop);
    }
    function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
    function pos(e) { var r = mol.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function hit(p) { for (var i = nodes.length - 1; i >= 0; i--) { var n = nodes[i]; if ((n.x - p[0]) * (n.x - p[0]) + (n.y - p[1]) * (n.y - p[1]) < (n.r + 6) * (n.r + 6)) return i; } return -1; }
    mol.addEventListener('pointerdown', function (e) { var h = hit(pos(e)); if (h < 0) return; drag = nodes[h]; hover = h; mol.setPointerCapture(e.pointerId); if (hint) hint.style.opacity = 0; start(); e.preventDefault(); });
    mol.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (drag) { drag.x = Math.min(W - 20, Math.max(20, p[0])); drag.y = Math.min(H - 20, Math.max(20, p[1])); }
      else { hover = hit(p); mol.style.cursor = hover > -1 ? 'grab' : 'default'; if (!running) { start(); } }
    });
    function up() { drag = null; }
    mol.addEventListener('pointerup', up); mol.addEventListener('pointercancel', up);
    mol.addEventListener('pointerleave', function () { if (!drag) hover = -1; });
    mol.style.touchAction = 'pan-y';
    size();
    window.addEventListener('resize', function () { size(); if (!running) draw(); });
    for (var k = 0; k < 220; k++) step();
    draw();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !reduce) start(); else if (vis) draw(); }, { threshold: .15 }).observe(mol);
    else { vis = true; if (!reduce) start(); }
    if (window.MutationObserver) new MutationObserver(function () { if (!running) { if (!root.hasAttribute('data-eco') && vis && !reduce) start(); else draw(); } }).observe(root, { attributes: true });
  })();

  /* ====================================================================
     v8: instant quote receipt
     ==================================================================== */
  $$('.est').forEach(function (box) {
    var cfg = JSON.parse(box.dataset.config), cur = 'BDT', ti = 1, pages = cfg.types[1].pages, feats = {}, rush = false, budget = 0, shown = 0, anim = null, prevKeys = {};
    var lines = $('.rc-lines', box), totEl = $('.tot', box), rangeEl = $('.rc-range', box), pgv = $('.pgv', box), bv = $('.bv', box), fill = $('.est-fill', box), msg = $('.est-msg', box);
    var wa = $('.est-wa', box), pgIn = $('.pg', box), budIn = $('.bud', box);
    var dateEl = $('.rc-date', box); if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    var code = $('.rc-code', box), etaEl = $('.eta', box), payEl = $('.rc-pay', box), qid = $('.qid', box), qvalid = $('.qvalid', box), noteEl = $('.est-note', box);
    function money(n) { if (n < 0) return '-' + money(-n); return cur === 'BDT' ? '৳' + Math.round(n).toLocaleString('en-IN') : '$' + Math.round(n / cfg.rate).toLocaleString('en-US'); }
    function compute() {
      var t = cfg.types[ti], L = [{ k: 't', n: t.n + ' (' + t.pages + (t.pages > 1 ? ' pages' : ' page') + ' included)', v: t.base }];
      if (pages > t.pages) L.push({ k: 'p', n: 'Extra pages x ' + (pages - t.pages), v: (pages - t.pages) * cfg.perPage });
      Object.keys(feats).forEach(function (i) { if (feats[i]) L.push({ k: 'f' + i, n: cfg.features[i].n, v: cfg.features[i].p }); });
      var sub = L.reduce(function (s, l) { return s + l.v; }, 0);
      var nf = Object.keys(feats).filter(function (i) { return feats[i]; }).length, days = t.days + Math.max(0, pages - t.pages);
      Object.keys(feats).forEach(function (i) { if (feats[i]) days += cfg.features[i].d || 0; });
      if (cfg.bundle && nf >= cfg.bundle.min) { var disc = -Math.round(sub * cfg.bundle.pct); L.push({ k: 'b', n: 'Bundle discount (' + cfg.bundle.min + '+ extras) -' + Math.round(cfg.bundle.pct * 100) + '%', v: disc }); sub += disc; }
      if (rush) days = Math.max(2, Math.round(days * 0.6));
      if (rush) L.push({ k: 'r', n: 'Rush delivery +' + Math.round(cfg.rush * 100) + '%', v: Math.round(sub * cfg.rush) });
      return { L: L, days: days, total: L.reduce(function (s, l) { return s + l.v; }, 0) };
    }
    function tween(to) {
      if (reduce) { shown = to; totEl.textContent = money(to); return; }
      cancelAnimationFrame(anim); var from = shown, t0 = performance.now();
      (function f(t) { var k = Math.min(1, (t - t0) / 550), e = 1 - Math.pow(1 - k, 3); shown = from + (to - from) * e; totEl.textContent = money(shown); if (k < 1) anim = requestAnimationFrame(f); })(t0);
    }
    function render() {
      var r = compute(), keys = {};
      lines.textContent = '';
      r.L.forEach(function (l) {
        keys[l.k] = 1; var li = el('li', prevKeys[l.k] ? '' : 'new');
        li.appendChild(el('span', '', l.n)); li.appendChild(el('b', '', money(l.v))); lines.appendChild(li);
      });
      prevKeys = keys; tween(r.total);
      var lo = r.total * (1 - cfg.spread), hi = r.total * (1 + cfg.spread);
      rangeEl.textContent = 'Likely range ' + money(Math.round(lo / 500) * 500) + ' to ' + money(Math.round(hi / 500) * 500);
      pgv.textContent = pages;
      /* delivery, payment plan, quote number */
      if (etaEl) {
        var d0 = new Date(); d0.setDate(d0.getDate() + 2 + Math.ceil(r.days * 7 / 5));
        etaEl.textContent = 'about ' + r.days + ' working days (by ' + d0.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ')';
        payEl.textContent = '';
        cfg.pay.forEach(function (s) { var li = el('li', ''); li.appendChild(el('span', '', s[0] + ' (' + Math.round(s[1] * 100) + '%)')); li.appendChild(el('b', '', money(r.total * s[1]))); payEl.appendChild(li); });
        var n = new Date(); qid.textContent = 'Quote no. MAM-' + String(n.getFullYear()).slice(2) + ('0' + (n.getMonth() + 1)).slice(-2) + ('0' + n.getDate()).slice(-2) + '-' + String(Math.round(r.total) % 9000 + 1000);
        var v = new Date(); v.setDate(v.getDate() + cfg.valid); qvalid.textContent = 'Valid until ' + v.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      $$('.fp', box).forEach(function (s, i) { s.textContent = '+' + money(cfg.features[i].p); });
      /* budget fit */
      if (budget > 0) {
        bv.textContent = '৳' + budget.toLocaleString('en-IN') + (cur === 'USD' ? ' (' + money(budget) + ')' : '');
        var pct = Math.min(100, r.total / budget * 100); fill.style.width = pct + '%'; fill.classList.toggle('over', r.total > budget);
        if (r.total <= budget) msg.textContent = 'Good news: your budget covers this with ' + money(budget - r.total) + ' to spare.';
        else {
          var big = r.L.filter(function (l) { return l.k[0] === 'f'; }).sort(function (a, b) { return b.v - a.v; })[0];
          msg.textContent = 'This is ' + money(r.total - budget) + ' over your budget.' + (big ? ' Try removing "' + big.n + '" or reduce the pages.' : ' Try fewer pages or a smaller project type.');
        }
      } else { bv.textContent = 'Not set'; fill.style.width = '0'; fill.classList.remove('over'); msg.textContent = 'Move the budget slider and I will tell you what fits.'; }
      /* barcode seeded by the total */
      if (code) { var seed = Math.round(r.total), bg = '', x = 0; for (var i = 0; i < 46; i++) { var w = 1 + ((seed >> (i % 12)) + i * 7) % 4; bg += (i % 2 ? 'transparent ' : '#111 ') + x + 'px ' + (x + w) + 'px,'; x += w; } code.style.backgroundImage = 'linear-gradient(90deg,' + bg.slice(0, -1).replace(/(#111|transparent) (\d+)px (\d+)px/g, '$1 $2px,$1 $3px') + ')'; }
      var text = 'Hi Maruf, I would like this quote:\n\n' + r.L.map(function (l) { return '- ' + l.n + ': ' + money(l.v); }).join('\n') + '\n\nTotal: ' + money(r.total) + ' (' + rangeEl.textContent.toLowerCase() + ')' + (budget ? '\nMy budget: ' + money(budget) : '');
      box._eta = etaEl ? etaEl.textContent : ''; box._qid = qid ? qid.textContent : '';
      text += '\n\nDelivery: ' + box._eta + '\n' + box._qid;
      wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); box._text = text;
    }
    $$('.est-types .pc', box).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.est-types .pc', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true');
        ti = +b.dataset.i; pages = cfg.types[ti].pages; pgIn.value = pages; render();
      });
    });
    $$('.est-feats .pc', box).forEach(function (b) {
      b.addEventListener('click', function () { var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); feats[b.dataset.i] = on; render(); });
    });
    pgIn.addEventListener('input', function () { pages = +pgIn.value; render(); });
    $('.rush', box).addEventListener('change', function (e) { rush = e.target.checked; render(); });
    budIn.addEventListener('input', function () { budget = +budIn.value; render(); });
    $$('.rc-cur button', box).forEach(function (b) { b.addEventListener('click', function () { cur = b.dataset.cur; $$('.rc-cur button', box).forEach(function (x) { x.classList.toggle('on', x === b); }); render(); }); });
    $('.est-copy', box).addEventListener('click', function () { copyText(box._text); });
    var pr = $('.est-print', box), ml = $('.est-mail', box);
    function qClean() { var q = document.getElementById('qprint'); if (q && q.parentNode) q.parentNode.removeChild(q); document.body.classList.remove('qp'); }
    if (pr) pr.addEventListener('click', function () {
      var src = $('.est-rc', box); if (!src) return; qClean();
      var q = document.createElement('div'); q.id = 'qprint'; q.appendChild(src.cloneNode(true));
      $$('[id]', q).forEach(function (n) { n.removeAttribute('id'); });
      document.body.appendChild(q); document.body.classList.add('qp');
      /* one quarter of an A4 page: shrink only if a very long quote would be taller */
      q.style.display = 'block'; var h = q.offsetHeight, max = 138 * 3.7795; q.style.display = '';
      if (h > max) q.style.zoom = String(Math.max(0.5, max / h));
      setTimeout(function () { window.print(); }, 60);
    });
    window.addEventListener('afterprint', qClean);
    if (ml) ml.addEventListener('click', function () {
      var txt = box._text, sbj = 'Quote request ' + (box._qid || '');
      if (window.SITE && window.SITE.formspree) { noteEl.textContent = 'Sending...'; sendForm({ message: txt, _subject: sbj }).then(function () { noteEl.textContent = 'Sent. I will reply with a plan soon.'; }, function () { noteEl.textContent = 'Could not send it from here. Please use the WhatsApp button.'; }); }
      else { location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(sbj) + '&body=' + encodeURIComponent(txt); noteEl.textContent = 'Your email app should open with the quote ready.'; }
    });
    render(); shown = compute().total; totEl.textContent = money(shown);
  });

  /* ====================================================================
     v9: Three.js 3D atom (hero) and 3D globe, animated with GSAP
     ==================================================================== */
  var atomCv = $('#atom3d'), globeCv = $('.globe3d');
  if (atomCv || globeCv) (function () {
    var loading = false, loaded = !!window.Scene3D, started = {};
    function webgl() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } }
    function fallback() { [atomCv, globeCv].forEach(function (c) { if (c) c.classList.add('no3d'); }); var gb = $('.globe-box'); if (gb) gb.classList.add('no3d'); }
    function init() {
      if (!window.Scene3D) return;
      try {
        if (atomCv && !started.a && !root.hasAttribute('data-eco')) {
          started.a = true; var st = { p: 0 };
          window.Scene3D.atom(atomCv, { state: st });
          if (window.gsap && window.ScrollTrigger && !reduce) { gsap.registerPlugin(ScrollTrigger); gsap.to(st, { p: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } }); }
        }
        if (globeCv && !started.g && !root.hasAttribute('data-eco')) {
          started.g = true; var api = window.Scene3D.globe(globeCv, { tag: $('.globe-tag') });
          $$('[data-fly]').forEach(function (b) { b.addEventListener('click', function () { api.flyTo(); }); });
          var hint = $('.globe-hint'); if (hint) globeCv.addEventListener('pointerdown', function () { hint.style.opacity = 0; });
        }
      } catch (e) { fallback(); }
    }
    function load() {
      if (loaded) return init();
      if (loading) return; loading = true;
      var s = el('script'); s.src = 'assets/vendor/scene3d.min.js'; s.async = true;
      s.onload = function () { loaded = true; init(); }; s.onerror = fallback; document.head.appendChild(s);
    }
    if (!webgl()) return fallback();
    /* load the 550 KB bundle only when a 3D canvas is about to be seen, and never in eco mode */
    function arm(c) {
      if (!c) return;
      if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); if (!root.hasAttribute('data-eco')) load(); } }, { rootMargin: '300px' }); io.observe(c); }
      else load();
    }
    arm(atomCv); arm(globeCv);
    if (window.MutationObserver) new MutationObserver(function () { if (!root.hasAttribute('data-eco')) { var vis = [atomCv, globeCv].some(function (c) { if (!c) return false; var r = c.getBoundingClientRect(); return r.bottom > -300 && r.top < innerHeight + 300; }); if (vis) load(); } }).observe(root, { attributes: true, attributeFilter: ['data-eco'] });
  })();

  /* ====================================================================
     v10: air dashboard, eco quiz, sky, journey, booking, reviews,
     shortcuts, PWA and analytics
     ==================================================================== */
  var SITE = window.SITE || {};
  function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function whenSeen(node, fn) {
    if (!node) return;
    if (!('IntersectionObserver' in window)) return fn();
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: '200px' }); io.observe(node);
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- live air quality dashboard (Open-Meteo, no key needed) ---------- */
  try { (function () {
    var box = $('#envd'); if (!box) return;
    var list = $('#envdList'), note = $('#envdNote');
    var CITIES = [['Dhaka', 23.81, 90.41], ['Chattogram', 22.36, 91.78], ['Jashore', 23.17, 89.21], ['Sylhet', 24.90, 91.87], ['Rajshahi', 24.37, 88.60]];
    var CATS = [[50, 'Good', '#22c55e'], [100, 'Moderate', '#eab308'], [150, 'Unhealthy for sensitive groups', '#f97316'], [200, 'Unhealthy', '#ef4444'], [300, 'Very unhealthy', '#a855f7'], [9999, 'Hazardous', '#9f1239']];
    function cat(v) { for (var i = 0; i < CATS.length; i++) if (v <= CATS[i][0]) return CATS[i]; return CATS[5]; }
    function render(rows, when) {
      list.textContent = '';
      rows.forEach(function (r) {
        var c = cat(r.aqi), row = mk('div', 'envd-r');
        var name = mk('b', '', r.n);
        var track = mk('div', 'envd-t'); var fill = mk('i'); fill.style.width = Math.max(4, Math.min(100, r.aqi / 2)) + '%'; fill.style.background = c[2]; track.appendChild(fill);
        var val = mk('span', 'envd-v'); var dot = mk('i', 'envd-dot'); dot.style.background = c[2]; val.appendChild(dot); val.appendChild(document.createTextNode('AQI ' + Math.round(r.aqi) + ' · ' + c[1]));
        var extra = mk('span', 'envd-x', 'PM2.5 ' + (r.pm == null ? '-' : r.pm.toFixed(0)) + ' µg/m³  ·  ' + (r.t == null ? '-' : Math.round(r.t) + '°C') + '  ·  ' + (r.h == null ? '-' : Math.round(r.h) + '% humidity'));
        var top = mk('div', 'envd-n'); top.appendChild(name); top.appendChild(val);
        row.appendChild(top); row.appendChild(track); row.appendChild(extra); list.appendChild(row);
      });
      if (note) note.textContent = 'US AQI scale. Data from Open-Meteo, updated ' + when + '. Values are model estimates, not an official reading.';
    }
    function fail() {
      list.textContent = ''; var p = mk('p', 'envd-load', 'Could not load live data right now. Check your connection and press Refresh.'); list.appendChild(p);
    }
    function load(force) {
      var cached = null; try { cached = JSON.parse(sessionStorage.getItem('mp-env5') || 'null'); } catch (e) {}
      if (!force && cached && Date.now() - cached.at < 600000) return render(cached.rows, cached.when);
      list.textContent = ''; list.appendChild(mk('p', 'envd-load', 'Loading live data...'));
      var la = CITIES.map(function (c) { return c[1]; }).join(','), lo = CITIES.map(function (c) { return c[2]; }).join(',');
      var u1 = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + la + '&longitude=' + lo + '&current=us_aqi,pm2_5&timezone=auto';
      var u2 = 'https://api.open-meteo.com/v1/forecast?latitude=' + la + '&longitude=' + lo + '&current=temperature_2m,relative_humidity_2m&timezone=auto';
      Promise.all([fetch(u1).then(function (r) { if (!r.ok) throw 0; return r.json(); }), fetch(u2).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })]).then(function (res) {
        var a = [].concat(res[0]), w = res[1] ? [].concat(res[1]) : [];
        var rows = CITIES.map(function (c, i) { var cu = a[i] && a[i].current || {}, wc = w[i] && w[i].current || {}; return { n: c[0], aqi: cu.us_aqi, pm: cu.pm2_5, t: wc.temperature_2m, h: wc.relative_humidity_2m }; }).filter(function (r) { return typeof r.aqi === 'number'; });
        if (!rows.length) throw 0;
        var when = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        try { sessionStorage.setItem('mp-env5', JSON.stringify({ at: Date.now(), rows: rows, when: when })); } catch (e) {}
        render(rows, when);
      }).catch(fail);
    }
    var re = $('#envdRe'); if (re) re.addEventListener('click', function () { load(true); });
    whenSeen(box, function () { load(false); });
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- eco habits quiz ---------- */
  try { (function () {
    var box = $('#quiz'); if (!box) return;
    var Q, TIPS; try { Q = JSON.parse(box.getAttribute('data-q')); TIPS = JSON.parse(box.getAttribute('data-tips')); } catch (e) { return; }
    var qEl = $('#qzQ'), opts = $('#qzOpts'), res = $('#qzRes'), cnt = $('#qzCount'), bar = $('#qzBar');
    var i = 0, pts = [];
    function show() {
      res.hidden = true; opts.hidden = false; qEl.hidden = false;
      cnt.textContent = 'Question ' + (i + 1) + ' of ' + Q.length; bar.style.width = (i / Q.length * 100) + '%';
      qEl.textContent = Q[i][0]; opts.textContent = '';
      Q[i][1].forEach(function (o) {
        var b = mk('button', 'pc', o[0]); b.type = 'button';
        b.addEventListener('click', function () { pts[i] = o[1]; i++; if (i < Q.length) show(); else done(); });
        opts.appendChild(b);
      });
    }
    function done() {
      var max = Q.length * 3, sum = pts.reduce(function (a, b) { return a + b; }, 0), pct = Math.round(sum / max * 100);
      var worst = 0; pts.forEach(function (p, k) { if (p < pts[worst]) worst = k; });
      var tier = pct >= 85 ? 'Eco champion' : pct >= 60 ? 'On the right path' : pct >= 35 ? 'Room to grow' : 'Great place to start';
      try { var best = Math.max(+lsGet('mp-quiz') || 0, pct); localStorage.setItem('mp-quiz', String(best)); } catch (e) {}
      bar.style.width = '100%'; cnt.textContent = 'Your result'; qEl.hidden = true; opts.hidden = true; res.hidden = false; res.textContent = '';
      var big = mk('div', 'qz-score'); big.appendChild(mk('b', '', String(pct))); big.appendChild(mk('span', '', '/ 100'));
      res.appendChild(big); res.appendChild(mk('h3', '', tier));
      res.appendChild(mk('p', '', pct >= 100 ? 'Perfect score. Keep inspiring the people around you.' : 'First tip: ' + TIPS[worst]));
      var row = mk('div', 'pl-act'); var again = mk('button', 'btn sec sm', 'Try again'); again.type = 'button';
      again.addEventListener('click', function () { i = 0; pts = []; show(); });
      var share = mk('button', 'btn pri sm', 'Copy my score'); share.type = 'button';
      share.addEventListener('click', function () { var t = 'I scored ' + pct + '/100 on the eco habits quiz at ' + location.href.split('#')[0]; if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { say('Score copied'); }, function () { say(t); }); else say(t); });
      row.appendChild(again); row.appendChild(share); res.appendChild(row);
    }
    show();
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- sky tonight: Moon phase and Sun times, worked out locally ---------- */
  try { (function () {
    var box = $('#skyBox'); if (!box) return;
    var SYN = 29.530588853, REF = Date.UTC(2000, 0, 6, 18, 14) / 864e5;
    function phaseAt(ms) { var d = ms / 864e5 - REF; var p = (d / SYN) % 1; return p < 0 ? p + 1 : p; }
    function nextPhase(target) { var now = Date.now(), p = phaseAt(now), dd = ((target - p + 1) % 1) * SYN; if (dd < 0.02) dd += SYN; return now + dd * 864e5; }
    var p = phaseAt(Date.now()), ill = (1 - Math.cos(2 * Math.PI * p)) / 2;
    var names = ['New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full Moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
    var nm = names[Math.floor(p * 8 + 0.5) % 8];
    /* draw the lit part */
    var r = 52, cx = 60, cy = 60, k = Math.cos(2 * Math.PI * p), rx = Math.abs(k) * r, sweep = k > 0 ? 0 : 1;
    var wax = p < 0.5, d;
    if (ill < 0.01) d = ''; else if (ill > 0.99) d = 'M60 8 A52 52 0 1 1 60 112 A52 52 0 1 1 60 8';
    else d = 'M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' A' + rx + ' ' + r + ' 0 0 ' + sweep + ' ' + cx + ' ' + (cy - r) + ' Z';
    var lit = $('#moonLit'); lit.setAttribute('d', d); if (!wax) lit.setAttribute('transform', 'translate(120 0) scale(-1 1)');
    $('#moonName').textContent = nm;
    var age = p * SYN; $('#moonSub').textContent = 'The Moon is about ' + Math.round(age) + ' day' + (Math.round(age) === 1 ? '' : 's') + ' into its ' + Math.round(SYN) + '-day cycle.';
    $('#skyIll').textContent = Math.round(ill * 100) + '%';
    var fmtD = new Intl.DateTimeFormat([], { day: 'numeric', month: 'short' });
    $('#skyFull').textContent = fmtD.format(new Date(nextPhase(0.5))); $('#skyNew').textContent = fmtD.format(new Date(nextPhase(0)));
    /* sunrise equation, Jashore */
    var lat = 23.17, lon = 89.21, rad = Math.PI / 180;
    function sunTimes(date) {
      var d0 = Math.floor((date.getTime() + 6 * 36e5) / 864e5) * 864e5 - 6 * 36e5, jdn = (d0 + 12 * 36e5) / 864e5 + 2440587.5, n = Math.round(jdn - 2451545.0 + lon / 360);
      var js = n - lon / 360, M = (357.5291 + 0.98560028 * js) % 360, C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
      var lam = (M + C + 180 + 102.9372) % 360, jt = 2451545.0 + js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lam * rad);
      var sd = Math.sin(lam * rad) * Math.sin(23.4397 * rad), cd = Math.cos(Math.asin(sd));
      var cw = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sd) / (Math.cos(lat * rad) * cd), w = Math.acos(Math.max(-1, Math.min(1, cw))) / rad;
      var toMs = function (j) { return (j - 2440587.5) * 864e5; };
      return [toMs(jt - w / 360), toMs(jt + w / 360)];
    }
    var st = sunTimes(new Date()), tf = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' });
    $('#skyRise').textContent = tf.format(new Date(st[0])) + ' BST'; $('#skySet').textContent = tf.format(new Date(st[1])) + ' BST';
    var len = (st[1] - st[0]) / 36e5; $('#skyLen').textContent = Math.floor(len) + ' h ' + Math.round((len % 1) * 60) + ' min';
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- journey timeline ---------- */
  try { (function () {
    var ol = $('#jy'); if (!ol) return;
    var fill = $('#jyFill'), items = $$('.jy-i', ol), tick = false;
    function upd() {
      tick = false; var r = ol.getBoundingClientRect(), vh = innerHeight;
      var pct = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height)); fill.style.height = (pct * 100) + '%';
      items.forEach(function (it) { var b = it.getBoundingClientRect(); it.classList.toggle('on', b.top < vh * 0.72); });
    }
    if (reduce) { fill.style.height = '100%'; items.forEach(function (it) { it.classList.add('open'); }); return; }
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); addEventListener('resize', upd); upd();
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- booking ---------- */
  try { (function () {
    var box = $('#bookBox'); if (!box) return;
    var cfg = SITE.book || { start: 10, end: 20, off: [5], days: 10 };
    var daysEl = $('#bkDays'), timesEl = $('#bkTimes'), lenEl = $('#bkLen'), sum = $('#bkSum'), note = $('#bkNote');
    var sel = { day: null, time: null, len: 15 };
    var DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dhNow = new Date(Date.now() + 6 * 36e5);
    var base = Date.UTC(dhNow.getUTCFullYear(), dhNow.getUTCMonth(), dhNow.getUTCDate());
    var days = [];
    for (var k = 0; days.length < cfg.days && k < 40; k++) { var dt = new Date(base + k * 864e5); if (cfg.off.indexOf(dt.getUTCDay()) > -1) continue; days.push({ y: dt.getUTCFullYear(), m: dt.getUTCMonth(), d: dt.getUTCDate(), w: dt.getUTCDay() }); }
    function slotMs(day, h) { return Date.UTC(day.y, day.m, day.d, h - 6, 0); }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    days.forEach(function (day, idx) {
      var b = mk('button', 'pc', DAYN[day.w] + ' ' + day.d + ' ' + MON[day.m]); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { sel.day = idx; sel.time = null; $$('.pc', daysEl).forEach(function (x, j) { x.setAttribute('aria-pressed', j === idx ? 'true' : 'false'); }); times(); upd(); });
      daysEl.appendChild(b);
    });
    function times() {
      timesEl.textContent = ''; if (sel.day == null) { timesEl.appendChild(mk('span', 'pl-note', 'Choose a day first.')); return; }
      var any = false;
      for (var h = cfg.start; h < cfg.end; h++) {
        if (slotMs(days[sel.day], h) < Date.now() + 2 * 36e5) continue; any = true;
        (function (h) {
          var b = mk('button', 'pc', pad(h) + ':00'); b.type = 'button'; b.setAttribute('aria-pressed', sel.time === h ? 'true' : 'false');
          b.addEventListener('click', function () { sel.time = h; $$('.pc', timesEl).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); upd(); });
          timesEl.appendChild(b);
        })(h);
      }
      if (!any) timesEl.appendChild(mk('span', 'pl-note', 'No slots left that day. Try another day.'));
    }
    times();
    $$('.pc', lenEl).forEach(function (b) { b.addEventListener('click', function () { sel.len = +b.dataset.v; $$('.pc', lenEl).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); upd(); }); });
    function label() {
      if (sel.day == null || sel.time == null) return null;
      var day = days[sel.day], ms = slotMs(day, sel.time), local = '';
      try { local = new Intl.DateTimeFormat([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(new Date(ms)); } catch (e) {}
      return { ms: ms, bd: DAYN[day.w] + ' ' + day.d + ' ' + MON[day.m] + ', ' + pad(sel.time) + ':00 (Bangladesh time)', local: local };
    }
    function upd() {
      var l = label();
      sum.textContent = l ? l.bd + ' · ' + sel.len + ' min' + (l.local ? '  =  ' + l.local + ' for you' : '') : 'Pick a day and a time.';
    }
    var name = $('#bkName'), con = $('#bkContact'), topic = $('#bkTopic');
    function need() { var l = label(); if (!l) { note.textContent = 'Please pick a day and a time first.'; return null; } if (!name.value.trim() || !con.value.trim()) { note.textContent = 'Please add your name and how I can reach you.'; (name.value.trim() ? con : name).focus(); return null; } note.textContent = ''; return l; }
    $('#bkSend').addEventListener('click', function () {
      var l = need(); if (!l) return;
      var msg = 'Call request\nWhen: ' + l.bd + ', ' + sel.len + ' min\nYour time: ' + l.local + '\nName: ' + name.value.trim() + '\nContact: ' + con.value.trim() + '\nTopic: ' + (topic.value.trim() || '-');
      if (SITE.formspree) { note.textContent = 'Sending...'; sendForm({ name: name.value.trim(), contact: con.value.trim(), message: msg, _subject: 'Call request: ' + l.bd }).then(function () { note.textContent = 'Request sent. I will confirm by reply soon.'; }, function () { note.textContent = 'Could not send it from here. Please use WhatsApp: ' + PHONE; }); }
      else { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener'); note.textContent = 'WhatsApp opens with your request ready. Press send there.'; }
    });
    $('#bkIcs').addEventListener('click', function () {
      var l = need(); if (!l) return;
      function z(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'); }
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Maruf Al Misbah//Call//EN', 'BEGIN:VEVENT', 'UID:' + l.ms + '@marufalmisbah', 'DTSTAMP:' + z(Date.now()), 'DTSTART:' + z(l.ms), 'DTEND:' + z(l.ms + sel.len * 6e4), 'SUMMARY:Call with Maruf Al Misbah (requested)', 'DESCRIPTION:Topic: ' + (topic.value.trim() || 'Project talk') + '. Not final until confirmed.', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'call-with-maruf.ics'; document.body.appendChild(a); a.click(); a.remove(); note.textContent = 'Calendar file downloaded.';
    });
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- review form ---------- */
  try { (function () {
    var f = $('#rvForm'); if (!f) return;
    var stars = $$('#rvStars button'), val = 5, note = $('#rvNote');
    function paint() { stars.forEach(function (b) { var s = +b.dataset.s; b.setAttribute('aria-checked', s === val ? 'true' : 'false'); b.classList.toggle('on', s <= val); }); }
    stars.forEach(function (b) { b.addEventListener('click', function () { val = +b.dataset.s; paint(); }); });
    paint();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = $('#rvName').value.trim(), role = $('#rvRole').value.trim(), t = $('#rvText').value.trim(), ok = $('#rvOk').checked;
      var msg = 'New review\nRating: ' + val + '/5\nName: ' + n + '\nRole: ' + (role || '-') + '\nMay be shown on the site: ' + (ok ? 'yes' : 'no') + '\n\n' + t;
      if (SITE.formspree) { note.textContent = 'Sending...'; sendForm({ name: n, message: msg, _subject: 'New review from ' + n }).then(function () { note.textContent = 'Thank you! Your review was sent.'; f.reset(); val = 5; paint(); }, function () { note.textContent = 'Could not send it from here. Please email ' + MAIL + '.'; }); }
      else { location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Review from ' + n) + '&body=' + encodeURIComponent(msg); note.textContent = 'Your email app should open with the review ready.'; }
    });
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- print resume ---------- */
  var rsb = $('#rsPrint'); if (rsb) rsb.addEventListener('click', function () { window.print(); });

  /* ---------- keyboard shortcuts overlay ---------- */
  try { (function () {
    var dlg = null, gTimer = 0, gWait = false;
    var MAP = { h: 'index.html', a: 'about.html', s: 'skills.html', e: 'experience.html', p: 'project.html', c: 'contact.html', k: 'case.html', r: 'resume.html' };
    function build() {
      dlg = mk('div', 'cmd kb'); dlg.id = 'kbd'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', 'Keyboard shortcuts');
      var rows = [['?', 'Show this list'], ['Ctrl K', 'Search everything'], ['/', 'Open search'], ['g then h', 'Go to Home'], ['g then a', 'Go to About'], ['g then s', 'Go to Skills'], ['g then e', 'Go to Experience'], ['g then p', 'Go to Projects'], ['g then k', 'Go to Case studies'], ['g then c', 'Go to Contact'], ['g then r', 'Go to Print resume'], ['t', 'Switch dark and light'], ['l', 'Switch English and Bangla'], ['b', 'Book a call'], ['Esc', 'Close']];
      var html = '<div class="cmd-box kb-box"><div class="cmd-top"><b>Keyboard shortcuts</b><kbd>Esc</kbd></div><ul class="kb-list">';
      rows.forEach(function (r) { html += '<li><span>' + r[1] + '</span><kbd>' + r[0] + '</kbd></li>'; });
      dlg.innerHTML = html + '</ul></div>';
      dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
      document.body.appendChild(dlg);
    }
    function open() { if (!dlg) build(); dlg.classList.add('open'); }
    function close() { if (dlg) dlg.classList.remove('open'); }
    window.mpShortcuts = open;
    document.addEventListener('keydown', function (e) {
      var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if (e.key === 'Escape' && dlg && dlg.classList.contains('open')) { close(); return; }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (gWait) { gWait = false; clearTimeout(gTimer); if (MAP[k]) { e.preventDefault(); location.href = MAP[k]; } return; }
      if (k === '?') { e.preventDefault(); dlg && dlg.classList.contains('open') ? close() : open(); }
      else if (k === 'g') { gWait = true; gTimer = setTimeout(function () { gWait = false; }, 1200); }
      else if (k === '/') { var cb = $('#cmdBtn'); if (cb) { e.preventDefault(); cb.click(); } }
      else if (k === 't') { var tb = $('#themeBtn'); if (tb) tb.click(); }
      else if (k === 'l') { var lb = $('#langBtn'); if (lb) lb.click(); }
      else if (k === 'b') { location.href = 'contact.html#book'; }
    });
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- PWA: offline-ready and installable ---------- */
  try { (function () {
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
    window.addEventListener('appinstalled', function () { say('Installed. Find it on your home screen.'); deferred = null; });
    window.mpInstall = function () {
      if (deferred) { deferred.prompt(); deferred = null; }
      else say('Use your browser menu: Install app, or Share then Add to Home Screen.');
    };
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- analytics (only when a Plausible domain is set in config.js) ---------- */
  if (SITE.plausible) { var pa = document.createElement('script'); pa.defer = true; pa.setAttribute('data-domain', SITE.plausible); pa.src = 'https://plausible.io/js/script.js'; document.head.appendChild(pa); }

  /* ---------- road map: a helicopter, drawn and flown with JavaScript ---------- */
  try { (function () {
    var rm = $('#rm'); if (!rm) return;
    var svg = $('#rmSvg'), pins = $$('.rm-pin', rm), items = $$('.rm-i', rm), NS = 'http://www.w3.org/2000/svg';
    function S(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
    var heliSvg = S('svg', { 'class': 'rm-heli', 'aria-hidden': 'true' }); rm.appendChild(heliSvg);
    var g = S('g', {}, heliSvg), body = S('g', { 'class': 'hb' }, g);
    /* helicopter, built from shapes (nose points right) */
    S('ellipse', { cx: 0, cy: 0, rx: 17, ry: 11, 'class': 'h-body' }, body);
    S('path', { d: 'M-14 -3 L-44 -7 L-44 -1 L-14 5 Z', 'class': 'h-tail' }, body);
    S('path', { d: 'M-44 -7 L-50 -17 L-40 -7 Z', 'class': 'h-fin' }, body);
    S('path', { d: 'M3 -9 Q14 -9 17 -1 L3 -1 Z', 'class': 'h-win' }, body);
    S('path', { d: 'M-12 15 L14 15 M-8 11 L-8 15 M8 11 L8 15', 'class': 'h-skid' }, body);
    S('rect', { x: -1.5, y: -17, width: 3, height: 7, 'class': 'h-mast' }, body);
    var rotor = S('line', { x1: -36, y1: -18, x2: 36, y2: -18, 'class': 'h-rotor' }, body);
    var trot = S('ellipse', { cx: -46, cy: -9, rx: 2, ry: 9, 'class': 'h-trot' }, body);
    var shadow = S('ellipse', { cx: 0, cy: 0, rx: 24, ry: 4, 'class': 'h-shadow' }, heliSvg);
    var hud = $('#rmHud'), hStop = $('#rmStop'), hName = $('#rmName'), hBar = $('#rmBar');
    if (hud && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { hud.classList.toggle('show', es[0].isIntersecting && es[0].intersectionRatio > 0); }, { threshold: [0, 0.05] }).observe(rm);
    var road, trail, total = 0, fr = [], cur = 0, tgt = 0, running = false, face = 1, t0 = performance.now(), lastH = 0;
    function build() {
      var rb = rm.getBoundingClientRect(), W = rb.width, H = rb.height; if (!W || !H) return;
      [svg, heliSvg].forEach(function (e) { e.setAttribute('viewBox', '0 0 ' + W + ' ' + H); e.setAttribute('width', W); e.setAttribute('height', H); });
      svg.textContent = '';
      var pts = pins.map(function (p) { var b = p.getBoundingClientRect(); return [b.left + b.width / 2 - rb.left, b.top + b.height / 2 - rb.top]; });
      var wide = W > 760, amp = wide ? Math.min(120, W * 0.11) : 16;
      var all = [[pts[0][0], 0]].concat(pts, [[pts[pts.length - 1][0], H]]), d = 'M' + all[0][0] + ' ' + all[0][1];
      for (var i = 1; i < all.length; i++) { var a = all[i - 1], b = all[i], dy = b[1] - a[1]; d += ' C' + (a[0] + amp) + ' ' + (a[1] + dy * 0.5) + ' ' + (b[0] - amp) + ' ' + (b[1] - dy * 0.5) + ' ' + b[0] + ' ' + b[1]; }
      var w = wide ? 34 : 22;
      S('path', { d: d, 'class': 'rm-edge', 'stroke-width': w + 6 }, svg);
      road = S('path', { d: d, 'class': 'rm-road', 'stroke-width': w }, svg);
      S('path', { d: d, 'class': 'rm-dash' }, svg);
      total = road.getTotalLength();
      trail = S('path', { d: d, 'class': 'rm-trail', 'stroke-dasharray': total + ' ' + total, 'stroke-dashoffset': total }, svg);
      /* where along the road each stop sits */
      fr = pts.map(function (p) { var best = 0, bd = 1e9; for (var k = 0; k <= 500; k++) { var q = road.getPointAtLength(total * k / 500), dd = (q.x - p[0]) * (q.x - p[0]) + (q.y - p[1]) * (q.y - p[1]); if (dd < bd) { bd = dd; best = k / 500; } } return best; });
      g.setAttribute('data-s', wide ? '1.6' : '1.1'); place(true);
    }
    function target() { var r = rm.getBoundingClientRect(), vh = innerHeight; return Math.max(0, Math.min(1, (vh * 0.55 - r.top) / r.height)); }
    function place(snap) {
      if (!road) return; var L = Math.max(0, Math.min(total, cur * total)), p = road.getPointAtLength(L), p2 = road.getPointAtLength(Math.min(total, L + 8)), p1 = road.getPointAtLength(Math.max(0, L - 8));
      var dx = p2.x - p1.x; if (dx > 1.5) face = 1; else if (dx < -1.5) face = -1;
      var tilt = Math.max(-12, Math.min(12, dx * 0.5)) * face, sc = +g.getAttribute('data-s') || 1;
      var bob = reduce ? 0 : Math.sin((performance.now() - t0) / 380) * 3;
      g.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + (p.y - 40 + bob).toFixed(1) + ') scale(' + (face * sc) + ' ' + sc + ') rotate(' + (tilt * face).toFixed(1) + ')');
      shadow.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + (p.y + 6).toFixed(1) + ') scale(' + sc + ')');
      trail.setAttribute('stroke-dashoffset', (total - L).toFixed(1));
      var si = 0; fr.forEach(function (f, i) { if (cur >= f - 0.004) si = i; });
      if (hud) { hStop.textContent = 'Stop ' + (si + 1) + ' of ' + pins.length; hName.textContent = items[si].getAttribute('data-n') || ''; hBar.style.width = (cur * 100).toFixed(0) + '%'; }
      pins.forEach(function (pin, i) { var on = cur >= fr[i] - 0.004; pin.classList.toggle('on', on); items[i].classList.toggle('on', on || (i > 0 && cur >= fr[i - 1] - 0.02)); });
    }
    function spin(now) { var ph = (now - t0) / 1000 * 38; rotor.setAttribute('x1', -36 * Math.cos(ph)); rotor.setAttribute('x2', 36 * Math.cos(ph)); trot.setAttribute('ry', 2 + 7 * Math.abs(Math.sin(ph * 1.3))); }
    function frame(now) {
      if (!running) return; tgt = target(); cur += (tgt - cur) * 0.07; if (Math.abs(tgt - cur) < 0.0004) cur = tgt;
      place(); spin(now); requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; requestAnimationFrame(frame); }
    function stop() { running = false; }
    function init() {
      build();
      if (reduce) { spin(performance.now()); var f = function () { cur = tgt = target(); place(); }; addEventListener('scroll', f, { passive: true }); f(); return; }
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { rootMargin: '150px' }).observe(rm); else start();
    }
    if (window.ResizeObserver) { var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(function () { var h = rm.offsetHeight + '-' + rm.offsetWidth; if (h !== lastH) { lastH = h; build(); } }, 120); }).observe(rm); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(build, 50); });
    addEventListener('scroll', function () { if (!running) { cur = tgt = target(); place(); } }, { passive: true });
    init(); cur = tgt = target(); place(); lastH = rm.offsetHeight + '-' + rm.offsetWidth;
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- certificates: 3D coverflow with flip ---------- */
  try { (function () {
    var tr = $('#cfTrack'); if (!tr) return;
    var cards = $$('.cf-card', tr), dots = $$('.cf-dot'), tick = false;
    function layout() {
      tick = false; var r = tr.getBoundingClientRect(), mid = r.left + r.width / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, i) {
        var b = c.getBoundingClientRect(), d = (b.left + b.width / 2 - mid) / b.width, ad = Math.abs(d);
        if (ad < bd) { bd = ad; best = i; }
        var rot = Math.max(-1, Math.min(1, d)) * -38, sc = 1 - Math.min(ad, 1.4) * 0.1;
        c.style.transform = reduce ? 'none' : 'perspective(900px) rotateY(' + rot.toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
        c.style.opacity = (1 - Math.min(ad, 1.6) * 0.28).toFixed(2); c.style.zIndex = String(10 - Math.round(ad * 3));
      });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === best); }); tr.dataset.cur = best;
    }
    function go(i) { i = Math.max(0, Math.min(cards.length - 1, i)); var c = cards[i]; tr.scrollTo({ left: c.offsetLeft - (tr.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); }
    tr.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(layout); } }, { passive: true });
    addEventListener('resize', layout);
    $('#cfPrev').addEventListener('click', function () { go(+tr.dataset.cur - 1); });
    $('#cfNext').addEventListener('click', function () { go(+tr.dataset.cur + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    var lbEl = null;
    function lb(img) {
      if (!img) return;
      if (!lbEl) { lbEl = document.createElement('div'); lbEl.className = 'cf-lb'; lbEl.setAttribute('role', 'dialog'); lbEl.setAttribute('aria-label', 'Certificate full size'); lbEl.innerHTML = '<img alt=""><button type="button" aria-label="Close">\u00d7</button>'; document.body.appendChild(lbEl); lbEl.addEventListener('click', function () { lbEl.classList.remove('on'); }); addEventListener('keydown', function (ev) { if (ev.key === 'Escape') lbEl.classList.remove('on'); }); }
      var im = lbEl.querySelector('img'); im.src = img.src; im.alt = img.alt; lbEl.classList.add('on');
    }
    cards.forEach(function (c, i) {
      function flip(e) { if (e && e.target && e.target.closest && e.target.closest('.cf-zoom')) { if (+tr.dataset.cur === i) lb(c.querySelector('img')); else go(i); return; } if (+tr.dataset.cur !== i) { go(i); return; } var on = c.classList.toggle('flip'); c.setAttribute('aria-pressed', on ? 'true' : 'false'); }
      c.addEventListener('click', flip);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      c.addEventListener('pointermove', function (e) { var b = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - b.left) / b.width * 100) + '%'); c.style.setProperty('--my', ((e.clientY - b.top) / b.height * 100) + '%'); });
    });
    layout(); setTimeout(function () { go(0); layout(); }, 60);
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- tech sphere: tags on a 3D sphere you can spin ---------- */
  try { (function () {
    var box = $('#ts'); if (!box) return;
    var NAMES = $$('#tsphere .sr-only li').map(function (l) { return l.textContent; }), n = NAMES.length, tags = [], pts = [];
    NAMES.forEach(function (t, i) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
      var e = mk('span', 'ts-t', t); box.appendChild(e); tags.push(e);
    });
    var ax = 0.004, ay = 0.006, vx = ax, vy = ay, rotX = 0.3, rotY = 0, drag = false, lx = 0, ly = 0, vis = false, raf = 0;
    function draw() {
      var R = box.clientWidth * 0.38, cs = Math.cos(rotX), sn = Math.sin(rotX), cy = Math.cos(rotY), sy = Math.sin(rotY);
      tags.forEach(function (e, i) {
        var p = pts[i], x = p[0] * cy + p[2] * sy, z0 = -p[0] * sy + p[2] * cy, y = p[1] * cs - z0 * sn, z = p[1] * sn + z0 * cs, s = 0.65 + (z + 1) * 0.28;
        e.style.transform = 'translate(-50%,-50%) translate3d(' + (x * R).toFixed(1) + 'px,' + (y * R).toFixed(1) + 'px,0) scale(' + s.toFixed(2) + ')';
        e.style.opacity = (0.35 + (z + 1) * 0.33).toFixed(2); e.style.zIndex = String(Math.round((z + 1) * 50));
      });
    }
    function loop() {
      if (!vis || root.hasAttribute('data-eco')) { raf = 0; return; }
      if (!drag) { vx += (ax - vx) * 0.03; vy += (ay - vy) * 0.03; rotX += vx; rotY += vy; }
      draw(); raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }
    box.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; ly = e.clientY; try { box.setPointerCapture(e.pointerId); } catch (x) {} box.classList.add('grab'); });
    box.addEventListener('pointermove', function (e) { if (!drag) return; vy = (e.clientX - lx) * 0.006; vx = -(e.clientY - ly) * 0.006; rotY += vy; rotX += vx; lx = e.clientX; ly = e.clientY; draw(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { box.addEventListener(ev, function () { drag = false; box.classList.remove('grab'); }); });
    draw();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }).observe(box); else { vis = true; kick(); }
    if (window.MutationObserver) new MutationObserver(kick).observe(root, { attributes: true, attributeFilter: ['data-eco'] });
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- bug hunt game ---------- */
  try { (function () {
    var box = $('#bugGame'); if (!box) return;
    var Q; try { Q = JSON.parse(box.getAttribute('data-q')); } catch (e) { return; }
    var code = $('#bgCode'), res = $('#bgRes'), nx = $('#bgNext'), cnt = $('#bgCount'), sc = $('#bgScore'), ask = $('#bgAsk'), i = 0, score = 0, done = false;
    function show() {
      var q = Q[i]; done = false; code.textContent = ''; res.textContent = ''; nx.hidden = true; ask.textContent = 'Tap the line that has the bug. (' + q.lang + ')';
      cnt.textContent = 'Bug hunt ' + (i + 1) + ' of ' + Q.length; sc.textContent = 'Score ' + score;
      q.lines.forEach(function (ln, k) {
        var b = mk('button', 'bl'); b.type = 'button'; var n = mk('i', '', String(k + 1)), c = mk('code', '', ln || ' '); b.appendChild(n); b.appendChild(c);
        b.addEventListener('click', function () {
          if (done) return; done = true; var ok = k === q.bug; if (ok) score++; sc.textContent = 'Score ' + score;
          $$('.bl', code).forEach(function (x, j) { x.disabled = true; if (j === q.bug) x.classList.add('good'); });
          if (!ok) b.classList.add('bad');
          res.textContent = ''; res.appendChild(mk('b', ok ? 'ok' : 'no', ok ? 'Found it! ' : 'Not that line. The bug is on line ' + (q.bug + 1) + '. '));
          res.appendChild(document.createTextNode(q.why + ' '));
          var f = mk('code', 'bug-fix', q.fix); res.appendChild(mk('span', 'bug-fl', 'Fix: ')); res.appendChild(f);
          nx.hidden = false; nx.textContent = i < Q.length - 1 ? 'Next bug' : 'See my result';
        });
        code.appendChild(b);
      });
    }
    nx.addEventListener('click', function () {
      if (i < Q.length - 1) { i++; show(); return; }
      var t = score >= Q.length ? 'Bug detective! You found every bug.' : score >= 3 ? 'Sharp eyes. A few more and you are a pro.' : 'Good start. Debugging gets easier with practice.';
      code.textContent = ''; nx.hidden = true; ask.textContent = 'Final score: ' + score + ' of ' + Q.length; res.textContent = t;
      var again = mk('button', 'btn sec sm', 'Play again'); again.type = 'button'; again.addEventListener('click', function () { i = 0; score = 0; show(); }); res.appendChild(document.createElement('br')); res.appendChild(again);
    });
    show();
  })(); } catch (err) { if (window.console) console.warn(err); }

  /* ---------- bug report form ---------- */
  try { (function () {
    var f = $('#bugForm'); if (!f) return;
    function chips(id) { var g = $$('#' + id + ' .pc'); g.forEach(function (b) { b.addEventListener('click', function () { g.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); }); }); return function () { var on = g.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0]; return on ? on.textContent : ''; }; }
    var dev = chips('bgDev'), urg = chips('bgUrg'), note = $('#bgNote');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var msg = 'Bug report\nLink: ' + ($('#bgUrl').value.trim() || '-') + '\nWhat is wrong: ' + $('#bgWhat').value.trim() + '\nShould be: ' + ($('#bgExp').value.trim() || '-') + '\nDevice: ' + dev() + '\nUrgency: ' + urg() + '\nFrom: ' + $('#bgWho').value.trim();
      if (SITE.formspree) { note.textContent = 'Sending...'; sendForm({ message: msg, _subject: 'Bug report (' + urg() + ')' }).then(function () { note.textContent = 'Thank you! I got your bug report and will reply soon.'; f.reset(); }, function () { note.textContent = 'Could not send it from here. Please use WhatsApp: ' + PHONE; }); }
      else { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener'); note.textContent = 'WhatsApp opens with your bug report ready. Press send there.'; }
    });
  })(); } catch (err) { if (window.console) console.warn(err); }

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
