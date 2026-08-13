/* ══════════════════════════════════════════════════════════════════
   BORDER BEAM
   ──────────────────────────────────────────────────────────────────
   Un trait de lumiere parcourt le bord d'un element. Poser la classe
   .border-beam suffit ; les reglages passent par des variables :

     <a class="border-beam" style="--beam-duree:7s;--beam-taille:90px">

   Le trait est porte par un ELEMENT injecte, jamais par ::before ou
   ::after. Un element n'a qu'un seul de chacun, et certains composants
   du site les occupent deja : .mdg-ihb utilise ::before pour le cercle
   du survol et ::after pour l'etiquette qui glisse. Un faisceau en
   ::after aurait efface cette etiquette.

   C'est une animation SANS FIN, ce que le brief du site ecarte. Elle ne
   tourne donc que sous les yeux de quelqu'un : elle demarre a l'entree
   a l'ecran, S'ARRETE en sortant, et s'eteint quand l'onglet passe en
   arriere-plan. Contrairement aux entrees de page, l'observateur ne se
   detache jamais — un faisceau invisible qui continuerait de tourner
   composerait une couche GPU pour le reste de la visite.

   Sous mouvement reduit, le trait se pose et ne court plus : la
   presence reste, le mouvement disparait, et aucune couche n'est
   reservee. Voir les regles .beam-trace dans mdg.css.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var io = null;
  var connus = [];

  function dejaVisible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.top < (window.innerHeight || 0) && r.bottom > 0;
  }

  function preparer(el) {
    if (!el.querySelector(':scope > .beam-trace')) {
      var t = document.createElement('i');
      t.className = 'beam-trace';
      t.setAttribute('aria-hidden', 'true');
      el.appendChild(t);
    }
    if (dejaVisible(el)) el.classList.add('beam-actif');
    if (io) io.observe(el);
    if (connus.indexOf(el) < 0) connus.push(el);
  }

  /* Rebalayage. Les cartes de tarifs sont construites en JavaScript :
     au chargement elles n'existent pas encore, et un balayage unique
     les manquerait. */
  function balayer() {
    if (!window.IntersectionObserver) return 0;
    if (!io) {
      io = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          e.target.classList.toggle('beam-actif', e.isIntersecting);
        });
      }, { rootMargin: '80px' });
    }
    var n = 0;
    document.querySelectorAll('.border-beam').forEach(function (el) {
      if (connus.indexOf(el) >= 0) return;
      preparer(el); n++;
    });
    return n;
  }

  window.mdgBeamScan = balayer;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      connus.forEach(function (el) { el.classList.remove('beam-actif'); });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', balayer);
  } else {
    balayer();
  }
})();
