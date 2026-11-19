MARUF AL MISBAH PORTFOLIO

Open index.html in a browser to preview.

1. Put your two PDFs in assets/file/ named exactly:
   Maruf_Resume.pdf (navbar "Download Resume" button) and Maruf-CV.pdf (all "Download CV" buttons)
2. To publish on GitHub Pages: upload everything in this folder
   (index.html and the assets folder) to your repository, keeping the structure.
3. Live Demo buttons use https://marufalmisbah.github.io/<repo-name>/
   Turn on GitHub Pages for each project repository
   (Settings > Pages > Deploy from branch > main) or edit the links in project.html and index.html.
4. Replace the three "Sample" testimonial cards in index.html, or delete that section.

Files
  index.html, skills.html, experience.html, project.html, contact.html
  assets/css/style.css, assets/css/responsive.css
  assets/js/app.js
  assets/images/logo.png
  assets/images/profile.webp  (hero portrait, transparent background; replace to change the photo)
  assets/vendor/             (GSAP + ScrollTrigger, Swiper, Venobox, Counter Up, Chart.js, Shuffle.js, all self-hosted, no internet needed)
  assets/file/   (your CV goes here)

PROJECT IMAGES
Put one screenshot per project in assets/images/ with these exact lowercase names
(.webp, .jpg, .png or .jpeg all work, any size, it is fitted to the card automatically):
  furniture-store      kids-mcq-portal      painting-contractor
  window-door-company  sheba-info-bd        portfolio-website
No image yet? The card shows its illustration instead. For fast loading, keep each image
around 1200px wide and under 200 KB.
To use a different file name, change data-img="..." on that card in project.html and index.html.

PLUGINS (assets/vendor/)
  GSAP + ScrollTrigger : scroll progress bar, word-by-word headings, hero parallax, magnetic buttons
  Swiper               : project and testimonial sliders (home page)
  Venobox              : click a project image to open it full size
  Shuffle.js           : animated project filter (projects page)
  Counter Up           : number counters (experience page)
  Chart.js             : skills radar chart (skills page). Edit values in data-values on #skillChart in skills.html
Do not delete the vendor folder, the pages need it. Images are WebP to keep the site fast.

EXTRA POLISH
  Preloader, tilted skills marquee (home), card spotlight on hover, custom cursor (desktop only). All in assets/css/style.css and assets/js/app.js.

NEW FEATURES (v4)
  Terminal (home)           : type help, whoami, skills, projects, github, contact, resume, cv, theme dark|light, goto <page>, sudo hire-me
  Quick search              : press Ctrl+K (or /) or tap the search icon
  GitHub live (home)        : reads github.com/marufalmisbah from the public API (works online only). Change the user in data-user on #gh in index.html
  3D tilt                   : project cards tilt with a light glare (desktop)
  Wireframe vs final slider : projects page, uses assets/images/furniture-store.webp
  Process timeline          : home page, the line fills as you scroll
  Spotlight mode            : palette icon > Spotlight mode
  English / Bangla          : "বাং" button in the navbar. Bangla text lives in the BN object inside assets/js/app.js

v5: the navbar is now a vertical icon dock on the left (desktop). Hover an icon to see its name. Phones keep the top bar and bottom navbar.
Tech stack tiles use real brand logos (inline SVG from the Simple Icons set).

v6 additions
  Home      : "Science meets code" (live Jashore weather and air quality from Open-Meteo, website carbon estimate, interests, ideas), "What you get" strip
  Skills    : Periodic table of skills
  Contact   : Project planner (builds a brief and sends it by WhatsApp or email), my local time, Save my contact (vCard)
  SEO       : Open Graph and Twitter cards (assets/images/og.png), JSON-LD Person data, sitemap.xml, robots.txt
  Note      : The "ideas I want to build" are plans, not finished projects. Edit them in index.html.

v7 additions
  Skills page : the periodic table now uses real logos; "Skill molecule" (drag the atoms, spring physics)
  Home        : animated DNA helix beside "Science meets code"
  Eco mode    : palette icon > Eco mode. Turns off the animated background and effects (also in Ctrl+K)
  Easter egg  : press Up Up Down Down Left Right Left Right B A (or type matrix in the terminal) for matrix rain
  GitHub card : if the live GitHub numbers cannot load, the card shows the reason (for example HTTP 403 = rate limit) and your featured repos, with a Try again button

