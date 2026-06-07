/* ══════════════════════════════════════════
   MDG Creative Studio — main.js
   Multi-page navigation helpers
   ══════════════════════════════════════════ */

/* ── Active nav state (set from nav.active class in HTML already) ── */
(function() {
  // Fallback: set active based on pathname
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var links = document.querySelectorAll('.nav-links a');
  links.forEach(function(a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '/' && href === '/') ||
        (path.startsWith(href) && href !== '/')) {
      a.classList.add('active');
    }
  });

  // Mobile tab bar active
  var tabs = document.querySelectorAll('#mob-tab-bar .mob-tab');
  tabs.forEach(function(tab) {
    var href = tab.getAttribute('href');
    if (href === path || (path === '/' && href === '/') ||
        (path.startsWith(href) && href !== '/')) {
      tab.classList.add('active');
    }
  });
})();

/* ── lenisScroll: on multi-page, navigate to page + hash ── */
window.lenisScroll = function(sectionId) {
  var map = {
    'hero': '/',
    'portfolio-accordion': '/portfolio',
    'social-proof': '/',
    'about': '/about',
    'services': '/services',
    'collabs': '/portfolio#collabs',
    'process': '/services#process',
    'pricing': '/services#pricing',
    'uranus': '/services#uranus',
    'faq': '/services#faq',
    'contact': '/contact',
  };
  var dest = map[sectionId];
  if (!dest) return;
  // If same page, scroll to section
  var el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.location.href = dest;
  }
};

/* ── openContact: navigate to contact page ── */
window.openContact = function(e) {
  if (e) e.preventDefault();
  var el = document.getElementById('contact');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.location.href = '/contact';
  }
};

/* ── cm (close mobile menu + navigate) ── */
window.cm = function(anchor) {
  // Close mobile menu
  var menu = document.getElementById('mobMenu');
  var overlay = document.getElementById('mobOverlay');
  if (menu) menu.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';

  if (!anchor) return;

  var map = {
    '#hero': '/',
    '#portfolio-accordion': '/portfolio',
    '#about': '/about',
    '#services': '/services',
    '#collabs': '/portfolio#collabs',
    '#process': '/services#process',
    '#pricing': '/services#pricing',
    '#uranus': '/services#uranus',
    '#faq': '/services#faq',
    '#contact': '/contact',
  };

  var dest = map[anchor];
  if (!dest) return;

  var sectionId = anchor.replace('#', '');
  var el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.location.href = dest;
  }
};

/* ── Quick-nav: update scroll-dot targets ── */
(function() {
  document.querySelectorAll('.scroll-dot[data-section]').forEach(function(dot) {
    dot.onclick = function() {
      lenisScroll(dot.dataset.section);
    };
  });
})();

/* ── Scroll-to hash on page load (for /services#pricing etc) ── */
(function() {
  if (window.location.hash) {
    var id = window.location.hash.replace('#', '');
    // Wait for page to fully render
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
  }
})();
