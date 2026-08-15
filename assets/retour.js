/* ══════════════════════════════════════════════════════════════════
   RETOUR AU POINT DE DEPART
   ──────────────────────────────────────────────────────────────────
   POURQUOI. Le site principal est une page unique ; les tarifs,
   Uranus, le Learning Center, l'Atelier et les etudes de cas sont des
   pages a part entiere. Un visiteur arrete au chapitre Services qui
   allait voir les tarifs revenait au heros : le lien de retour
   pointait vers "/" en dur, sans rien savoir d'ou l'on venait. Il
   fallait re-parcourir la page pour retrouver sa place. Meme chose au
   retour de l'Atelier, du Learning Center et des etudes de cas.

   COMMENT. On note l'adresse quittee au moment du CLIC, jamais au
   dechargement : index.html remet deliberement le defilement a zero
   dans beforeunload, et une lecture plus tardive rapporterait
   toujours zero.

   Deux granularites, parce que les pages n'ont pas la meme nature :

     - la page unique porte deja sa section dans son adresse
       (/work, /services, /contact…) et son routeur sait s'y rendre.
       Lui rendre l'adresse suffit, et on ne note aucune position :
       une reprise au pixel se battrait avec ce routeur.
       Ces pages se declarent par data-mdg-page-unique sur <html>.

     - les autres n'ont pas de routeur : on leur rend la position
       exacte, en pixels, sans animation.

   Un lien de retour garde toujours son href d'ecriture comme repli.
   C'est lui qui sert aux arrivees directes — moteur de recherche,
   lien partage — quand aucun point de depart n'a ete note.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CLE_PILE    = 'mdg:retour:pile';
  var CLE_REPRISE = 'mdg:retour:reprise';

  var MAX_PILE   = 6;              /* au-dela, la plus ancienne sort */
  var PEREMPTION = 30 * 60 * 1000; /* un point de depart d'il y a une demi-heure ne veut plus rien dire */
  var FENETRE_REPRISE = 60 * 1000; /* la consigne de reprise ne vaut que pour la navigation qui suit */

  function lire(cle, defaut) {
    try {
      var v = sessionStorage.getItem(cle);
      return v ? (JSON.parse(v) || defaut) : defaut;
    } catch (e) { return defaut; }
  }
  function ecrire(cle, valeur) {
    try { sessionStorage.setItem(cle, JSON.stringify(valeur)); } catch (e) {}
  }
  function effacer(cle) {
    try { sessionStorage.removeItem(cle); } catch (e) {}
  }

  function ici() { return location.pathname + location.search; }

  /* La page unique se signale elle-meme : c'est elle qui sait qu'elle
     possede un routeur de sections. */
  function pageUnique() {
    return document.documentElement.hasAttribute('data-mdg-page-unique');
  }

  /* ── Empiler le point de depart ──────────────────────────────── */
  function empiler() {
    var pile = lire(CLE_PILE, []);
    var entree = {
      u: ici(),
      /* Sur la page unique, la position n'est pas notee : son adresse
         porte deja la section, et son routeur s'en charge. */
      y: pageUnique() ? 0 : Math.round(window.pageYOffset || 0),
      t: Date.now()
    };
    /* Un aller-retour repete ne doit pas faire grossir la pile : si le
       sommet designe deja cette page, on le remplace. */
    if (pile.length && pile[pile.length - 1].u === entree.u) pile.pop();
    pile.push(entree);
    while (pile.length > MAX_PILE) pile.shift();
    ecrire(CLE_PILE, pile);
  }

  /* ── Depiler, et demander la reprise de position ─────────────── */
  function depiler() {
    var pile = lire(CLE_PILE, []);
    var entree = pile.pop();
    ecrire(CLE_PILE, pile);
    if (entree && entree.y > 0) {
      ecrire(CLE_REPRISE, { u: entree.u, y: entree.y, t: Date.now() });
    } else {
      effacer(CLE_REPRISE);
    }
  }

  function valide(entree) {
    return !!entree && (Date.now() - entree.t) < PEREMPTION && entree.u !== ici();
  }

  /* Les liens de retour deja en place dans le site portent tous une de
     ces classes. Les reconnaitre evite d'avoir a se souvenir de
     l'attribut sur chaque nouvelle page : la regle vaut pour le site
     entier, pas page par page. data-retour reste la declaration
     explicite, pour un lien qui ne rentre dans aucune de ces familles. */
  var FAMILLES = '.nav-back, .footer-back, .u-nav-back, .tf-back, .cs-footer a[href^="/"]';

  function liensDeRetour() {
    var vus = [], sortie = [];
    var listes = [document.querySelectorAll('a[data-retour]'),
                  document.querySelectorAll(FAMILLES)];
    for (var l = 0; l < listes.length; l++) {
      for (var i = 0; i < listes[l].length; i++) {
        var a = listes[l][i];
        if (vus.indexOf(a) !== -1) continue;
        vus.push(a);
        /* Un lien de famille qui pointe ailleurs que vers une page du
           site n'est pas un retour : on le laisse tranquille. */
        if (!a.getAttribute('href') || a.getAttribute('href').charAt(0) !== '/') continue;
        a.setAttribute('data-retour', '');
        sortie.push(a);
      }
    }
    return sortie;
  }

  /* ── Donner sa cible a chaque lien de retour ─────────────────── */
  function resoudre() {
    var pile = lire(CLE_PILE, []);
    var sommet = pile.length ? pile[pile.length - 1] : null;
    var liens = liensDeRetour();
    for (var i = 0; i < liens.length; i++) {
      var a = liens[i];
      /* Le href d'ecriture est le repli. On le met de cote a la
         premiere resolution, avant d'y toucher. */
      if (!a.hasAttribute('data-retour-repli')) {
        a.setAttribute('data-retour-repli', a.getAttribute('href') || '/');
      }
      a.setAttribute('href', valide(sommet) ? sommet.u
                                            : a.getAttribute('data-retour-repli'));
    }
  }

  /* ── Reprendre la position a l'arrivee ───────────────────────── */
  function reprendre() {
    var r = lire(CLE_REPRISE, null);
    if (!r) return;
    effacer(CLE_REPRISE);
    if (r.u !== ici() || (Date.now() - r.t) > FENETRE_REPRISE) return;
    if (pageUnique()) return;

    /* Les images n'ont pas encore leur hauteur : le document est trop
       court pour qu'on puisse descendre jusqu'a la position visee. On
       repose donc la position tant qu'elle n'est pas atteinte, le
       temps que la mise en page se stabilise. */
    var essais = 0;
    (function poser() {
      var racine = document.documentElement;
      var precedent = racine.style.scrollBehavior;
      /* scroll-behavior:smooth est actif sur plusieurs pages : sans
         cette neutralisation la reprise serait ANIMEE, et le visiteur
         verrait la page redescendre toute seule. */
      racine.style.scrollBehavior = 'auto';
      window.scrollTo(0, r.y);
      racine.style.scrollBehavior = precedent;
      if (++essais < 14 && Math.abs((window.pageYOffset || 0) - r.y) > 2) {
        setTimeout(poser, 110);
      }
    })();
  }

  /* ── Ecoute des clics, en phase de CAPTURE ───────────────────────
     transition.js annule l'evenement en phase de bulle pour poser son
     voile : lire la position a ce moment-la serait trop tard. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;

    var url;
    try { url = new URL(a.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin) return;
    /* Ancre sur la page courante : on ne quitte rien. */
    if (url.pathname === location.pathname && url.search === location.search) return;

    if (a.hasAttribute('data-retour')) depiler();  /* on remonte : on ne s'empile pas soi-meme */
    else empiler();
  }, true);

  /* ── Lancement ───────────────────────────────────────────────── */
  function demarrer() { resoudre(); reprendre(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }

  /* Retour arriere depuis le cache de navigation : le document n'est
     pas re-execute, mais les liens de retour doivent designer le bon
     point de depart pour cet etat-ci de la pile. */
  window.addEventListener('pageshow', function (e) { if (e.persisted) resoudre(); });
})();
