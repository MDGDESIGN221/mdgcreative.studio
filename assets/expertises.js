/* ══════════════════════════════════════════════════════════════════
   EXPERTISES — la rangee de tuiles commande le panneau
   ──────────────────────────────────────────────────────────────────
   Huit disciplines, huit panneaux, un seul visible. Le motif est celui
   des onglets : la tuile est l'onglet, le panneau son contenu.

   LES HUIT PANNEAUX SONT DANS LA PAGE. On les masque avec l'attribut
   hidden, on ne les construit pas a la volee : ce qui n'existe qu'en
   JavaScript n'est lu ni par un moteur de recherche, ni par quelqu'un
   dont le script n'a pas charge. Sans JavaScript, le premier panneau
   reste affiche et les sept autres restent atteignables — ils sont
   dans le HTML.

   Le clavier suit la convention des onglets : les fleches se deplacent
   dans la rangee, Origine et Fin vont aux extremites. Seule la tuile
   active est atteignable par tabulation, c'est ce qui evite d'avoir a
   traverser huit boutons pour atteindre le contenu.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function equiper(rangee) {
    var tuiles = Array.prototype.slice.call(rangee.querySelectorAll('[role="tab"]'));
    if (tuiles.length < 2) return;

    function panneau(t) {
      return document.getElementById(t.getAttribute('aria-controls'));
    }

    function activer(i, donnerLeFocus) {
      tuiles.forEach(function (t, k) {
        var actif = k === i;
        t.setAttribute('aria-selected', actif ? 'true' : 'false');
        t.tabIndex = actif ? 0 : -1;
        var p = panneau(t);
        if (!p) return;
        if (actif) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
      if (donnerLeFocus) tuiles[i].focus();
      recentrer(tuiles[i]);
    }

    /* Sur ecran etroit la rangee defile : la tuile choisie peut se
       trouver hors champ. On la ramene au centre — horizontalement
       seulement, block:'nearest' empeche la page de bouger avec. */
    function recentrer(t) {
      if (rangee.scrollWidth <= rangee.clientWidth + 4) return;
      var doux = !(window.matchMedia
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      try {
        t.scrollIntoView({ inline: 'center', block: 'nearest',
                           behavior: doux ? 'smooth' : 'auto' });
      } catch (e) {
        rangee.scrollLeft = t.offsetLeft - (rangee.clientWidth - t.offsetWidth) / 2;
      }
    }

    tuiles.forEach(function (t, i) {
      t.addEventListener('click', function () { activer(i, false); });
    });

    rangee.addEventListener('keydown', function (e) {
      var i = tuiles.indexOf(document.activeElement);
      if (i === -1) return;
      var n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tuiles.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tuiles.length) % tuiles.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tuiles.length - 1;
      if (n === null) return;
      e.preventDefault();
      activer(n, true);
    });
  }

  function demarrer() {
    var rangees = document.querySelectorAll('.xp-tuiles[role="tablist"]');
    for (var i = 0; i < rangees.length; i++) equiper(rangees[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
