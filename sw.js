/* Offline-ready app shell. Pages: network first. Assets: cache first. */
var V = 'mp-v11', FILES = ["./about.html", "./assets/css/responsive.css", "./assets/css/style.css", "./assets/images/cert-retail-sales-l3.webp", "./assets/images/cert-web-design-l3.webp", "./assets/images/furniture-store.webp", "./assets/images/icon-192.png", "./assets/images/icon-512.png", "./assets/images/kids-mcq-portal.webp", "./assets/images/logo.png", "./assets/images/painting-contractor.webp", "./assets/images/portfolio-website.webp", "./assets/images/profile.webp", "./assets/images/sheba-info-bd.webp", "./assets/images/window-door-company.webp", "./assets/js/app.js", "./assets/js/config.js", "./assets/vendor/ScrollTrigger.min.js", "./assets/vendor/chart.umd.min.js", "./assets/vendor/counterup2.min.js", "./assets/vendor/gsap.min.js", "./assets/vendor/shuffle.min.js", "./assets/vendor/swiper-bundle.min.css", "./assets/vendor/swiper-bundle.min.js", "./assets/vendor/venobox.min.css", "./assets/vendor/venobox.min.js", "./case.html", "./contact.html", "./experience.html", "./index.html", "./manifest.webmanifest", "./project.html", "./resume.html", "./robots.txt", "./sitemap.xml", "./skills.html"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== location.origin) return;
  var isPage = r.mode === 'navigate' || /\.html?$/.test(u.pathname);
  if (isPage) {
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); return res; }).catch(function () { return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html'); }); }));
  } else {
    e.respondWith(caches.match(r).then(function (m) { return m || fetch(r).then(function (res) { if (res.ok) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return res; }); }));
  }
});
