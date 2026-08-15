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
      majRail();
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

    /* ── Le rail : fleches et voiles de bord ──────────────────────
       Rien ne disait au visiteur qu'il restait des disciplines a
       cote. Les fleches le disent par leur presence, les voiles par
       leur estompe, et l'indice sous la rangee par des mots. */
    var rail = rangee.closest('.xp-rail');
    var prec = rail && rail.querySelector('.xp-rail-f--prec');
    var suiv = rail && rail.querySelector('.xp-rail-f--suiv');

    function rangActif() {
      for (var k = 0; k < tuiles.length; k++) {
        if (tuiles[k].getAttribute('aria-selected') === 'true') return k;
      }
      return 0;
    }

    function majRail() {
      if (!rail) return;
      var i = rangActif();
      if (prec) prec.disabled = i === 0;
      if (suiv) suiv.disabled = i === tuiles.length - 1;
      /* Les voiles ne se justifient que si la rangee defile vraiment. */
      var defile = rangee.scrollWidth > rangee.clientWidth + 4;
      var x = rangee.scrollLeft;
      rail.classList.toggle('a-gauche', defile && x > 4);
      rail.classList.toggle('a-droite', defile && x < rangee.scrollWidth - rangee.clientWidth - 4);
    }

    if (prec) prec.addEventListener('click', function () { activer(Math.max(0, rangActif() - 1), false); });
    if (suiv) suiv.addEventListener('click', function () { activer(Math.min(tuiles.length - 1, rangActif() + 1), false); });
    rangee.addEventListener('scroll', majRail, { passive: true });
    window.addEventListener('resize', majRail);
    /* Etat initial : APRES l'affectation de rail. Place plus haut,
       l'appel partait alors que la variable valait encore undefined et
       la fonction sortait aussitot — les fleches restaient inertes. */
    majRail();

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
