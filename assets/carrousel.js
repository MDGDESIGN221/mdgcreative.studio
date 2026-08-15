/* ══════════════════════════════════════════════════════════════════
   CARROUSEL — commande de navigation entre vues
   ──────────────────────────────────────────────────────────────────
   Deux fleches, une pastille par vue, la pastille courante allongee.
   La commande ne connait pas les vues : elle dit quel rang est
   demande, l'appelant fait le reste.

   CE QUI A ETE CORRIGE en portant le composant d'origine :

   1. La couleur venait d'un nom de classe utilitaire passe a une
      propriete CSS ("backgroundColor: 'bg-zinc-100'"). Ce n'est pas
      une couleur : le fond ne s'affichait jamais. Ici la teinte passe
      par des variables CSS, donc par la charte du site.

   2. La fleche "precedent" etait grisee au premier rang mais restait
      cliquable, et bouclait vers le dernier. Griser sans desactiver
      ne trompe que l'oeil. Le bouton porte maintenant l'attribut
      disabled, et le bouclage est un choix explicite : boucle vrai ou
      faux des deux cotes, jamais l'un sans l'autre.

   3. La barre de progression comptait un delai que le composant ne
      possedait pas : rien ne garantissait qu'elle finisse en meme
      temps que le defilement reel. Ici, ou le carrousel tient le
      minuteur et avance lui-meme, ou il n'affiche pas de barre. Une
      barre qui ment est pire qu'une barre absente.

   4. Le nombre de vues et le nombre de teintes etaient deux reglages
      independants : depasser le second plantait. Il n'y a plus qu'une
      teinte, celle de la page.

   Usage :
     var c = MDGCarrousel.creer(hote, {
       total: 4, index: 0,
       onIndex: function(i){ … },
       duree: 5000,        // 0 = pas d'avance automatique, pas de barre
       boucle: true,
       nom: 'Temoignages'  // pour les lecteurs d'ecran
     });
     c.aller(2); c.majTotal(6); c.pause(); c.reprend(); c.detruire();
   ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var FLECHE_G = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var FLECHE_D = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  function moinsDeMouvement() {
    return global.matchMedia
      && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function creer(hote, options) {
    if (!hote) return null;
    var o = options || {};

    var total  = Math.max(1, o.total | 0);
    var index  = Math.min(Math.max(0, o.index | 0), total - 1);
    var duree  = Math.max(0, o.duree | 0);
    var boucle = o.boucle !== false;
    var onIndex = typeof o.onIndex === 'function' ? o.onIndex : function () {};

    /* Une barre de progression n'a de sens que si c'est CE composant
       qui tient le minuteur. Sous mouvement reduit, on n'avance pas
       tout seul : l'utilisateur a demande le contraire. */
    var auto = duree > 0 && !moinsDeMouvement();
    var minuteur = null;
    var enPause = false;

    var racine = document.createElement('div');
    racine.className = 'mdgc';
    racine.setAttribute('role', 'group');
    racine.setAttribute('aria-label', o.nom || 'Navigation');

    var bPrec = document.createElement('button');
    bPrec.type = 'button';
    bPrec.className = 'mdgc-fleche';
    bPrec.innerHTML = FLECHE_G;
    bPrec.setAttribute('aria-label', o.libellePrec || 'Vue précédente');

    var piste = document.createElement('div');
    piste.className = 'mdgc-piste';

    var bSuiv = document.createElement('button');
    bSuiv.type = 'button';
    bSuiv.className = 'mdgc-fleche';
    bSuiv.innerHTML = FLECHE_D;
    bSuiv.setAttribute('aria-label', o.libelleSuiv || 'Vue suivante');

    racine.appendChild(bPrec);
    racine.appendChild(piste);
    racine.appendChild(bSuiv);
    hote.appendChild(racine);

    var pastilles = [];

    function construirePastilles() {
      piste.innerHTML = '';
      pastilles = [];
      for (var i = 0; i < total; i++) {
        (function (rang) {
          var p = document.createElement('button');
          p.type = 'button';
          p.className = 'mdgc-pastille';
          p.setAttribute('aria-label', 'Vue ' + (rang + 1) + ' sur ' + total);
          /* Une pastille de 9 px n'a pas besoin d'une infobulle : elle
             dirait ce que sa position montre deja. */
          p.setAttribute('data-sans-infobulle', '');
          /* La marque visible est un element A PART du bouton. Le site
             impose 44 px minimum a tout bouton sur pointeur grossier, et
             il a raison : c'est la taille d'un doigt. Mais un repere de
             position n'a pas a mesurer 44 px pour autant. Le bouton
             garde donc sa grande zone tactile, la marque reste petite. */
          var marque = document.createElement('span');
          marque.className = 'mdgc-marque';
          p.appendChild(marque);
          if (auto) {
            var barre = document.createElement('span');
            barre.className = 'mdgc-barre';
            marque.appendChild(barre);
          }
          p.addEventListener('click', function () { aller(rang, true); });
          piste.appendChild(p);
          pastilles.push(p);
        })(i);
      }
    }

    function armer() {
      clearTimeout(minuteur);
      if (!auto || enPause) return;
      minuteur = setTimeout(function () {
        aller(boucle ? (index + 1) % total : Math.min(index + 1, total - 1), true);
      }, duree);
    }

    function peindre() {
      for (var i = 0; i < pastilles.length; i++) {
        var actif = i === index;
        pastilles[i].classList.toggle('est-active', actif);
        pastilles[i].setAttribute('aria-current', actif ? 'true' : 'false');
        var barre = pastilles[i].querySelector('.mdgc-barre');
        if (!barre) continue;
        /* Relancer l'animation : on la coupe, on force un reflow, on la
           repose. Sans le reflow le navigateur fusionne les deux etats
           et la barre ne repart pas. */
        barre.style.transition = 'none';
        barre.style.transform = 'scaleX(0)';
        if (actif && !enPause) {
          void barre.offsetWidth;
          barre.style.transition = 'transform ' + duree + 'ms linear';
          barre.style.transform = 'scaleX(1)';
        }
      }
      /* Sans bouclage, une extremite ne mene nulle part : le bouton est
         desactive pour de vrai, pas seulement grise. */
      bPrec.disabled = !boucle && index === 0;
      bSuiv.disabled = !boucle && index === total - 1;
    }

    /* Le sens de la parole est a sens unique : le carrousel ne previent
       QUE lorsqu'il decide lui-meme — un clic, ou son minuteur. Quand
       l'appelant lui dit ou il en est (aller ci-dessous), il se contente
       de se peindre. Sans cette regle, se synchroniser depuis l'exterieur
       redeclencherait l'appelant, qui resynchroniserait, sans fin. */
    function aller(rang, decideIci) {
      if (total < 1) return;
      index = boucle ? ((rang % total) + total) % total
                     : Math.min(Math.max(0, rang), total - 1);
      peindre();
      armer();
      if (decideIci) onIndex(index);
    }

    bPrec.addEventListener('click', function () { aller(index - 1, true); });
    bSuiv.addEventListener('click', function () { aller(index + 1, true); });

    construirePastilles();
    peindre();
    armer();

    return {
      element: racine,
      aller: function (i) { aller(i, false); },
      get index() { return index; },
      majTotal: function (n) {
        total = Math.max(1, n | 0);
        if (index > total - 1) index = total - 1;
        construirePastilles();
        peindre();
        armer();
      },
      pause:   function () { enPause = true;  clearTimeout(minuteur); peindre(); },
      reprend: function () { enPause = false; peindre(); armer(); },
      detruire: function () {
        clearTimeout(minuteur);
        if (racine.parentNode) racine.parentNode.removeChild(racine);
      }
    };
  }

  global.MDGCarrousel = { creer: creer };
})(window);
