/* ══════════════════════════════════════════════════════════════════
   TRANSITION DE PAGE, cote DEPART
   ──────────────────────────────────────────────────────────────────
   Le site passait sans transition vers atelier, tarifs, uranus et le
   Learning Center : douze liens y menaient, deux seulement fondaient.
   Le reste coupait net.

   Le principe tient en une phrase : l'ecran se couvre de la couleur de
   la page VISEE, puis on navigue. A l'arrivee, cette meme couleur se
   leve (le voile est pose dans la page, voir le bloc en tete de chaque
   fichier). Le raccord se fait donc sur une couleur commune, et non sur
   un fondu au noir arbitraire.

   Ce fichier ne s'occupe que du depart. Il est charge en defer : rien
   ici n'a besoin d'exister avant le premier rendu.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUIT = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* "Mouvement reduit" vise le DEPLACEMENT, pas le fondu : un fondu
     d'opacite ne bouge rien a l'ecran et reste explicitement admis.
     Le reste du site suit deja cette regle, la revelation de texte
     comprise. La transition joue donc dans les deux cas, simplement
     plus courte quand l'option est active. */
  var DUREE = REDUIT ? 180 : 320;   /* fondu de sortie */
  var SECOURS = 1400;               /* si la navigation n'aboutit pas, on decouvre */

  /* Couleur de fond de chaque destination, par prefixe de chemin. Elle
     doit correspondre au theme-color de la page visee, sinon le raccord
     se voit. Le prefixe /en/ est optionnel : les deux langues partagent
     la meme mise en page, donc le meme fond. */
  var FONDS = [
    [/^\/(?:en\/)?atelier(?:$|[\/?#])/,         '#ffffff'],
    [/^\/(?:en\/)?projets\//,                   '#ffffff'],
    [/^\/(?:en\/)?uranus(?:$|[\/?#])/,          '#08040f'],
    [/^\/(?:en\/)?learning-center(?:$|[\/?#])/, '#0B0C0D']
  ];
  var FOND_PAR_DEFAUT = '#060606';

  function fondDe(chemin) {
    for (var i = 0; i < FONDS.length; i++) {
      if (FONDS[i][0].test(chemin)) return FONDS[i][1];
    }
    return FOND_PAR_DEFAUT;
  }

  var voile = null;
  function poserVoile() {
    if (voile) return voile;
    voile = document.createElement('div');
    voile.className = 'mdg-sortie';
    voile.setAttribute('aria-hidden', 'true');
    voile.style.cssText =
      'position:fixed;inset:0;z-index:100001;opacity:0;pointer-events:none;' +
      'transition:opacity ' + DUREE + 'ms cubic-bezier(.4,0,.2,1)';
    document.body.appendChild(voile);
    return voile;
  }

  /* Un lien est-il une navigation interne ordinaire ? Tout le reste doit
     garder son comportement natif : nouvel onglet, telechargement,
     ancre, protocole tiers, clic milieu, clic avec modificateur. */
  function navigationOrdinaire(a, e) {
    if (!a || !a.href) return false;
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (a.getAttribute('rel') === 'external') return false;

    var url;
    try { url = new URL(a.href, location.href); } catch (_) { return false; }
    if (url.origin !== location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    /* Ancre sur la page courante : c'est un defilement, pas un depart. */
    if (url.pathname === location.pathname && url.search === location.search) return false;
    /* Lien direct vers un fichier : image, video, PDF, archive. Le
       navigateur l'affiche ou le telecharge, ce n'est pas une page et
       un voile n'aurait aucun sens devant. */
    if (/\.(png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|mov|pdf|zip|rar|txt|xml|json|css|js)$/i
        .test(url.pathname)) return false;
    return url;
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var url = navigationOrdinaire(a, e);
    if (!url) return;

    e.preventDefault();
    var v = poserVoile();
    v.style.background = fondDe(url.pathname);
    /* Forcer un calcul avant de changer l'opacite, sinon la transition
       n'a pas d'etat de depart et le voile apparait d'un coup. */
    void v.offsetWidth;
    v.style.opacity = '1';

    var parti = false;
    function partir() {
      if (parti) return;
      parti = true;
      location.href = url.href;
    }
    setTimeout(partir, DUREE);

    /* Si quoi que ce soit empeche la navigation, on ne laisse pas le
       visiteur devant un ecran plein. */
    setTimeout(function () {
      if (v) v.style.opacity = '0';
    }, SECOURS);
  }, false);

  /* Retour arriere depuis le cache de navigation : la page est restauree
     telle qu'elle etait, voile compris. Il faut le lever. */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && voile) voile.style.opacity = '0';
  });

  /* Filet pour le voile d'ARRIVEE, pose en dur dans la page. Il se leve
     par une animation CSS ; si celle-ci ne joue pas — onglet ouvert en
     arriere-plan, moteur qui l'ignore, feuille non chargee — le visiteur
     resterait devant un aplat de couleur. On le retire donc dans tous
     les cas, bien apres la duree normale de l'animation. */
  var arrivee = document.querySelector('.mdg-arrivee');
  if (arrivee) {
    setTimeout(function () {
      if (arrivee && arrivee.parentNode) arrivee.parentNode.removeChild(arrivee);
    }, 900);
  }
})();
