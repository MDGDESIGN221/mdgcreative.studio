/* ══════════════════════════════════════════════════════════════════
   INFOBULLE — nommer les commandes qui n'ont qu'une icone
   ──────────────────────────────────────────────────────────────────
   Une seule bande porte TOUS les libelles, cote a cote. On n'en montre
   qu'un a la fois, en la rognant, et on la fait glisser pour centrer
   le libelle sous son icone. D'ou le deplacement continu d'une
   commande a l'autre, au lieu de deux bulles qui clignotent.

   Le libelle est lu sur aria-label. Il n'y a donc rien a redire deux
   fois : ce que le lecteur d'ecran annonce est ce que l'oeil lit, et
   une commande sans aria-label n'a pas d'infobulle — c'est le signe
   qu'il lui manque son nom, pas son ornement.

   CE QUI A ETE CORRIGE en portant le composant d'origine :

   1. Le minuteur du delai d'apparition n'etait jamais annule au
      demontage : il ecrivait dans un composant disparu.

   2. La bande de mesure et la bande visible ne rendaient pas la meme
      chose — un raccourci clavier passe en element devenait "⌘" cote
      mesure. Les largeurs divergeaient, et le rognage tombait a cote.
      Ici les deux bandes sont construites par la MEME fonction.

   3. L'infobulle ne repondait qu'a la souris. Les boutons sont
      focusables : au clavier, on les atteignait sans jamais savoir ce
      qu'ils faisaient. Elle repond desormais aussi au focus.

   Usage : marquer le conteneur des commandes.
     <div data-infobulles>            … au-dessus (defaut)
     <div data-infobulles="bas">      … en dessous
   Raccourci facultatif sur une commande : data-touche="C"
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DELAI = 320;   /* avant la premiere apparition */

  function moinsDeMouvement() {
    return global.matchMedia
      && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function libelle(el) {
    return (el.getAttribute('data-infobulle')
         || el.getAttribute('aria-label') || '').trim();
  }

  /* Une seule fabrique pour les deux bandes : c'est ce qui garantit
     qu'elles ont exactement la meme largeur. */
  function construireBande(commandes, classe) {
    var bande = document.createElement('div');
    bande.className = classe;
    commandes.forEach(function (c) {
      var item = document.createElement('span');
      item.className = 'mdgi-item';
      var texte = document.createElement('span');
      texte.textContent = libelle(c);
      item.appendChild(texte);
      var touche = c.getAttribute('data-touche');
      if (touche) {
        var k = document.createElement('kbd');
        k.className = 'mdgi-touche';
        k.textContent = touche;
        item.appendChild(k);
      }
      bande.appendChild(item);
    });
    return bande;
  }

  function equiper(hote) {
    var commandes = Array.prototype.slice
      .call(hote.querySelectorAll('button, a[href], [role="button"]'))
      .filter(function (c) {
        return libelle(c) && !c.hasAttribute('data-sans-infobulle');
      });
    if (commandes.length < 1) return null;

    var sens = hote.getAttribute('data-infobulles') === 'bas' ? 'bas' : 'haut';

    var cadre = document.createElement('div');
    cadre.className = 'mdgi mdgi--' + sens;
    cadre.setAttribute('aria-hidden', 'true');   /* aria-label dit deja tout */

    var visible = construireBande(commandes, 'mdgi-bande');
    var mesure  = construireBande(commandes, 'mdgi-bande mdgi-bande--mesure');

    cadre.appendChild(visible);
    cadre.appendChild(mesure);
    if (getComputedStyle(hote).position === 'static') hote.style.position = 'relative';
    hote.appendChild(cadre);

    var minuteur = null;
    var ouverte = false;

    function placer(rang) {
      var items = mesure.children;
      var cible = items[rang];
      if (!cible) return;

      var largeurTotale = mesure.offsetWidth;
      if (!largeurTotale) return;

      var gauche = cible.offsetLeft;
      var largeur = cible.offsetWidth;

      var bouton = commandes[rang];
      var centreBouton = bouton.offsetLeft + bouton.offsetWidth / 2;
      var centreLibelle = gauche + largeur / 2;

      var droite = largeurTotale - (gauche + largeur);
      visible.style.clipPath = 'inset(0 ' + (droite / largeurTotale * 100) + '% 0 '
                                          + (gauche / largeurTotale * 100) + '% round 7px)';
      visible.style.transform = 'translateX(' + (centreBouton - centreLibelle) + 'px)';
    }

    function montrer(rang) {
      if (ouverte) {                 /* deja ouverte : on glisse, sans attendre */
        cadre.classList.add('est-glissante');
        placer(rang);
        return;
      }
      clearTimeout(minuteur);
      minuteur = setTimeout(function () {
        cadre.classList.remove('est-glissante');
        placer(rang);
        /* Un cadre reflow avant l'ouverture : sans lui, la premiere
           apparition glisserait depuis la position precedente. */
        void cadre.offsetWidth;
        cadre.classList.add('est-ouverte');
        ouverte = true;
      }, moinsDeMouvement() ? 0 : DELAI);
    }

    function cacher() {
      clearTimeout(minuteur);
      cadre.classList.remove('est-ouverte', 'est-glissante');
      ouverte = false;
    }

    commandes.forEach(function (c, rang) {
      c.addEventListener('pointerenter', function () { montrer(rang); });
      c.addEventListener('focus', function () { montrer(rang); });
      c.addEventListener('blur', cacher);
      c.addEventListener('click', cacher);
    });
    hote.addEventListener('pointerleave', cacher);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cacher();
    });

    return {
      element: cadre,
      cacher: cacher,
      detruire: function () {
        clearTimeout(minuteur);
        if (cadre.parentNode) cadre.parentNode.removeChild(cadre);
      }
    };
  }

  function equiperTout(racine) {
    var hotes = (racine || document).querySelectorAll('[data-infobulles]');
    var faits = [];
    for (var i = 0; i < hotes.length; i++) {
      if (hotes[i].__mdgi) continue;
      var inst = equiper(hotes[i]);
      if (inst) { hotes[i].__mdgi = inst; faits.push(inst); }
    }
    return faits;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { equiperTout(); });
  } else {
    equiperTout();
  }

  global.MDGInfobulle = { equiper: equiper, equiperTout: equiperTout };
})(window);
