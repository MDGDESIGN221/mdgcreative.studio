/* ══════════════════════════════════════════════════════════════════
   LUEUR — le halo suit le pointeur
   ──────────────────────────────────────────────────────────────────
   Pose --mx / --my sur tout element marque data-lueur, en pourcentage
   de sa propre boite. Le CSS s'en sert comme centre d'un degrade
   radial : c'est ce qui donne l'impression que la surface reflechit
   une source, au lieu de s'allumer d'un bloc.

   Trois precautions :

   - on n'ecoute QUE pendant le survol. Un ecouteur de mouvement pose
     en permanence sur une page longue coute cher pour rien ;
   - une seule ecriture par image, via requestAnimationFrame. Le
     pointeur emet bien plus d'evenements que l'ecran n'affiche
     d'images ;
   - rien sur pointeur grossier ni sous mouvement reduit. Un doigt n'a
     pas de position de survol, et le halo reste alors la ou le CSS
     l'a mis par defaut.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var media = window.matchMedia;
  if (media && (media('(pointer: coarse)').matches
             || media('(prefers-reduced-motion: reduce)').matches)) return;

  function suivre(el) {
    var image = 0, dernier = null;

    function poser() {
      image = 0;
      if (!dernier) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty('--mx', ((dernier.x - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((dernier.y - r.top) / r.height * 100).toFixed(1) + '%');
    }

    el.addEventListener('pointermove', function (e) {
      dernier = { x: e.clientX, y: e.clientY };
      if (!image) image = requestAnimationFrame(poser);
    });

    el.addEventListener('pointerleave', function () {
      cancelAnimationFrame(image); image = 0; dernier = null;
      /* On rend la main au CSS : la valeur par defaut reprend, et la
         prochaine apparition ne repart pas du dernier point survole. */
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });
  }

  function equiper(racine) {
    var els = (racine || document).querySelectorAll('[data-lueur]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].__lueur) continue;
      els[i].__lueur = 1;
      suivre(els[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { equiper(); });
  } else {
    equiper();
  }

  window.MDGLueur = { equiper: equiper };
})();
