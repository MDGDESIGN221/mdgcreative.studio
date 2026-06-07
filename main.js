/* ══════════════════════════════════════════
   MDG Creative Studio — main.js v2
   Multi-page · View Transitions · No-reload loader
   ══════════════════════════════════════════ */

/* ── LOADER SKIP — sessionStorage flag ──
   Le loader cinématique joue UNE seule fois par session.
   Toutes les pages suivantes : skip immédiat, display:none.
   ─────────────────────────────────────────────────────── */
(function () {
  var loader = document.getElementById('loader');
  if (!loader) return;

  var VISITED = 'mdg_visited';

  if (sessionStorage.getItem(VISITED)) {
    /* Page secondaire : on coupe le loader instantanément */
    loader.style.display = 'none';
    document.body.style.overflow = '';
    window._loaderDoneAt = Date.now();
  } else {
    /* Première visite : on mémorise pour les pages suivantes */
    sessionStorage.setItem(VISITED, '1');
    /* Le loader joue normalement — rien à faire ici */
  }
})();

/* ── SCROLL-DOT : masquer les dots hors-page ──
   Chaque page déclare ses sections via data-section sur les dots.
   Les dots qui pointent vers une section absente de la page sont cachés.
   ─────────────────────────────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.scroll-dot[data-section]').forEach(function (dot) {
    var id = dot.dataset.section;
    if (!document.getElementById(id)) {
      dot.style.display = 'none';
    }
  });
})();

/* ── ACTIVE NAV STATE ── */
(function () {
  var path = window.location.pathname.replace(/\/$/, '') || '/';

  /* Desktop nav */
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (
      href === path ||
      (path === '/' && href === '/') ||
      (href !== '/' && path.startsWith(href))
    ) {
      a.classList.add('active');
    }
  });

  /* Mobile tab bar */
  document.querySelectorAll('#mob-tab-bar .mob-tab').forEach(function (tab) {
    var href = tab.getAttribute('href');
    if (
      href === path ||
      (path === '/' && href === '/') ||
      (href !== '/' && path.startsWith(href))
    ) {
      tab.classList.add('active');
    }
  });
})();

/* ── lenisScroll : scroll ancre si section présente, sinon navigate ── */
window.lenisScroll = function (sectionId) {
  var map = {
    'hero':                '/',
    'portfolio-accordion': '/portfolio',
    'social-proof':        '/',
    'collabs':             '/portfolio#collabs',
    'about':               '/about',
    'services':            '/services',
    'process':             '/services#process',
    'pricing':             '/services#pricing',
    'uranus':              '/services#uranus',
    'faq':                 '/services#faq',
    'contact':             '/contact',
  };
  var el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    var dest = map[sectionId];
    if (dest) window.location.href = dest;
  }
};

/* ── openContact ── */
window.openContact = function (e) {
  if (e) e.preventDefault();
  var el = document.getElementById('contact');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.location.href = '/contact';
  }
};

/* ── cm : fermer menu mobile + naviguer ── */
window.cm = function (anchor) {
  var menu    = document.getElementById('mobMenu');
  var overlay = document.getElementById('mobOverlay');
  if (menu)    menu.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';

  if (!anchor) return;

  var map = {
    '#hero':                '/',
    '#portfolio-accordion': '/portfolio',
    '#about':               '/about',
    '#services':            '/services',
    '#collabs':             '/portfolio#collabs',
    '#process':             '/services#process',
    '#pricing':             '/services#pricing',
    '#uranus':              '/services#uranus',
    '#faq':                 '/services#faq',
    '#contact':             '/contact',
  };

  var sectionId = anchor.replace('#', '');
  var el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    var dest = map[anchor];
    if (dest) window.location.href = dest;
  }
};

/* ── Scroll-dots : clic handler ── */
(function () {
  document.querySelectorAll('.scroll-dot[data-section]').forEach(function (dot) {
    dot.onclick = function () {
      lenisScroll(dot.dataset.section);
    };
  });
})();

/* ── Hash scroll on load (/services#pricing etc.) ── */
(function () {
  if (!window.location.hash) return;
  var id = window.location.hash.replace('#', '');
  var delay = sessionStorage.getItem('mdg_visited') ? 200 : 900;
  setTimeout(function () {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, delay);
})();