v8: Instant quote receipt (home and contact pages)
  The prices are STARTING VALUES that you should change. Open index.html and contact.html, find data-config="..." on the element with class "est", and edit the numbers:
  base = starting price of a project type, pages = pages included, perPage = price of each extra page, features p = price of an extra, rush = 0.25 means +25%, rate = BDT per USD, spread = 0.15 means the range is plus or minus 15%.

v9 - Three.js + GSAP
- 3D atom behind the hero portrait (scroll-scrubbed with GSAP ScrollTrigger).
- 3D dotted globe with Jashore marker, animated arcs, drag to spin, "Fly to Jashore" (GSAP). Section "Worldwide" on Home and Contact.
- assets/vendor/scene3d.min.js (Three.js bundle) loads lazily; skipped in Eco mode, no WebGL, reduced motion.
- Upload the new file assets/vendor/scene3d.min.js to GitHub too.

v10 - 12 new features
1. Case studies: case.html (+ "Case study" button on every project card).
2. Book a call: contact.html#book (hours, days off: assets/js/config.js).
3. Real contact form: create a free form at formspree.io, paste its ID in assets/js/config.js -> formspree. Messages, reviews and call requests then reach your inbox. Without an ID everything falls back to email/WhatsApp.
4. Reviews: contact.html#review form. To show real reviews on the home page, add them to REVIEWS in build/v10.py (or tell Claude to).
5. Air quality dashboard (5 cities, live), 6. Eco habits quiz, 7. Sky tonight (Moon + Sun), 8. Journey timeline  - all on Home.
9. Printable resume: resume.html (Ctrl+P / button).
10. PWA: manifest.webmanifest + sw.js, installable and works offline (needs https, so on GitHub Pages).
11. Press ? for keyboard shortcuts (g then h/s/e/p/k/c/r, t, l, b, /).
12. Analytics: put your domain in assets/js/config.js -> plausible (create the site at plausible.io first).
Upload ALL files, including manifest.webmanifest, sw.js, assets/js/config.js and assets/images/icon-*.png.

v11
- Terminal now types "who am I ?" and prints the About text (the old "whoami" and "about" still work).
- New "Road map" section on Home: a helicopter drawn and flown with JavaScript follows the road of the school-to-code journey as you scroll.

v12
- New About page (about.html), already linked from the dock, mobile menu and search.
- DNA helix now shows on phones (above the Science heading).
- Road map helicopter hardened (each v10+ widget now fails on its own without breaking others) and also on the About page.

v13
- About page: "Certificates" 3D coverflow (swipe, tap to flip) built from your NSDA certificates, and a draggable 3D "Tech sphere".
- Real certificates: assets/images/cert-web-design-l3.webp and cert-retail-sales-l3.webp. Your NID number and parents' names are covered on these images, so keep it that way for new ones.
- To add a new certificate later: export page 1 as an image, cover NID and parents' names, save it in assets/images/, and replace the empty 'cf-soon' card in about.html (copy the Web Design card).
- Pending cards: Web Design and Development for Freelancing (assessment 22 Nov 2026), CBT&A (assessment 28 Nov 2026), Front-End Developer Certificate (last).
- Quote 'Print or save PDF' prints one small receipt (about a quarter of an A4 page).

v14
- About photo centred with the name under it. On phones cards now fade in (no slide-up) and nothing is sticky, so cards cannot ride over each other.
- "My journey" and "Road map" merged into one richer road map (10 stops, details, tags, links) with a live "Stop N of 10" bar.
- Quote: 4 new extras, delivery estimate, payment plan (40/30/30), bundle discount (3+ extras = 5%), quote number + validity, print/save PDF, email me this quote. Prices, days and the discount are PLACEHOLDERS: edit PRICING in build/more.py.
- New "Problem solver" section (Home + About): 5-step debug method, problems I fix, a 5-round Bug Hunt game.
- New "Report a bug" form on the Contact page (contact.html#bug).
