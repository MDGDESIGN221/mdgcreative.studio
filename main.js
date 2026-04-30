/* MDG Creative Studio — main.js
   Extrait de index.html — © MDG */

/* Lenis smooth scroll — desktop uniquement + respect prefers-reduced-motion */
(function(){
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
  s.onload = function(){
    if(typeof Lenis === 'undefined') return;
    // Appeler initLenis si déjà défini, sinon le poll s'en chargera
    if(typeof initLenis === 'function') initLenis();
  };
  document.head.appendChild(s);
})();

/* ─────────────────────────────── */

// Nav scrolled
(function(){const nav=document.querySelector('nav');if(!nav)return;window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>40)},{passive:true});})();

/* ─────────────────────────────── */

/* ── ARTISTS GRID — reveal + spotlight ── */
  (function(){
    var items = document.querySelectorAll('.ag-item');
    if(!items.length) return;

    /* Intersection Observer — déclenche le reveal */
    var observed = false;
    var io = new IntersectionObserver(function(entries){
      if(observed) return;
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          observed = true;
          items.forEach(function(item, i){
            setTimeout(function(){
              item.classList.add('ag-revealed');
            }, i * 90);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });

    if(items[0]) io.observe(items[0].closest('.artists-grid-wrap') || items[0]);

    /* Reduced motion — pas d'animation */
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      items.forEach(function(item){ item.classList.add('ag-revealed'); });
    }
  })();

/* ─────────────────────────────── */

(function(){
  var wrap  = document.getElementById('uranus-box-wrap');
  var inner = document.getElementById('uranus-box-inner');
  var hint  = document.getElementById('ub-hint');
  if(!inner) return;

  var D = 40; /* profondeur de la boîte en px */

  function buildFaces(){
    var W = wrap.offsetWidth;
    var H = Math.round(W * 4 / 3);
    if(!W || !H) return;

    inner.style.width  = W + 'px';
    inner.style.height = H + 'px';

    /* Front et Back : W x H, translateZ = D/2 */
    var f = document.getElementById('ub-front');
    f.style.cssText = 'width:'+W+'px;height:'+H+'px;left:0;top:0;transform:rotateY(0deg) translateZ('+(D/2)+'px);';

    var b = document.getElementById('ub-back');
    b.style.cssText = 'width:'+W+'px;height:'+H+'px;left:0;top:0;transform:rotateY(180deg) translateZ('+(D/2)+'px);';

    /* Right et Left : D x H, centrés sur W/2, translateZ = W/2 */
    var r = document.getElementById('ub-right');
    r.style.cssText = 'width:'+D+'px;height:'+H+'px;left:'+(W/2-D/2)+'px;top:0;transform:rotateY(90deg) translateZ('+(W/2)+'px);';

    var l = document.getElementById('ub-left');
    l.style.cssText = 'width:'+D+'px;height:'+H+'px;left:'+(W/2-D/2)+'px;top:0;transform:rotateY(-90deg) translateZ('+(W/2)+'px);';

    /* Top et Bottom : W x D, centrés sur H/2, translateZ = H/2 */
    var t = document.getElementById('ub-top');
    t.style.cssText = 'width:'+W+'px;height:'+D+'px;left:0;top:'+(H/2-D/2)+'px;transform:rotateX(90deg) translateZ('+(H/2)+'px);';

    var bt = document.getElementById('ub-bot');
    bt.style.cssText = 'width:'+W+'px;height:'+D+'px;left:0;top:'+(H/2-D/2)+'px;transform:rotateX(-90deg) translateZ('+(H/2)+'px);';
  }

  /* Wait for layout — double RAF + timeout pour garantir les dimensions */
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      buildFaces();
      setTimeout(buildFaces, 300);
    });
  });
  window.addEventListener('resize', buildFaces);

  /* Rotation */
  var rotX=-12, rotY=28, velX=0, velY=.18, dragging=false, lx=0, ly=0;

  function applyT(){ inner.style.transform='rotateX('+rotX+'deg) rotateY('+rotY+'deg)'; }
  applyT();

  wrap.addEventListener('mousedown',function(e){dragging=true;lx=e.clientX;ly=e.clientY;velX=0;velY=0;hint.style.opacity='0';e.preventDefault();});
  window.addEventListener('mousemove',function(e){
    if(!dragging)return;
    var dx=e.clientX-lx,dy=e.clientY-ly;
    rotY+=dx*.42;rotX-=dy*.42;velY=dx*.42;velX=-dy*.42;
    lx=e.clientX;ly=e.clientY;applyT();
  });
  window.addEventListener('mouseup',function(){dragging=false;});
  wrap.addEventListener('touchstart',function(e){e.preventDefault();dragging=true;lx=e.touches[0].clientX;ly=e.touches[0].clientY;velX=0;velY=0;hint.style.opacity='0';},{passive:false});
  window.addEventListener('touchmove',function(e){
    if(!dragging)return;
    var dx=e.touches[0].clientX-lx,dy=e.touches[0].clientY-ly;
    rotY+=dx*.42;rotX-=dy*.42;velY=dx*.42;velX=-dy*.42;
    lx=e.touches[0].clientX;ly=e.touches[0].clientY;applyT();
  },{passive:true});
  window.addEventListener('touchend',function(){dragging=false;});

  function animate(){
    requestAnimationFrame(animate);
    if(!dragging){
      velX+=(0-velX)*.04;velY+=(.18-velY)*.02;
      rotX+=velX;rotY+=velY;
      rotX=Math.max(-35,Math.min(35,rotX));
    }
    applyT();
  }
  animate();
})();

/* ─────────────────────────────── */

/* ── Stars ── */
(function(){
  var c = document.getElementById('uranusStars');
  if (!c) return;
  var h = '';
  var stars = [
    [15,20,1,3,.15,.6],[72,8,1,4,.1,.5],[88,35,1.5,5,.12,.55],
    [32,70,1,3.5,.1,.7],[55,85,1,4,.08,.45],[10,60,1.5,6,.1,.5],
    [93,75,1,3,.15,.65],[42,15,1,4.5,.1,.4],[67,50,1,5,.12,.5],
    [25,45,2,3,.2,.8],[80,22,1,4,.1,.6],[48,65,1.5,5,.12,.7],
    [18,80,1,3.5,.1,.5],[60,10,1,4,.08,.45],[35,55,1,6,.15,.6],
    [77,40,1.5,3,.1,.55],[5,35,1,4.5,.12,.7],[90,55,1,3,.1,.6],
    [50,30,1,5,.1,.5],[20,90,1,3.5,.12,.6],[70,25,1.5,4,.1,.55]
  ];
  stars.forEach(function(s){
    h += '<span style="left:'+s[0]+'%;top:'+s[1]+'%;width:'+s[2]+'px;height:'+s[2]+'px;--lo:'+s[4]+';--hi:'+s[5]+';--d:'+s[3]+'s;--delay:'+(Math.random()*4).toFixed(1)+'s"></span>';
  });
  c.innerHTML = h;
})();

/* ── Box image rotation ── */
(function(){
  var imgs = [
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_600/match-day-sadio_we5xzy.jpg',
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_600/gameday-gambie_men43y.jpg',
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_600/steadiness_gzcuvj.jpg'
  ];
  /* Précharger */
  imgs.forEach(function(src){ var i = new Image(); i.src = src; });
  var idx = 0;
  var el  = document.getElementById('uranusBoxImg');
  if (!el) return;
  setInterval(function(){
    idx = (idx + 1) % imgs.length;
    el.classList.add('fading');
    setTimeout(function(){
      el.src = imgs[idx];
      el.classList.remove('fading');
    }, 600);
  }, 3500);
})();
(function(){
  /* ======================================================
     ⬇️  MODIFIE UNIQUEMENT CETTE DATE pour repousser
     Format : 'AAAA-MM-JJ' — actuellement : 10 juin 2026
     ====================================================== */
  var end = new Date('2026-06-10T23:59:59').getTime();

  function pad(n){ return n < 10 ? '0'+n : ''+n; }
  function flash(el){ el.classList.add('flash'); setTimeout(function(){ el.classList.remove('flash'); }, 400); }

  var elD = document.getElementById('u-cd-d');
  var elH = document.getElementById('u-cd-h');
  var elM = document.getElementById('u-cd-m');
  var elS = document.getElementById('u-cd-s');
  var prevS = -1;
  var expired = false;

  function showExpired() {
    if (expired) return;
    expired = true;
    /* Hide countdown units, show expired message */
    var units = document.getElementById('u-cd-units');
    var lbl   = document.getElementById('u-cd-label');
    var expEl = document.getElementById('u-cd-expired');
    if (units) units.style.display = 'none';
    if (lbl)   lbl.style.display   = 'none';
    if (expEl) expEl.style.display = 'block';
    /* Update the banner text */
    var bannerTxt = document.querySelector('.u-banner-txt');
    if (bannerTxt) bannerTxt.innerHTML = 'La précommande est <strong>terminée</strong> — pack disponible au tarif officiel';
    /* Update the top badge */
    var bannerBadge = document.querySelector('.u-banner-badge');
    if (bannerBadge) { bannerBadge.textContent = '✅ Disponible'; bannerBadge.style.color='var(--u-accent3)'; bannerBadge.style.background='rgba(177,158,245,.1)'; bannerBadge.style.borderColor='rgba(177,158,245,.25)'; }
    /* Update order card: replace form with direct WA CTA */
    var form2 = document.getElementById('uranusForm2');
    if (form2) {
      form2.innerHTML =
        '<div style="text-align:center;padding:1rem 0 .5rem">' +
          '<div style="font-family:\'Syne\',sans-serif;font-size:.6rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:var(--u-gold);margin-bottom:.6rem;">⚡ Tarif officiel</div>' +
          '<div style="display:flex;align-items:baseline;gap:.4rem;justify-content:center;margin-bottom:.5rem">' +
            '<span style="font-family:\'Syne\',sans-serif;font-size:1.8rem;font-weight:900;color:var(--u-light);letter-spacing:-.05em">45 000</span>' +
            '<span style="font-size:.72rem;color:var(--u-dim)">FCFA</span>' +
          '</div>' +
          '<p style="font-size:.68rem;color:var(--u-dim);margin-bottom:1.25rem;line-height:1.55">La précommande est fermée.<br>Contacte MDG directement pour acquérir le pack.</p>' +
        '</div>' +
        '<a href="https://wa.me/221763772208?text=Salut%20MDG%2C%20je%20veux%20acheter%20l\'URANUS%20GFX%20PACK%20au%20tarif%20officiel%20%F0%9F%92%9C" target="_blank" rel="noopener" class="u-wa-btn" style="display:flex">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.859L.057 23.571a.75.75 0 0 0 .921.921l5.712-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.698-.528-5.228-1.446l-.374-.224-3.892 1.004 1.004-3.892-.224-.374A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>' +
          'Acheter sur WhatsApp' +
        '</a>' +
        '<p class="u-card-note">Paiement par <strong>Wave</strong> · Livraison immédiate · Accès à vie</p>';
    }
    /* Update card price display */
    var cardPriceNum = document.querySelector('.u-card-price-num');
    if (cardPriceNum) cardPriceNum.textContent = '45 000';
    var cardTag = document.querySelector('.u-card-tag');
    if (cardTag) { cardTag.textContent = '✅ Disponible maintenant'; cardTag.style.background='rgba(177,158,245,.08)'; cardTag.style.borderColor='rgba(177,158,245,.2)'; cardTag.style.color='var(--u-accent3)'; }
    /* Update hero price */
    var heroPriceNum = document.querySelector('.u-price-num');
    if (heroPriceNum) heroPriceNum.textContent = '45 000';
    var priceBadge = document.querySelector('.u-price-badge');
    if (priceBadge) priceBadge.textContent = '✅ Pack disponible · tarif officiel';
    /* Update hero eyebrow */
    var eyebrow = document.querySelector('.u-eyebrow');
    if (eyebrow) eyebrow.innerHTML = '<span class="u-eyebrow-dot"></span>Disponible maintenant';
    /* Update primary CTA */
    var btnPrimary = document.querySelector('.u-btn-primary');
    if (btnPrimary) {
      btnPrimary.textContent = 'Acheter sur WhatsApp →';
      btnPrimary.onclick = function(){ window.open('https://wa.me/221763772208?text=Salut%20MDG%2C%20je%20veux%20acheter%20l\'URANUS%20GFX%20PACK%20%F0%9F%92%9C','_blank'); };
    }
  }

  function tick(){
    var diff = end - Date.now();
    if (diff <= 0) {
      showExpired();
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    elD.textContent = pad(d);
    elH.textContent = pad(h);
    elM.textContent = pad(m);
    elS.textContent = pad(s);
    if (s !== prevS) { flash(elS); prevS = s; }
    if (m !== parseInt(elM.dataset.prev||'-1')) { flash(elM); elM.dataset.prev = m; }
  }
  tick();
  var cdInterval = setInterval(function(){ if(expired){ clearInterval(cdInterval); return; } tick(); }, 1000);
})();

/* ── Submit ── */
function uranusSubmit2() {
  var name  = document.getElementById('uName2').value.trim();
  var email = document.getElementById('uEmail2').value.trim();
  var phone = document.getElementById('uPhone2').value.trim();
  if (!name)  { document.getElementById('uName2').focus(); return; }
  if (!email || !email.includes('@')) { document.getElementById('uEmail2').focus(); return; }
  if (!phone) { document.getElementById('uPhone2').focus(); return; }

  var btn = document.querySelector('.u-submit2');
  btn.textContent = '⏳ Envoi…';
  btn.disabled = true;

  /* Web3Forms */
  var WEB3FORMS_KEY = '7db2eac5-7a46-40db-a864-8b99ea9f4b7b';
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: 'URANUS GFX PACK — Nouvelle précommande',
      from_name: 'MDG Creative Studio',
      name: name, email: email, phone: phone,
      message: 'Précommande URANUS GFX PACK · 35 000 FCFA\n\nNom : ' + name + '\nEmail : ' + email + '\nTéléphone : ' + phone
    })
  }).then(function(res){ return res.json(); }).then(function(data){
    if (data.success) {
      btn.textContent = '✓ Enregistré !';
      var waveBtn = document.getElementById('uranusWaveBtn2');
      waveBtn.style.display = 'flex';
      var hint = document.getElementById('uranusWaveInstructions');
      if (hint) hint.style.display = 'block';
      setTimeout(function() {
        document.getElementById('uranusForm2').style.display = 'none';
        document.getElementById('uranusSuccess2').style.display = 'block';
      }, 1500);
    } else {
      btn.textContent = '✕ Erreur — réessaie';
      btn.disabled = false;
      setTimeout(function(){ btn.textContent = 'Enregistrer ma précommande →'; }, 3000);
    }
  }).catch(function(){
    btn.textContent = '✕ Erreur réseau';
    btn.disabled = false;
    setTimeout(function(){ btn.textContent = 'Enregistrer ma précommande →'; }, 3000);
  });
}

function copyWaveNumber(btn) {
  navigator.clipboard.writeText('221763772208').then(function() {
    btn.textContent = '✅ Copié !';
    setTimeout(function(){ btn.textContent = '📋 Copier le numéro'; }, 2500);
  }).catch(function(){});
}

/* ─────────────────────────────── */

/* ── TABS ── */
function switchPricingTab(panel, btn) {
  document.querySelectorAll('.pricing-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.pricing-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
}

/* ══════════════════════════════════════════════
   CURTAIN REVEAL — Drag/Swipe pour révéler pack
══════════════════════════════════════════════ */
(function initCurtains() {
  function setupCurtain(curtain) {
    const face = curtain.querySelector('.pack-curtain-face');
    const progress = curtain.querySelector('.pack-curtain-progress');
    const light = curtain.querySelector('.pack-curtain-light');
    if (!face) return;

    let startX = 0, currentX = 0, isDragging = false, isOpened = false;
    const THRESHOLD = 0.45; // 45% de la largeur pour ouvrir

    function getClientX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onStart(e) {
      if (isOpened) return;
      isDragging = true;
      startX = getClientX(e);
      curtain.classList.add('dragging');
      curtain.classList.remove('snapping');
      face.style.transition = 'none';
      if (light) light.style.transition = 'none';
    }

    function onMove(e) {
      if (!isDragging || isOpened) return;
      currentX = getClientX(e) - startX;
      if (currentX < 0) { currentX = 0; }
      const ratio = Math.min(currentX / curtain.offsetWidth, 1);

      // Translate le rideau
      face.style.transform = `translateX(${currentX}px)`;

      // Progress bar
      if (progress) progress.style.width = (ratio * 100) + '%';

      // Lumière qui suit
      if (light) {
        light.style.left = (ratio * 110 - 15) + '%';
        light.style.opacity = ratio > 0.05 ? '1' : '0';
      }

      // Blur + brightness qui s'atténuent au glissement
      const blurVal = Math.max(0, 12 * (1 - ratio * 1.5));
      face.style.filter = `blur(${blurVal}px) brightness(${0.7 + ratio * 0.3})`;

      e.preventDefault();
    }

    function onEnd() {
      if (!isDragging || isOpened) return;
      isDragging = false;
      curtain.classList.remove('dragging');
      const ratio = currentX / curtain.offsetWidth;

      if (ratio >= THRESHOLD) {
        // Ouvrir directement
        isOpened = true;
        face.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1), filter .4s, opacity .4s';
        face.style.transform = 'translateX(110%)';
        face.style.filter = 'blur(20px) brightness(1.4)';
        face.style.opacity = '0';
        if (progress) progress.style.width = '100%';
        curtain.classList.add('opened');
        // Haptic feedback si dispo
        if (navigator.vibrate) navigator.vibrate(8);
      } else {
        // Snap back
        curtain.classList.add('snapping');
        face.style.transition = 'transform .42s cubic-bezier(.16,1,.3,1), filter .3s';
        face.style.transform = 'translateX(0)';
        face.style.filter = 'blur(0px) brightness(1)';
        if (progress) { progress.style.transition = 'width .4s cubic-bezier(.16,1,.3,1)'; progress.style.width = '0%'; }
        if (light) { light.style.opacity = '0'; }
        setTimeout(() => curtain.classList.remove('snapping'), 450);
      }
    }

    // Mouse
    curtain.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    // Touch
    curtain.addEventListener('touchstart', onStart, { passive: false });
    curtain.addEventListener('touchmove', onMove, { passive: false });
    curtain.addEventListener('touchend', onEnd);
  }

  // Initialiser tous les rideaux présents + futurs (au switch tab)
  function initAll() {
    document.querySelectorAll('.pack-curtain:not([data-curtain-ready])').forEach(c => {
      c.setAttribute('data-curtain-ready', '1');
      setupCurtain(c);
    });
  }

  // Lancer à l'init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Relancer initAll quand l'utilisateur change d'onglet pricing
  const _origSwitchForCurtains = window.switchPricingTab;
  window.switchPricingTab = function(panel, btn) {
    _origSwitchForCurtains(panel, btn);
    // Réinitialiser les rideaux seulement si le panel a bien changé (pas bloqué)
    var activePanel = document.querySelector('.pricing-panel.active');
    if (activePanel && activePanel.id === 'panel-' + panel) setTimeout(initAll, 50);
  };
})();

/* ── CONVERTISSEUR DE DEVISES ── */
// Taux fixes approximatifs par rapport à XOF
// 1 EUR = 655.957 XOF (taux fixe CFA officiel)
const xofRates = {
  USD: 1 / 608,
  EUR: 1 / 655.957,
  GBP: 1 / 780,
  CAD: 1 / 445,
  MAD: 1 / 60,
  DZD: 1 / 4.5,
};

const ccSymbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', MAD: 'DH', DZD: 'DA' };

function convertCurrency() {
  const raw = document.getElementById('ccAmount').value.replace(/\s/g, '');
  const amount = parseFloat(raw) || 0;
  Object.keys(xofRates).forEach(currency => {
    const el = document.getElementById('cc' + currency);
    if (!el) return;
    if (amount <= 0) { el.textContent = '—'; return; }
    const converted = amount * xofRates[currency];
    const sym = ccSymbols[currency];
    el.textContent = sym + converted.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  });
}

// Init au chargement
document.addEventListener('DOMContentLoaded', function() {
  convertCurrency();
});

/* ── DONNÉES MODALES ── */
const packData = {
  silver: {
    label: 'Pack Primaire', name: 'Silver', sub: 'Cover Simple — Single / Projet rapide',
    price: '25.000', unit: 'XOF',
    features: [
      '<strong>1 concept graphique</strong> créé sur mesure pour ta cover',
      '<strong>2 révisions</strong> incluses pour affiner le résultat',
      'Livrables en <strong>PNG / JPG haute résolution</strong>, prêts à l\'upload',
    ],
    option: '<strong>Option disponible :</strong> déclinaison story/post réseaux sociaux <strong>+5.000 XOF</strong>',
  },
  gold: {
    label: 'Pack Primaire', name: 'Gold', sub: 'Mixtape / EP — avec support réseaux inclus',
    price: '50.000', unit: 'XOF',
    features: [
      '<strong>1 concept graphique</strong> créé sur mesure pour ta cover',
      '<strong>3 révisions</strong> incluses',
      'Livrables PNG/JPG + <strong>tracklist complète</strong> mise en page',
      'Visuels réseaux sociaux : <strong>COMING SOON</strong> &amp; <strong>OUT NOW</strong>',
    ],
    option: '<strong>Option disponible :</strong> déclinaison story/post réseaux sociaux <strong>+5.000 XOF</strong>',
  },
  diamond: {
    label: 'Pack Primaire — Le + complet', name: 'Diamond', sub: 'Album — avec mini direction artistique offerte',
    price: '95.000', unit: 'XOF',
    features: [
      '<strong>1 concept graphique premium</strong> pour ta cover album',
      '<strong>4 révisions</strong> incluses',
      'PNG/JPG + <strong>tracklist pro</strong> + support réseaux sociaux complet',
      '<strong>Bonus offert :</strong> mini direction artistique (moodboard, palette, typographies)',
    ],
    option: null,
  },
  spotlight: {
    label: 'Pack Avancé', name: 'Spotlight', sub: 'Single Edition — communication complète pour un single',
    price: '175.000', unit: 'XOF',
    features: [
      '<strong>Cover</strong> du single, conçue et finalisée',
      '<strong>Motion cover simple</strong> (animation légère) + <strong>Canvas</strong> Spotify/Apple Music inclus',
      'Visuels promotionnels : <strong>COMING SOON</strong> &amp; <strong>OUT NOW</strong> prêts à poster',
      'Au choix : <strong>1 visualizer</strong> (vidéo musicale avec paroles défilantes) <em>ou</em> <strong>1 lyrics video</strong> animée',
    ],
    option: '<strong>Option disponible :</strong> déclinaison story/post réseaux sociaux <strong>+5.000 XOF</strong>',
  },
  magnum: {
    label: 'Pack Avancé', name: 'Magnum', sub: 'EP Edition — pour un EP de 2 à 7 titres',
    price: '450.000', unit: 'XOF',
    features: [
      '<strong>Cover EP</strong> niveau Gold + <strong>tracklist complète</strong> mise en page',
      '<strong>Motion cover avancé</strong> (animation travaillée) + <strong>Canvas</strong> Spotify/Apple',
      'Pack visuels promo complet : <strong>COMING SOON, REVEAL, PRE-SAVE, OUT NOW</strong>',
      '<strong>Visualizer ou lyrics video</strong> pour chaque titre du projet',
      '<strong>Pack bannières complet</strong> (YouTube, Facebook, X)',
    ],
    option: '<strong>Option disponible :</strong> déclinaison story/post <strong>+5.000 XOF</strong>',
  },
  prestige: {
    label: 'Pack Avancé', name: 'Prestige', sub: 'Album Edition — direction artistique complète',
    price: '800.000', unit: 'XOF',
    features: [
      '<strong>Cover album premium</strong> + <strong>mini direction artistique</strong> (moodboard, palette, univers visuel)',
      '<strong>Tracklist pro</strong> + <strong>motion cover premium</strong> (motion design poussé) + <strong>Canvas</strong>',
      '<strong>Pack visuels promo étendu</strong> pour toutes les étapes de sortie',
      '<strong>Visualizer ou lyrics video</strong> pour chaque titre du projet',
      '<strong>Template story réutilisable</strong> + déclinaisons story &amp; post pour tous les visuels',
      '<strong>Pack bannières complet</strong> (YouTube, Facebook, X)',
    ],
    option: '<strong>Option disponible :</strong> déclinaison story/post <strong>+5.000 XOF</strong>',
  },
  rollout: {
    label: 'Full Campaign', name: 'ROLLOUT', sub: 'Campagne premium sur 2 semaines — pour artistes sérieux et labels',
    price: '1.200.000', unit: 'XOF',
    features: [
      '<strong>Cover EP ou Album</strong> + tracklist professionnelle complète',
      '<strong>Motion cover avancé</strong> avec Canvas Spotify/Apple inclus',
      'Série complète de visuels promo : <strong>Teaser, Coming Soon, Reveal, Pre-Save, Out Now, Highlight Post</strong>',
      '<strong>Visualizer ou lyrics video</strong> pour chaque titre du projet',
      '<strong>Vidéo announcement</strong> de 10 à 15 secondes (annonce de sortie)',
      '<strong>Pack bannières complet</strong> : YouTube, Facebook et X',
      'Déclinaisons <strong>story + post</strong> pour l\'ensemble de tous les visuels',
      '<strong>Plan de diffusion sur 2 semaines</strong> avec calendrier de publication (Instagram, Facebook, X, TikTok)',
    ],
    option: null,
  },
};

function openPackModal(packId) {
  const d = packData[packId];
  if (!d) return;
  const modal = document.getElementById('packModal');
  modal.querySelector('.pack-modal-label').textContent = d.label;
  modal.querySelector('.pack-modal-name').textContent = d.name;
  modal.querySelector('.pack-modal-sub').textContent = d.sub;
  modal.querySelector('.pack-modal-price-val').textContent = d.price;
  modal.querySelector('.pack-modal-price-unit').textContent = d.unit;
  // Features
  const ul = modal.querySelector('.pack-modal-features');
  ul.innerHTML = d.features.map(f => `<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>${f}</span></li>`).join('');
  // Option
  const optEl = modal.querySelector('.pack-modal-option');
  if (d.option) { optEl.innerHTML = d.option; optEl.style.display = 'block'; }
  else { optEl.style.display = 'none'; }
  // Pre-fill subject
  modal.querySelector('#modal-subject').value = `Demande — Pack ${d.name}`;
  // Open
  const overlay = document.getElementById('packModalOverlay');
  overlay.classList.add('open');
  overlay.scrollTop = 0;
  // Prix visible pour les packs primaires (silver, gold, diamond), masqué pour les packs avancés
  const priceBlock = modal.querySelector('.pack-modal-price');
  const lockNote = modal.querySelector('.pack-modal-head > div[style*="rgba(200,250,100"]');
  var primaryPacks = ['silver', 'gold', 'diamond'];
  if (primaryPacks.indexOf(packId) !== -1) {
    if (priceBlock) priceBlock.style.display = 'block';
    if (lockNote) lockNote.style.display = 'none';
  } else {
    if (priceBlock) priceBlock.style.display = 'none';
    if (lockNote) lockNote.style.display = '';
  }
  // Stop lenis smooth scroll
  if (typeof lenis !== 'undefined' && lenis) lenis.stop();
  // Lock body scroll — sans position:fixed pour éviter le jump mobile
  const scrollY = window.scrollY;
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.height = '100%';
  document.body.dataset.scrollY = scrollY;
}

function closePackModal() {
  const overlay = document.getElementById('packModalOverlay');
  overlay.classList.remove('open');
  // Restore body scroll
  const scrollY = parseInt(document.body.dataset.scrollY || '0');
  document.documentElement.style.overflow = '';
  document.documentElement.style.height = '';
  window.scrollTo({top: scrollY, behavior: 'instant'});
  if (typeof lenis !== 'undefined' && lenis) lenis.start();
}

document.addEventListener('keydown', e => { if(e.key === 'Escape') closePackModal(); });

function submitPackForm(e) {
  e.preventDefault();
  const name    = document.getElementById('modal-name').value.trim();
  const contact = document.getElementById('modal-contact').value.trim();
  const subject = document.getElementById('modal-subject').value.trim();
  const msg     = document.getElementById('modal-msg').value.trim();
  if (!name || !contact) return;

  var btn = e.target.querySelector('.pack-modal-submit');
  var origText = btn.textContent;
  btn.textContent = '⏳ Envoi…';
  btn.disabled = true;

  var WEB3FORMS_KEY = '7db2eac5-7a46-40db-a864-8b99ea9f4b7b';
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: 'Demande Pack — ' + subject,
      from_name: 'MDG Creative Studio',
      name: name,
      email: contact.includes('@') ? contact : 'noreply@mdgcreative.studio',
      phone: contact.includes('@') ? '' : contact,
      message: 'Pack demandé : ' + subject + '\n\nNom : ' + name + '\nContact : ' + contact + '\n\nProjet :\n' + msg
    })
  }).then(function(res) { return res.json(); }).then(function(data) {
    if (data.success) {
      btn.textContent = '✓ Demande envoyée !';
      setTimeout(function() { closePackModal(); }, 2000);
    } else {
      btn.textContent = origText;
      btn.disabled = false;
      alert('Erreur lors de l\'envoi. Contacte-moi directement sur WhatsApp.');
    }
  }).catch(function() {
    btn.textContent = origText;
    btn.disabled = false;
    alert('Erreur réseau. Contacte-moi sur WhatsApp ou Instagram.');
  });
}

/* ─────────────────────────────── */

// ── LOADER PREMIUM ──
(function(){
  var loader = document.getElementById('loader');
  if(!loader) { window._loaderDoneAt = Date.now(); return; }

  // Bloquer le scroll pendant le loader
  document.body.style.overflow = 'hidden';

  // Apparition du contenu loader après 80ms (laisser le DOM respirer)
  setTimeout(function(){
    loader.classList.add('ready');
    // Animer aussi le label sous le titre
    var lbl = loader.querySelector('.loader-label');
    if(lbl){ lbl.style.opacity='1'; lbl.style.transform='translateY(0)'; }
  }, 80);

  // Fermeture : rideau s'écrase vers le bas après 1.6s
  setTimeout(function(){
    loader.classList.add('done');
    // Rétablir le scroll
    document.body.style.overflow = '';
    window._loaderDoneAt = Date.now();
    // Retirer du DOM après la transition (1.1s)
    setTimeout(function(){ loader.style.display = 'none'; }, 1200);
  }, 1600);
})();

// ── CURSEUR PREMIUM ──
const cur=document.getElementById('cur'),curR=document.getElementById('curR');
let mx=0,my=0,rx=0,ry=0;
if(window.matchMedia('(hover:hover)').matches){
  // Utiliser transform au lieu de left/top pour la fluidité GPU
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    cur.style.transform=`translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`;
  },{passive:true});
  (function a(){
    rx+=(mx-rx)*.12;
    ry+=(my-ry)*.12;
    curR.style.transform=`translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px))`;
    requestAnimationFrame(a);
  })();
  document.querySelectorAll('a,button,.ac-card,.svc-card,.sk,.trust-item,.work-card,.cov-card,.process-step,.cond-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cur.classList.add('g');curR.classList.add('g')});
    el.addEventListener('mouseleave',()=>{cur.classList.remove('g');curR.classList.remove('g')});
  });
  // Curseur "view" sur les images
  document.querySelectorAll('.work-card,.cov-card,.ac-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{curR.style.background='rgba(200,250,100,.08)'});
    el.addEventListener('mouseleave',()=>{curR.style.background=''});
  });
}
// ── SYSTÈME REVEAL — GSAP ScrollTrigger ──
// Logique : start 'top 85%' → l'élément commence à s'animer bien avant que l'user arrive dessus
//           end 'bottom -10%' → le reverse ne se déclenche que quand l'élément a quitté l'écran par le haut
//           Éléments liés → même timeline, trigger sur le parent
gsap.registerPlugin(ScrollTrigger);

const _E  = 'power3.out';
const _Eb = 'back.out(1.5)';

// Helper : ScrollTrigger standard — start quand le haut de l'élément passe à 85% du viewport
// end quand le bas sort à -10% (complètement hors écran par le haut) → reverse propre
function _st(trigger, extra) {
  return {
    scrollTrigger: {
      trigger,
      start: 'top 85%',
      end:   'bottom -10%',
      toggleActions: 'play reverse play reverse',
      ...(extra || {})
    }
  };
}

// Helper batch : même logique start/end pour les grilles
function _batch(sel, fromVars, toVars, staggerIn, staggerOut) {
  ScrollTrigger.batch(sel, {
    start: 'top 85%',
    end:   'bottom -10%',
    onEnter:     els => gsap.fromTo(els, fromVars, { ...toVars, stagger: staggerIn }),
    onLeaveBack: els => gsap.to(els, { ...fromVars, duration: toVars.duration * .55, stagger: staggerOut }),
    onEnterBack: els => gsap.to(els, { ...toVars, stagger: staggerIn }),
  });
}

// Helper stagger groupé : UN trigger sur le parent, les enfants s'animent en cascade
// → synchronisation garantie, pas de désynchronisation au scroll rapide
function _staggerTl(parentSel, childSel, fromVars, toVars, staggerVal) {
  const parent = document.querySelector(parentSel);
  if (!parent) return;
  const els = parent.querySelectorAll(childSel);
  if (!els.length) return;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: parent,
      start:   'top 85%',
      end:     'bottom -10%',
      toggleActions: 'play reverse play reverse'
    }
  });
  tl.fromTo(els, fromVars, { ...toVars, stagger: staggerVal ?? 0.08 });
}

// ── PORTFOLIO ──
// Header groupé en timeline : label → h2 → count → tabs, trigger sur la section
{
  const portHdr = document.querySelector('#portfolio') || document.querySelector('.port-h2')?.closest('section');
  const tl = gsap.timeline({ scrollTrigger: { trigger: portHdr || '.port-h2', start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  const _ph2 = document.querySelector('.port-h2');
  const _pLbl = document.querySelector('.port-extract-label');
  const _pCnt = document.querySelector('.port-count');
  const _pTabs = document.querySelector('.port-tabs-wrap');
  if (_ph2)   tl.fromTo(_ph2,   { opacity:0, y:40 },     { opacity:1, y:0, duration:.85, ease:_E });
  if (_pLbl)  tl.fromTo(_pLbl,  { opacity:0, y:20 },     { opacity:1, y:0, duration:.6, ease:_E }, '-=0.55');
  if (_pCnt)  tl.fromTo(_pCnt,  { opacity:0, scale:.8 }, { opacity:1, scale:1, duration:.65, ease:_Eb }, '-=0.45');
  if (_pTabs) tl.fromTo(_pTabs, { opacity:0, y:20 },     { opacity:1, y:0, duration:.6, ease:_E }, '-=0.4');
}
// Cards : batch sur le parent commun pour sync parfaite
_batch('.work-card',
  { opacity:0, y:50, scale:.95 },
  { opacity:1, y:0, scale:1, duration:.7, ease:_E },
  .08, .04
);
_batch('.cov-card',
  { opacity:0, y:40, scale:.96 },
  { opacity:1, y:0, scale:1, duration:.65, ease:_E },
  .07, .04
);
gsap.fromTo('.work-footer', { opacity:0, x:40 }, { opacity:1, x:0, duration:.7, ease:_E, ..._st('.work-footer') });

// ── ABOUT ──
// photo + contenu liés → même timeline, trigger sur #about
{
  const _aPhoto   = document.querySelector('.about-v2-photo');
  const _aContent = document.querySelector('.about-v2-content');
  if (_aPhoto && _aContent) {
    const tl = gsap.timeline({ scrollTrigger: { trigger:'#about', start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
    tl.fromTo(_aPhoto,   { opacity:0, x:-60, rotate:-2 }, { opacity:1, x:0, rotate:0, duration:.95, ease:_E })
      .fromTo(_aContent, { opacity:0, x:60 },              { opacity:1, x:0, duration:.85, ease:_E }, '-=0.65');
  }
}
// Contenu textuel : sec-label → badge → h2 → intro → body, enchaîné depuis about-v2-content
{
  const _aLabel  = document.querySelector('.about-v2-content .sec-label');
  const _aBadge  = document.querySelector('.av2-badge-txt') || document.querySelector('.av2-badge');
  const _ah2     = document.querySelector('.about-v2-h2');
  const _aIntro  = document.querySelector('.about-v2-intro');
  const _aBody   = document.querySelector('.about-v2-body');
  const anchor   = document.querySelector('.about-v2-h2') || document.querySelector('.about-v2-content');
  if (anchor) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: anchor, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
    if (_aLabel) tl.fromTo(_aLabel, { opacity:0, clipPath:'inset(0 100% 0 0)' }, { opacity:1, clipPath:'inset(0 0% 0 0)', duration:.6, ease:_E });
    if (_ah2)    tl.fromTo(_ah2,    { opacity:0, y:24 }, { opacity:1, y:0, duration:.7, ease:_E }, '-=0.25');
    if (_aIntro) tl.fromTo(_aIntro, { opacity:0, y:18 }, { opacity:1, y:0, duration:.65, ease:_E }, '-=0.45');
    if (_aBody)  tl.fromTo(_aBody,  { opacity:0, y:14 }, { opacity:1, y:0, duration:.6, ease:_E }, '-=0.4');
  }
  // badge "Disponible · Kaolack, SN" → animé avec la photo
  if (_aBadge) {
    gsap.fromTo(_aBadge, { opacity:0, y:12, scale:.9 }, { opacity:1, y:0, scale:1, duration:.6, ease:_Eb,
      scrollTrigger:{ trigger:'#about', start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  }
}
_staggerTl('#about', '.sk',         { opacity:0, y:24, scale:.92 }, { opacity:1, y:0, scale:1, duration:.65, ease:_E }, 0.07);
_staggerTl('#about', '.about-text', { opacity:0, y:16 },            { opacity:1, y:0, duration:.6, ease:_E }, 0.06);

// ── SERVICES ──
// sec-label → h2 → sec-sub → cards, timeline depuis #services
{
  const _svcLbl = document.querySelector('.svc-header .sec-label');
  const _svcH2  = document.querySelector('.svc-header .svc-h2');
  const _svcSub = document.querySelector('.svc-header .sec-sub');
  const _sSec   = document.querySelector('.svc-secondary');
  const svcAnchor = document.querySelector('#services') || document.querySelector('.svc-header');
  if (svcAnchor) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: svcAnchor, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
    if (_svcLbl) tl.fromTo(_svcLbl, { opacity:0, clipPath:'inset(0 100% 0 0)' }, { opacity:1, clipPath:'inset(0 0% 0 0)', duration:.65, ease:_E });
    if (_svcH2)  tl.fromTo(_svcH2,  { opacity:0, y:28 }, { opacity:1, y:0, duration:.8, ease:_E }, '-=0.3');
    if (_svcSub) tl.fromTo(_svcSub, { opacity:0, y:18 }, { opacity:1, y:0, duration:.65, ease:_E }, '-=0.5');
  }
  // svc-secondary : label + items en stagger depuis le conteneur
  if (_sSec) {
    const tl2 = gsap.timeline({ scrollTrigger: { trigger: _sSec, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
    const _sLabel = _sSec.querySelector('.svc-secondary-label');
    const _sItems = _sSec.querySelectorAll('.svc-secondary-item');
    if (_sLabel) tl2.fromTo(_sLabel, { opacity:0, y:16 }, { opacity:1, y:0, duration:.6, ease:_E });
    if (_sItems.length) tl2.fromTo(_sItems, { opacity:0, x:-24 }, { opacity:1, x:0, duration:.55, ease:_E, stagger:.07 }, '-=0.3');
  }
}

_staggerTl('.svc-grid', '.svc-card', { opacity:0, y:50, scale:.93 }, { opacity:1, y:0, scale:1, duration:.65, ease:_E }, 0.09);
// tout le header collabs → une timeline, trigger sur la section
{
  const collabsSec = document.querySelector('#collabs') || document.querySelector('.collabs-hdr')?.closest('section');
  const tl = gsap.timeline({ scrollTrigger: { trigger: collabsSec || '.collabs-hdr', start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  const _cHdr   = document.querySelector('.collabs-hdr');
  const _cTitle = document.querySelector('.collabs-main-title');
  const _cSub   = document.querySelector('.collabs-main-sub');
  const _cMq    = document.querySelector('.collabs-marquee-wrap');
  const _cSub2  = document.querySelector('.collabs-sub');
  const _cTrust = document.querySelector('.trust-strip');
  if (_cHdr)   tl.fromTo(_cHdr,   { opacity:0, x:-44 },    { opacity:1, x:0, duration:.8, ease:_E });
  if (_cTitle) tl.fromTo(_cTitle, { opacity:0, x:44 },     { opacity:1, x:0, duration:.8, ease:_E }, '-=0.65');
  if (_cSub)   tl.fromTo(_cSub,   { opacity:0, y:20 },     { opacity:1, y:0, duration:.6, ease:_E }, '-=0.5');
  if (_cMq)    tl.fromTo(_cMq,    { opacity:0, scaleX:.88 },{ opacity:1, scaleX:1, duration:.7, ease:_E }, '-=0.3');
  if (_cSub2)  tl.fromTo(_cSub2,  { opacity:0, y:16 },     { opacity:1, y:0, duration:.55, ease:_E }, '-=0.3');
  if (_cTrust) tl.fromTo(_cTrust, { opacity:0, y:20 },     { opacity:1, y:0, duration:.6, ease:_E }, '-=0.25');
}

// ── SOCIAL PROOF ──
// sec-label → h2 → sp-sub → sp-feature → tout enchaîné, trigger sur .sp-header
// (la section #testimonials est display:none — fantôme. La vraie SP est dans #collabs)
{
  const _spLbl = document.querySelector('.sp-header .sec-label');
  const _spH2  = document.querySelector('.sp-header .svc-h2, .sp-header h2');
  const _spSub = document.querySelector('.sp-header .sp-sub');
  const _spF   = document.querySelector('.sp-feature');
  const spAnchor = document.querySelector('.sp-header');
  if (spAnchor) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: spAnchor, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
    if (_spLbl) tl.fromTo(_spLbl, { opacity:0, clipPath:'inset(0 100% 0 0)' }, { opacity:1, clipPath:'inset(0 0% 0 0)', duration:.65, ease:_E });
    if (_spH2)  tl.fromTo(_spH2,  { opacity:0, y:30 }, { opacity:1, y:0, duration:.8, ease:_E }, '-=0.35');
    if (_spSub) tl.fromTo(_spSub, { opacity:0, y:18 }, { opacity:1, y:0, duration:.65, ease:_E }, '-=0.5');
  }
  // sp-feature : glisse depuis la gauche comme un pieter-step
  if (_spF) {
    gsap.fromTo(_spF, { opacity:0, x:-60, y:16 }, { opacity:1, x:0, y:0, duration:.9, ease:_E,
      scrollTrigger: { trigger: _spF, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  }
}
// vcards : même style que .pieter-step — alternance gauche/droite, trigger individuel
document.querySelectorAll('.sp-vcard').forEach((el, i) => {
  const dir = i % 2 === 0 ? -60 : 60;
  gsap.fromTo(el,
    { opacity:0, x: dir, y:20 },
    { opacity:1, x:0, y:0, duration:.9, ease:_E,
      scrollTrigger:{ trigger:el, start:'top 88%', end:'bottom -10%', toggleActions:'play reverse play reverse' } }
  );
  // Contenu interne en cascade (thumb → source → artist → desc)
  const inner = [
    el.querySelector('.sp-vcard-thumb'),
    el.querySelector('.sp-vcard-source'),
    el.querySelector('.sp-vcard-artist'),
    el.querySelector('.sp-vcard-desc'),
  ].filter(Boolean);
  if(inner.length){
    gsap.fromTo(inner,
      { opacity:0, y:16 },
      { opacity:1, y:0, duration:.6, ease:_E, stagger:.08, delay:.18,
        scrollTrigger:{ trigger:el, start:'top 88%', end:'bottom -10%', toggleActions:'play reverse play reverse' } }
    );
  }
});

// ── PROCESS ──
// header puis steps en cascade depuis la section
{
  const procSec = document.querySelector('#process') || document.querySelector('.process-header')?.closest('section');
  const tl = gsap.timeline({ scrollTrigger: { trigger: procSec || '.process-header', start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  const _pH = document.querySelector('.process-header');
  if (_pH) tl.fromTo(_pH, { opacity:0, y:30 }, { opacity:1, y:0, duration:.75, ease:_E });
}
// Chaque step a son propre trigger (éléments distants verticalement, pas liés visuellement entre eux)
document.querySelectorAll('.pieter-step').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity:0, x: i%2===0 ? -60 : 60, y:20 },
    { opacity:1, x:0, y:0, duration:.9, ease:_E,
      scrollTrigger:{ trigger:el, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } }
  );
});
_staggerTl('.proc-conds', '.proc-cond', { opacity:0, y:28, scale:.94 }, { opacity:1, y:0, scale:1, duration:.65, ease:_E }, 0.08);

// ── PRICING ──
// pricing-header complet : sec-label → h2 → p → scope-note → pricing-tabs → tout enchaîné
{
  const _pricLbl  = document.querySelector('.pricing-header .sec-label');
  const _pricH2   = document.querySelector('.pricing-header h2');
  const _pricP    = document.querySelector('.pricing-header p');
  const _pricNote = document.querySelector('.pricing-scope-note');
  const _pricTabs = document.querySelector('.pricing-tabs');
  const tl = gsap.timeline({ scrollTrigger: { trigger:'#pricing', start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  if (_pricLbl)  tl.fromTo(_pricLbl,  { opacity:0, clipPath:'inset(0 100% 0 0)' }, { opacity:1, clipPath:'inset(0 0% 0 0)', duration:.65, ease:_E });
  if (_pricH2)   tl.fromTo(_pricH2,   { opacity:0, x:-44 }, { opacity:1, x:0, duration:.8, ease:_E }, '-=0.3');
  if (_pricP)    tl.fromTo(_pricP,    { opacity:0, y:20 },  { opacity:1, y:0, duration:.65, ease:_E }, '-=0.5');
  if (_pricNote) tl.fromTo(_pricNote, { opacity:0, y:14 },  { opacity:1, y:0, duration:.55, ease:_E }, '-=0.4');
  if (_pricTabs) tl.fromTo(_pricTabs, { opacity:0, y:18 },  { opacity:1, y:0, duration:.6,  ease:_E }, '-=0.35');
}
// Pack-cards (panel-primaires, toujours visible) : batch classique
_batch('.pack-card',
  { opacity:0, y:60, rotation:2 },
  { opacity:1, y:0, rotation:0, duration:.75, ease:_E },
  .09, .05
);

// ── PANELS CACHÉS (avancés, rollout, addons) ──
// Les éléments dans pricing-panel display:none ne peuvent pas être animés par ScrollTrigger
// (position incalculable). On les initialise à opacity:1 immédiatement,
// et on ajoute une animation d'entrée au moment où l'onglet s'ouvre.
// Forcer opacity:1 sur tous les éléments dans les panels non-actifs dès le départ
document.querySelectorAll('.pricing-panel:not(.active) .adv-card,\
  .pricing-panel:not(.active) .rollout-card,\
  .pricing-panel:not(.active) .addons-intro,\
  .pricing-panel:not(.active) .addon-card').forEach(el => {
  gsap.set(el, { opacity:1, x:0, y:0, scale:1, rotation:0, clearProps:'all' });
});

// Wrapper switchPricingTab pour animer l'entrée des cards à l'ouverture
{
  const _origSwitch = window.switchPricingTab;
  window.switchPricingTab = function(panel, btn) {
    _origSwitch(panel, btn);
    const activePanel = document.getElementById('panel-' + panel);
    if (!activePanel) return;
    // Animation d'entrée selon le panel
    if (panel === 'avances') {
      const cards = activePanel.querySelectorAll('.adv-card');
      gsap.fromTo(cards, { opacity:0, y:40, scale:.95 }, { opacity:1, y:0, scale:1, duration:.65, ease:_E, stagger:.1, clearProps:'transform' });
    } else if (panel === 'rollout') {
      const rc = activePanel.querySelector('.rollout-card');
      if (rc) gsap.fromTo(rc, { opacity:0, scale:.9, y:30 }, { opacity:1, scale:1, y:0, duration:.75, ease:_Eb, clearProps:'transform' });
    } else if (panel === 'addons') {
      const ai = activePanel.querySelector('.addons-intro');
      const ac = activePanel.querySelectorAll('.addon-card');
      if (ai) gsap.fromTo(ai, { opacity:0, y:20 }, { opacity:1, y:0, duration:.5, ease:_E });
      if (ac.length) gsap.fromTo(ac, { opacity:0, y:30, scale:.94 }, { opacity:1, y:0, scale:1, duration:.6, ease:_E, stagger:.07, delay:.15, clearProps:'transform' });
    } else if (panel === 'primaires') {
      const cards = activePanel.querySelectorAll('.pack-card');
      gsap.fromTo(cards, { opacity:0, y:40, rotation:1 }, { opacity:1, y:0, rotation:0, duration:.65, ease:_E, stagger:.09, clearProps:'transform' });
    }
  };
}

// rollout-card dans le panel actif initial : on le laisse visible (ScrollTrigger ne peut pas y accéder)
gsap.set('.pricing-panel:not(.active) .rollout-card', { opacity:1, clearProps:'all' });

// addon-cards visibles par défaut aussi
gsap.set('.addon-card', { opacity:1, clearProps:'all' });
gsap.set('.addons-intro', { opacity:1, clearProps:'all' });

// ── FAQ ──
// header → items, timeline depuis la section
{
  const faqSec = document.querySelector('#faq') || document.querySelector('.faq-header')?.closest('section');
  const tl = gsap.timeline({ scrollTrigger: { trigger: faqSec || '.faq-header', start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  const _fH = document.querySelector('.faq-header');
  if (_fH) tl.fromTo(_fH, { opacity:0, y:30 }, { opacity:1, y:0, duration:.75, ease:_E });
}
_batch('.faq-item2',
  { opacity:0, y:20 },
  { opacity:1, y:0, duration:.65, ease:_E },
  .07, .04
);

// ── CONTACT ──
// label → titre → info-list → liens directs → tout enchaîné, trigger sur #contact
{
  const _cLbl  = document.querySelector('#contact .sec-label');
  const _cH2   = document.querySelector('.contact-h2');
  const _cInfo = document.querySelector('.info-list');
  const contactSec = document.querySelector('#contact');
  if (contactSec) {
    const tl = gsap.timeline({ scrollTrigger: { trigger:contactSec, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
    if (_cLbl)  tl.fromTo(_cLbl,  { opacity:0, clipPath:'inset(0 100% 0 0)' }, { opacity:1, clipPath:'inset(0 0% 0 0)', duration:.7, ease:_E });
    if (_cH2)   tl.fromTo(_cH2,   { opacity:0, y:36 },  { opacity:1, y:0, duration:.85, ease:_E }, '-=0.45');
    if (_cInfo) tl.fromTo(_cInfo, { opacity:0, x:-44 }, { opacity:1, x:0, duration:.8, ease:_E }, '-=0.5');
  }
}
// liens directs : batch (peuvent être hors vue au chargement initial de la section)
_batch('.contact-direct-link',
  { opacity:0, x:40, scale:.96 },
  { opacity:1, x:0, scale:1, duration:.65, ease:_E },
  .08, .05
);

// ── CITATION ──
// les 3 éléments liés → timeline depuis .citation-text
{
  const _cEy  = document.querySelector('.citation-eyebrow');
  const _cTxt = document.querySelector('.citation-text');
  const _cAu  = document.querySelector('.citation-author');
  if (_cTxt) {
    const tl = gsap.timeline({ scrollTrigger: { trigger:_cTxt, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
    if (_cEy)  tl.fromTo(_cEy,  { opacity:0, y:16 },           { opacity:1, y:0, duration:.6, ease:_E });
    tl.fromTo(_cTxt,             { opacity:0, x:54, skewX:-4 }, { opacity:1, x:0, skewX:0, duration:.95, ease:_E }, '-=0.3');
    if (_cAu)  tl.fromTo(_cAu,  { opacity:0, y:16 },           { opacity:1, y:0, duration:.6, ease:_E }, '-=0.4');
  }
}

// ── URANUS ──
// Trigger individuel sur chaque bloc pour éviter les délais de calcul
{
  const _uH = document.querySelector('.u-hero-copy');
  const _uV = document.querySelector('.u-box-visual');
  const _uO = document.querySelector('.u-order-card');
  // Section Uranus : trigger sur la section parente
  const uSec = _uH?.closest('section') || document.querySelector('#uranus');
  if (_uH) gsap.fromTo(_uH, { opacity:0, y:36 }, { opacity:1, y:0, duration:.85, ease:_E,
    scrollTrigger:{ trigger:_uH, start:'top 88%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  if (_uV) gsap.fromTo(_uV, { opacity:0, scale:.92, rotate:3 }, { opacity:1, scale:1, rotate:0, duration:.9, ease:_Eb,
    scrollTrigger:{ trigger:_uV, start:'top 88%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
  if (_uO) gsap.fromTo(_uO, { opacity:0, y:32 }, { opacity:1, y:0, duration:.75, ease:_E,
    scrollTrigger:{ trigger:_uO, start:'top 88%', end:'bottom -10%', toggleActions:'play reverse play reverse' } });
}

// ── Tous les sec-label restants (clip-path) ──
// Ceux déjà animés dans leur section sont ignorés grâce au check ScrollTrigger
document.querySelectorAll('.sec-label').forEach(el => {
  // Vérifie qu'aucun ScrollTrigger n'est déjà attaché à cet élément
  const existing = ScrollTrigger.getAll().find(st => st.vars.trigger === el || st.trigger === el);
  if (!existing) {
    gsap.fromTo(el,
      { opacity:0, clipPath:'inset(0 100% 0 0)' },
      { opacity:1, clipPath:'inset(0 0% 0 0)', duration:.7, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } }
    );
  }
});

// ── Tous les sec-num restants ──
document.querySelectorAll('.sec-num').forEach(el => {
  const existing = ScrollTrigger.getAll().find(st => st.vars.trigger === el || st.trigger === el);
  if (!existing) {
    gsap.fromTo(el,
      { opacity:0, x:-32 },
      { opacity:1, x:0, duration:.65, ease:_E,
        scrollTrigger:{ trigger:el, start:'top 85%', end:'bottom -10%', toggleActions:'play reverse play reverse' } }
    );
  }
});

// ── GARDE-FOU MOBILE ──
// Si un élément animé par GSAP reste à opacity:0 après 5s (bug de position sur mobile,
// section cachée, etc.), on le force à opacity:1 pour ne jamais bloquer du contenu.
setTimeout(() => {
  document.querySelectorAll('.sp-feature, .sp-header, .sp-vcard, .adv-card, .rollout-card, .addons-intro, .addon-card, .u-hero-copy, .u-box-visual, .u-order-card').forEach(el => {
    const computed = window.getComputedStyle(el);
    if (parseFloat(computed.opacity) < 0.1) {
      gsap.set(el, { opacity:1, clearProps:'all' });
    }
  });
}, 5000);



function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 4000;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(ease * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

// Pour les stats dans le hero : démarrer après le loader (2.8s) + animations hero
setTimeout(() => {
  document.querySelectorAll('.hero-stats [data-target]').forEach(el => {
    el._counterDone = true; // marquer comme fait pour éviter le double déclenchement
    animateCounter(el);
  });
}, 3400);

// Pour les autres compteurs hors hero : IntersectionObserver (déclenché au scroll)
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target._counterDone) {
      e.target._counterDone = true;
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, {threshold: .5});
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));
const sObs=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){document.querySelectorAll('.nav-links a').forEach(l=>l.classList.remove('active'));const a=document.querySelector(`.nav-links a[href="#${x.target.id}"]`);if(a)a.classList.add('active')}});},{threshold:.3});
document.querySelectorAll('section[id]').forEach(s=>sObs.observe(s));
const burger=document.getElementById('burger'),mob=document.getElementById('mobMenu'),mobOv=document.getElementById('mobOverlay');
function openMobMenu(){
  mob.classList.add('open');
  if(mobOv)mobOv.classList.add('open');
  burger.setAttribute('aria-expanded','true');
  const _msy=window.scrollY;
  document.documentElement.style.overflow='hidden';
  document.documentElement.style.height='100%';
  document.body.dataset.mobScrollY=_msy;
  setTimeout(()=>{const first=mob.querySelector('a,button:not(.mob-close)');if(first)first.focus();},80);
}
function closeMobMenu(skipScrollRestore){
  mob.classList.remove('open');
  if(mobOv)mobOv.classList.remove('open');
  burger.setAttribute('aria-expanded','false');
  document.documentElement.style.overflow='';
  document.documentElement.style.height='';
  if(!skipScrollRestore){
    const _msy2=parseInt(document.body.dataset.mobScrollY||'0');
    window.scrollTo({top:_msy2,behavior:'instant'});
  }
  burger.focus();
}
function cm(href){
  closeMobMenu(true); // ne pas restaurer la position, laisser le href gérer
  if(href){
    // Délai suffisant pour que le unlock overflow soit effectif sur mobile lent
    setTimeout(function(){
      var id=href.replace('#','');
      var el=document.getElementById(id);
      if(!el) return;
      // Utiliser Lenis si dispo (desktop), sinon scrollIntoView natif (mobile)
      if(typeof lenis !== 'undefined' && lenis){
        lenis.scrollTo(el, {offset: -80, duration: 1.4});
      } else {
        el.scrollIntoView({behavior:'smooth',block:'start'});
      }
    }, 160); // 160ms — laisse le temps au overflow:'' d'être appliqué
  }
}
// ── HELPER SCROLL GLOBAL — Lenis si dispo, sinon natif ──
window.lenisScroll = function(id){
  var el = document.getElementById(id);
  if(!el) return;
  if(typeof lenis !== 'undefined' && lenis){
    lenis.scrollTo(el, {offset: -80, duration: 1.4});
  } else {
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }
};
(function(){
  let startY=0,startT=0;
  mob.addEventListener('touchstart',function(e){startY=e.touches[0].clientY;startT=Date.now();},{passive:true});
  mob.addEventListener('touchend',function(e){
    const dy=e.changedTouches[0].clientY-startY;
    const dt=Date.now()-startT;
    if(dy>80&&dt<350)closeMobMenu();
  },{passive:true});
})();
burger.setAttribute('aria-expanded','false');
burger.setAttribute('aria-controls','mobMenu');
burger.setAttribute('aria-label','Menu principal');
mob.setAttribute('aria-modal','true');
mob.setAttribute('role','dialog');
burger.addEventListener('click',openMobMenu);
document.getElementById('mobClose').addEventListener('click',closeMobMenu);
if(mobOv)mobOv.addEventListener('click',closeMobMenu);
// Escape closes menu
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&mob.classList.contains('open'))closeMobMenu();
  // Focus trap inside menu
  if(e.key==='Tab'&&mob.classList.contains('open')){
    const focusable=mob.querySelectorAll('a,button');
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
// Close on overlay click (clicking outside nav links)
mob.addEventListener('click',function(e){if(e.target===mob)closeMobMenu();});
// ── SMOOTH CAROUSEL SCROLL — RAF-based, zero lag ──
function carouselScrollTo(track, targetLeft) {
  var start = track.scrollLeft;
  var dist = targetLeft - start;
  if (Math.abs(dist) < 2) return;
  var startTime = null;
  var duration = 320;
  function ease(t){ return t<.5 ? 2*t*t : -1+(4-2*t)*t; }
  function step(ts){
    if(!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    track.scrollLeft = start + dist * ease(progress);
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Portfolio carousel
(function(){
  const track=document.getElementById('workTrack');
  const prev=document.getElementById('workPrev');
  const next=document.getElementById('workNext');
  const curEl=document.getElementById('workCur');
  const totEl=document.getElementById('workTot');
  if(!track||!prev||!next||!curEl||!totEl)return;
  const cards=track.querySelectorAll('.work-card');
  totEl.textContent=String(cards.length).padStart(2,'0');
  function step(){return cards[0].getBoundingClientRect().width + 20}
  function update(){
    const i=Math.round(track.scrollLeft/step());
    curEl.textContent=String(Math.min(i+1,cards.length)).padStart(2,'0');
    prev.disabled=track.scrollLeft<4;
    next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-4;
  }
  prev.addEventListener('click',()=>carouselScrollTo(track, track.scrollLeft - step()));
  next.addEventListener('click',()=>carouselScrollTo(track, track.scrollLeft + step()));
  track.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  update();
})();
// Covers carousel
(function(){
  const track=document.getElementById('covTrack');
  const prev=document.getElementById('covPrev');
  const next=document.getElementById('covNext');
  const curEl=document.getElementById('covCur');
  const totEl=document.getElementById('covTot');
  if(!track||!prev||!next||!curEl||!totEl)return;
  const cards=track.querySelectorAll('.cov-card');
  totEl.textContent=String(cards.length).padStart(2,'0');
  function step(){return cards[0].getBoundingClientRect().width + 20}
  function update(){
    const i=Math.round(track.scrollLeft/step());
    curEl.textContent=String(Math.min(i+1,cards.length)).padStart(2,'0');
    prev.disabled=track.scrollLeft<4;
    next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-4;
  }
  prev.addEventListener('click',()=>carouselScrollTo(track, track.scrollLeft - step()));
  next.addEventListener('click',()=>carouselScrollTo(track, track.scrollLeft + step()));
  track.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  update();
})();

// ── PARALLAX HERO (desktop uniquement) ──
(function(){
  // Pas de parallax sur mobile/touch
  if(!window.matchMedia('(hover:hover)').matches) return;
  if(window.innerWidth < 900) return;
  const wrap = document.querySelector('.hero-photo-wrap');
  const img = wrap ? wrap.querySelector('img') : null;
  if(!wrap || !img) return;
  let tX=0, tY=0, cX=0, cY=0;
  let animId;
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    tX = (e.clientX - cx) / cx * -5;
    tY = (e.clientY - cy) / cy * -3;
  });
  function animate(){
    cX += (tX - cX) * 0.05;
    cY += (tY - cY) * 0.05;
    img.style.transform = `scale(1.18) translate(${cX}px, ${cY}px)`;
    animId = requestAnimationFrame(animate);
  }
  animate();
  // Stopper quand hors viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting) { animId = requestAnimationFrame(animate); }
      else { cancelAnimationFrame(animId); }
    });
  });
  observer.observe(wrap);
})();

// ── RIPPLE AU CLIC ──
document.addEventListener('click', e => {
  const el = e.target.closest('a, button, .svc-card, .work-card, .cov-card, .ac-card, .trust-item, .sk');
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const r = document.createElement('span');
  r.classList.add('ripple');
  const size = Math.max(rect.width, rect.height) * 2;
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
  el.style.position = el.style.position || 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(r);
  setTimeout(() => r.remove(), 700);
});

// ── PAGE TRANSITION FADE ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  if(a.closest('.mob-menu') || a.closest('#quick-nav')) return; // déjà gérés
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.lenisScroll(target.id);
  });
});

// ── REVEAL CINÉMATIQUE (scroll-triggered) — inspiré pieterkoopt ──
(function(){
  var els = document.querySelectorAll('.reveal-cinema');
  if (!els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(function(el){ io.observe(el); });
})();

// ── DRAG TO SCROLL (souris desktop) — système unique propre ──
function enableDragScroll(track){
  if(!track || track._dragEnabled) return;
  track._dragEnabled = true;

  var isDown = false, startX = 0, scrollLeft = 0, moved = false;
  var lastX = 0, lastT = 0, velX = 0, rafId = null;
  var THRESHOLD = 5;

  // Désactiver scroll-snap pendant le drag pour éviter le "retour de force"
  function setSnap(on){ track.style.scrollSnapType = on ? '' : 'none'; }

  track.addEventListener('mousedown', function(e){
    if(e.target.closest('button, a, input')) return;
    if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
    isDown = true; moved = false;
    startX = e.clientX;
    lastX = e.clientX;
    lastT = performance.now();
    velX = 0;
    scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
    track.style.userSelect = 'none';
    setSnap(false);
  });

  function endDrag(){
    if(!isDown) return;
    isDown = false;
    track.style.cursor = 'grab';
    track.style.userSelect = '';
    // Inertie naturelle puis ré-active snap quand ça s'arrête
    var v = velX;
    function glide(){
      if(Math.abs(v) < 0.4){ setSnap(true); rafId = null; return; }
      track.scrollLeft -= v;
      v *= 0.94;
      rafId = requestAnimationFrame(glide);
    }
    if(Math.abs(v) > 0.4) rafId = requestAnimationFrame(glide);
    else setSnap(true);
  }

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('mouseleave', endDrag);

  document.addEventListener('mousemove', function(e){
    if(!isDown) return;
    var delta = e.clientX - startX;
    if(!moved && Math.abs(delta) < THRESHOLD) return;
    moved = true;
    e.preventDefault();
    // Ratio 1:1 — le curseur suit exactement la card
    track.scrollLeft = scrollLeft - delta;
    // Calcul vélocité pour l'inertie au relâchement
    var now = performance.now();
    var dt = now - lastT || 1;
    velX = (e.clientX - lastX) / dt * 16; // px par frame (~60fps)
    lastX = e.clientX;
    lastT = now;
  });

  track.addEventListener('click', function(e){
    if(moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);

  track.style.cursor = 'grab';
}

enableDragScroll(document.getElementById('workTrack'));
enableDragScroll(document.getElementById('covTrack'));
enableDragScroll(document.getElementById('motTrack'));

// ── TOUCH MOBILE = 100% natif ──
// On laisse le navigateur gérer : overflow-x:auto + scroll-snap-type:x proximity
// + -webkit-overflow-scrolling:touch + touch-action:pan-x
// Aucun JS — c'est ce qui donne la fluidité maximale (inertie iOS native).
enableDragScroll(document.querySelector('.trust-strip-inner'));

// ── CARROUSELS MOBILE — scroll natif CSS pur (scroll-snap + touch-action) ──
// Lenis est configuré avec prevent() pour ignorer ces éléments.
// Le CSS gère tout : touch-action:pan-x, scroll-snap-type, -webkit-overflow-scrolling:touch.
// Aucun JS touch nécessaire — c'est le navigateur natif qui donne la fluidité maximale.

// ── SWIPE POPUP CONTACT (ferme en swipant vers le bas) ──
(function(){
  const pop = document.getElementById('cPop');
  if (!pop) return;
  let startY = 0, isDragging = false;
  pop.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });
  pop.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      pop.style.transform = `translateX(-50%) translateY(${dy}px)`;
      pop.style.transition = 'none';
    }
  }, { passive: true });
  pop.addEventListener('touchend', e => {
    isDragging = false;
    const dy = e.changedTouches[0].clientY - startY;
    pop.style.transition = '';
    pop.style.transform = '';
    if (dy > 80) {
      // ferme le popup
      document.getElementById('cPopOverlay').classList.remove('active');
      pop.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
})();

/* ─────────────────────────────── */

// ── MODAL SERVICES ──
const servicesData = [{"num": "01", "title": "Direction Artistique Musicale", "desc": "La musique mérite une image à sa hauteur. Du single à l'album complet, je conçois l'univers visuel qui prolonge ton son. Les gens doivent sentir ta musique avant même d'appuyer sur play.", "includes": ["Cover art pour single, EP ou album", "Direction artistique complète (concept, moodboard, palette)", "Déclinaisons réseaux (story, carré, bannière)", "Press kit visuel pour booking et médias", "Formats optimisés streaming (Spotify, Apple Music, Deezer)"], "tags": ["Cover Art", "EP / Album", "Press Kit", "Streaming"]}, {"num": "02", "title": "Identité de Marque", "desc": "Ton identité visuelle, c'est la première chose que les gens voient avant même que tu parles. Je construis des identités solides, cohérentes sur tous les supports, qu'on reconnaît au premier coup d'œil.", "includes": ["Recherche de direction artistique & moodboard", "Conception du logotype (variantes principale, secondaire, favicon)", "Charte graphique complète (couleurs, typographies, espacements)", "Déclinaisons sur supports (mockups réalistes)", "Fichiers livrés en tous formats (SVG, PNG, PDF)"], "tags": ["Logo", "Charte", "Mockups", "Branding"]}, {"num": "03", "title": "Motion Design", "desc": "Le mouvement donne vie à ce qui était statique. Logos animés, intros vidéo, transitions. Je crée des animations qui renforcent ton identité et retiennent l'attention sur les réseaux.", "includes": ["Logo reveal animé (After Effects)", "Intros et outros pour vidéos YouTube / Twitch", "Stories et Reels animés pour Instagram", "Transitions et overlays pour montages", "Export multi-formats (MP4, GIF, WebM)"], "tags": ["Animation", "Logo Reveal", "Reels", "After Effects"]}, {"num": "04", "title": "Web Design", "desc": "Un site qui te représente vraiment, pas un template qu'on reconnaît de loin. Je conçois et développe des sites sur mesure, pensés pour convertir autant que pour impressionner.", "includes": ["Design UI/UX complet (wireframe vers maquette finale)", "Développement HTML / CSS / JS optimisé", "Responsive design (mobile, tablette, desktop)", "Optimisation vitesse et SEO de base", "Déploiement et mise en ligne inclus"], "tags": ["Site Web", "UI / UX", "Landing", "Responsive"]}, {"num": "05", "title": "Design Éditorial & Print", "desc": "Ce qui se touche marque les esprits autrement. Affiches, flyers, programmes, livrets. Je conçois des supports print qui ont du caractère et qui tiennent à l'impression.", "includes": ["Conception d'affiches et flyers événementiels", "Programmes et livrets (concert, festival, expo)", "Magazines et zines indépendants", "Suivi prépresse et validation des fichiers d'impression", "Formats adaptés offset et numérique"], "tags": ["Affiche", "Flyer", "Print", "Prépresse"]}, {"num": "06", "title": "Contenu Social Media", "desc": "Une présence cohérente sur les réseaux, ça ne s'improvise pas. Je crée des templates et contenus visuels qui gardent une ligne forte sur tous tes canaux. Chaque post doit ressembler à toi.", "includes": ["Templates personnalisés Instagram (posts, stories, carousels)", "Carrousels éducatifs ou promotionnels", "Visuels pour campagnes et sorties", "Guides de style pour publication en autonomie", "Formats adaptés TikTok, X, Facebook"], "tags": ["Instagram", "Templates", "Carrousel", "TikTok"]}, {"num": "07", "title": "Merchandising", "desc": "Ton merch, c'est ton identité portée par tes fans. Je conçois des visuels pour textile et goodies qui ont de la gueule. Du concept jusqu'au fichier prêt pour la production.", "includes": ["Concept et direction artistique du merch", "Visuels pour t-shirts, hoodies, tote-bags, casquettes", "Adaptation aux techniques d'impression (sérigraphie, DTF, broderie)", "Mockups réalistes pour présentation ou vente en ligne", "Fichiers techniques prêts pour impression"], "tags": ["Textile", "Goodies", "Production", "Sérigraphie"]}, {"num": "08", "title": "Scénographie & Événementiel", "desc": "Faire vivre une identité dans l'espace physique, c'est un autre niveau. Pour tes concerts, festivals ou événements, je conçois l'habillage visuel qui crée une vraie expérience.", "includes": ["Habillage scène et backdrop", "Signalétique et fléchage festival / événement", "Stands et espaces d'exposition", "Projection mapping et supports LED (concept)", "Direction artistique de l'espace complet"], "tags": ["Festival", "Stand", "Scène", "Événement"]}];

const overlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

let _modalTrigger = null;
function openModal(num) {
  const svc = servicesData.find(s => s.num === num);
  if (!svc) return;
  _modalTrigger = document.activeElement;
  modalContent.innerHTML = `
    <div class="modal-num">${svc.num}</div>
    <div class="modal-title">${svc.title}</div>
    <p class="modal-desc">${svc.desc}</p>
    <div class="modal-includes">
      <div class="modal-includes-title">Ce qui est inclus</div>
      <ul class="modal-list">${svc.includes.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
    <div class="modal-tags">${svc.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}</div>
    <a href="#contact" class="modal-cta" onclick="closeModal()">Discuter de ce projet →</a>
  `;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  setTimeout(()=>{const cl=document.getElementById('modalClose');if(cl)cl.focus();},60);
}

function closeModal() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  if(_modalTrigger)_modalTrigger.focus();
}

document.querySelectorAll('[data-modal]').forEach(card => {
  card.setAttribute('tabindex','0');
  card.setAttribute('role','button');
  card.setAttribute('aria-haspopup','dialog');
  card.addEventListener('click', () => openModal(card.dataset.modal));
  card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){e.preventDefault();openModal(card.dataset.modal);} });
});

document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

// ── FORMULAIRE DEVIS ──
// ══════════════════════════════════════════
//  MOOD BOARD — logique interactive
// ══════════════════════════════════════════
(function(){
  // Services qui nécessitent un mood board visuel
  const VISUAL_SERVICES = [
    'Identité de Marque',
    'Direction Artistique Musicale',
    'Cover Art (Single / EP / Album)',
    'Motion Design',
    'Design Éditorial & Print',
    'Contenu Social Media',
    'Scénographie & Événementiel',
    'Merchandising'
  ];

  const serviceSelect = document.getElementById('dv-service');
  const mbField      = document.getElementById('moodboard-field');
  const mbDrop       = document.getElementById('mbDrop');
  const mbFileInput  = document.getElementById('mbFileInput');
  const mbGrid       = document.getElementById('mbGrid');
  const mbLinkInput  = document.getElementById('mbLinkInput');
  const mbLinkAdd    = document.getElementById('mbLinkAdd');
  const mbLinksList  = document.getElementById('mbLinksList');
  const mbData       = document.getElementById('mbData');

  if (!serviceSelect || !mbField) return;

  let uploads = []; // { name, dataUrl }
  let links   = []; // string[]

  function syncHidden() {
    const parts = [];
    if (uploads.length) parts.push('IMAGES: ' + uploads.map(u => u.name).join(', '));
    if (links.length)   parts.push('LIENS: ' + links.join(' | '));
    mbData.value = parts.join(' — ');
  }

  function updateCounter() {
    let counter = mbField.querySelector('.mb-counter');
    if (!counter) {
      counter = document.createElement('p');
      counter.className = 'mb-counter';
      mbField.querySelector('.mb-wrap').appendChild(counter);
    }
    const total = uploads.length + links.length;
    counter.innerHTML = total
      ? `<span>${total}</span> référence${total > 1 ? 's' : ''} ajoutée${total > 1 ? 's' : ''}`
      : '';
  }

  // ── Afficher / masquer selon le service ──
  serviceSelect.addEventListener('change', function() {
    const isVisual = VISUAL_SERVICES.includes(this.value);
    if (isVisual && mbField.style.display === 'none') {
      mbField.style.display = 'block';
      // re-trigger animation
      mbField.style.animation = 'none';
      requestAnimationFrame(() => {
        mbField.style.animation = '';
      });
    } else if (!isVisual) {
      mbField.style.display = 'none';
    }
  });

  // ── Upload fichiers ──
  function addFile(file) {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop lourde (max 5 Mo) : ' + file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      const idx = uploads.length;
      uploads.push({ name: file.name, dataUrl });

      const item = document.createElement('div');
      item.className = 'mb-item';
      item.innerHTML = `
        <img src="${dataUrl}" alt="${file.name}" loading="lazy">
        <button type="button" class="mb-item-del" title="Retirer" data-idx="${idx}">✕</button>
      `;
      item.querySelector('.mb-item-del').addEventListener('click', function() {
        const i = parseInt(this.dataset.idx);
        uploads.splice(i, 1);
        item.remove();
        // Re-index
        mbGrid.querySelectorAll('.mb-item-del').forEach((btn, j) => btn.dataset.idx = j);
        syncHidden(); updateCounter();
      });
      mbGrid.appendChild(item);
      syncHidden(); updateCounter();
    };
    reader.readAsDataURL(file);
  }

  mbFileInput.addEventListener('change', function() {
    Array.from(this.files).forEach(addFile);
    this.value = '';
  });

  // Click sur la dropzone déclenche le sélecteur de fichier
  mbDrop.addEventListener('click', function(e) {
    if (e.target.tagName === 'LABEL' || e.target.closest('label')) return;
    mbFileInput.click();
  });

  // Drag & Drop
  mbDrop.addEventListener('dragover', e => { e.preventDefault(); mbDrop.classList.add('drag-over'); });
  mbDrop.addEventListener('dragleave', () => mbDrop.classList.remove('drag-over'));
  mbDrop.addEventListener('drop', e => {
    e.preventDefault();
    mbDrop.classList.remove('drag-over');
    Array.from(e.dataTransfer.files).forEach(addFile);
  });

  // ── Ajout de lien ──
  function addLink() {
    const val = mbLinkInput.value.trim();
    if (!val) return;
    // Accepte avec ou sans protocole
    const url = val.startsWith('http') ? val : 'https://' + val;
    links.push(url);

    // Déduire la plateforme pour l'icône
    const platforms = {
      'pinterest': '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>',
      'behance': '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.2.836 1.884 2.094 1.884.829 0 1.399-.405 1.662-1.028L23.726 17zm-7.406-3h4.938c-.034-1.147-.670-1.9-2.252-1.9-1.461 0-2.368.725-2.686 1.9zM5.906 15.125H2.833v2.964H5.82c1.218 0 2.053-.558 2.053-1.497 0-.948-.748-1.467-1.967-1.467zM2.833 9.938v2.65H5.52c1.095 0 1.883-.465 1.883-1.332 0-.876-.73-1.318-1.822-1.318H2.833zM11.275 17.25c0-2.234-1.644-3.484-4.014-3.484H0V7.5h6.88c2.358 0 3.96 1.121 3.96 3.07 0 1.34-.679 2.21-1.713 2.644C10.475 13.618 11.275 14.668 11.275 17.25z"/></svg>',
      'instagram': '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
      'dribbble': '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>',
      'figma': '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/><path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/><path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/></svg>',
      'notion': '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.469l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>'
    };
    let icon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>';
    for (const [k, v] of Object.entries(platforms)) {
      if (url.toLowerCase().includes(k)) { icon = v; break; }
    }

    const tag = document.createElement('div');
    tag.className = 'mb-link-tag';
    const idx = links.length - 1;
    tag.innerHTML = `
      <span class="mb-link-icon">${icon}</span>
      <span class="mb-link-url">${url}</span>
      <button type="button" class="mb-link-del" title="Retirer">✕</button>
    `;
    tag.querySelector('.mb-link-del').addEventListener('click', function() {
      links.splice(idx, 1);
      tag.remove();
      syncHidden(); updateCounter();
    });
    mbLinksList.appendChild(tag);
    mbLinkInput.value = '';
    syncHidden(); updateCounter();
  }

  mbLinkAdd.addEventListener('click', addLink);
  mbLinkInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } });

})();

const devisForm = document.getElementById('devisForm');
if(devisForm){
  devisForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('devisBtn');
    const success = document.getElementById('devisSuccess');
    btn.classList.add('loading');
    btn.innerHTML = 'Envoi en cours... <svg viewBox="0 0 24 24" width="16" height="16" style="stroke:var(--black);fill:none;stroke-width:2"><circle cx="12" cy="12" r="10"/></svg>';
    try {
      const res = await fetch(devisForm.action, {
        method:'POST',
        body: new FormData(devisForm),
        headers:{'Accept':'application/json'}
      });
      if(res.ok){
        devisForm.querySelectorAll('.devis-field,.devis-submit').forEach(el=>el.style.display='none');
        success.classList.add('show');
      } else {
        btn.classList.remove('loading');
        btn.innerHTML = 'Réessayer <svg viewBox="0 0 24 24" width="16" height="16" style="stroke:var(--black);fill:none;stroke-width:2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        let errMsg = document.getElementById('devis-error-msg');
        if(!errMsg){ errMsg = document.createElement('p'); errMsg.id='devis-error-msg'; errMsg.style.cssText='color:#ff6b6b;font-size:.85rem;margin-top:.5rem;'; devisForm.querySelector('.devis-submit').appendChild(errMsg); }
        errMsg.textContent = 'Une erreur est survenue. Écris-moi directement sur WhatsApp ou à mdgdesign221@gmail.com.';
      }
    } catch(err){
      btn.classList.remove('loading');
      btn.innerHTML = 'Réessayer →';
      let errMsg = document.getElementById('devis-error-msg');
      if(!errMsg){ errMsg = document.createElement('p'); errMsg.id='devis-error-msg'; errMsg.style.cssText='color:#ff6b6b;font-size:.85rem;margin-top:.5rem;'; devisForm.querySelector('.devis-submit').appendChild(errMsg); }
      errMsg.textContent = 'Problème de connexion. Écris-moi sur WhatsApp ou à mdgdesign221@gmail.com.';
    }
  });
}


// ── SCROLL PROGRESS BAR ──
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  if(progressBar) progressBar.style.width = scrolled + '%';
}, {passive:true});

// ── SCROLL INDICATOR DOTS ──
const dots = document.querySelectorAll('.scroll-dot');
const dotSections = Array.from(dots).map(d => document.getElementById(d.dataset.section)).filter(Boolean);
const dotObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      dots.forEach(d => d.classList.remove('active'));
      const dot = document.querySelector(`.scroll-dot[data-section="${e.target.id}"]`);
      if(dot) dot.classList.add('active');
    }
  });
}, {threshold:.3});
dotSections.forEach(s => dotObs.observe(s));

// ── MAGNETIC BUTTONS ──
document.querySelectorAll('.nav-cta, .cta-btn, .devis-submit button, .modal-cta, .svc-cta, .hero-btn-primary, .hero-btn-secondary').forEach(btn => {
  btn.classList.add('magnetic');
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ── NAV FIXE avec ticker ──
// Ajuster le padding-top du hero pour compenser le ticker
function fixHeroPadding(){
  const ticker = document.querySelector('.nav-ticker');
  const nav = document.querySelector('nav:not(#mob-tab-bar)');
  const mobNavRow = document.getElementById('mob-nav-row');
  const hero = document.getElementById('hero');
  if(ticker && nav) {
    const navH = ticker.offsetHeight + nav.offsetHeight;
    const mobRowH = (mobNavRow && window.innerWidth <= 900) ? mobNavRow.offsetHeight : 0;
    const totalH = navH + mobRowH;
    document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    if(hero) hero.style.paddingTop = totalH + 'px';
  }
}
fixHeroPadding();
window.addEventListener('resize', fixHeroPadding, {passive:true});

// ── DISPLAY ROTATIF — FADE DISCRET ──
(function(){
  var words = ['Brand Identity','Cover Art','Motion Design','Web Design','Direction Artistique'];
  window._rotatorWords = words;
  var el = document.getElementById('heroTypeText');
  var cursor = document.querySelector('.hero-type-wrap .cursor-blink');
  if(!el) return;

  // Supprimer le curseur clignotant — pas adapté au fade
  if(cursor) cursor.remove();

  var i = 0;
  el.textContent = words[0];
  el.style.transition = 'none';
  el.style.opacity = '1';

  setInterval(function(){
    // Fade out
    el.style.transition = 'opacity .55s ease';
    el.style.opacity = '0';
    setTimeout(function(){
      i = (i + 1) % window._rotatorWords.length;
      el.textContent = window._rotatorWords[i];
      // Fade in
      el.style.opacity = '1';
    }, 580);
  }, 3200);
})();

// ── LENIS SMOOTH SCROLL ──
// Lenis est chargé dynamiquement (async). On attend qu'il soit dispo.
let lenis;
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  // Lenis désactivé sur mobile — le scroll natif gère le touch
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.8,
    prevent: node => node.id === 'workTrack' || node.id === 'covTrack' || node.id === 'motTrack' || !!(node.closest && node.closest('.pack-modal-overlay')),
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  // Sync avec les liens d'ancre — exclure les liens du menu mobile (gérés par cm())
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    if(a.closest('.mob-menu') || a.closest('#quick-nav')) return; // cm() et qnGo() les gèrent
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, {offset: -80, duration: 1.6});
    });
  });
  // Pause pendant les modals
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', () => {
      lenis.stop();
      setTimeout(() => lenis.start(), 100);
    });
  }
}
// Lenis est chargé via s.onload dans le premier bloc —
// on poll toutes les 50ms au cas où le script serait déjà prêt
(function waitLenis(attempts) {
  if (typeof Lenis !== 'undefined') { initLenis(); return; }
  if (attempts <= 0) return; // abandon après 3s
  setTimeout(function(){ waitLenis(attempts - 1); }, 50);
})(60);

// ── EASTER EGG — taper "MDG" ──
(function(){
  const sequence = 'MDG';
  let typed = '';
  const overlay = document.getElementById('easter-egg');
  const particles = document.getElementById('eeParticles');
  
  function spawnParticles() {
    particles.innerHTML = '';
    for(let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.classList.add('ee-particle');
      p.style.cssText = `
        left:${Math.random()*100}%;
        animation-duration:${2 + Math.random()*4}s;
        animation-delay:${Math.random()*2}s;
        width:${2 + Math.random()*5}px;
        height:${2 + Math.random()*5}px;
        opacity:${0.4 + Math.random()*.6};
      `;
      particles.appendChild(p);
    }
  }

  document.addEventListener('keydown', e => {
    if(overlay.classList.contains('show')) {
      if(e.key === 'Escape') {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        if(lenis) lenis.start();
      }
      return;
    }
    typed += e.key.toUpperCase();
    if(typed.length > sequence.length) typed = typed.slice(-sequence.length);
    if(typed === sequence) {
      spawnParticles();
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      if(lenis) lenis.stop();
      setTimeout(() => {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        if(lenis) lenis.start();
      }, 4000);
    }
  });

  overlay.addEventListener('click', () => {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    if(lenis) lenis.start();
  });
})();

// ── EFFET TILT 3D SUR LES CARDS ──
document.querySelectorAll('.work-card,.cov-card,.svc-card,.process-step,.trust-card,.ac-card,.sk,.cond-item').forEach(function(card){
  card.addEventListener('mousemove', function(e){
    var rect = card.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transition = 'transform 0.08s ease';
    card.style.transform = 'perspective(900px) rotateY('+( x*10 )+'deg) rotateX('+( -y*10 )+'deg) translateY(-6px) scale(1.02)';
  });
  card.addEventListener('mouseleave', function(){
    card.style.transition = 'transform 0.6s cubic-bezier(.16,1,.3,1)';
    card.style.transform = '';
  });
});


// ── HEURE EN TEMPS RÉEL À KAOLACK (GMT+0) ──
function updateKaolackTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kaolack = new Date(utc);
  const h = String(kaolack.getHours()).padStart(2,'0');
  const m = String(kaolack.getMinutes()).padStart(2,'0');
  const time = h + 'h' + m;
  const el = document.getElementById('kaolackTime');
  const el2 = document.getElementById('kaolackTimeContact');
  if (el) el.textContent = time;
  if (el2) el2.textContent = time;
}
updateKaolackTime();
setInterval(updateKaolackTime, 10000);

// ── CURSOR TRAIL (covers en miniature) ──
(function(){
  if(!window.matchMedia('(hover:hover)').matches) return;
  
  const covers = [
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_120/bal-poussiere_mtzobd.jpg',
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_120/new-wave_vzxywo.jpg',
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_120/good-vibes_m7kre2.jpg',
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_120/okg_j3a2cn.jpg',
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_120/gideon_t4a5wt.jpg',
    'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_120/ghetto-star_cdj53n.jpg',
  ];
  
  const trail = [];
  const TRAIL_COUNT = 6;
  let coverIndex = 0;
  let lastX = 0, lastY = 0;
  let moveCount = 0;
  
  // Créer les éléments trail
  for(let i = 0; i < TRAIL_COUNT; i++){
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    const size = 52 - i * 6;
    el.style.cssText = `width:${size}px;height:${size}px`;
    const img = document.createElement('img');
    img.src = covers[i % covers.length];
    el.appendChild(img);
    document.body.appendChild(el);
    trail.push({el, x: 0, y: 0, tx: 0, ty: 0, delay: i * 0.08});
  }
  
  let positions = Array(TRAIL_COUNT).fill({x:0,y:0});
  
  document.addEventListener('mousemove', e => {
    moveCount++;
    positions = [{x: e.clientX, y: e.clientY}, ...positions.slice(0, TRAIL_COUNT - 1)];
    
    // Changer l'image toutes les 8 mouvements
    if(moveCount % 8 === 0) {
      coverIndex = (coverIndex + 1) % covers.length;
      trail[0].el.querySelector('img').src = covers[coverIndex];
    }
  });
  
  let trailActive = false;
  // Activer le trail seulement dans la section covers/work
  document.querySelectorAll('#covers, #work').forEach(section => {
    section.addEventListener('mouseenter', () => {
      trailActive = true;
      trail.forEach(t => t.el.style.opacity = '1');
    });
    section.addEventListener('mouseleave', () => {
      trailActive = false;
      trail.forEach(t => t.el.style.opacity = '0');
    });
  });
  
  (function animateTrail(){
    positions.forEach((pos, i) => {
      if(!trail[i]) return;
      const t = trail[i];
      t.x += (pos.x - t.x) * (0.3 - i * 0.03);
      t.y += (pos.y - t.y) * (0.3 - i * 0.03);
      t.el.style.transform = `translate(${t.x - 26}px, ${t.y - 26}px) rotate(${i * 8}deg)`;
      t.el.style.opacity = trailActive ? String(1 - i * 0.15) : '0';
    });
    requestAnimationFrame(animateTrail);
  })();
})();

// ── IMAGE SUIT LE CURSEUR SUR LES ARTISTES ──
(function(){
  if(!window.matchMedia('(hover:hover)').matches) return;
  
  const preview = document.getElementById('artistPreview');
  const previewImg = document.getElementById('artistPreviewImg');
  if(!preview || !previewImg) return;
  
  const artistPhotos = {
    'ISS 814': 'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_400/iss814_zgufzl.jpg',
    'Oothentik Zeus': 'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_400/IMG_7210_c0xycb.jpg',
    'Gun Silent Beatz': 'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_400/DOPEBOY_DMG_II_o47civ.jpg',
    'Dopeboy DMG': 'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_400/DOPEBOY_DMG_II_o47civ.jpg',
    'One Lyrical': 'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_400/WhatsApp_Image_2024-11-19_at_03.14.19_bjs7us.jpg',
  };
  
  let previewX = 0, previewY = 0;
  let targetX = 0, targetY = 0;
  
  document.addEventListener('mousemove', e => {
    targetX = e.clientX + 24;
    targetY = e.clientY - 110;
  });
  
  (function animPreview(){
    previewX += (targetX - previewX) * 0.1;
    previewY += (targetY - previewY) * 0.1;
    preview.style.transform = `translate(${previewX}px, ${previewY}px) scale(${preview.classList.contains('show') ? 1 : 0.85}) rotate(${preview.classList.contains('show') ? -1 : -3}deg)`;
    requestAnimationFrame(animPreview);
  })();
  
  // Hover sur les spans du marquee
  document.querySelectorAll('.collabs-marquee span:not(.sep)').forEach(span => {
    const name = span.textContent.trim();
    if(!artistPhotos[name]) return;
    
    span.addEventListener('mouseenter', () => {
      previewImg.src = artistPhotos[name];
      preview.classList.add('show');
    });
    span.addEventListener('mouseleave', () => {
      preview.classList.remove('show');
    });
  });
})();

/* ─────────────────────────────── */

// ── MOTION THUMBNAIL → PLAY ──
document.querySelectorAll('.motion-thumb').forEach(function(thumb){
  thumb.addEventListener('click', function(){
    var src = thumb.getAttribute('data-src');
    if(!src) return;
    var iframe = document.createElement('iframe');
    iframe.src = src + '&autoplay=1';
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none';
    thumb.innerHTML = '';
    thumb.appendChild(iframe);
    thumb.classList.remove('motion-thumb');
  });
});

// ── BANNER INSTAGRAM ──
(function(){
  var banner = document.getElementById('ig-banner');
  var closeBtn = document.getElementById('igBannerClose');
  // Afficher seulement si navigateur interne Instagram/Facebook
  var ua = navigator.userAgent || '';
  var isInApp = /Instagram|FBAN|FBAV|FB_IAB|Line|Twitter|Snapchat|musical_ly|TikTok|BytedanceWebview|ByteLocale|Aweme/i.test(ua);
  if(!isInApp){ banner.style.display = 'none'; return; }
  // Signal au quick-nav de remonter + hauteur dynamique du banner
  function updateBannerOffsets(){
    var h = banner.offsetHeight;
    var qn     = document.getElementById('quick-nav');
    var qnBase = window.innerWidth <= 600 ? 80 : 64; // px base du quick-nav sans banner
    if(qn)    { qn.style.bottom = (h + qnBase) + 'px'; }
  }
  setTimeout(function(){
    document.body.classList.add('banner-visible');
    updateBannerOffsets();
    if(window.ResizeObserver){
      var ro = new ResizeObserver(updateBannerOffsets);
      ro.observe(banner);
    }
  }, 4000);
  if(closeBtn){
    closeBtn.addEventListener('click', function(){
      banner.style.display = 'none';
      document.body.classList.remove('banner-visible');
        var qn     = document.getElementById('quick-nav');
        if(qn)    { qn.style.bottom = ''; }
    });
  }
})();

// ── LIGHTBOX ──
(function(){
  var overlay = document.getElementById('lbOverlay');
  var lb = document.getElementById('lb');
  var lbClose = document.getElementById('lbClose');
  var lbImg = document.getElementById('lbImg');
  var lbTitle = document.getElementById('lbTitle');
  var lbDesc = document.getElementById('lbDesc');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');

  // Collecter toutes les cartes avec lightbox dans l'ordre du DOM
  var cards = [];
  var currentIndex = 0;

  function buildCardList(){
    cards = Array.from(document.querySelectorAll('[data-lb-src]'));
  }

  function openLb(src, title, desc, index){
    lbImg.src = src;
    lbImg.alt = title;
    lbTitle.textContent = title;
    lbDesc.textContent = desc;
    currentIndex = (index !== undefined) ? index : 0;
    updateNavButtons();
    overlay.classList.add('active');
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    if(typeof lenis !== 'undefined' && lenis) lenis.stop();
    setTimeout(function(){var c=document.getElementById('lbClose');if(c)c.focus();},60);
  }

  function closeLb(){
    overlay.classList.remove('active');
    lb.classList.remove('active');
    document.body.style.overflow = '';
    if(typeof lenis !== 'undefined' && lenis) lenis.start();
    setTimeout(function(){ lbImg.src = ''; }, 400);
  }

  function goTo(index){
    if(index < 0 || index >= cards.length) return;
    currentIndex = index;
    var card = cards[currentIndex];
    lbImg.classList.add('switching');
    setTimeout(function(){
      lbImg.src = card.getAttribute('data-lb-src');
      lbImg.alt = card.getAttribute('data-lb-title');
      lbTitle.textContent = card.getAttribute('data-lb-title');
      lbDesc.textContent = card.getAttribute('data-lb-desc');
      lbImg.classList.remove('switching');
    }, 180);
    updateNavButtons();
  }

  function updateNavButtons(){
    if(!lbPrev || !lbNext) return;
    lbPrev.classList.toggle('hidden', currentIndex <= 0);
    lbNext.classList.toggle('hidden', currentIndex >= cards.length - 1);
  }

  // Init
  buildCardList();

  // Tap sur les cards — distingue tap (ouvrir) vs swipe (scroller)
  document.querySelectorAll('[data-lb-src]').forEach(function(card){
    var txStart = 0, tyStart = 0, tMoved = false;

    card.addEventListener('touchstart', function(e){
      txStart = e.touches[0].clientX;
      tyStart = e.touches[0].clientY;
      tMoved = false;
    }, { passive: true });

    card.addEventListener('touchmove', function(e){
      if (Math.abs(e.touches[0].clientX - txStart) > 8 ||
          Math.abs(e.touches[0].clientY - tyStart) > 8) {
        tMoved = true;
      }
    }, { passive: true });

    card.addEventListener('touchend', function(e){
      if (!tMoved) {
        e.preventDefault();
        buildCardList();
        currentIndex = cards.indexOf(card);
        openLb(
          card.getAttribute('data-lb-src'),
          card.getAttribute('data-lb-title'),
          card.getAttribute('data-lb-desc'),
          currentIndex
        );
      }
    });

    // Souris desktop
    card.addEventListener('click', function(e){
      if ('ontouchstart' in window) return; // éviter double déclenchement
      e.preventDefault();
      buildCardList();
      currentIndex = cards.indexOf(card);
      openLb(
        card.getAttribute('data-lb-src'),
        card.getAttribute('data-lb-title'),
        card.getAttribute('data-lb-desc'),
        currentIndex
      );
    });
  });

  // Fermer en cliquant sur l'overlay ou n'importe où hors image/boutons
  overlay.addEventListener('click', closeLb);
  lb.addEventListener('click', function(e){
    // Fermer si clic direct sur le fond du lb (pas sur l'image ou les boutons)
    if(e.target === lb) closeLb();
  });
  lbClose.addEventListener('click', closeLb);
  if(lbPrev) lbPrev.addEventListener('click', function(e){ e.stopPropagation(); goTo(currentIndex - 1); });
  if(lbNext) lbNext.addEventListener('click', function(e){ e.stopPropagation(); goTo(currentIndex + 1); });

  // Clavier
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('active')) return;
    if(e.key === 'Escape') closeLb();
    if(e.key === 'ArrowLeft') goTo(currentIndex - 1);
    if(e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  // Swipe tactile
  var touchStartX = 0;
  lb.addEventListener('touchstart', function(e){ touchStartX = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx) > 50){
      if(dx < 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
  }, {passive:true});
})();

// ── YOUTUBE THUMBNAILS — embed iframe direct au clic ──
(function(){
  var ytPreconnected = false;

  // Preconnect YouTube au premier hover sur une miniature
  document.querySelectorAll('.yt-thumb').forEach(function(thumb){
    thumb.addEventListener('mouseenter', function(){
      if(ytPreconnected) return;
      ytPreconnected = true;
      ['https://www.youtube.com','https://i.ytimg.com','https://www.google.com'].forEach(function(url){
        var link = document.createElement('link');
        link.rel = 'preconnect'; link.href = url; link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    }, { once: true, passive: true });
    thumb.addEventListener('click', function(){
      var videoId = thumb.getAttribute('data-video-id');
      var start   = parseInt(thumb.getAttribute('data-start') || '0', 10);

      // URL embed avec autoplay et position de départ
      var src = 'https://www.youtube.com/embed/' + videoId
        + '?autoplay=1&start=' + start
        + '&rel=0&modestbranding=1&iv_load_policy=3&color=white';

      // Créer l'iframe
      var iframe = document.createElement('iframe');
      iframe.setAttribute('src', src);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;';

      // Vider le thumbnail et y injecter l'iframe (garde le conteneur avec aspect-ratio)
      thumb.style.cursor = 'default';
      while (thumb.firstChild) thumb.removeChild(thumb.firstChild);
      thumb.appendChild(iframe);
    });
  });
})();

// ── ABOUT PHOTO MORPHING ──
(function(){
  var slides = document.querySelectorAll('.morph-slide');
  if(!slides.length) return;
  var dots = document.querySelectorAll('#morphDots .morph-dot');
  var current = 0;
  var total = slides.length;

  function updateDots(idx){
    dots.forEach(function(d,i){ d.classList.toggle('active', i === idx); });
  }

  function goTo(idx){
    var prev = current;
    current = idx;
    slides[prev].classList.remove('active');
    slides[prev].classList.add('leaving');
    slides[current].classList.add('active');
    updateDots(current);
    setTimeout(function(){ slides[prev].classList.remove('leaving'); }, 1400);
  }

  function next(){ goTo((current + 1) % total); }

  var timer = setInterval(next, 4500);

  // Clic sur les dots
  dots.forEach(function(d){
    d.addEventListener('click', function(){
      var idx = parseInt(d.dataset.idx, 10);
      if(idx === current) return;
      clearInterval(timer);
      goTo(idx);
      timer = setInterval(next, 4500);
    });
  });
})();

/* ─────────────────────────────── */

(function(){
'use strict';

// ── État courant ──────────────────────────────────────
var currentLang = 'fr';

// ── Dictionnaire complet FR → EN ─────────────────────
var translations = {

  // ─── NAV & TICKER ───────────────────────────────────
  nav_avail: { fr: 'Disponible', en: 'Available' },
  nav_cta:   { fr: 'Travaillons ensemble', en: "Let's work together" },
  nav_about: { fr: 'À propos', en: 'About' },
  nav_work:  { fr: 'Projets', en: 'Work' },
  nav_covers:{ fr: 'Covers', en: 'Covers' },
  nav_services: { fr: 'Services', en: 'Services' },
  nav_process: { fr: 'Process', en: 'Process' },
  nav_testimonials: { fr: 'Témoignages', en: 'Testimonials' },
  nav_pricing: { fr: 'Tarifs', en: 'Pricing' },
  tick1: { fr: 'Disponible pour nouveaux projets', en: 'Available for new projects' },
  tick2: { fr: "7 ans d'expérience", en: '7 years of experience' },

  // ─── HERO ────────────────────────────────────────────
  hero_eyebrow: { fr: 'MDG CREATIVE STUDIO', en: 'MDG CREATIVE STUDIO' },
  hero_promise: { fr: "L'excellence, c'est mon seul standard.", en: "Excellence is my only standard." },
  hero_btn_primary: { fr: 'Travaillons ensemble', en: "Let's work together" },
  hero_btn_secondary: { fr: 'Voir les projets', en: 'View work' },
  stat_years_label: { fr: "Années d'expérience", en: 'Years of experience' },
  stat_years_sub: { fr: 'Depuis 2017', en: 'Since 2017' },
  stat_projects_label: { fr: 'Projets livrés', en: 'Projects delivered' },
  stat_projects_sub: { fr: 'Brand · Web · Motion · Print', en: 'Brand · Web · Motion · Print' },
  stat_artists_label: { fr: 'Artistes accompagnés', en: 'Artists served' },
  stat_artists_sub: { fr: 'Sénégal, France, Canada…', en: 'Senegal, France, Canada…' },
  stat_countries_label: { fr: 'Pays touchés', en: 'Countries reached' },
  stat_countries_sub: { fr: 'Présence internationale', en: 'International presence' },
  stat_mini_years: { fr: "Années d'XP", en: 'Yrs of XP' },
  stat_mini_projects: { fr: 'Projets livrés', en: 'Projects delivered' },
  stat_mini_artists: { fr: 'Artistes', en: 'Artists' },
  stat_mini_countries: { fr: 'Pays', en: 'Countries' },

  // ─── ABOUT ───────────────────────────────────────────
  about_badge: { fr: 'Kaolack, Sénégal', en: 'Kaolack, Senegal' },
  about_badge_avail: { fr: 'Disponible', en: 'Available' },
  about_label: { fr: 'À propos', en: 'About' },
  about_title: { fr: 'Creative Director<br><span>basé à Kaolack</span>', en: 'Creative Director<br><span>based in Kaolack</span>' },
  about_p1: { fr: "Je suis un cas d'école, un perfectionniste désordonné. 7 ans de cover art, branding, motion et web et je n'ai jamais été pleinement satisfait d'un seul projet. Pas par manque de résultat, mais parce que l'exigence grandit plus vite que la production. Et c'est exactement pour ça que je ne sais pas faire autrement que de l'excellence.", en: "I'm a case study, a disorganized perfectionist. 7 years of cover art, branding, motion and web and I've never been fully satisfied with a single project. Not for lack of results, but because the standard grows faster than the output. And that's exactly why I can't do anything other than excellence." },
  about_p2: { fr: "", en: "" },
  about_p3: { fr: "Pas de template. Pas de copier-coller. Chaque projet part d'une vraie compréhension de qui tu es, de ce que tu fais, et de ce que tu veux projeter.", en: "No templates. No copy-paste. Every project starts from a real understanding of who you are, what you do, and what you want to project." },
  sk1_name: { fr: 'Brand Identity', en: 'Brand Identity' },
  sk1_desc: { fr: 'Logo · Charte · Mockups', en: 'Logo · Guidelines · Mockups' },
  sk2_name: { fr: 'Direction Artistique', en: 'Art Direction' },
  sk2_desc: { fr: 'Cover Art · Visual Concept', en: 'Cover Art · Visual Concept' },
  sk3_name: { fr: 'Web Design', en: 'Web Design' },
  sk3_desc: { fr: 'UI · UX · Dev · Déploiement', en: 'UI · UX · Dev · Deployment' },
  sk4_name: { fr: 'Motion Design', en: 'Motion Design' },
  sk4_desc: { fr: 'After Effects · Animation', en: 'After Effects · Animation' },
  tools_label: { fr: 'Outils', en: 'Tools' },
  apt_role: { fr: 'Creative Director', en: 'Creative Director' },
  apt_city: { fr: 'Kaolack, Sénégal', en: 'Kaolack, Senegal' },

  // ─── COLLABS ─────────────────────────────────────────
  collabs_label: { fr: 'Collaborations', en: 'Collaborations' },
  collabs_title: { fr: "Ils m'ont fait<em> confiance</em>", en: 'They trusted<em> me</em>' },
  collabs_sub: { fr: 'Plus de 50 artistes et marques africaines accompagnés depuis 2017. Et la liste continue.', en: 'Over 50 African artists and brands since 2017. And counting.' },
  collabs_count_label: { fr: 'artistes & marques', en: 'artists & brands' },
  collabs_info_label: { fr: 'Collaborations actives', en: 'Active collaborations' },

  // ─── WORK ────────────────────────────────────────────
  work_label: { fr: 'Réalisations', en: 'Work' },
  work_h2: { fr: 'Réalisations', en: 'Selected work' },
  work_h2_sub: { fr: 'Des projets construits avec intention. Chaque visuel raconte quelque chose : une contrainte, un univers, une solution qui lui ressemble.', en: 'Projects built with intention. Every visual tells a story: a constraint, a world, a solution that fits.' },
  work_prev: { fr: 'Précédent', en: 'Previous' },
  work_next: { fr: 'Suivant', en: 'Next' },

  // ─── COVERS ──────────────────────────────────────────
  covers_label: { fr: 'Cover Art', en: 'Cover Art' },
  covers_h2: { fr: 'Cover Art', en: 'Cover Art' },
  covers_h2_sub: { fr: "L'image qui fait écouter avant même d'appuyer sur play.", en: 'The image that makes you listen before hitting play.' },

  // ─── SERVICES ────────────────────────────────────────
  services_label: { fr: 'Services', en: 'Services' },
  services_h2: { fr: 'Ce que je fais', en: 'What I do' },
  services_h2_sub: { fr: "De l'identité au mouvement, du print au web. Un studio complet.", en: 'From identity to motion, from print to web. A complete studio.' },
  svc_cta_text: { fr: 'Demander un devis', en: 'Get a quote' },
  svc_starting: { fr: 'À partir de', en: 'Starting at' },
  svc_detail: { fr: 'Voir le détail', en: 'See details' },
  svc1_title: { fr: 'Identité de Marque', en: 'Brand Identity' },
  svc1_desc: { fr: 'Logo · Charte · Mockups', en: 'Logo · Guidelines · Mockups' },
  svc2_title: { fr: 'Direction Artistique Musicale', en: 'Music Art Direction' },
  svc2_desc: { fr: 'Cover Art · Concept · Press Kit', en: 'Cover Art · Concept · Press Kit' },
  svc3_title: { fr: 'Web Design', en: 'Web Design' },
  svc3_desc: { fr: 'UI/UX · Dev · Déploiement', en: 'UI/UX · Dev · Deployment' },
  svc4_title: { fr: 'Motion Design', en: 'Motion Design' },
  svc4_desc: { fr: 'Animation · Logo Reveal · Reels', en: 'Animation · Logo Reveal · Reels' },
  svc5_title: { fr: 'Design Éditorial & Print', en: 'Editorial & Print Design' },
  svc5_desc: { fr: 'Affiche · Flyer · Prépresse', en: 'Poster · Flyer · Prepress' },
  svc6_title: { fr: 'Contenu Social Media', en: 'Social Media Content' },
  svc6_desc: { fr: 'Templates · Carrousels · TikTok', en: 'Templates · Carousels · TikTok' },
  svc7_title: { fr: 'Merchandising', en: 'Merchandising' },
  svc7_desc: { fr: 'Textile · Goodies · Sérigraphie', en: 'Apparel · Merch · Screen Print' },
  svc8_title: { fr: 'Scénographie & Événementiel', en: 'Stage & Event Design' },
  svc8_desc: { fr: 'Festival · Scène · Stand', en: 'Festival · Stage · Stand' },

  // ─── MODALS SERVICES (data JSON injecté dynamiquement) ─
  modal_includes_title: { fr: 'Ce qui est inclus', en: "What's included" },
  modal_cta_text: { fr: 'Discuter de ce projet →', en: 'Discuss this project →' },

  // Services data EN
  svc_data_en: { fr: null, en: [
    { num:'01', title:'Brand Identity', desc:"Your visual identity is the first thing people see before you say a word. I build identities that stand out, consistent across every medium, recognizable from the first glance.", includes:['Art direction research & moodboard','Logo design (main, secondary & favicon variants)','Complete brand guidelines (colors, typography, spacing)','Multi-format mockups (realistic renderings)','Files delivered in all formats (SVG, PNG, PDF)'], tags:['Logo','Guidelines','Mockups','Branding'] },
    { num:'02', title:'Music Art Direction', desc:"Music deserves a visual to match. From single to full album, I design the visual world that extends your sound. People should feel your music before they even press play.", includes:['Cover art for single, EP or album','Full art direction (concept, moodboard, palette)','Social media adaptations (story, square, banner)','Visual press kit for booking and media','Streaming-optimized formats (Spotify, Apple Music, Deezer)'], tags:['Cover Art','EP / Album','Press Kit','Streaming'] },
    { num:'03', title:'Web Design', desc:"A site that truly represents you, not a template anyone can spot from miles away. I design and develop custom sites built to convert as much as to impress.", includes:['Complete UI/UX design (wireframe to final mockup)','HTML / CSS / JS optimized development','Responsive design (mobile, tablet, desktop)','Speed and basic SEO optimization','Deployment and launch included'], tags:['Website','UI / UX','Landing','Responsive'] },
    { num:'04', title:'Motion Design', desc:"Motion brings what was static to life. Animated logos, video intros, transitions. I create animations that reinforce your identity and hold attention on social media.", includes:['Animated logo reveal (After Effects)','Intros and outros for YouTube / Twitch videos','Animated Stories and Reels for Instagram','Transitions and overlays for edits','Multi-format export (MP4, GIF, WebM)'], tags:['Animation','Logo Reveal','Reels','After Effects'] },
    { num:'05', title:'Editorial & Print Design', desc:"What you can touch stays in the mind differently. Posters, flyers, programs, booklets. I design print materials with character that hold up under real print constraints.", includes:['Event poster and flyer design','Programs and booklets (concert, festival, expo)','Independent magazines and zines','Prepress follow-up and print file validation','Formats adapted for offset and digital print'], tags:['Poster','Flyer','Print','Prepress'] },
    { num:'06', title:'Social Media Content', desc:"A consistent social media presence doesn't happen by chance. I create templates and visual content that hold a strong line across all your channels. Every post should look like you.", includes:['Custom Instagram templates (posts, stories, carousels)','Educational or promotional carousels','Visuals for campaigns and releases','Style guides for autonomous publishing','Formats adapted for TikTok, X, Facebook'], tags:['Instagram','Templates','Carousel','TikTok'] },
    { num:'07', title:'Merchandising', desc:"Your merch is your identity worn by your fans. I design visuals for apparel and goods that have edge. From concept to production-ready files.", includes:['Merch concept and art direction','Visuals for t-shirts, hoodies, tote bags, caps','Adaptation for printing techniques (screen print, DTF, embroidery)','Realistic mockups for presentation or online sales','Technical files ready for print'], tags:['Apparel','Merch','Production','Screen Print'] },
    { num:'08', title:'Stage & Event Design', desc:"Bringing an identity into physical space is another level. For your concerts, festivals or events, I design the visual dressing that creates a real immersive experience.", includes:['Stage backdrop and dressing','Signage and wayfinding for festivals / events','Stands and exhibition spaces','Projection mapping and LED visuals (concept)','Complete space art direction'], tags:['Festival','Stand','Stage','Event'] }
  ]},

  // ─── PROCESS ─────────────────────────────────────────
  process_label: { fr: 'Process', en: 'Process' },
  process_h2: { fr: 'Comment je travaille', en: 'How I work' },
  process_h2_sub: { fr: 'Une méthode claire, des livrables précis, zéro surprise.', en: 'A clear method, precise deliverables, zero surprises.' },
  process_step1_num: { fr: '01', en: '01' },
  process_step1_title: { fr: 'Brief', en: 'Brief' },
  process_step1_desc: { fr: "On définit ensemble l'objectif, le contexte, les contraintes et le budget. Je pose les bonnes questions pour ne pas partir dans la mauvaise direction.", en: 'We define together the goal, context, constraints and budget. I ask the right questions to avoid going in the wrong direction.' },
  process_step2_num: { fr: '02', en: '02' },
  process_step2_title: { fr: 'Concept', en: 'Concept' },
  process_step2_desc: { fr: "Je fais une recherche de direction artistique et je te présente un moodboard. On valide l'axe créatif avant de passer à l'exécution.", en: 'I research art directions and present a moodboard. We validate the creative direction before moving to execution.' },
  process_step3_num: { fr: '03', en: '03' },
  process_step3_title: { fr: 'Création', en: 'Creation' },
  process_step3_desc: { fr: "Je produis le ou les livrables selon l'axe validé. Tu reçois une ou deux propositions avec des variations, pas 10 pistes dans tous les sens.", en: 'I produce the deliverable(s) based on the validated direction. You receive one or two proposals with variations — not 10 random concepts.' },
  process_step4_num: { fr: '04', en: '04' },
  process_step4_title: { fr: 'Révisions', en: 'Revisions' },
  process_step4_desc: { fr: "On affine ensemble. J'inclus 2 tours de révisions dans chaque prestation. Les retours doivent être précis — pas juste \"c'est pas tout à fait ça\".", en: "We refine together. I include 2 rounds of revisions in every service. Feedback must be specific — not just \"it's not quite right\"." },
  process_step5_num: { fr: '05', en: '05' },
  process_step5_title: { fr: 'Livraison', en: 'Delivery' },
  process_step5_desc: { fr: "Tu reçois tous les fichiers dans les formats prévus (SVG, PNG, PDF, MP4…), organisés et nommés proprement. Zéro approximation.", en: 'You receive all files in the agreed formats (SVG, PNG, PDF, MP4…), organised and properly named. Zero approximation.' },
  cond_title: { fr: 'Conditions de travail', en: 'Working conditions' },
  cond1_title: { fr: 'Acompte de 50%', en: '50% deposit' },
  cond1_desc: { fr: 'Tout projet démarre avec un acompte. Pas de travail gratuit.', en: 'Every project starts with a deposit. No free work.' },
  cond2_title: { fr: 'Brief écrit', en: 'Written brief' },
  cond2_desc: { fr: "Je travaille sur la base d'un brief clair. Pas de vague.", en: 'I work from a clear brief. No vagueness.' },
  cond3_title: { fr: '2 tours de révisions', en: '2 revision rounds' },
  cond3_desc: { fr: 'Au-delà, les retours supplémentaires sont facturés.', en: 'Beyond that, extra revisions are billed.' },
  cond4_title: { fr: 'Délais respectés', en: 'Deadlines respected' },
  cond4_desc: { fr: "Je livre dans les temps convenus. En échange, j'attends les retours dans les 48h.", en: 'I deliver on agreed timelines. In return, I expect feedback within 48h.' },

  // ─── PRESS ───────────────────────────────────────────
  press_label: { fr: 'Preuve sociale', en: 'Social proof' },
  press_h2: { fr: 'Vu à la télé, entendu sur le terrain', en: 'In the media & on the ground' },
  press_h2_em: { fr: '', en: '' },
  press_source: { fr: 'ISS 814 sur YouTube', en: 'ISS 814 on YouTube' },
  press_title: { fr: 'ISS 814 parle de son directeur créatif', en: 'ISS 814 talks about his creative director' },
  press_desc: { fr: 'ISS 814 parle de MDG avec enthousiasme. Il dit du bien de son travail, de son sérieux et de ses qualités humaines.', en: 'ISS 814 speaks about MDG with enthusiasm. He praises his work, professionalism and human qualities.' },
  press_timestamp: { fr: 'À partir de 59:12', en: 'Starting at 59:12' },

  // ─── TESTIMONIALS ────────────────────────────────────
  testimonials_label: { fr: 'Témoignages', en: 'Testimonials' },
  testimonials_h2: { fr: 'Ce que disent', en: 'What they say' },
  testimonials_h2_em: { fr: 'ceux qui ont bossé avec moi', en: 'about working with MDG' },
  tq_label: { fr: 'Citation', en: 'Quote' },
  tq_text: { fr: "C'est quelqu'un avec qui je bosse beaucoup. Il est hyper correct, hyper travailleur <em>et trop fort.</em>", en: "He's someone I work with a lot. He's super professional, super hard-working <em>and extremely talented.</em>" },
  tq_role1: { fr: 'Producteur / Artiste · Sénégal', en: 'Producer / Artist · Senegal' },
  tq_stat1_label: { fr: 'Artistes en vidéo', en: 'Artists on video' },
  tq_stat2_label: { fr: 'Collaborations', en: 'Collaborations' },

  // ─── CONTACT ─────────────────────────────────────────
  contact_label: { fr: 'Contact', en: 'Contact' },
  contact_h2_1: { fr: 'On crée', en: "Let's create" },
  contact_h2_2: { fr: 'quelque chose ?', en: 'something?' },
  contact_sub: { fr: 'Brand identity, cover art, motion, web design, print. Écris-moi, je réponds sous 48h.', en: 'Brand identity, cover art, motion, web design, print. Write to me, I reply within 48h.' },
  info_location_label: { fr: 'Localisation', en: 'Location' },
  info_location_val: { fr: 'Kaolack, Sénégal', en: 'Kaolack, Senegal' },
  info_lang_label: { fr: 'Langues', en: 'Languages' },
  info_lang_val: { fr: 'Français · Wolof · Anglais', en: 'French · Wolof · English' },
  info_reply_label: { fr: 'Réponse', en: 'Response' },
  info_reply_val: { fr: 'Moins de 24h', en: 'Under 24h' },

  // ─── AWARDS ──────────────────────────────────────────
  awards_label: { fr: 'Reconnaissances', en: 'Recognition' },
  awards_title_1: { fr: 'Ce que les autres', en: 'What others' },
  awards_title_em: { fr: ' disent du travail', en: ' say about the work' },
  award1_name: { fr: 'Behance Featured', en: 'Behance Featured' },
  award1_desc: { fr: 'Plusieurs projets mis en avant par la communauté Behance pour leur direction artistique et leur cohérence visuelle.', en: 'Several projects highlighted by the Behance community for their art direction and visual consistency.' },
  award2_name: { fr: 'Streaming Cover Art', en: 'Streaming Cover Art' },
  award2_desc: { fr: 'Cover art diffusées sur Spotify, Apple Music et Deezer pour des artistes sénégalais avec des millions de streams cumulés.', en: 'Cover art broadcast on Spotify, Apple Music and Deezer for Senegalese artists with millions of cumulative streams.' },
  award3_name: { fr: '50+ Collaborations', en: '50+ Collaborations' },
  award3_desc: { fr: "Plus de 50 artistes et marques africaines accompagnés sur des projets de brand identity, cover art et motion design.", en: 'Over 50 African artists and brands supported on brand identity, cover art and motion design projects.' },

  // ─── FOOTER ──────────────────────────────────────────
  footer_brand_desc: { fr: "Basé à Kaolack, Sénégal. Je travaille avec des artistes et des marques qui ont quelque chose à dire. Et je m'assure que ça se voit.", en: 'Based in Kaolack, Senegal. I work with artists and brands that have something to say. And I make sure it shows.' },
  footer_nav_title: { fr: 'Navigation', en: 'Navigation' },
  footer_contact_title: { fr: 'Contact', en: 'Contact' },
  footer_location_label: { fr: 'Localisation', en: 'Location' },
  footer_copyright: { fr: '© 2026 MDG Creative Studio · Tous droits réservés', en: '© 2026 MDG Creative Studio · All rights reserved' },

  // ─── POPUP CONTACT ───────────────────────────────────
  cpop_label: { fr: 'Contact', en: 'Contact' },
  cpop_title_1: { fr: 'Travaillons', en: "Let's work" },
  cpop_title_em: { fr: ' ensemble', en: ' together' },
  cpop_sub: { fr: 'Choisis le canal qui te convient, je réponds sous 24h.', en: 'Pick your preferred channel, I reply within 24h.' },

  // ─── IG BANNER ───────────────────────────────────────
  ig_banner_text: { fr: '<strong>Meilleure expérience</strong> : ouvre ce site dans ton navigateur.', en: '<strong>Better experience</strong> — open this in your browser.' },
  ig_banner_open: { fr: 'Ouvrir dans Safari / Chrome', en: 'Open in Safari / Chrome' },

  // ─── MODAL CLOSE / FERMER ────────────────────────────
  close_label: { fr: 'Fermer', en: 'Close' },

  // ─── LOADER ──────────────────────────────────────────
  loader_text: { fr: 'MDG Creative Studio', en: 'MDG Creative Studio' },

  // ─── TYPING WORDS ────────────────────────────────────
  type_words_fr: { fr: null, en: null }, // handled separately

  // ─── EASTER EGG ──────────────────────────────────────
  ee_sub: { fr: "Tu as trouvé l'easter egg 🎉", en: 'You found the easter egg 🎉' },
  ee_hint: { fr: 'ESC pour quitter', en: 'ESC to exit' },

  // ─── SEC LABELS EXTRA ────────────────────────────────
  sec_collabs_num: { fr: '—', en: '—' },

  // ─── PRICING ─────────────────────────────────────────
  pricing_label: { fr: 'Investissement', en: 'Investment' },
  pricing_h2: { fr: 'Choisis ton <em>pack</em>', en: 'Choose your <em>pack</em>' },
  pricing_sub: { fr: "Trois packs, calibrés pour trois moments d'un projet. Les fourchettes de prix sont affichées ci-dessous.", en: "Three packs, calibrated for three stages of a project. Prices shown below." },
  pricing_tab_primary: { fr: 'Packs Primaires', en: 'Primary Packs' },
  pricing_tab_advanced: { fr: 'Packs Avancés', en: 'Advanced Packs' },
  pricing_tab_rollout: { fr: 'Rollout', en: 'Rollout' },
  pricing_tab_addons: { fr: 'Compléments', en: 'Add-ons' },

  // Pack cards labels
  pack_silver_tier: { fr: 'Pack — Cover Simple', en: 'Pack — Single Cover' },
  pack_silver_name: { fr: 'Silver', en: 'Silver' },
  pack_silver_sub: { fr: 'Idéal pour un single ou projet rapide.', en: 'Ideal for a single or quick project.' },
  pack_gold_tier: { fr: 'Pack — Mixtape / EP', en: 'Pack — Mixtape / EP' },
  pack_gold_name: { fr: 'Gold', en: 'Gold' },
  pack_gold_sub: { fr: 'Pour EP ou mixtape avec support réseaux sociaux inclus.', en: 'For EP or mixtape with social media support included.' },
  pack_diamond_tier: { fr: 'Pack — Album', en: 'Pack — Album' },
  pack_diamond_name: { fr: 'Diamond', en: 'Diamond' },
  pack_diamond_sub: { fr: 'Pour album complet avec mini direction artistique offerte.', en: 'For a full album with complimentary mini art direction.' },
  pack_diamond_badge: { fr: 'Le + complet', en: 'Most complete' },
  pack_cta: { fr: 'Démarrer ce pack →', en: 'Start this pack →' },

  // Packs avancés
  adv_spotlight_title: { fr: 'Single Edition', en: 'Single Edition' },
  adv_spotlight_sub: { fr: 'Communication complète pour un single', en: 'Full communication for a single' },
  adv_magnum_title: { fr: 'EP Edition', en: 'EP Edition' },
  adv_magnum_sub: { fr: 'Pour un EP entre 2 et 7 titres', en: 'For an EP of 2 to 7 tracks' },
  adv_prestige_title: { fr: 'Album Edition', en: 'Album Edition' },
  adv_prestige_sub: { fr: "L'arsenal complet pour un album", en: 'The complete arsenal for an album' },
  adv_cta: { fr: 'Démarrer ce pack →', en: 'Start this pack →' },

  // Rollout
  rollout_label: { fr: 'Full Campaign', en: 'Full Campaign' },
  rollout_title: { fr: 'ROLLOUT', en: 'ROLLOUT' },
  rollout_sub: { fr: 'La campagne complète, du visuel à la rue.', en: 'The complete campaign, from visual to street.' },
  rollout_cta: { fr: 'Lancer le projet →', en: 'Launch the project →' },
  rollout_unit: { fr: 'XOF — Full Campaign', en: 'XOF — Full Campaign' },

  // Pricing note
  pricing_note_title: { fr: 'Conditions générales', en: 'General terms' },
  pricing_note_body: { fr: '<strong>Acompte 50%</strong> avant démarrage de tout projet. Solde à la livraison finale. <strong>3 révisions</strong> incluses par projet. Au-delà, chaque correction est facturée selon le temps passé. Urgences : <strong>+10%</strong> sur le tarif. Projets longue durée : <strong>-20%</strong>. Disponible <strong>Lun à Sam, 09h à minuit</strong>. Contact : mdgdesign221@gmail.com', en: '<strong>50% deposit</strong> before any project starts. Balance due on final delivery. <strong>3 revisions</strong> included per project. Beyond that, each correction is billed by time spent. Rush jobs: <strong>+10%</strong>. Long-term projects: <strong>-20%</strong>. Available <strong>Mon to Sat, 9am to midnight</strong>. Contact: mdgdesign221@gmail.com' },

  // Add-ons
  addon_lyrics_name: { fr: 'Lyrics Videos', en: 'Lyrics Videos' },
  addon_lyrics_detail: { fr: 'Vidéo animée avec paroles synchronisées sur la musique.', en: 'Animated video with lyrics synced to the music.' },
  addon_lyrics_price: { fr: 'Basique 60K · Intermédiaire 80K · Avancé 100K XOF', en: 'Basic 60K · Intermediate 80K · Advanced 100K XOF' },
  addon_flyer_name: { fr: 'Flyers & Affiches', en: 'Flyers & Posters' },
  addon_flyer_detail: { fr: 'Visuels impactants pour concerts, événements et promotions.', en: 'Impactful visuals for concerts, events and promotions.' },
  addon_flyer_price: { fr: 'Affiche simple 25K · Multi-formats 50K XOF', en: 'Single poster 25K · Multi-format 50K XOF' },
  addon_motion_name: { fr: 'Motion Cover', en: 'Motion Cover' },
  addon_motion_detail: { fr: "Animation de cover, fluide et immersive.", en: 'Cover animation, fluid and immersive.' },
  addon_motion_price: { fr: 'Simple 40K · Motion design avancé 60K XOF', en: 'Simple 40K · Advanced motion design 60K XOF' },
  addon_canvas_name: { fr: 'Canvas Spotify & Apple Music', en: 'Canvas Spotify & Apple Music' },
  addon_canvas_detail: { fr: "Vidéo animée courte (jusqu'à 8s) optimisée pour le streaming.", en: 'Short animated video (up to 8s) optimised for streaming.' },
  addon_canvas_price: { fr: 'Motion simple 30K · Animation dynamique 50K XOF', en: 'Simple motion 30K · Dynamic animation 50K XOF' },
  addon_yt_name: { fr: 'Bannière YouTube', en: 'YouTube Banner' },
  addon_yt_detail: { fr: 'Bannière de chaîne optimisée pour YouTube.', en: 'Channel banner optimised for YouTube.' },
  addon_yt_price: { fr: '30.000 XOF', en: '30,000 XOF' },
  addon_fb_name: { fr: 'Bannière Facebook / X', en: 'Facebook / X Banner' },
  addon_fb_detail: { fr: 'Couverture profil pour Facebook ou X (ex-Twitter).', en: 'Profile cover for Facebook or X (ex-Twitter).' },
  addon_fb_price: { fr: '20.000 XOF', en: '20,000 XOF' },
  addon_story_name: { fr: 'Déclinaison Story', en: 'Story Format' },
  addon_story_detail: { fr: 'Format story pour Instagram, Facebook, TikTok, etc.', en: 'Story format for Instagram, Facebook, TikTok, etc.' },
  addon_story_price: { fr: '15.000 XOF', en: '15,000 XOF' },
  addon_pack_name: { fr: 'Pack Multi-Formats', en: 'Multi-Format Pack' },
  addon_pack_detail: { fr: 'Story + Post + Bannière, présence optimisée sur toutes les plateformes.', en: 'Story + Post + Banner, optimised presence across all platforms.' },
  addon_pack_price: { fr: '50.000 XOF', en: '50,000 XOF' },

  addons_intro: { fr: "Ces éléments peuvent s'ajouter à n'importe quel pack, ou être commandés séparément. Chaque livrable est conçu avec le même niveau d'exigence que le reste.", en: "These elements can be added to any pack, or ordered separately. Each deliverable is crafted with the same level of quality as everything else." },

  // Modal pack form
  pack_modal_receive: { fr: 'Ce que tu reçois', en: "What's included" },
  pack_modal_send: { fr: 'Envoyer une demande', en: 'Send a request' },
  pack_modal_name_ph: { fr: 'Ton nom / nom d\'artiste', en: 'Your name / artist name' },
  pack_modal_contact_ph: { fr: 'WhatsApp ou email', en: 'WhatsApp or email' },
  pack_modal_msg_ph: { fr: 'Décris ton projet en quelques mots (type de sortie, style, date visée…)', en: 'Describe your project briefly (release type, style, target date…)' },
  pack_modal_submit: { fr: 'Envoyer la demande →', en: 'Send request →' },
  pack_modal_alt: { fr: 'Ou contacte directement via', en: 'Or contact directly via' },

  // Currency converter
  cc_title: { fr: 'Convertisseur de devises', en: 'Currency converter' },
  cc_badge: { fr: 'Indicatif', en: 'Indicative' },
  cc_sub: { fr: 'Les prix sont en XOF (Franc CFA). Convertis en ta devise pour estimer le budget.', en: 'Prices are in XOF (CFA Franc). Convert to your currency to estimate the budget.' },
  cc_amount_label: { fr: 'Montant XOF', en: 'Amount XOF' },
  cc_disclaimer: { fr: 'Taux de change approximatifs — à titre indicatif uniquement. 1 EUR ≈ 655 XOF (taux fixe CFA).', en: 'Approximate exchange rates — indicative only. 1 EUR ≈ 655 XOF (fixed CFA rate).' },

  // Devis form
  devis_title: { fr: 'Demander un devis', en: 'Request a quote' },
  devis_sub: { fr: 'Décris-moi ton projet. Je te reviens sous 24h avec une proposition.', en: 'Describe your project. I\'ll get back to you within 24h with a proposal.' },
  devis_name_label: { fr: 'Ton nom / Artiste', en: 'Your name / Artist' },
  devis_email_label: { fr: 'Email ou WhatsApp', en: 'Email or WhatsApp' },
  devis_service_label: { fr: 'Type de projet', en: 'Project type' },
  devis_budget_label: { fr: 'Budget approximatif', en: 'Approximate budget' },
  devis_desc_label: { fr: 'Décris ton projet', en: 'Describe your project' },
  devis_btn: { fr: 'Envoyer la demande', en: 'Send request' },
  devis_note: { fr: 'Réponse sous 24h. Tes infos restent entre nous, point.', en: 'Reply within 24h. Your info stays private, period.' },
  devis_success_title: { fr: "C'est parti !", en: "You're all set!" },
  devis_success_msg: { fr: 'Je te reviens sous 24h. Tu peux aussi me joindre directement sur WhatsApp si c\'est urgent.', en: 'I\'ll get back to you within 24h. You can also reach me directly on WhatsApp if urgent.' },
};

// ─── Éléments à patcher directement par sélecteur ────
// Format: [ selector, key, attribute_or_innerHTML ]
// attribute: 'text' = textContent, 'html' = innerHTML, 'aria-label' = attr
var patches = [

  // NAV links — ciblage par href, pas par position (évite le décalage)
  ['.nav-links a[href="#portfolio-accordion"]', 'nav_work', 'text'],
  ['.nav-links a[href="#about"]', 'nav_about', 'text'],
  ['.nav-links a[href="#services"]', 'nav_services', 'text'],
  ['.nav-links a[href="#collabs"]', 'collabs_label', 'text'],
  ['.nav-links a[href="#pricing"]', 'nav_pricing', 'text'],
  ['.nav-links a[href="#contact"]', 'contact_label', 'text'],

  // Mobile menu
  ['.mob-menu a[href="#about"]', 'nav_about', 'text'],
  ['.mob-menu a[href="#portfolio-accordion"]', 'nav_work', 'text'],
  ['.mob-menu a[data-i18n="nav_covers"]', 'nav_covers', 'text'],
  ['.mob-menu a[href="#services"]', 'nav_services', 'text'],
  ['.mob-menu a[href="#process"]', 'nav_process', 'text'],
  ['.mob-menu a[href="#testimonials"]', 'nav_testimonials', 'text'],
  ['.mob-menu a[href="#contact"]', 'contact_label', 'text'],

  // HERO
  ['.hero-eyebrow', 'hero_eyebrow', 'text'],
  ['.hero-sub', 'hero_promise', 'text'],
  ['.hero-btn-primary', 'hero_btn_primary', 'text'],
  ['.hero-btn-secondary', 'hero_btn_secondary', 'text'],
  ['.stat-label:nth-of-type(1)', 'stat_years_label', 'text'],
  ['.stat-mini-label:nth-of-type(1)', 'stat_mini_years', 'text'],

  // ABOUT
  ['.about-badge strong', 'about_badge_avail', 'text'],
  ['.apt-role', 'apt_role', 'text'],
  ['.apt-city', 'apt_city', 'text'],

  // WORK
  ['#workPrev', 'work_prev', 'aria-label'],
  ['#workNext', 'work_next', 'aria-label'],

  // CONTACT section
  ['.info-item:nth-child(1) .info-label', 'info_location_label', 'text'],
  ['.info-item:nth-child(1) .info-value', 'info_location_val', 'text'],
  ['.info-item:nth-child(2) .info-label', 'info_lang_label', 'text'],
  ['.info-item:nth-child(2) .info-value', 'info_lang_val', 'text'],
  ['.info-item:nth-child(3) .info-label', 'info_reply_label', 'text'],
  ['.info-item:nth-child(3) .info-value', 'info_reply_val', 'text'],

  // POPUP CONTACT
  ['.cpop-label', 'cpop_label', 'text'],
  ['.cpop-sub', 'cpop_sub', 'text'],

  // FOOTER
  ['.footer-col:nth-child(2) h4', 'footer_nav_title', 'text'],
  ['.footer-col:nth-child(3) h4', 'footer_contact_title', 'text'],

  // AWARDS label
  ['.awards-header .sec-label', 'awards_label', 'text'],

  // TESTIMONIALS
  ['.tq-label', 'tq_label', 'text'],
  ['.tq-role', 'tq_role1', 'text'],
  ['.tq-stat:nth-child(1) .tq-stat-label', 'tq_stat1_label', 'text'],
  ['.tq-stat:nth-child(2) .tq-stat-label', 'tq_stat2_label', 'text'],

  // PRESS
  ['.press-source', 'press_source', 'text'],
  ['.press-title', 'press_title', 'text'],
  ['.press-desc', 'press_desc', 'text'],

  // PROCESS label/cond
  ['#process .cond-title', 'cond_title', 'text'],

  // EASTER EGG
  ['.ee-sub', 'ee_sub', 'text'],
  ['.ee-hint', 'ee_hint', 'text'],
];

// ─── Éléments avec data-i18n (déjà balisés) ──────────
function applyDataI18n(lang) {
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var key = el.getAttribute('data-i18n');
    if (translations[key] && translations[key][lang] !== null) {
      el.textContent = translations[key][lang];
    }
  });
}

// ─── Éléments complexes patchés manuellement ──────────
function applyComplexPatches(lang) {

  // ── Ticker ──
  var tickerInner = document.querySelector('.nav-ticker-inner');
  if (tickerInner) {
    var t1 = translations.tick1[lang];
    var t2 = translations.tick2[lang];
    tickerInner.innerHTML =
      '<span>'+t1+'</span><span class="tick-sep">✦</span>' +
      '<span>Kaolack, Sénégal</span><span class="tick-sep">✦</span>' +
      '<span>Creative Director</span><span class="tick-sep">✦</span>' +
      '<span>Brand · Cover Art · Motion · Web</span><span class="tick-sep">✦</span>' +
      '<span>'+t2+'</span><span class="tick-sep">✦</span>' +
      '<span>@_its.mdg</span><span class="tick-sep">✦</span>' +
      '<span>'+t1+'</span><span class="tick-sep">✦</span>' +
      '<span>Kaolack, Sénégal</span><span class="tick-sep">✦</span>' +
      '<span>Creative Director</span><span class="tick-sep">✦</span>' +
      '<span>Brand · Cover Art · Motion · Web</span><span class="tick-sep">✦</span>' +
      '<span>'+t2+'</span><span class="tick-sep">✦</span>' +
      '<span>@_its.mdg</span><span class="tick-sep">✦</span>';
  }

  // ── Stat labels / sub (hero stats bar) ──
  var statEls = document.querySelectorAll('.hero-stats .stat');
  var statData = [
    { label: translations.stat_years_label[lang], sub: translations.stat_years_sub[lang] },
    { label: translations.stat_artists_label[lang], sub: translations.stat_artists_sub[lang] },
    { label: translations.stat_countries_label[lang], sub: translations.stat_countries_sub[lang] },
  ];
  statEls.forEach(function(stat, i){
    if (!statData[i]) return;
    var lbl = stat.querySelector('.stat-label');
    var sub = stat.querySelector('.stat-sub');
    if (lbl) lbl.textContent = statData[i].label;
    if (sub) sub.textContent = statData[i].sub;
  });

  // ── Hero mini stats ──
  var miniLabels = document.querySelectorAll('.hero-mini-stats .stat-mini-label');
  var miniKeys = ['stat_mini_years','stat_mini_projects','stat_mini_artists','stat_mini_countries'];
  miniLabels.forEach(function(el, i){
    if (translations[miniKeys[i]]) el.textContent = translations[miniKeys[i]][lang];
  });

  // ── About section ──
  var aboutLabel = document.querySelector('#about .sec-label');
  if (aboutLabel) aboutLabel.textContent = translations.about_label[lang];
  var aboutTitle = document.querySelector('.about-title');
  if (aboutTitle) aboutTitle.innerHTML = translations.about_title[lang];
  var aboutTexts = document.querySelectorAll('.about-text');
  var aboutKeys = ['about_p1','about_p2','about_p3'];
  aboutTexts.forEach(function(el, i){
    if (translations[aboutKeys[i]]) el.innerHTML = translations[aboutKeys[i]][lang];
  });
  // Skills
  var skNames = document.querySelectorAll('.sk-name');
  var skDescs = document.querySelectorAll('.sk-desc');
  var skNameKeys = ['sk1_name','sk2_name','sk3_name','sk4_name'];
  var skDescKeys = ['sk1_desc','sk2_desc','sk3_desc','sk4_desc'];
  skNames.forEach(function(el, i){ if(translations[skNameKeys[i]]) el.textContent = translations[skNameKeys[i]][lang]; });
  skDescs.forEach(function(el, i){ if(translations[skDescKeys[i]]) el.textContent = translations[skDescKeys[i]][lang]; });

  // ── Collabs ──
  var collabsLabel = document.querySelector('#collabs .sec-label');
  if (collabsLabel) collabsLabel.textContent = lang === 'en' ? 'Outstanding collaborations' : 'Collaborations d\'exception';
  var collabsTitle = document.querySelector('.collabs-main-title');
  if (collabsTitle) {
    if (lang === 'en') collabsTitle.innerHTML = 'Alongside those<br><em>who shape the scene</em>';
    else collabsTitle.innerHTML = 'Aux côtés de<br><em>ceux qui font la scène</em>';
  }
  var collabsSub = document.querySelector('.collabs-main-sub');
  if (collabsSub) collabsSub.textContent = lang === 'en'
    ? 'From Kaolack to Dakar, the Senegalese and African scene through one single vision.'
    : 'De Kaolack à Dakar, la scène sénégalaise et africaine concentrée en une seule vision.';
  var collabsCountLabel = document.querySelector('.collabs-counter-txt');
  if (collabsCountLabel) collabsCountLabel.textContent = lang === 'en' ? 'artists' : 'artistes';

  // ── Work section ──
  var workLabel = document.querySelector('#work .sec-label');
  if (workLabel) workLabel.textContent = translations.work_label[lang];
  var workReveal = document.querySelector('.work-h2 .text-reveal:first-child .text-reveal-inner');
  if (workReveal) workReveal.textContent = translations.work_h2[lang];
  var workSub = document.querySelector('#work .sec-sub');
  if (workSub) workSub.textContent = translations.work_h2_sub[lang];

  // ── Covers section ──
  var covsLabel = document.querySelector('#covers .sec-label');
  if (covsLabel) covsLabel.textContent = translations.covers_label[lang];
  var covsReveal = document.querySelector('#covers .text-reveal .text-reveal-inner');
  if (covsReveal) covsReveal.textContent = translations.covers_h2[lang];
  var covsSub = document.querySelector('#covers .sec-sub');
  if (covsSub) covsSub.textContent = translations.covers_h2_sub[lang];

  // ── Services section ──
  var svcLabel = document.querySelector('#services .sec-label');
  if (svcLabel) svcLabel.textContent = translations.services_label[lang];
  var svcH2 = document.querySelector('.svc-h2');
  if (svcH2) {
    if (lang === 'en') svcH2.innerHTML = '<em>Expertise</em> & services';
    else svcH2.innerHTML = '<em>Expertises</em> & services';
  }
  var svcCtaBtns = document.querySelectorAll('.svc-cta');
  svcCtaBtns.forEach(function(btn){ btn.textContent = translations.svc_cta_text[lang]; });

  // Services cards titles & descriptions
  var svcCards = document.querySelectorAll('.svc-card');
  var svcTitleKeys = ['svc1_title','svc2_title','svc3_title','svc4_title','svc5_title','svc6_title','svc7_title','svc8_title'];
  var svcDescKeys = ['svc1_desc','svc2_desc','svc3_desc','svc4_desc','svc5_desc','svc6_desc','svc7_desc','svc8_desc'];
  svcCards.forEach(function(card, i){
    var titleEl = card.querySelector('.svc-name');
    var descEl = card.querySelector('.svc-tagline');
    if (titleEl && translations[svcTitleKeys[i]]) titleEl.textContent = translations[svcTitleKeys[i]][lang];
    if (descEl && translations[svcDescKeys[i]]) descEl.textContent = translations[svcDescKeys[i]][lang];
  });

  // ── Services modals — remplacer les données ──
  if (lang === 'en') {
    window._servicesDataEn = translations.svc_data_en.en;
  } else {
    window._servicesDataEn = null;
  }

  // ── Pricing section ──
  var pricingLabel = document.querySelector('#pricing .sec-label');
  if (pricingLabel) pricingLabel.textContent = translations.pricing_label[lang];
  var pricingH2 = document.querySelector('#pricing h2');
  if (pricingH2) pricingH2.innerHTML = translations.pricing_h2[lang];
  var pricingSub = document.querySelector('#pricing .pricing-header p');
  if (pricingSub) pricingSub.textContent = translations.pricing_sub[lang];

  // Tabs
  var pricingTabs = document.querySelectorAll('.pricing-tab');
  var tabKeys = ['pricing_tab_primary','pricing_tab_advanced','pricing_tab_rollout','pricing_tab_addons'];
  pricingTabs.forEach(function(tab, i){ if(translations[tabKeys[i]]) tab.textContent = translations[tabKeys[i]][lang]; });

  // Pack primaires sub-titles & CTAs
  var packTiers = document.querySelectorAll('.pack-tier');
  var packNames = document.querySelectorAll('.pack-name');
  var packSubs  = document.querySelectorAll('.pack-sub');
  var packCtaBtns = document.querySelectorAll('.pack-cta');
  var packBadge = document.querySelector('.pack-badge');
  var packTierKeys = ['pack_silver_tier','pack_gold_tier','pack_diamond_tier'];
  var packNameKeys = ['pack_silver_name','pack_gold_name','pack_diamond_name'];
  var packSubKeys  = ['pack_silver_sub','pack_gold_sub','pack_diamond_sub'];
  packTiers.forEach(function(el,i){ if(translations[packTierKeys[i]]) el.textContent = translations[packTierKeys[i]][lang]; });
  packNames.forEach(function(el,i){ if(translations[packNameKeys[i]]) el.textContent = translations[packNameKeys[i]][lang]; });
  packSubs.forEach(function(el,i){ if(translations[packSubKeys[i]]) el.textContent = translations[packSubKeys[i]][lang]; });
  packCtaBtns.forEach(function(el){ el.textContent = translations.pack_cta[lang]; });
  if (packBadge) packBadge.textContent = translations.pack_diamond_badge[lang];

  // Pack features (bullets)
  var packFeaturesData = [
    { // Silver
      fr: [
        '<strong>1 concept</strong> graphique pour ta cover',
        '<strong>2 révisions</strong> incluses',
        'Livrables <strong>PNG / JPG</strong> haute résolution',
        '<em>Option :</em> déclinaison story/post <strong>+5.000 XOF</strong>'
      ],
      en: [
        '<strong>1 graphic concept</strong> created for your cover',
        '<strong>2 revisions</strong> included',
        '<strong>PNG / JPG</strong> high-resolution deliverables',
        '<em>Option:</em> story/post adaptation <strong>+5,000 XOF</strong>'
      ]
    },
    { // Gold
      fr: [
        '<strong>1 concept</strong> graphique pour ta cover',
        '<strong>3 révisions</strong> incluses',
        'Livrables PNG/JPG + <strong>tracklist complète</strong>',
        'Visuels réseaux : <strong>COMING SOON</strong> &amp; <strong>OUT NOW</strong>',
        '<em>Option :</em> déclinaison story/post <strong>+5.000 XOF</strong>'
      ],
      en: [
        '<strong>1 graphic concept</strong> created for your cover',
        '<strong>3 revisions</strong> included',
        'PNG/JPG deliverables + <strong>full tracklist</strong>',
        'Social visuals: <strong>COMING SOON</strong> &amp; <strong>OUT NOW</strong>',
        '<em>Option:</em> story/post adaptation <strong>+5,000 XOF</strong>'
      ]
    },
    { // Diamond
      fr: [
        '<strong>1 concept</strong> graphique premium pour ta cover',
        '<strong>4 révisions</strong> incluses',
        'PNG/JPG + <strong>tracklist pro</strong> + support réseaux complet',
        '<strong>Bonus offert :</strong> mini direction artistique (moodboard, palette, typo)'
      ],
      en: [
        '<strong>1 premium graphic concept</strong> for your cover',
        '<strong>4 revisions</strong> included',
        'PNG/JPG + <strong>pro tracklist</strong> + full social support',
        '<strong>Free bonus:</strong> mini art direction (moodboard, palette, type)'
      ]
    }
  ];
  document.querySelectorAll('.pack-card:not(.adv-card)').forEach(function(card, i) {
    if (!packFeaturesData[i]) return;
    var items = card.querySelectorAll('.pack-features li');
    var texts = lang === 'en' ? packFeaturesData[i].en : packFeaturesData[i].fr;
    items.forEach(function(li, j) {
      if (!texts[j]) return;
      var icon = li.querySelector('.feat-icon');
      var div = li.querySelector('div');
      if (div) div.innerHTML = texts[j];
    });
  });

  // Packs avancés
  var advTitles = document.querySelectorAll('.adv-title');
  var advSubs   = document.querySelectorAll('.adv-subtitle');
  var advCtaBtns= document.querySelectorAll('.adv-cta');
  var advTitleKeys = ['adv_spotlight_title','adv_magnum_title','adv_prestige_title'];
  var advSubKeys   = ['adv_spotlight_sub','adv_magnum_sub','adv_prestige_sub'];
  advTitles.forEach(function(el,i){ if(translations[advTitleKeys[i]]) el.textContent = translations[advTitleKeys[i]][lang]; });
  advSubs.forEach(function(el,i){ if(translations[advSubKeys[i]]) el.textContent = translations[advSubKeys[i]][lang]; });
  advCtaBtns.forEach(function(el){ el.textContent = translations.adv_cta[lang]; });

  // Rollout
  var rolloutLabel = document.querySelector('.rollout-label');
  if (rolloutLabel) rolloutLabel.textContent = translations.rollout_label[lang];
  var rolloutCta = document.querySelector('.rollout-price-cta');
  if (rolloutCta) rolloutCta.textContent = translations.rollout_cta[lang];

  // Pricing note
  var pricingNoteTitle = document.querySelector('.pricing-note-text h4');
  if (pricingNoteTitle) pricingNoteTitle.textContent = translations.pricing_note_title[lang];
  var pricingNoteBody = document.querySelector('.pricing-note-text p');
  if (pricingNoteBody) pricingNoteBody.innerHTML = translations.pricing_note_body[lang];

  // Modal pack texts
  var pmSectionTitles = document.querySelectorAll('.pack-modal-section-title');
  if (pmSectionTitles[0]) pmSectionTitles[0].textContent = translations.pack_modal_receive[lang];
  if (pmSectionTitles[1]) pmSectionTitles[1].textContent = translations.pack_modal_send[lang];
  var pmNameInput = document.getElementById('modal-name');
  if (pmNameInput) pmNameInput.placeholder = translations.pack_modal_name_ph[lang];
  var pmContactInput = document.getElementById('modal-contact');
  if (pmContactInput) pmContactInput.placeholder = translations.pack_modal_contact_ph[lang];
  var pmMsgInput = document.getElementById('modal-msg');
  if (pmMsgInput) pmMsgInput.placeholder = translations.pack_modal_msg_ph[lang];
  var pmSubmit = document.querySelector('.pack-modal-submit');
  if (pmSubmit) pmSubmit.textContent = translations.pack_modal_submit[lang];
  var pmAlt = document.querySelector('.pack-modal-alt');
  if (pmAlt) {
    var lang_or = lang === 'en' ? 'Or contact directly via' : 'Ou contacte directement via';
    pmAlt.innerHTML = lang_or + ' <a href="https://wa.me/221763772208" target="_blank">WhatsApp</a> · <a href="https://instagram.com/_its.mdg" target="_blank">Instagram</a>';
  }

  // Devis form
  var devisHeader = document.querySelector('.devis-header h3');
  if (devisHeader) devisHeader.textContent = translations.devis_title[lang];
  var devisHeaderP = document.querySelector('.devis-header p');
  if (devisHeaderP) devisHeaderP.textContent = translations.devis_sub[lang];
  var devisBtn = document.getElementById('devisBtn');
  if (devisBtn) {
    devisBtn.childNodes[0].textContent = translations.devis_btn[lang] + ' ';
  }
  var devisNote = document.querySelector('.devis-note');
  if (devisNote) devisNote.textContent = translations.devis_note[lang];
  var devisSuccessTitle = document.querySelector('.devis-success h4');
  if (devisSuccessTitle) devisSuccessTitle.textContent = translations.devis_success_title[lang];
  var devisSuccessMsg = document.querySelector('.devis-success p');
  if (devisSuccessMsg) devisSuccessMsg.textContent = translations.devis_success_msg[lang];

  // Devis labels
  var devisLabels = document.querySelectorAll('.devis-field label');
  var devisLabelKeys = ['devis_name_label','devis_email_label','devis_service_label','devis_budget_label','devis_desc_label'];
  devisLabels.forEach(function(el,i){ if(translations[devisLabelKeys[i]]) el.textContent = translations[devisLabelKeys[i]][lang]; });

  // Currency converter
  if (typeof convertCurrency === 'function') convertCurrency();

  // ── Process ──
  var processLabel = document.querySelector('#process .sec-label');
  if (processLabel) processLabel.textContent = translations.process_label[lang];
  var processH2 = document.querySelector('#process .svc-h2, #process .work-h2');
  if (processH2) {
    var pInner = processH2.querySelector('.text-reveal-inner');
    if (pInner) pInner.textContent = translations.process_h2[lang];
  }
  var processSub = document.querySelector('#process .sec-sub');
  if (processSub) processSub.textContent = translations.process_h2_sub[lang];

  // Process steps
  var steps = document.querySelectorAll('.process-step');
  var stepTKeys = ['process_step1_title','process_step2_title','process_step3_title','process_step4_title','process_step5_title'];
  var stepDKeys = ['process_step1_desc','process_step2_desc','process_step3_desc','process_step4_desc','process_step5_desc'];
  steps.forEach(function(step, i){
    var tEl = step.querySelector('.ps-title');
    var dEl = step.querySelector('.ps-desc');
    if (tEl && translations[stepTKeys[i]]) tEl.textContent = translations[stepTKeys[i]][lang];
    if (dEl && translations[stepDKeys[i]]) dEl.textContent = translations[stepDKeys[i]][lang];
  });

  // Conditions de travail (proc-cond)
  var procConds = document.querySelectorAll('.proc-cond');
  var procCondData = [
    { label: { fr: 'Disponibilité', en: 'Availability' }, detail: { fr: 'Lun à Sam, 09h à minuit', en: 'Mon to Sat, 9am to midnight' }, expl: { fr: "Tu peux m'écrire le matin ou le soir, je réponds toujours dans la journée, même le samedi.", en: "You can reach me morning or evening — I always reply the same day, even on Saturday." } },
    { label: { fr: 'Retouches incluses', en: 'Revisions included' }, detail: { fr: 'Corrections supplémentaires au temps passé', en: 'Additional revisions billed by time' }, expl: { fr: "3 modifications offertes par projet. Au-delà, chaque correction est facturée selon le temps réel passé dessus.", en: "3 revisions included per project. Beyond that, each correction is billed based on actual time spent." } },
    { label: { fr: 'Acompte au démarrage', en: 'Upfront deposit' }, detail: { fr: 'Wave · Orange Money · Virement', en: 'Wave · Orange Money · Bank transfer' }, expl: { fr: "La moitié est versée avant le début du travail. Le reste est payé à la livraison finale. Aucune surprise.", en: "Half is paid before work begins. The rest is due at final delivery. No surprises." } },
    { label: { fr: 'Projet urgent', en: 'Urgent project' }, detail: { fr: 'Livraison en moins de 48h', en: 'Delivery in under 48h' }, expl: { fr: "Tu as besoin du résultat très vite ? C'est possible, mais je bloque tout pour toi. Une majoration de 10% s'applique.", en: "Need it fast? It's possible — but I block everything else for you. A 10% surcharge applies." } },
    { label: { fr: 'Partenariat long terme', en: 'Long-term partnership' }, detail: { fr: 'Pour les projets récurrents', en: 'For recurring projects' }, expl: { fr: "Tu reviens régulièrement ? Je t'offre 20% de réduction sur tous tes projets suivants. La fidélité, ça mérite d'être récompensée.", en: "Coming back regularly? I offer 20% off on all your future projects. Loyalty deserves to be rewarded." } }
  ];
  procConds.forEach(function(item, i) {
    if (!procCondData[i]) return;
    var lbl = item.querySelector('.proc-cond-label');
    var det = item.querySelector('.proc-cond-detail');
    var expl = item.querySelector('.proc-cond-expl');
    if (lbl) lbl.textContent = procCondData[i].label[lang];
    if (det) det.textContent = procCondData[i].detail[lang];
    if (expl) expl.textContent = procCondData[i].expl[lang];
  });

  // ── Press ──
  var pressLabel = document.querySelector('#press .sec-label');
  if (pressLabel) pressLabel.textContent = translations.press_label[lang];
  var pressH2 = document.querySelector('#press .svc-h2');
  if (pressH2) {
    if (lang === 'en') pressH2.innerHTML = 'In the media<em> & on the ground</em>';
    else pressH2.innerHTML = 'Vu à la télé,<em> entendu sur le terrain</em>';
  }
  var pressTimestamp = document.querySelector('.press-timestamp');
  if (pressTimestamp) {
    pressTimestamp.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + translations.press_timestamp[lang];
  }

  // ── Testimonials ──
  var testLabel = document.querySelectorAll('#testimonials .sec-label');
  testLabel.forEach(function(el){ el.textContent = translations.testimonials_label[lang]; });
  var testH2 = document.querySelector('#testimonials .svc-h2');
  if (testH2) {
    if (lang === 'en') testH2.innerHTML = 'What they say<em> about working with MDG</em>';
    else testH2.innerHTML = 'Ce que disent<em> ceux qui ont bossé avec moi</em>';
  }
  var tqText = document.querySelector('.tq-text');
  if (tqText) tqText.innerHTML = translations.tq_text[lang];

  // ── Contact section ──
  var contactLabel = document.querySelector('#contact .sec-label');
  if (contactLabel) contactLabel.textContent = translations.contact_label[lang];
  var contactH2 = document.querySelector('.contact-h2');
  if (contactH2) {
    if (lang === 'en') contactH2.innerHTML = '<span class="text-reveal"><span class="text-reveal-inner">Let\'s create</span></span><span class="text-reveal"><em><span class="text-reveal-inner">something?</span></em></span>';
    else contactH2.innerHTML = '<span class="text-reveal"><span class="text-reveal-inner">On crée</span></span><span class="text-reveal"><em><span class="text-reveal-inner">quelque chose ?</span></em></span>';
  }
  var contactSub = document.querySelector('.contact-sub');
  if (contactSub) contactSub.textContent = translations.contact_sub[lang];

  // ── Awards ──
  var awardsH2 = document.querySelector('.awards-title');
  if (awardsH2) {
    if (lang === 'en') awardsH2.innerHTML = 'What others<em> say about the work</em>';
    else awardsH2.innerHTML = 'Ce que les autres<em> disent du travail</em>';
  }
  var awardDescs = document.querySelectorAll('.award-desc');
  var awardDescKeys = ['award1_desc','award2_desc','award3_desc'];
  awardDescs.forEach(function(el, i){
    if (translations[awardDescKeys[i]]) el.textContent = translations[awardDescKeys[i]][lang];
  });

  // ── Footer ──
  var footerBrandDesc = document.querySelector('.footer-brand p');
  if (footerBrandDesc) footerBrandDesc.textContent = translations.footer_brand_desc[lang];
  var footerCopyright = document.querySelector('.footer-bottom p:first-child');
  if (footerCopyright) footerCopyright.textContent = translations.footer_copyright[lang];
  // Footer avail badge
  var footerAvailText = document.querySelector('.f-avail-text');
  if (footerAvailText) footerAvailText.textContent = lang === 'en' ? 'Available' : 'Disponible';
  // Footer nav title (Raccourcis / Shortcuts)
  var footerNavTitle = document.querySelector('.footer-nav-group .f-nav-title');
  if (footerNavTitle) footerNavTitle.textContent = lang === 'en' ? 'Shortcuts' : 'Raccourcis';
  // Footer nav links
  var footerNavLinks = document.querySelectorAll('.footer-nav-group .f-nav-list li a');
  var footerNavTextsFr = ['Projets','Services','Comment je travaille','Tarifs','Collaborations','✦ URANUS GFX','FAQ'];
  var footerNavTextsEn = ['Work','Services','How I work','Pricing','Collaborations','✦ URANUS GFX','FAQ'];
  footerNavLinks.forEach(function(el, i){
    el.textContent = lang === 'en' ? (footerNavTextsEn[i] || el.textContent) : (footerNavTextsFr[i] || el.textContent);
  });
  // Footer local time label
  var footerLocalTimeLbl = document.querySelector('.footer-contact-group .f-contact-item:last-child .f-contact-lbl');
  if (footerLocalTimeLbl) footerLocalTimeLbl.textContent = lang === 'en' ? 'Local time' : 'Heure locale';

  // ── Popup contact ──
  var cpopTitle = document.querySelector('.cpop-title');
  if (cpopTitle) {
    if (lang === 'en') cpopTitle.innerHTML = "Let's work<em> together</em>";
    else cpopTitle.innerHTML = "Travaillons<em> ensemble</em>";
  }

  // ── IG Banner ──
  var igBannerText = document.querySelector('.ig-banner-text');
  if (igBannerText) igBannerText.innerHTML = translations.ig_banner_text[lang];
  var igBannerOpen = document.querySelector('.ig-banner-open');
  if (igBannerOpen) igBannerOpen.textContent = translations.ig_banner_open[lang];

  // ── Aria-labels ──
  var lbClose = document.getElementById('lbClose');
  if (lbClose) lbClose.setAttribute('aria-label', translations.close_label[lang]);
  var cPopClose = document.getElementById('cPopClose');
  if (cPopClose) cPopClose.setAttribute('aria-label', translations.close_label[lang]);
  var modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.setAttribute('aria-label', translations.close_label[lang]);

  // ── Type words (display rotatif) ──
  window._typeWordsEN = ['Brand Identity','Cover Art','Motion Design','Web Design','Art Direction'];
  window._typeWordsFR = ['Brand Identity','Cover Art','Motion Design','Web Design','Direction Artistique'];
  if (lang === 'en') window.typeWords = window._typeWordsEN;
  else window.typeWords = window._typeWordsFR;
  // Mettre à jour le rotator en cours si actif
  if (window._rotatorWords) window._rotatorWords = window.typeWords;


  // ═══════════════════════════════════════════════════
  // BLOCS HTML CODÉS EN DUR — traduction complète
  // ═══════════════════════════════════════════════════

  // ── Work hint & "voir plus" ──
  var workHint = document.querySelector('.work-hint');
  if (workHint) {
    var wSvg = workHint.querySelector('svg');
    workHint.innerHTML = '';
    if (wSvg) workHint.appendChild(wSvg);
    workHint.appendChild(document.createTextNode(' ' + (lang === 'en' ? 'Drag or use the arrows' : 'Fais glisser ou utilise les flèches')));
  }
  var workMore = document.querySelector('.work-more');
  if (workMore) {
    var wArr = workMore.querySelector('.arr');
    workMore.innerHTML = (lang === 'en' ? 'Want to see more' : 'Envie de voir plus') + ' ';
    if (wArr) workMore.appendChild(wArr); else workMore.innerHTML += '<span class="arr">\u2192</span>';
  }

  // ── Cover Art accordion ──
  var accCoversLabel = document.querySelector('#acc-covers .sec-label');
  if (accCoversLabel) accCoversLabel.textContent = lang === 'en' ? 'Musical Art Direction' : 'Direction Artistique Musicale';
  var accCoversH2 = document.querySelector('#acc-covers h2');
  if (accCoversH2) accCoversH2.innerHTML = lang === 'en'
    ? 'Cover Art <em style="font-family:\'Instrument Serif\',serif;font-style:italic;font-weight:400;color:var(--off)">& Musical Direction</em>'
    : 'Cover Art <em style="font-family:\'Instrument Serif\',serif;font-style:italic;font-weight:400;color:var(--off)">& Direction Musicale</em>';

  // ── Social proof quote ──
  var spQuoteText = document.querySelector('.sp-quote-text');
  if (spQuoteText) spQuoteText.innerHTML = lang === 'en'
    ? 'Someone I work with a lot. He\'s <strong>extremely professional</strong>, <strong>incredibly hardworking</strong> and <strong>too strong.</strong>'
    : 'C\'est quelqu\'un avec qui je bosse beaucoup. Il est <strong>hyper correct</strong>, <strong>hyper travailleur</strong> et <strong>trop fort.</strong>';

  // ── Services sub ──
  var svcSub = document.querySelector('#services .sec-sub');
  if (svcSub) svcSub.textContent = lang === 'en'
    ? 'From logo to stage design, digital and print. What I do, I do all the way.'
    : 'Du logo à la scénographie, en passant par le digital et le print. Ce que je fais, je le fais jusqu\'au bout.';

  // ── Service cards (hardcoded HTML) ──
  var svcTitlesHtml = document.querySelectorAll('.svc-title');
  var svcDescsHtml  = document.querySelectorAll('.svc-desc');
  var svcTFr = ['Direction Artistique Musicale','Identité de Marque','Motion Design & Vidéo'];
  var svcTEn = ['Musical Art Direction','Brand Identity','Motion Design & Video'];
  var svcDFr = [
    'La musique mérite une image à sa hauteur. Du single à l\'album complet, je conçois l\'univers visuel qui prolonge ton son, avant même que tu appuies sur play.',
    'Un logo, oui. Mais surtout : comment ta marque va se tenir dans 5 ans, dans 10 médias différents, sans jamais se trahir. On pose les bases une bonne fois pour toutes.',
    'Intro, lyric video, teaser, clip. Le mouvement au service du son. Chaque image est pensée pour prolonger l\'expérience musicale.'
  ];
  var svcDEn = [
    'Music deserves visuals to match. From single to full album, I design the visual universe that extends your sound, before you even hit play.',
    'A logo, yes. But above all: how your brand will hold up in 5 years, across 10 different media, without ever betraying itself. We set the foundations once and for all.',
    'Intro, lyric video, teaser, clip. Motion in service of sound. Every image is designed to extend the musical experience.'
  ];
  svcTitlesHtml.forEach(function(el, i) { if(svcTFr[i]) el.textContent = lang === 'en' ? svcTEn[i] : svcTFr[i]; });
  svcDescsHtml.forEach(function(el, i) { if(svcDFr[i]) el.textContent = lang === 'en' ? svcDEn[i] : svcDFr[i]; });

  // ── Collabs sub ──
  var collabsSub2 = document.querySelector('.collabs-sub');
  if (collabsSub2) collabsSub2.innerHTML = lang === 'en'
    ? 'Artists, labels and collectives from the Senegalese and African scene. <em>And the list keeps growing.</em>'
    : 'Artistes, labels et collectifs de la scène sénégalaise et africaine. <em>Et la liste continue de s\'allonger.</em>';

  // ── Process pieter-steps ──
  var pSteps = document.querySelectorAll('.pieter-step');
  var pBadgesFr=['Étape 01','Étape 02','Étape 03','Livraison'];
  var pBadgesEn=['Step 01','Step 02','Step 03','Delivery'];
  var pTitlesFr=['Brief & Échange','Concept & Direction','Production','Livraison & Suivi'];
  var pTitlesEn=['Brief & Discovery','Concept & Direction','Production','Delivery & Follow-up'];
  var pDescsFr=[
    'On parle de ton projet, ton univers, tes références. Plus tu es précis sur ce que tu veux, plus le résultat va coller.',
    'Je pose la direction créative : moodboard, palette, typographies. Tu valides avant que je rentre dans le vif.',
    'Je crée. Photoshop, After Effects, Blender selon le projet. Tu reçois une preview pour valider avant la version finale.',
    'Fichiers en haute résolution. Je reste dispo après livraison pour les petits ajustements.'
  ];
  var pDescsEn=[
    'We talk about your project, your world, your references. The more specific you are, the closer the result.',
    'I set the creative direction: moodboard, palette, typography. You validate before I go deeper. Aligned from the start.',
    'I create. Photoshop, After Effects, Blender depending on the project. You get a preview to validate before the final version.',
    'Files in high resolution. I stay available after delivery for minor adjustments.'
  ];
  var pRulesFr=['Acompte 50% avant démarrage','1 révision de direction incluse','Délai tenu, toujours','Solde à la livraison finale'];
  var pRulesEn=['50% deposit before start','1 direction revision included','Deadline always met','Balance due on final delivery'];
  pSteps.forEach(function(step,i){
    var badge=step.querySelector('.pieter-step-badge');
    var title=step.querySelector('.pieter-step-title');
    var desc=step.querySelector('.pieter-step-desc');
    var rule=step.querySelector('.pieter-step-rule');
    if(badge) badge.textContent=lang==='en'?(pBadgesEn[i]||''):(pBadgesFr[i]||'');
    if(title) title.textContent=lang==='en'?(pTitlesEn[i]||''):(pTitlesFr[i]||'');
    if(desc)  desc.textContent =lang==='en'?(pDescsEn[i]||''):(pDescsFr[i]||'');
    if(rule){var rSvg=rule.querySelector('svg');rule.innerHTML='';if(rSvg)rule.appendChild(rSvg);rule.appendChild(document.createTextNode(' '+(lang==='en'?(pRulesEn[i]||''):(pRulesFr[i]||''))));}
  });

  // ── Pricing scope note ──
  var pricingScope=document.querySelector('.pricing-scope-note span');
  if(pricingScope) pricingScope.textContent=lang==='en'?'Cover art, posters & videos only. Other services quoted on request.':'Covers, affiches & vidéos uniquement. Les autres domaines sont sur devis.';

  // ── Pack curtain labels ──
  document.querySelectorAll('.pack-curtain-tier').forEach(function(el){el.textContent=lang==='en'?'Primary Pack':'Pack Primaire';});
  document.querySelectorAll('.pack-curtain-hint-text').forEach(function(el){el.textContent=lang==='en'?'Slide to reveal':'Glisse pour révéler';});

  // ── URANUS section ──
  var uBannerTxt=document.querySelector('.u-banner-txt');
  if(uBannerTxt) uBannerTxt.innerHTML=lang==='en'?'Pre-order price available until the <strong>official drop</strong>':'Prix précommande disponible jusqu\'au <strong>drop officiel</strong>';
  var uCdLabel=document.getElementById('u-cd-label');
  if(uCdLabel) uCdLabel.textContent=lang==='en'?'Offer expires in':'Offre expire dans';
  var uCdSubsFr=['jours','heures','min','sec'];
  var uCdSubsEn=['days','hours','min','sec'];
  document.querySelectorAll('.u-cd-sub').forEach(function(el,i){if(uCdSubsFr[i])el.textContent=lang==='en'?uCdSubsEn[i]:uCdSubsFr[i];});
  var uExpired=document.getElementById('u-cd-expired');
  if(uExpired){
    var ueSpans=uExpired.querySelectorAll('span');
    if(ueSpans[0]) ueSpans[0].textContent=lang==='en'?'⚡ Pre-order ended':'⚡ Précommande terminée';
    if(ueSpans[1]) ueSpans[1].textContent=lang==='en'?'The pack is now available at the official price':'Le pack est maintenant disponible au tarif officiel';
  }
  var uEyebrow=document.querySelector('.u-eyebrow');
  if(uEyebrow){var ueDot=uEyebrow.querySelector('.u-eyebrow-dot');uEyebrow.innerHTML='';if(ueDot)uEyebrow.appendChild(ueDot);uEyebrow.appendChild(document.createTextNode(' '+(lang==='en'?'Pre-order open':'Précommande ouverte')));}
  var uHeroDesc=document.querySelector('.u-hero-desc');
  if(uHeroDesc) uHeroDesc.textContent=lang==='en'?'The ultimate box for serious designers. Layered PSD files, HD mockups, exclusive textures, premium fonts, cover & flyer templates, Photoshop presets.':'La box ultime pour les graphistes sérieux. PSD calqués, mockups HD, textures exclusives, fonts premium, templates covers & flyers, presets Photoshop.';
  var uPillsFr=['+5 000 assets','PSD calqués','Mockups HD','Fonts premium'];
  var uPillsEn=['+5,000 assets','Layered PSD','HD Mockups','Premium Fonts'];
  document.querySelectorAll('.u-pill').forEach(function(el,i){if(uPillsFr[i])el.textContent=lang==='en'?uPillsEn[i]:uPillsFr[i];});
  var uPriceUnit=document.querySelector('.u-price-unit');
  if(uPriceUnit) uPriceUnit.innerHTML=lang==='en'?'Full pack<br>pre-order':'Pack complet<br>précommande';
  var uPriceBadge=document.querySelector('.u-price-badge');
  if(uPriceBadge) uPriceBadge.textContent=lang==='en'?'Price locked · final price will be higher':'Prix bloqué · tarif final plus élevé';
  var uBtnPrimary=document.querySelector('.u-btn-primary');
  if(uBtnPrimary) uBtnPrimary.textContent=lang==='en'?'Reserve my pack \u2192':'Réserver mon pack \u2192';
  var uSectionLabel=document.querySelector('.u-section-label');
  if(uSectionLabel) uSectionLabel.textContent=lang==='en'?'What\'s inside the box':'Ce que contient la box';
  var uAssetNamesFr=['Fichiers PSD','Mockups 3D','Textures','Fonts premium','Templates','Presets PS'];
  var uAssetNamesEn=['PSD Files','3D Mockups','Textures','Premium Fonts','Templates','PS Presets'];
  var uAssetDetailsFr=['Calques organisés, éditables','Réalistes, haute résolution','Grain, papier, métal, bruit','Sélection exclusive','Covers, flyers, social media','Actions & LUT Photoshop'];
  var uAssetDetailsEn=['Organized, editable layers','Realistic, high resolution','Grain, paper, metal, noise','Exclusive selection','Covers, flyers, social media','Actions & LUT Photoshop'];
  document.querySelectorAll('.u-asset-name2').forEach(function(el,i){if(uAssetNamesFr[i])el.textContent=lang==='en'?uAssetNamesEn[i]:uAssetNamesFr[i];});
  document.querySelectorAll('.u-asset-detail2').forEach(function(el,i){if(uAssetDetailsFr[i])el.textContent=lang==='en'?uAssetDetailsEn[i]:uAssetDetailsFr[i];});
  var uWhyFr=['<strong>Conçu par quelqu\'un qui crée vraiment</strong> — pas un pack générique assemblé pour vendre.','<strong>Orienté musique africaine</strong> — les templates sont taillés pour le rap, l\'afrobeats et le son local.','<strong>Assets sélectionnés à la main</strong> — chaque fichier est testé et validé. Pas de remplissage.','<strong>Un seul paiement, à vie</strong> — pas d\'abonnement, pas de tiers. La box t\'appartient.'];
  var uWhyEn=['<strong>Built by someone who actually creates</strong> — not a generic pack assembled to sell.','<strong>African music-oriented</strong> — templates tailored for rap, afrobeats and local sounds.','<strong>Hand-picked assets</strong> — every file is tested and validated. No filler.','<strong>One payment, lifetime access</strong> — no subscription, no third parties. The box is yours.'];
  document.querySelectorAll('.u-why-txt').forEach(function(el,i){if(uWhyFr[i])el.innerHTML=lang==='en'?uWhyEn[i]:uWhyFr[i];});
  var uCardPackName=document.querySelector('.u-card-pack-name');
  if(uCardPackName) uCardPackName.textContent=lang==='en'?'URANUS GFX PACK · Pre-order':'URANUS GFX PACK · Précommande';
  var uCardPriceSub=document.querySelector('.u-card-price-sub');
  if(uCardPriceSub) uCardPriceSub.innerHTML=lang==='en'?'FCFA<br>Full pack':'FCFA<br>Pack complet';
  var uCardTag=document.querySelector('.u-card-tag');
  if(uCardTag) uCardTag.textContent=lang==='en'?'⚡ Pre-order price':'⚡ Prix précommande';
  var uLabel1=document.querySelector('label[for="uName2"]');
  if(uLabel1) uLabel1.textContent=lang==='en'?'First name / handle':'Prénom / pseudo';
  var uInput1=document.getElementById('uName2');
  if(uInput1) uInput1.placeholder=lang==='en'?'e.g. Mohamed, MDG…':'Ex : Mouhamed, MDG…';
  var uLabel3=document.querySelector('label[for="uPhone2"]');
  if(uLabel3) uLabel3.textContent=lang==='en'?'Wave number / phone':'Numéro Wave / téléphone';
  var uSubmit=document.querySelector('.u-submit2');
  if(uSubmit){var usSvg=uSubmit.querySelector('svg');uSubmit.innerHTML='';if(usSvg)uSubmit.appendChild(usSvg);uSubmit.appendChild(document.createTextNode(' '+(lang==='en'?'Reserve my pack':'Réserver mon pack')));}
  document.querySelectorAll('.u-wa-btn').forEach(function(btn){var waSvg=btn.querySelector('svg');btn.innerHTML='';if(waSvg)btn.appendChild(waSvg);btn.appendChild(document.createTextNode(' '+(lang==='en'?'Confirm on WhatsApp':'Confirmer sur WhatsApp')));});
  var uWaHint=document.getElementById('uranusWaveInstructions');
  if(uWaHint) uWaHint.innerHTML=lang==='en'?'WhatsApp opens with your message ready 👆<br>MDG will reply and send you the Wave request directly.':'WhatsApp s\'ouvre avec ton message prêt 👆<br>MDG te répond et t\'envoie la demande Wave directement.';
  var uCardNote=document.querySelector('.u-card-note');
  if(uCardNote) uCardNote.innerHTML=lang==='en'?'Payment via <strong>Wave</strong> · Delivered on launch · Your info is private':'Paiement par <strong>Wave</strong> · Livraison dès la sortie · Tes infos sont privées';
  var uSuccess2=document.getElementById('uranusSuccess2');
  if(uSuccess2){var us2h4=uSuccess2.querySelector('h4');var us2ps=uSuccess2.querySelectorAll('p');if(us2h4)us2h4.textContent=lang==='en'?'You\'re on the list!':'Tu es dans la liste !';if(us2ps[0])us2ps[0].textContent=lang==='en'?'Last step — confirm on WhatsApp to finalize your reservation.':'Dernière étape — confirme sur WhatsApp pour finaliser ta réservation.';if(us2ps[1])us2ps[1].textContent=lang==='en'?'MDG will reply and send you the Wave request directly 💜':'MDG te répond et t\'envoie la demande Wave directement 💜';}
  var uTrustFr=['Données<br>privées','Livraison<br>à la sortie','Accès<br>à vie','Validé<br>par MDG'];
  var uTrustEn=['Private<br>data','Delivered<br>on launch','Lifetime<br>access','Validated<br>by MDG'];
  document.querySelectorAll('.u-trust-label').forEach(function(el,i){if(uTrustFr[i])el.innerHTML=lang==='en'?uTrustEn[i]:uTrustFr[i];});

  // ── html lang attr ──
  document.documentElement.lang = lang;
  // Mettre à jour sectionLabels selon la langue active
  if (typeof sectionLabelsEn !== 'undefined' && typeof sectionLabelsFr !== 'undefined') {
    sectionLabels = lang === 'en' ? sectionLabelsEn : sectionLabelsFr;
    // Mettre à jour le label courant du quick-nav toggle
    var qnLabel = document.getElementById('qn-current-label');
    if (qnLabel) {
      var activeSection = document.querySelector('.qn-item.active');
      if (activeSection && activeSection.getAttribute('onclick')) {
        var match = activeSection.getAttribute('onclick').match(/qnGo\('([^']+)'\)/);
        if (match && sectionLabels[match[1]]) qnLabel.textContent = sectionLabels[match[1]];
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // NOUVELLES SECTIONS — traduction complète EN/FR
  // ══════════════════════════════════════════════════════

  // ── Hero h1 ──
  var heroNameWrap = document.querySelector('.hero-name-wrap');
  var heroNameSub  = document.querySelector('.hero-name-sub .hero-name-sub-wrap');
  if (heroNameWrap) heroNameWrap.textContent = lang === 'en' ? "The elite" : "L'élite";
  if (heroNameSub)  heroNameSub.textContent  = lang === 'en' ? "stands out." : "se remarque.";

  // ── Hero sub ──
  var heroSub = document.querySelector('.hero-sub');
  if (heroSub) heroSub.innerHTML = lang === 'en'
    ? 'Excellence is <strong>my only standard.</strong>'
    : "L'excellence, <strong>c'est mon seul standard.</strong>";

  // ── Hero CTA buttons ──
  var heroBtnPrimary = document.querySelector('.hero-btn-primary');
  if (heroBtnPrimary) {
    var btnSpan = heroBtnPrimary.querySelector('span');
    if (btnSpan) btnSpan.textContent = lang === 'en' ? "Let's work together" : "Travaillons ensemble";
  }
  var heroBtnSecondary = document.querySelector('.hero-btn-secondary');
  if (heroBtnSecondary) heroBtnSecondary.textContent = lang === 'en' ? 'See the work' : 'Voir les réalisations';

  // ── Portfolio tabs ──
  var portTabs = document.querySelectorAll('.port-tab');
  var portTabData = [
    { name: lang === 'en' ? 'In Motion' : 'In Motion',   sub: lang === 'en' ? 'Motion · Video · Animation' : 'Motion · Vidéo · Animation' },
    { name: 'Cover Art',                                  sub: lang === 'en' ? 'Singles · EPs · Albums' : 'Singles · EP · Albums' },
    { name: lang === 'en' ? 'Graphics' : 'Graphisme',    sub: lang === 'en' ? 'Posters · Editorial · Identity' : 'Affiches · Éditorial · Identité' }
  ];
  portTabs.forEach(function(tab, i) {
    var nameEl = tab.querySelector('.port-tab-name');
    var subEl  = tab.querySelector('.port-tab-sub');
    if (nameEl && portTabData[i]) nameEl.textContent = portTabData[i].name;
    if (subEl  && portTabData[i]) subEl.textContent  = portTabData[i].sub;
  });
  var portCountLabel = document.getElementById('portCountLabel');
  if (portCountLabel) {
    var activePortTab = document.querySelector('.port-tab.active');
    if (activePortTab && activePortTab.dataset.label) {
      portCountLabel.textContent = activePortTab.dataset.label;
    }
  }
  var portH2 = document.querySelector('.port-h2');
  if (portH2) {
    var portH2Em = portH2.querySelector('em');
    portH2.childNodes[0].nodeValue = lang === 'en' ? 'Creations' : 'Réalisations';
    if (portH2Em) portH2Em.textContent = lang === 'en' ? ' 7 years of excellence' : ' 7 ans d\'exigence';
  }

  // ── About v2 ──
  var aboutV2H2 = document.querySelector('.about-v2-h2');
  if (aboutV2H2) aboutV2H2.innerHTML = lang === 'en'
    ? 'Creative Director<br><span>based in Kaolack, Senegal</span>'
    : 'Creative Director<br><span>basé à Kaolack, Sénégal</span>';
  var aboutV2Intro = document.querySelector('.about-v2-intro');
  if (aboutV2Intro) aboutV2Intro.textContent = lang === 'en'
    ? "I'm a textbook case, a disordered perfectionist. 7 years of cover art, branding, motion and web, and I've never been fully satisfied with a single project. Not for lack of results — because the standard grows faster than the output."
    : "Je suis un cas d'école, un perfectionniste désordonné. 7 ans de cover art, branding, motion et web, et je n'ai jamais été pleinement satisfait d'un seul projet. Pas par manque de résultat, mais parce que l'exigence grandit plus vite que la production.";
  var aboutV2Body = document.querySelector('.about-v2-body');
  if (aboutV2Body) aboutV2Body.textContent = lang === 'en'
    ? "That's exactly why I can't do anything other than excellence. No templates. No copy-paste. Every project starts from a genuine understanding of who you are, what you do, and what you want to project."
    : "Et c'est exactement pour ça que je ne sais pas faire autrement que de l'excellence. Pas de template. Pas de copier-coller. Chaque projet part d'une vraie compréhension de qui tu es, de ce que tu fais, et de ce que tu veux projeter.";
  var aboutV2ToolsLabel = document.querySelector('.av2-tools-label');
  if (aboutV2ToolsLabel) aboutV2ToolsLabel.textContent = lang === 'en' ? 'Tools' : 'Outils';
  var aboutV2Cta = document.querySelector('.av2-cta');
  if (aboutV2Cta) aboutV2Cta.innerHTML = (lang === 'en' ? 'See the work on Instagram' : 'Voir le travail sur Instagram') + ' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>';
  var aboutBadgeTxt = document.querySelector('.av2-badge-txt');
  if (aboutBadgeTxt) aboutBadgeTxt.textContent = lang === 'en' ? 'Available · Kaolack, SN' : 'Disponible · Kaolack, SN';
  var sigName = document.querySelector('.av2-sig-name');
  if (sigName) sigName.textContent = 'Mouhamed Al Amine';

  // ── Services ──
  var svcSecLabel = document.querySelector('.svc-secondary-label');
  if (svcSecLabel) svcSecLabel.textContent = lang === 'en' ? 'Also available' : 'Aussi disponibles';
  var svcClickHints = document.querySelectorAll('.svc-click-hint');
  svcClickHints.forEach(function(el) {
    var svg = el.querySelector('svg');
    el.innerHTML = '';
    if (svg) el.appendChild(svg);
    el.appendChild(document.createTextNode(' ' + (lang === 'en' ? 'Click for details' : 'Clique pour en savoir plus')));
  });
  var svcSecNames = {
    fr: ['Web Design','Design Éditorial & Print','Contenu Social Media','Merchandising','Scénographie & Événementiel'],
    en: ['Web Design','Editorial & Print Design','Social Media Content','Merchandising','Stage Design & Events']
  };
  var secItems = document.querySelectorAll('.svc-secondary-name');
  secItems.forEach(function(el, i) {
    var names = lang === 'en' ? svcSecNames.en : svcSecNames.fr;
    if (names[i]) el.textContent = names[i];
  });
  var svcSecTags = {
    fr: ['Site · Landing · Portfolio','Flyer · Affiche · Livret','Templates · Stories · Carrousel','Textile · Goodies · Production','Festival · Stand · Scène'],
    en: ['Site · Landing · Portfolio','Flyer · Poster · Booklet','Templates · Stories · Carousel','Textile · Merch · Production','Festival · Stand · Stage']
  };
  var secTagEls = document.querySelectorAll('.svc-secondary-tags');
  secTagEls.forEach(function(el, i) {
    var tags = lang === 'en' ? svcSecTags.en : svcSecTags.fr;
    if (tags[i]) el.textContent = tags[i];
  });

  // ── Social proof ──
  var spSecLabel = document.querySelector('#social-proof .sec-label');
  if (spSecLabel) spSecLabel.textContent = lang === 'en' ? 'What they say' : 'Ce qu\'ils disent';
  var spH2 = document.querySelector('#social-proof .sp-h2');
  if (spH2) spH2.innerHTML = lang === 'en'
    ? 'They speak<em> before we ask</em>'
    : 'Ils parlent<em> avant qu\'on leur demande</em>';
  var spSub = document.querySelector('.sp-sub');
  if (spSub) spSub.textContent = lang === 'en'
    ? 'No commissioned testimonials. Just artists who said what they thought, in public, unfiltered.'
    : 'Pas de témoignages commandés. Juste des artistes qui ont dit ce qu\'ils pensaient, en public, sans filtre.';
  var spQuoteAuthor = document.querySelector('.sp-quote-role');
  if (spQuoteAuthor) spQuoteAuthor.textContent = lang === 'en'
    ? 'Producer / Artist · Senegal · 6 years of collaboration'
    : 'Producteur / Artiste · Sénégal · 6 ans de collaboration';
  var spSources = document.querySelectorAll('.sp-vcard-source');
  var spDescs = document.querySelectorAll('.sp-vcard-desc');
  var spDescsFr = [
    'ISS 814 parle de MDG avec enthousiasme. Il dit du bien de son travail, de son sérieux et de ses qualités humaines.',
    'Le mot "trop fort" sort naturellement, en public. Pas de mise en scène.',
    'Sur le plateau, Key Em Ti sort le nom de MDG sans qu\'on le lui demande.',
    'Le mot "génie" sort naturellement, pas pour faire plaisir.'
  ];
  var spDescsEn = [
    '6 years together. In this interview, ISS 814 talks about their collaboration without being asked.',
    'The words "too strong" come out naturally, in public. No staging.',
    'On set, Key Em Ti drops MDG\'s name without being prompted.',
    'The word "genius" comes out naturally, not to please anyone.'
  ];
  spDescs.forEach(function(el, i) {
    el.textContent = lang === 'en' ? (spDescsEn[i] || '') : (spDescsFr[i] || '');
  });

  // ── Process timeline ──
  var procSecLabel = document.querySelector('#process .sec-label');
  if (procSecLabel) procSecLabel.textContent = lang === 'en' ? 'Methodology' : 'Méthodologie';
  var procH2 = document.querySelector('#process .svc-h2');
  if (procH2) procH2.innerHTML = lang === 'en'
    ? 'How I work<em> & what it implies</em>'
    : 'Comment je travaille<em> & ce que ça implique</em>';
  var procSub = document.querySelector('#process .sec-sub');
  if (procSub) procSub.textContent = lang === 'en'
    ? 'From first contact to delivery, here\'s exactly how it goes.'
    : 'De la prise de contact à la livraison, voilà exactement comment ça se passe.';
  var procBadges = document.querySelectorAll('.proc-badge');
  var procBadgesFr = ['Étape 01','Étape 02','Étape 03','Livraison'];
  var procBadgesEn = ['Step 01','Step 02','Step 03','Delivery'];
  procBadges.forEach(function(el, i) {
    el.textContent = lang === 'en' ? (procBadgesEn[i] || '') : (procBadgesFr[i] || '');
  });
  var procTitles = document.querySelectorAll('.proc-title');
  var procTitlesFr = ['Brief & Échange','Concept & Direction','Production','Livraison & Suivi'];
  var procTitlesEn = ['Brief & Discovery','Concept & Direction','Production','Delivery & Follow-up'];
  procTitles.forEach(function(el, i) {
    el.textContent = lang === 'en' ? (procTitlesEn[i] || '') : (procTitlesFr[i] || '');
  });
  var procDescs = document.querySelectorAll('.proc-desc');
  var procDescsFr = [
    'On parle de ton projet, ton univers, tes références. Plus tu es précis sur ce que tu veux, plus le résultat va coller.',
    'Je pose la direction : moodboard, palette, typographies. Tu valides avant que je rentre dans le vif. On est alignés dès le départ.',
    'Je crée. Photoshop, After Effects, Blender, AI selon le projet. Tu reçois une preview pour valider avant la version finale.',
    'Fichiers en haute résolution dans tous les formats. Je reste dispo après pour les petits ajustements.'
  ];
  var procDescsEn = [
    'We talk about your project, your world, your references. The more specific you are, the closer the result.',
    'I set the direction: moodboard, palette, typography. You validate before I go deeper. We\'re aligned from the start.',
    'I create. Photoshop, After Effects, Blender, AI depending on the project. You get a preview to validate before the final version.',
    'Files in high resolution in all formats. I\'m available after delivery for minor adjustments.'
  ];
  procDescs.forEach(function(el, i) {
    el.textContent = lang === 'en' ? (procDescsEn[i] || '') : (procDescsFr[i] || '');
  });
  var procRules = document.querySelectorAll('.proc-rule');
  var procRulesFr = ['Acompte 50% avant démarrage','1 révision de direction incluse','Délai tenu, toujours','Solde à la livraison finale'];
  var procRulesEn = ['50% deposit before start','1 direction revision included','Deadline always met','Balance due on final delivery'];
  procRules.forEach(function(el, i) {
    var svg = el.querySelector('svg');
    el.innerHTML = '';
    if (svg) el.appendChild(svg);
    el.appendChild(document.createTextNode(' ' + (lang === 'en' ? (procRulesEn[i] || '') : (procRulesFr[i] || ''))));
  });

  // ── Conditions générales (pcond-wrap) ──
  var pcondHeader = document.querySelector('.pcond-header-label');
  var pcondHeaderEn = document.querySelector('.pcond-header-en');
  if (pcondHeader) pcondHeader.textContent = lang === 'en' ? 'General Terms' : 'Conditions générales';
  if (pcondHeaderEn) pcondHeaderEn.textContent = lang === 'en' ? 'Comment je travaille' : 'General Terms';

  var pcondKeys = document.querySelectorAll('.pcond-key');
  var pcondVals = document.querySelectorAll('.pcond-val');
  var pcondBigs = document.querySelectorAll('.pcond-big');

  var pcondKeysFr = ['Acompte','Révisions','Urgences','Long terme','Dispo'];
  var pcondKeysEn = ['Deposit','Revisions','Rush','Long term','Hours'];

  var pcondValsFr = [
    '<strong>avant tout démarrage</strong> · solde à la livraison',
    '<strong>incluses</strong> · au-delà, facturé au temps passé',
    'livraison <strong>sous 48h</strong>',
    'pour <strong>projets récurrents</strong>',
    '<strong>Lun à Sam</strong> · 09h à minuit · Dim. fermé'
  ];
  var pcondValsEn = [
    '<strong>before any start</strong> · balance on delivery',
    '<strong>included</strong> · beyond that, billed by time',
    'delivery <strong>under 48h</strong>',
    'for <strong>recurring projects</strong>',
    '<strong>Mon–Sat</strong> · 9am–midnight · Sun. closed'
  ];

  pcondKeys.forEach(function(el, i) {
    el.textContent = lang === 'en' ? (pcondKeysEn[i] || '') : (pcondKeysFr[i] || '');
  });
  pcondVals.forEach(function(el, i) {
    el.innerHTML = lang === 'en' ? (pcondValsEn[i] || '') : (pcondValsFr[i] || '');
  });

  // ── Trust strip ──
  var trustLabel = document.querySelector('.trust-strip-label');
  if (trustLabel) trustLabel.textContent = lang === 'en' ? 'They trusted me with their image' : 'Ils m\'ont confié leur image';

  // ── FAQ ──
  var faqH2 = document.querySelector('.faq-h2');
  if (faqH2) faqH2.textContent = lang === 'en' ? 'Frequently asked' : 'Questions fréquentes';
  var faqSecLabel = document.querySelector('#faq .sec-label');
  if (faqSecLabel) faqSecLabel.textContent = 'FAQ';
  var faq2Qs = document.querySelectorAll('.faq2-q');
  var faqQsFr = [
    'Comment se passe le paiement ?',
    'Quels sont les délais ?',
    'Tu travailles hors du Sénégal ?',
    'Qui est propriétaire des fichiers ?',
    'Combien de révisions sont incluses ?',
    'Tu travailles depuis des références ?'
  ];
  var faqQsEn = [
    'How does payment work?',
    'What are the turnaround times?',
    'Do you work outside Senegal?',
    'Who owns the delivered files?',
    'How many revisions are included?',
    'Can you work from references?'
  ];
  var faqAsFr = [
    '<strong>50% d\'acompte</strong> avant démarrage, le reste à la livraison. J\'accepte <strong>Wave, Orange Money, Free Money</strong> et virements. Hors Sénégal : PayPal ou virement IBAN.',
    'Single cover : <strong>2 à 4 jours.</strong> EP / mixtape : <strong>5 à 10 jours.</strong> Album complet : <strong>10 à 21 jours.</strong> Urgence sous 48h : <strong>+10%.</strong>',
    'Oui. Mali, Côte d\'Ivoire, Cameroun, France et au-delà. Tout se fait à distance. <strong>La distance n\'a jamais ralenti un projet.</strong>',
    'Toi, une fois le solde réglé. Tu es l\'<strong>unique propriétaire</strong> des visuels finaux. Fichiers sources disponibles sur demande.',
    '<strong>3 révisions</strong> incluses par projet. Au-delà : facturé au temps (min 5 000 XOF).',
    'Absolument, c\'est même recommandé. Je m\'en inspire sans copier. L\'objectif : <strong>que ça te ressemble, pas à quelqu\'un d\'autre.</strong>'
  ];
  var faqAsEn = [
    '<strong>50% deposit</strong> before starting, balance on delivery. I accept <strong>Wave, Orange Money, Free Money</strong> and bank transfers. Outside Senegal: PayPal or IBAN.',
    'Single cover: <strong>2 to 4 days.</strong> EP / mixtape: <strong>5 to 10 days.</strong> Full album: <strong>10 to 21 days.</strong> Rush under 48h: <strong>+10%.</strong>',
    'Yes. Mali, Côte d\'Ivoire, Cameroon, France and beyond. Everything is done remotely. <strong>Distance has never slowed a project down.</strong>',
    'You do, once the balance is paid. You\'re the <strong>sole owner</strong> of the final visuals. Source files available on request.',
    '<strong>3 revisions</strong> included per project. Beyond that: billed by time (min 5,000 XOF).',
    'Absolutely, it\'s even recommended. I\'m inspired without copying. The goal: <strong>for it to look like you, not someone else.</strong>'
  ];
  document.querySelectorAll('.faq-item2').forEach(function(item, i) {
    var q = item.querySelector('.faq2-q');
    var a = item.querySelector('.faq2-a p');
    if (q) {
      var icon = q.querySelector('.faq2-icon');
      q.innerHTML = (lang === 'en' ? faqQsEn[i] : faqQsFr[i]) || '';
      if (icon) q.appendChild(icon);
    }
    if (a) a.innerHTML = (lang === 'en' ? faqAsEn[i] : faqAsFr[i]) || '';
  });

  // ── Contact form ──
  var cqfHeader = document.querySelector('.cqf-header h3');
  if (cqfHeader) cqfHeader.textContent = lang === 'en' ? 'Tell me what you want to build.' : 'Dis-moi ce que tu veux construire.';
  var cqfHeaderP = document.querySelector('.cqf-header p');
  if (cqfHeaderP) cqfHeaderP.textContent = lang === 'en' ? 'I\'ll get back to you within 24h, always.' : 'Je réponds en 24h, toujours.';
  var cqfChipData = [
    { fr: 'Cover Art', en: 'Cover Art', val: 'Direction Artistique Musicale' },
    { fr: 'Identité', en: 'Identity', val: 'Identité de Marque' },
    { fr: 'Motion', en: 'Motion', val: 'Motion Design' },
    { fr: 'Web', en: 'Web', val: 'Web Design' },
    { fr: 'Autre', en: 'Other', val: 'Autre projet' }
  ];
  document.querySelectorAll('.cqf-chip').forEach(function(chip, i) {
    if (!cqfChipData[i]) return;
    var svg = chip.querySelector('svg');
    chip.innerHTML = '';
    if (svg) chip.appendChild(svg);
    chip.appendChild(document.createTextNode(' ' + (lang === 'en' ? cqfChipData[i].en : cqfChipData[i].fr)));
  });
  var cqfLabels = document.querySelectorAll('.cqf-field label');
  var cqfLabelsFr = ['Nom ou artiste','Email ou WhatsApp','Budget approximatif','Décris ton projet','Références visuelles'];
  var cqfLabelsEn = ['Name or artist','Email or WhatsApp','Approximate budget','Describe your project','Visual references'];
  cqfLabels.forEach(function(el, i) {
    var opt = el.querySelector('.cqf-opt');
    el.textContent = lang === 'en' ? (cqfLabelsEn[i] || '') : (cqfLabelsFr[i] || '');
    if (opt && i === 4) { el.textContent = lang === 'en' ? 'Visual references ' : 'Références visuelles '; el.appendChild(opt); }
  });
  var cqfSubmitBtn = document.querySelector('#cqfBtn');
  if (cqfSubmitBtn) {
    var svg = cqfSubmitBtn.querySelector('svg');
    cqfSubmitBtn.innerHTML = (lang === 'en' ? 'Send message' : 'Envoyer le message') + ' ';
    if (svg) cqfSubmitBtn.appendChild(svg);
  }
  var cqfNote = document.querySelector('.cqf-note');
  if (cqfNote) cqfNote.textContent = lang === 'en' ? 'Reply guaranteed within 24h · Confidential' : 'Réponse garantie sous 24h · Confidentiel';
  var cqfSelectFr = ['Fourchette estimée','25 000 – 75 000 XOF','100 000 – 300 000 XOF','300 000 – 500 000 XOF','500 000 XOF et plus','À définir ensemble'];
  var cqfSelectEn = ['Estimated range','25,000 – 75,000 XOF','100,000 – 300,000 XOF','300,000 – 500,000 XOF','500,000 XOF and above','To be defined together'];
  var budgetSelect = document.getElementById('cqf-budget');
  if (budgetSelect) {
    budgetSelect.querySelectorAll('option').forEach(function(opt, i) {
      opt.textContent = lang === 'en' ? (cqfSelectEn[i] || opt.textContent) : (cqfSelectFr[i] || opt.textContent);
    });
  }
  var cqfSuccessH4 = document.querySelector('#cqfSuccess h4');
  if (cqfSuccessH4) cqfSuccessH4.textContent = lang === 'en' ? 'Message received.' : 'Message reçu.';
  var cqfSuccessP = document.querySelector('#cqfSuccess p');
  if (cqfSuccessP) cqfSuccessP.textContent = lang === 'en' ? 'I\'ll get back to you within 24h. Urgent? WhatsApp.' : 'Je te reviens sous 24h. Urgent ? WhatsApp direct.';

  // ── References upload ──
  var dropLabel = document.querySelector('.cqf-ref-drop span:first-of-type');
  if (dropLabel) dropLabel.textContent = lang === 'en' ? 'Drop your images here' : 'Glisse tes images ici';
  var dropSub = document.querySelector('.cqf-ref-sub');
  if (dropSub) dropSub.textContent = lang === 'en' ? 'PNG · JPG · max 5MB · up to 4 images' : 'PNG · JPG · max 5 Mo · jusqu\'à 4 images';
  var dropBrowse = document.querySelector('.cqf-ref-browse');
  if (dropBrowse) dropBrowse.textContent = lang === 'en' ? 'Browse' : 'Parcourir';
  var linkInput = document.getElementById('cqfLinkInput');
  if (linkInput) linkInput.placeholder = lang === 'en' ? 'Pinterest, Behance, Instagram, Dribbble…' : 'Lien Pinterest, Behance, Instagram, Dribbble…';

  // ── Citation (manifeste final) ──
  var citationEyebrow = document.querySelector('.citation-eyebrow');
  if (citationEyebrow) citationEyebrow.textContent = 'MDG Creative Studio';
  var citationText = document.querySelector('.citation-text');
  if (citationText) citationText.innerHTML = lang === 'en'
    ? 'You don\'t see me.<br><em>My visuals speak for me.</em>'
    : 'On ne me voit pas.<br><em>Mes visuels parlent pour moi.</em>';
  var citationAuthor = document.querySelector('.citation-author');
  if (citationAuthor) citationAuthor.textContent = 'Mouhamed Al Amine — MDG Creative Studio';

  // ── Footer contact section ──
  var contactLinks = document.querySelectorAll('.contact-link-label');
  var contactLinksFr = ['WhatsApp','Instagram','Email'];
  var contactLinksEn = ['WhatsApp','Instagram','Email'];
  contactLinks.forEach(function(el, i) {
    el.textContent = lang === 'en' ? (contactLinksEn[i] || '') : (contactLinksFr[i] || '');
  });

  // ── Bottom tab bar ──
  var mobTabs = document.querySelectorAll('.mob-tab span');
  var mobTabsFr = ['Accueil','Projets','Services','Tarifs','Contact'];
  var mobTabsEn = ['Home','Projects','Services','Pricing','Contact'];
  mobTabs.forEach(function(el, i) {
    el.textContent = lang === 'en' ? (mobTabsEn[i] || '') : (mobTabsFr[i] || '');
  });

  // ── Burger menu nav links ──
  var mobMenuLinks = document.querySelectorAll('.mob-menu a:not(.mob-cta)');
  var mobMenuFr = ['','Réalisations','À propos','Services','Collabs','Process','Tarifs & Packs','URANUS GFX','FAQ','Contact'];
  var mobMenuEn = ['','Portfolio','About','Services','Collabs','Process','Pricing','URANUS GFX','FAQ','Contact'];
  mobMenuLinks.forEach(function(el, i) {
    if (mobMenuFr[i]) el.textContent = lang === 'en' ? (mobMenuEn[i] || el.textContent) : (mobMenuFr[i] || el.textContent);
  });
  var mobCta = document.querySelector('.mob-cta');
  if (mobCta) mobCta.textContent = lang === 'en' ? "Let's work together" : 'Travaillons ensemble';

  // ── Quick-nav ──
  var qnData = [
    { fr: 'Accueil',        en: 'Home' },
    { fr: 'Réalisations',   en: 'Portfolio' },
    { fr: 'À propos',       en: 'About' },
    { fr: 'Services',       en: 'Services' },
    { fr: 'Collabs',        en: 'Collabs' },
    { fr: 'Process',        en: 'Process' },
    { fr: 'Tarifs & Packs', en: 'Pricing' },
    { fr: 'URANUS GFX',     en: 'URANUS GFX' },
    { fr: 'FAQ',            en: 'FAQ' },
    { fr: 'Contact',        en: 'Contact' }
  ];
  var quickNavLinks = document.querySelectorAll('#quick-nav a');
  quickNavLinks.forEach(function(el, i) {
    if (!qnData[i]) return;
    // Preserve the qn-num span, only update the text node
    var numSpan = el.querySelector('.qn-num');
    var txt = lang === 'en' ? qnData[i].en : qnData[i].fr;
    // Clear and rebuild: keep span, update text
    var spanHTML = numSpan ? numSpan.outerHTML : '';
    el.innerHTML = spanHTML + txt;
  });

}

// ─── Patches par sélecteur ────────────────────────────
function applyPatches(lang) {
  patches.forEach(function(patch){
    var sel = patch[0], key = patch[1], mode = patch[2];
    var els = document.querySelectorAll(sel);
    els.forEach(function(el){
      if (!translations[key] || translations[key][lang] === null) return;
      var val = translations[key][lang];
      if (mode === 'text') el.textContent = val;
      else if (mode === 'html') el.innerHTML = val;
      else el.setAttribute(mode, val);
    });
  });

  // ── FAQ — traduction EN ──
  var faqData = {
    fr: [
      { q: 'Comment se passe le paiement ?', a: '<strong>50% d\'acompte</strong> avant le démarrage, le reste à la livraison finale. J\'accepte <strong>Wave, Orange Money, Free Money</strong> et les virements bancaires. Pour les clients hors Sénégal : PayPal ou virement IBAN.' },
      { q: 'Quels sont les délais ?', a: 'Pour un <strong>single cover</strong>, compte entre 2 et 4 jours. Un <strong>EP ou une mixtape</strong>, c\'est 5 à 10 jours. Un <strong>album complet</strong> demande entre 10 et 21 jours. Si t\'as une urgence et que ça doit sortir sous 48h, un supplément de <strong>+10%</strong> s\'applique.' },
      { q: 'Tu travailles avec des artistes hors du Sénégal ?', a: 'Oui, sans problème. Je travaille avec des artistes à travers toute l\'Afrique : Sénégal, Mali, Côte d\'Ivoire, Cameroun, France et même au-delà. Tout se fait à distance via WhatsApp, email ou appel. <strong>La distance n\'a jamais ralenti un projet.</strong>' },
      { q: 'Qui est propriétaire des fichiers livrés ?', a: 'Une fois le solde réglé, tu es l\'<strong>unique propriétaire</strong> des visuels finaux. Je conserve le droit de présenter le travail dans mon portfolio et mes réseaux, sauf accord contraire écrit.' },
      { q: 'Combien de révisions sont incluses ?', a: 'Chaque pack inclut <strong>2 à 4 révisions</strong> selon le niveau. Au-delà, chaque révision supplémentaire est facturée selon le temps passé (minimum 5.000 XOF).' },
      { q: 'Tu peux travailler depuis une référence/inspiration ?', a: 'Absolument, c\'est même recommandé. Partage des <strong>références visuelles</strong> (covers que tu aimes, ambiances, artistes qui t\'inspirent). Plus tu es précis, plus le résultat colle à ta vision.' },
    ],
    en: [
      { q: 'How does payment work?', a: '<strong>50% deposit</strong> before starting, the balance on final delivery. I accept <strong>Wave, Orange Money, Free Money</strong> and bank transfers. For clients outside Senegal: PayPal or international wire.' },
      { q: 'What are the turnaround times?', a: 'For a <strong>single cover</strong>, expect 2 to 4 days. An <strong>EP or mixtape</strong> takes 5 to 10 days. A <strong>full album</strong> requires 10 to 21 days. Rush delivery under 48h carries a <strong>+10%</strong> surcharge.' },
      { q: 'Do you work with artists outside Senegal?', a: 'Absolutely. I work with artists across Africa and beyond — Senegal, Mali, Côte d\'Ivoire, Cameroon, France. Everything is done remotely via WhatsApp, email or call. <strong>Distance has never slowed a project down.</strong>' },
      { q: 'Who owns the delivered files?', a: 'Once the balance is paid, you are the <strong>sole owner</strong> of the final visuals. I retain the right to showcase the work in my portfolio and social media, unless otherwise agreed in writing.' },
      { q: 'How many revisions are included?', a: 'Each pack includes <strong>2 to 4 revisions</strong> depending on the tier. Beyond that, each additional revision is billed by time spent (minimum 5,000 XOF).' },
      { q: 'Can you work from a reference or inspiration?', a: 'Absolutely — it\'s even recommended. Share <strong>visual references</strong> (covers you love, moods, inspiring artists). The more specific you are, the closer the result to your vision.' },
    ]
  };
  var faqItems = document.querySelectorAll('.faq-item');
  var faqLang = faqData[lang] || faqData.fr;
  faqItems.forEach(function(item, i) {
    if (!faqLang[i]) return;
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a p');
    if (q) {
      // Keep the icon, update only the text node
      var icon = q.querySelector('.faq-q-icon');
      q.childNodes.forEach(function(node){ if(node.nodeType === 3) node.textContent = faqLang[i].q + ' '; });
      if (!q.querySelector('.faq-q-icon') && icon) q.appendChild(icon);
    }
    if (a) a.innerHTML = faqLang[i].a;
  });

  // ── Services secondaires — noms EN ──
  var svcSecNames = {
    fr: ['Web Design','Design Éditorial & Print','Contenu Social Media','Merchandising','Scénographie & Événementiel'],
    en: ['Web Design','Editorial & Print Design','Social Media Content','Merchandising','Stage Design & Events']
  };
  var secItems = document.querySelectorAll('.svc-secondary-name');
  var secLang = svcSecNames[lang] || svcSecNames.fr;
  secItems.forEach(function(el, i){ if(secLang[i]) el.textContent = secLang[i]; });

  // ── Label "Aussi disponibles" ──
  var secLabel = document.querySelector('.svc-secondary-label');
  if (secLabel) secLabel.innerHTML = (lang === 'en' ? 'Also available' : 'Aussi disponibles');

  // ── Contact section heading ──
  var contactSub = document.querySelector('.contact-sub');
  if (contactSub) contactSub.textContent = lang === 'en'
    ? 'Brand identity, cover art, motion, web, print. Tell me about your project — I\'ll get back to you within 24h.'
    : 'Brand identity, cover art, motion, web, print. Décris-moi ton projet, je reviens sous 24h avec une réponse concrète.';

  // ── FAQ header ──
  var faqH2 = document.querySelector('#faq h2');
  if (faqH2) faqH2.textContent = lang === 'en' ? 'Frequently asked' : 'Questions fréquentes';

}

// ─── Override openModal pour les modals services EN ──
// On utilise une référence différée pour éviter de capturer undefined
// (la fonction openModal originale est définie dans un autre <script> plus haut)
window.openModal = function(num) {
  if (currentLang === 'en' && window._servicesDataEn) {
    var svc = window._servicesDataEn.find(function(s){ return s.num === num; });
    if (svc) {
      var overlay = document.getElementById('modalOverlay');
      var modalContent = document.getElementById('modalContent');
      if (!overlay || !modalContent) return;
      modalContent.innerHTML =
        '<div class="modal-num">'+svc.num+'</div>' +
        '<div class="modal-title">'+svc.title+'</div>' +
        '<p class="modal-desc">'+svc.desc+'</p>' +
        '<div class="modal-includes">' +
          '<div class="modal-includes-title">' + translations.modal_includes_title.en + '</div>' +
          '<ul class="modal-list">' + svc.includes.map(function(i){ return '<li>'+i+'</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="modal-tags">' + svc.tags.map(function(t){ return '<span class="modal-tag">'+t+'</span>'; }).join('') + '</div>' +
        '<a href="#contact" class="modal-cta" onclick="closeModal()">' + translations.modal_cta_text.en + '</a>';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      return;
    }
  }
  // Fallback : appel de la logique FR directement (sans référence capturée)
  var svcFr = (typeof servicesData !== 'undefined') ? servicesData.find(function(s){ return s.num === num; }) : null;
  if (!svcFr) return;
  var overlay2 = document.getElementById('modalOverlay');
  var modalContent2 = document.getElementById('modalContent');
  if (!overlay2 || !modalContent2) return;
  modalContent2.innerHTML =
    '<div class="modal-num">'+svcFr.num+'</div>' +
    '<div class="modal-title">'+svcFr.title+'</div>' +
    '<p class="modal-desc">'+svcFr.desc+'</p>' +
    '<div class="modal-includes">' +
      '<div class="modal-includes-title">Ce qui est inclus</div>' +
      '<ul class="modal-list">'+svcFr.includes.map(function(i){ return '<li>'+i+'</li>'; }).join('')+'</ul>' +
    '</div>' +
    '<div class="modal-tags">'+svcFr.tags.map(function(t){ return '<span class="modal-tag">'+t+'</span>'; }).join('')+'</div>' +
    '<a href="#contact" class="modal-cta" onclick="closeModal()">Discuter de ce projet →</a>';
  overlay2.classList.add('open');
  document.body.style.overflow = 'hidden';
};

// ─── Fonction principale de traduction ───────────────
function applyLang(lang) {
  currentLang = lang;
  applyDataI18n(lang);
  applyPatches(lang);
  applyComplexPatches(lang);

  // Toggle button state — nav desktop
  var btn = document.getElementById('langToggle');
  var lbl = document.getElementById('langLabel');
  if (btn && lbl) {
    if (lang === 'en') {
      lbl.textContent = 'FR';
      btn.classList.add('active');
      btn.title = 'Passer en français';
    } else {
      lbl.textContent = 'EN';
      btn.classList.remove('active');
      btn.title = 'Switch to English';
    }
  }
  // Toggle button state — menu mobile
  var mobBtn = document.getElementById('mobLangToggle');
  var mobLbl = document.getElementById('mobLangLabel');
  if (mobBtn && mobLbl) {
    if (lang === 'en') {
      mobLbl.textContent = 'FR';
      mobBtn.classList.add('active');
    } else {
      mobLbl.textContent = 'EN';
      mobBtn.classList.remove('active');
    }
  }

  // Ne pas sauvegarder dans localStorage — évite la contamination entre sessions
  // try { localStorage.setItem('mdg_lang', lang); } catch(e){}
}

// ─── Toggle public ────────────────────────────────────
window.toggleLang = function() {
  // On lit l'état réel du bouton (source de vérité) plutôt que currentLang
  // pour éviter toute désynchronisation entre sessions.
  var btn = document.getElementById('langToggle');
  var activeLang = (btn && btn.classList.contains('active')) ? 'en' : 'fr';
  currentLang = activeLang; // resync interne
  applyLang(activeLang === 'fr' ? 'en' : 'fr');
};

// ─── Init au chargement ───────────────────────────────
document.addEventListener('DOMContentLoaded', function(){
  // Détecte la langue du navigateur uniquement — pas de localStorage
  // pour éviter qu'une session précédente affecte les nouveaux visiteurs.
  var browserLang = (navigator.language || navigator.userLanguage || 'fr').slice(0, 2).toLowerCase();
  var initLang = browserLang === 'en' ? 'en' : 'fr';
  applyLang(initLang);
});

})();

/* ─────────────────────────────── */

/* ═══════════════════════════════════════════════
   PRICING MOBILE — Carousel + Bottom Sheet + UX
═══════════════════════════════════════════════ */
(function(){

  // ── Données des packs pour le bottom sheet ──
  // ── SOURCE UNIQUE des prix : on lit packData défini plus haut ──
  const ACCENT_MAP = {
    silver:'var(--accent)', gold:'#c8a040', diamond:'var(--accent)',
    spotlight:'var(--accent)', magnum:'#ff64c8', prestige:'#ffc832', rollout:'var(--accent)'
  };
  const PACK_DATA = {};
  Object.keys(packData).forEach(function(id){
    const s = packData[id];
    PACK_DATA[id] = { tier:s.label, name:s.name, price:s.price, unit:s.unit,
      features:s.features, accentColor:ACCENT_MAP[id]||'var(--accent)', modalId:id };
  });

  // ── Packs verrouillés (nécessitent mot de passe) ──
  const LOCKED_PACKS = [];

  // ── Ouvrir le bottom sheet ──
  window.bsOpen = function(packId) {
    const d = PACK_DATA[packId];
    if (!d) return;

    // Bloquer si pack verrouillé et mot de passe non entré
    if (LOCKED_PACKS.indexOf(packId) !== -1 && (typeof pricingUnlocked === 'undefined' || !pricingUnlocked)) {
      var lockBar = document.getElementById('pricing-lock-bar');
      if (lockBar) {
        lockBar.style.transition = 'box-shadow .15s';
        lockBar.style.boxShadow = '0 0 0 2px var(--accent)';
        setTimeout(function(){ lockBar.style.boxShadow = ''; }, 900);
        lockBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var input = document.getElementById('pricing-pw-input');
        if (input) setTimeout(function(){ input.focus(); }, 400);
      }
      return;
    }

    document.getElementById('pack-bs-tier').textContent = d.tier;
    document.getElementById('pack-bs-name').textContent = d.name;
    document.getElementById('pack-bs-name').style.color = d.accentColor;

    // Afficher le prix uniquement si déverrouillé (ou pack non protégé)
    var isLocked = LOCKED_PACKS.indexOf(packId) !== -1 && (typeof pricingUnlocked === 'undefined' || !pricingUnlocked);
    var priceEl = document.getElementById('pack-bs-price');
    if (isLocked) {
      priceEl.innerHTML = '<span style="font-size:.8rem;color:var(--dim);">Tarif communiqué sous 24h — entre le mot de passe pour voir les prix</span>';
      priceEl.style.color = '';
    } else {
      priceEl.innerHTML = d.price + '<span>' + d.unit + '</span>';
      priceEl.style.color = d.accentColor;
    }
    const ul = document.getElementById('pack-bs-features');
    ul.innerHTML = d.features.map(f =>
      `<li>
        <svg class="bs-feat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        <div>${f}</div>
      </li>`
    ).join('');
    const cta = document.getElementById('pack-bs-cta');
    cta.style.background = d.accentColor === 'var(--accent)' ? 'var(--accent)' : d.accentColor;
    cta.style.color = d.accentColor === '#ffc832' ? '#000' : '#000';
    cta.onclick = () => { bsClose(); if(window.openPackModal) openPackModal(d.modalId); };
    document.getElementById('pack-bottom-sheet').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(()=>{const cl=document.getElementById('pack-bs-close');if(cl)cl.focus();},60);
  };

  window.bsClose = function() {
    document.getElementById('pack-bottom-sheet').classList.remove('open');
    document.body.style.overflow = '';
  };

  // Fermer sur fond
  document.getElementById('pack-bs-backdrop').addEventListener('click', bsClose);

  // Swipe vers le bas pour fermer
  let bsTouchStart = 0;
  const bsContent = document.getElementById('pack-bs-content');
  bsContent.addEventListener('touchstart', e => { bsTouchStart = e.touches[0].clientY; }, {passive:true});
  bsContent.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - bsTouchStart;
    if (dy > 60 && bsContent.scrollTop === 0) { bsClose(); }
  }, {passive:true});

  // ── Injecter select mobile + dots + hint dans la section pricing ──
  function initMobilePricing() {
    if (window.innerWidth > 900) return;

    const section = document.getElementById('pricing');
    if (!section || section.dataset.mobileReady) return;
    section.dataset.mobileReady = '1';

    const container = section.querySelector('.container');

    // Tabs mobile
    const tabsWrap = document.createElement('div');
    tabsWrap.className = 'pricing-mobile-tabs-wrap';
    const TABS_DATA = [
      { value: 'primaires', label: 'Packs Primaires' },
      { value: 'avances',   label: 'Packs Avancés' },
      { value: 'rollout',   label: 'Rollout' },
      { value: 'addons',    label: 'Compléments' },
    ];
    // Outer wrapper pour l'indicateur de scroll
    const tabsOuter = document.createElement('div');
    tabsOuter.className = 'pricing-tabs-outer';
    tabsOuter.appendChild(tabsWrap);

    TABS_DATA.forEach(function(t, i) {
      var btn = document.createElement('button');
      btn.className = 'pricing-mobile-tab' + (i === 0 ? ' active' : '');
      btn.textContent = t.label;
      btn.setAttribute('data-panel', t.value);
      btn.addEventListener('click', function() {
        document.querySelectorAll('.pricing-mobile-tab').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        switchMobileTab(t.value);
      });
      tabsWrap.appendChild(btn);
    });

    const selectWrap = document.createElement('div');
    selectWrap.className = 'pricing-mobile-select-wrap';
    selectWrap.style.display = 'none';
    const tabs = container.querySelector('.pricing-tabs');
    tabs.parentNode.insertBefore(tabsOuter, tabs.nextSibling);
    tabs.parentNode.insertBefore(selectWrap, tabsOuter.nextSibling);

    // Injecter boutons mobiles sur chaque card
    injectMobileButtons();

    // Hint swipe (s'affiche une fois)
    showSwipeHint();

    // Dots + counter
    initCarouselDots();
  }

  function injectMobileButtons() {
    document.querySelectorAll('.pack-card').forEach(card => {
      if (card.querySelector('.pack-mobile-actions')) return;
      const packId = card.querySelector('[onclick*="openPackModal"]')
        ? card.querySelector('[onclick*="openPackModal"]').getAttribute('onclick').match(/'([^']+)'/)?.[1]
        : null;
      const actions = document.createElement('div');
      actions.className = 'pack-mobile-actions';
      actions.innerHTML = `
        <button class="pack-mobile-detail-btn" onclick="bsOpen('${packId}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          Voir les détails
        </button>
        <button class="pack-mobile-start-btn" onclick="bsClose();if(window.openPackModal)openPackModal('${packId}')">
          Démarrer ce pack →
        </button>`;
      card.appendChild(actions);
    });

    document.querySelectorAll('.adv-card').forEach(card => {
      if (card.querySelector('.pack-mobile-actions')) return;
      const packId = card.querySelector('[onclick*="openPackModal"]')
        ? card.querySelector('[onclick*="openPackModal"]').getAttribute('onclick').match(/'([^']+)'/)?.[1]
        : null;
      const actions = document.createElement('div');
      actions.className = 'pack-mobile-actions';
      actions.innerHTML = `
        <button class="pack-mobile-detail-btn" onclick="bsOpen('${packId}')" aria-label="Voir les détails de ce pack">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          Voir les détails
        </button>
        <button class="pack-mobile-start-btn" onclick="if(window.openPackModal)openPackModal('${packId}')" aria-label="Démarrer ce pack">
          Démarrer →
        </button>`;
      card.appendChild(actions);
    });
  }

  function showSwipeHint() {
    if (localStorage.getItem('mdg_swipe_hint_seen')) return;
    const hint = document.createElement('div');
    hint.className = 'pricing-swipe-hint';
    hint.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      Glisse les catégories &amp; les packs`;
    const panel = document.querySelector('.pricing-panel.active');
    if (panel) panel.parentNode.insertBefore(hint, panel);
    setTimeout(() => { hint.style.display = 'none'; localStorage.setItem('mdg_swipe_hint_seen','1'); }, 3200);
  }

  function initCarouselDots() {
    document.querySelectorAll('.pricing-panel').forEach(panel => {
      const grid = panel.querySelector('.packs-grid, .advanced-grid');
      if (!grid) return;
      if (panel.querySelector('.pricing-dots')) return;

      const cards = grid.querySelectorAll('.pack-card, .adv-card');
      if (cards.length < 2) return;

      // Dots
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'pricing-dots';
      cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'pricing-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Pack ' + (i+1));
        dot.onclick = () => {
          cards[i].scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
        };
        dotsWrap.appendChild(dot);
      });
      grid.parentNode.insertBefore(dotsWrap, grid.nextSibling);

      // Counter
      const counter = document.createElement('div');
      counter.className = 'pricing-counter';
      counter.innerHTML = '<span>1</span> / ' + cards.length;
      dotsWrap.parentNode.insertBefore(counter, dotsWrap.nextSibling);

      // Scroll → update dots + counter
      const dots = dotsWrap.querySelectorAll('.pricing-dot');
      grid.addEventListener('scroll', () => {
        const cw = grid.offsetWidth;
        const idx = Math.round(grid.scrollLeft / (cw * 0.78));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        counter.innerHTML = '<span>' + (idx+1) + '</span> / ' + cards.length;
      }, {passive:true});

      // Première card : micro-animation peek au chargement
      setTimeout(() => {
        grid.scrollTo({left: 60, behavior:'smooth'});
        setTimeout(() => grid.scrollTo({left: 0, behavior:'smooth'}), 500);
      }, 800);
    });
  }

  // ── Switch tab mobile ──
  window.switchMobileTab = function(panel) {
    document.querySelectorAll('.pricing-tab').forEach(t => t.classList.toggle('active', t.textContent.toLowerCase().includes(panel.substring(0,4))));
    document.querySelectorAll('.pricing-mobile-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === panel));
    document.querySelectorAll('.pricing-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('panel-' + panel);
    if (target) {
      target.classList.add('active');
      // Reset scroll position pour rollout et addons
      target.scrollTop = 0;
      initCarouselDots();
      injectMobileButtons();
    }
  };

  // Lancer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobilePricing);
  } else {
    setTimeout(initMobilePricing, 100);
  }
  window.addEventListener('resize', () => { if(window.innerWidth <= 900) initMobilePricing(); });

})();

/* ─────────────────────────────── */

function motionOpen(src, name, artist) {
  var fs = document.getElementById('motion-fullscreen');
  var content = document.getElementById('motion-fullscreen-content');
  document.getElementById('motion-fullscreen-title').textContent = name || '';
  document.getElementById('motion-fullscreen-artist').textContent = artist || '';

  var isMp4 = /\.(mp4|webm|mov)(\?|$)/i.test(src);
  if (isMp4) {
    content.innerHTML = '<video src="' + src + '" autoplay playsinline webkit-playsinline controls style="position:absolute;inset:0;width:100%;height:100%;background:#000;border:none;" preload="auto"></video>';
  } else {
    var sep = src.indexOf('?') > -1 ? '&' : '?';
    var autoSrc = src + sep + 'autoplay=1&muted=false&controls=true&loop=false&quality=auto&preload=auto';
    content.innerHTML = '<iframe src="' + autoSrc + '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:none;"></iframe>';
  }

  fs.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function motionClose() {
  var fs = document.getElementById('motion-fullscreen');
  fs.classList.remove('open');
  document.getElementById('motion-fullscreen-content').innerHTML = '';
  document.body.style.overflow = '';
}
document.getElementById('motion-fullscreen').addEventListener('click', function(e){
  if(e.target === this) motionClose();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') motionClose();
});
document.querySelectorAll('.motion-thumb').forEach(function(thumb){
  thumb.addEventListener('click', function(){
    var src = this.getAttribute('data-src');
    var card = this.closest('.motion-card');
    var name = card ? (card.querySelector('.motion-name') ? card.querySelector('.motion-name').textContent : '') : '';
    var artist = card ? (card.querySelector('.motion-artist') ? card.querySelector('.motion-artist').textContent : '') : '';
    motionOpen(src, name, artist);
  });
});

// ── MOT TRACK (In Motion carousel) — init immédiat (panel actif par défaut) ──
(function(){
  var initialized = false;

  function initMotTrack() {
    if (initialized) return;
    var track = document.getElementById('motTrack');
    var prev  = document.getElementById('motPrev');
    var next  = document.getElementById('motNext');
    var curEl = document.getElementById('motCur');
    var totEl = document.getElementById('motTot');
    if(!track || !prev || !next) return;
    initialized = true;

    var cards = track.querySelectorAll('.work-card');
    if(totEl) totEl.textContent = String(cards.length).padStart(2,'0');

    function step(){ return cards[0] ? cards[0].getBoundingClientRect().width + 20 : 300; }
    function update(){
      var i = Math.round(track.scrollLeft / Math.max(step(),1));
      if(curEl) curEl.textContent = String(Math.min(i+1, cards.length)).padStart(2,'0');
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }
    prev.addEventListener('click', function(){ carouselScrollTo(track, track.scrollLeft - step()); });
    next.addEventListener('click', function(){ carouselScrollTo(track, track.scrollLeft + step()); });
    track.addEventListener('scroll', update, {passive:true});
    update();
    enableDragScroll(track);

    // Tap sur une card motion → ouvrir fullscreen
    // Sur mobile : distinguer tap (< 8px de déplacement) vs swipe
    cards.forEach(function(card){
      var touchStartX = 0, touchStartY = 0, touchMoved = false;

      card.addEventListener('touchstart', function(e){
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      }, { passive: true });

      card.addEventListener('touchmove', function(e){
        var dx = Math.abs(e.touches[0].clientX - touchStartX);
        var dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 8 || dy > 8) touchMoved = true;
      }, { passive: true });

      card.addEventListener('touchend', function(e){
        if (!touchMoved) {
          e.preventDefault(); // éviter le click synthétique
          var src   = card.getAttribute('data-mot-src');
          var label = card.getAttribute('data-mot-title') || '';
          var parts = label.split(' · ');
          motionOpen(src, parts[0] || '', parts[1] || '');
        }
      });

      // Souris desktop
      card.addEventListener('click', function(){
        var src   = this.getAttribute('data-mot-src');
        var label = this.getAttribute('data-mot-title') || '';
        var parts = label.split(' · ');
        motionOpen(src, parts[0] || '', parts[1] || '');
      });
    });
  }

  // Init immédiat — c'est le panel actif par défaut
  initMotTrack();

  // Aussi au clic sur le tab (si l'utilisateur revient dessus)
  document.querySelectorAll('.port-tab, .acc-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      if(tab.dataset.panel === 'motion'){
        initMotTrack();
      }
    });
  });
})();

/* ─────────────────────────────── */

function accSwitch(panel, btn) {
  document.querySelectorAll('.acc-tab, .port-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.acc-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('acc-' + panel).classList.add('active');

  // Update dynamic counter
  var countNum = document.getElementById('portCountNum');
  var countLabel = document.getElementById('portCountLabel');
  if (countNum && btn.dataset.count) countNum.textContent = btn.dataset.count;
  if (countLabel && btn.dataset.label) countLabel.textContent = btn.dataset.label;

  // Réinitialiser le carousel covers au premier affichage
  if (panel === 'covers') {
    var track = document.getElementById('covTrack');
    var prev = document.getElementById('covPrev');
    var next = document.getElementById('covNext');
    var curEl = document.getElementById('covCur');
    var totEl = document.getElementById('covTot');
    if (track && prev && next && curEl && totEl) {
      var cards = track.querySelectorAll('.cov-card');
      totEl.textContent = String(cards.length).padStart(2,'0');
      function covStep(){ return cards[0].getBoundingClientRect().width + 20; }
      function covUpdate(){
        var i = Math.round(track.scrollLeft / covStep());
        curEl.textContent = String(Math.min(i+1, cards.length)).padStart(2,'0');
        prev.disabled = track.scrollLeft < 4;
        next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      }
      if (!prev._covBound) {
        prev.addEventListener('click', function(){ carouselScrollTo(track, track.scrollLeft - covStep()); });
        next.addEventListener('click', function(){ carouselScrollTo(track, track.scrollLeft + covStep()); });
        track.addEventListener('scroll', covUpdate, {passive:true});
        prev._covBound = true;
      }
      setTimeout(covUpdate, 50);
    }
  }
}

/* ─────────────────────────────── */

var pricingUnlocked = false;
    async function unlockPricing() {
      var val = document.getElementById('pricing-pw-input').value.trim().toLowerCase();
      var err = document.getElementById('pricing-pw-error');
      // Hash SHA-256 côté client — le mot de passe n'est plus en clair dans le source
      var msgBuffer = new TextEncoder().encode(val);
      var hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      var hashArray = Array.from(new Uint8Array(hashBuffer));
      var hashHex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
      var VALID = '707a57d8be0e9b72a29cc86c78bd1b0a37d58cac8c95c146b4600f2b96def257';
      if (hashHex === VALID) {
        pricingUnlocked = true;
        document.getElementById('pricing-lock-bar').style.display = 'none';
        var unlockedBar = document.getElementById('pricing-unlocked-bar');
        unlockedBar.style.display = 'flex';
        err.style.display = 'none';
        // Mettre à jour les price-sealed pour afficher les vrais prix
        var priceList = ['25.000 XOF', '50.000 XOF', '95.000 XOF', '175.000 XOF', '450.000 XOF', '800.000 XOF', '1.200.000 XOF', '250.000 XOF'];
        document.querySelectorAll('.price-sealed').forEach(function(el, i){
          var label = el.querySelector('.price-sealed-label');
          var hint = el.querySelector('.price-sealed-hint');
          var lock = el.querySelector('.price-sealed-lock');
          var arr = el.querySelector('.price-sealed-arr');
          if(label) { label.textContent = 'Tarif'; label.style.fontSize = '.6rem'; }
          if(hint && priceList[i]) {
            hint.textContent = priceList[i];
            hint.style.fontSize = '1.25rem';
            hint.style.fontFamily = "'Syne', sans-serif";
            hint.style.fontWeight = '800';
            hint.style.color = 'var(--accent)';
            hint.style.letterSpacing = '-.02em';
          }
          if(lock) lock.style.display = 'none';
          if(arr) arr.style.display = 'none';
          el.style.cursor = 'default';
          el.style.pointerEvents = 'none';
        });
        // Afficher le convertisseur de devises
        var cc = document.getElementById('currencyConverter');
        if(cc) { cc.style.display = ''; convertCurrency(); }
      } else {
        err.style.display = 'block';
        document.getElementById('pricing-pw-input').style.borderColor = '#f87171';
        setTimeout(function(){ document.getElementById('pricing-pw-input').style.borderColor = ''; }, 1500);
      }
    }
    // Intercepter openPackModal pour afficher le prix si déverrouillé
    var _origOpenPackModal = typeof openPackModal !== 'undefined' ? openPackModal : null;
    document.addEventListener('DOMContentLoaded', function(){
      var orig = openPackModal;
      openPackModal = function(packId){
        orig(packId);
        // Prix visible pour les packs primaires uniquement
        var primaryPacks = ['silver','gold','diamond'];
        if(primaryPacks.indexOf(packId) !== -1){
          var priceBlock = document.querySelector('.pack-modal-price');
          if(priceBlock) priceBlock.style.display = 'block';
          var lockNote = document.querySelector('.pack-modal-head > div[style*="rgba(200,250,100"]');
          if(lockNote) lockNote.style.display = 'none';
        }
      };
    });

/* ─────────────────────────────── */

/* ══ MDG COLLABS — ELITE BUILD ══ */
(function(){

var ARTISTS=[
  {
    name:'ISS 814',
    index:'AR-01',
    genre:'Rapper · Beatmaker · Producer',
    collab:'Cover Art · Brand Identity',
    ig:'https://www.instagram.com/iss814beats/',
    thumb:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_260/v1777184982/iss_814_v22_dtnhal.jpg',
    cutout:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto,w_500/v1777184982/iss_814_v22_dtnhal.jpg'
  },
  {
    name:'One Lyrical',
    index:'AR-02',
    genre:'Artiste Rappeur',
    collab:'Cover Art · Flyer Design',
    ig:'https://www.instagram.com/onelyrical.sn/',
    thumb:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777184384/one_lyrical_33_s2iha2.jpg',
    cutout:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777184384/one_lyrical_33_s2iha2.jpg'
  },
  {
    name:'Omzo Beatz',
    index:'AR-03',
    genre:'Beatmaker · Producer',
    collab:'Branding · Motion Design',
    ig:'https://www.instagram.com/omzobeatz/',
    thumb:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777182477/omzo_1_jkbnwn.jpg',
    cutout:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777182477/omzo_1_jkbnwn.jpg'
  },
  {
    name:'Oothentik Zeus',
    index:'AR-04',
    genre:'Artiste Rappeur',
    collab:'Cover Art · Direction Artistique',
    ig:'https://www.instagram.com/oothentik_zeus_gb/',
    thumb:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777183762/hf_20260426_055913_8dad1a9d-44e7-424e-9794-30bd704f9588_h5pesn.png',
    cutout:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777183762/hf_20260426_055913_8dad1a9d-44e7-424e-9794-30bd704f9588_h5pesn.png'
  },
  {
    name:'Gun Silent Beatz',
    index:'AR-05',
    genre:'Beatmaker · Producer',
    collab:'Logo · Brand Identity',
    ig:'https://www.instagram.com/gunsilentbeatz/',
    thumb:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777182558/GUN_SILE_socvwe.jpg',
    cutout:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777182558/GUN_SILE_socvwe.jpg'
  },
  {
    name:'Dopeboy DMG',
    index:'AR-06',
    genre:'Artiste Rappeur',
    collab:'Cover Art · Visuel EP',
    ig:'https://www.instagram.com/dopeboydmg/',
    thumb:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777184573/dopeboy_bdrzw6.jpg',
    cutout:'https://res.cloudinary.com/djdkpihuz/image/upload/f_auto,q_auto/v1777184573/dopeboy_bdrzw6.jpg'
  }
];

/* ── DOM ── */
var card       = document.getElementById('the-card');
var cutoutWrap = null; // cutout removed
var cardIndex  = document.getElementById('card-index');
var cardName   = document.getElementById('card-name');
var cardGenre  = document.getElementById('card-genre');
var cardCollab = document.getElementById('card-collab');
var cardIg     = document.getElementById('card-ig');
var cardDots   = document.getElementById('card-dots');
var stageCurrent = document.getElementById('stage-current');
var stageTotal   = document.getElementById('stage-total');
var progressBar  = document.getElementById('progress-bar');
var btnPrev = document.getElementById('btn-prev');
var btnNext = document.getElementById('btn-next');
var cardZone = document.getElementById('card-zone');
var stage   = document.getElementById('artist-stage');
var thumbImg = document.getElementById('thumb-img');
if(!card) return;

/* ── GRAIN + HALO + FLASH ── */
if(!card.querySelector('.card-grain')){
  var gr=document.createElement('div'); gr.className='card-grain'; card.appendChild(gr);
}

var flash=document.createElement('div'); flash.className='card-flash'; card.appendChild(flash);

/* ── DOUBLE IMAGE pour crossfade ── */
// crossfade removed

/* ── PRELOAD ── */
ARTISTS.forEach(function(a){
  var i=new Image(); i.src=a.cutout;
  var j=new Image(); j.src=a.thumb;
});

/* ── DOTS ── */
var current=0, total=ARTISTS.length;
stageTotal.textContent = String(total).padStart(2,'0');
for(var d=0;d<total;d++){
  var dot=document.createElement('div');
  dot.className='card-dot'+(d===0?' active':'');
  dot.dataset.i=d;
  (function(idx){
    dot.addEventListener('click',function(){
      if(idx!==current) goTo(idx, idx>current?'right':'left');
    });
  })(d);
  cardDots.appendChild(dot);
}

/* ── RENDER ── */
function renderCard(dir){
  var a = ARTISTS[current];
  /* update trust bg image */
  var trustBg = document.getElementById('trust-bg-photo');
  if(trustBg){
    trustBg.style.opacity='0';
    setTimeout(function(){
      trustBg.src = a.cutout || a.thumb;
      trustBg.onload=function(){ trustBg.style.opacity='.08'; };
      if(trustBg.complete && trustBg.naturalWidth) trustBg.style.opacity='.08';
    },300);
  }

  /* flash accent */
  flash.classList.remove('fire'); void flash.offsetWidth; flash.classList.add('fire');

  /* thumb — smooth swap */
  thumbImg.style.opacity='0';
  thumbImg.style.transform='scale(1.05)';
  setTimeout(function(){
    thumbImg.src=a.thumb; thumbImg.alt=a.name;
    thumbImg.style.transition='opacity .35s ease,transform .5s cubic-bezier(.16,1,.3,1)';
    thumbImg.onload=function(){ thumbImg.style.opacity='1'; thumbImg.style.transform='scale(1)'; };
    if(thumbImg.complete&&thumbImg.naturalWidth){ thumbImg.style.opacity='1'; thumbImg.style.transform='scale(1)'; }
  },200);

  /* texte */
  cardIndex.textContent = a.index;
  cardCollab.textContent = a.collab;
  cardIg.href = a.ig;

  /* name + genre reveal par clip-path */
  cardName.textContent  = a.name;
  cardGenre.textContent = a.genre;
  cardName.classList.remove('revealed');
  cardGenre.classList.remove('revealed');
  void cardName.offsetWidth;
  /* léger délai pour que le browser enregistre le retrait */
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      cardName.classList.add('revealed');
      cardGenre.classList.add('revealed');
    });
  });

  /* crossfade removed — single image mode */

  /* counter flip */
  stageCurrent.classList.remove('flip'); void stageCurrent.offsetWidth;
  stageCurrent.textContent = String(current+1).padStart(2,'0');
  stageCurrent.classList.add('flip');

  /* dots */
  cardDots.querySelectorAll('.card-dot').forEach(function(dot,i){
    dot.classList.toggle('active', i===current);
  });

  /* anim carte */
  var ac = dir==='right' ? 'anim-in-right' : 'anim-in-left';
  card.classList.remove('anim-in-right','anim-in-left');
  void card.offsetWidth;
  card.classList.add(ac);
  setTimeout(function(){ card.classList.remove(ac); }, 700);

  /* glow pulse */
  card.style.boxShadow = '0 0 0 1px rgba(255,255,255,.04) inset,0 40px 100px rgba(0,0,0,.8),0 0 80px rgba(200,250,100,.08)';
  setTimeout(function(){ card.style.boxShadow=''; }, 650);
}

function goTo(idx,dir){
  current = ((idx%total)+total)%total;
  renderCard(dir||'right');
  resetProgress();
}
function next(){ goTo(current+1,'right'); }
function prev(){ goTo(current-1,'left');  }

btnNext.addEventListener('click', next);
btnPrev.addEventListener('click', prev);

/* ── KEYBOARD ── */
document.addEventListener('keydown',function(e){
  var s=document.getElementById('collabs'); if(!s) return;
  var r=s.getBoundingClientRect();
  if(r.top>window.innerHeight||r.bottom<0) return;
  if(e.key==='ArrowRight') next();
  else if(e.key==='ArrowLeft') prev();
});

/* ── PROGRESS / AUTOPLAY ── */
var autoTimer=null, progTimer=null, progVal=0, SLIDE_DUR=5500;
function resetProgress(){
  clearInterval(progTimer); clearTimeout(autoTimer);
  progVal=0; progressBar.style.width='0%';
  progTimer=setInterval(function(){
    progVal += 100/(SLIDE_DUR/100);
    if(progVal>=100) progVal=100;
    progressBar.style.width = progVal+'%';
  },100);
  autoTimer=setTimeout(function(){ next(); }, SLIDE_DUR);
}
card.addEventListener('mouseenter',function(){ clearInterval(progTimer); clearTimeout(autoTimer); });
card.addEventListener('mouseleave',resetProgress);

/* ── TILT 3D MAGNÉTIQUE (desktop) ── */
var tT={x:0,y:0}, tC={x:0,y:0}, tRAF=null, tilting=false;

function tiltLoop(){
  tC.x += (tT.x - tC.x) * .05;
  tC.y += (tT.y - tC.y) * .05;
  card.style.transform =
    'perspective(1200px) rotateX('+(-tC.y*7)+'deg) rotateY('+(tC.x*10)+'deg) translateZ(8px)';
  /* cutout se déplace EN SENS INVERSE — crée la profondeur */

  tRAF = requestAnimationFrame(tiltLoop);
}

function resetTilt(){
  cancelAnimationFrame(tRAF); tilting=false;
  card.classList.remove('tilting');
  (function relax(){
    tC.x += (0-tC.x)*.06;
    tC.y += (0-tC.y)*.06;
    card.style.transform =
      'perspective(1200px) rotateX('+(-tC.y*7)+'deg) rotateY('+(tC.x*10)+'deg) translateZ(8px)';

    if(Math.abs(tC.x)>.0008 || Math.abs(tC.y)>.0008){
      requestAnimationFrame(relax);
    } else {
      card.style.transform='';

    }
  })();
}

if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  cardZone.addEventListener('mousemove',function(e){
    var r = cardZone.getBoundingClientRect();
    tT.x = (e.clientX-r.left)/r.width  - .5;
    tT.y = (e.clientY-r.top) /r.height - .5;
    if(!tilting){
      tilting=true;
      card.classList.add('tilting'); /* pause idle float */
      tiltLoop();
    }
  });
  cardZone.addEventListener('mouseleave', resetTilt);

  /* spotlight curseur sur le stage */
  stage.addEventListener('mousemove',function(e){
    var r=stage.getBoundingClientRect();
    stage.style.setProperty('--mx', (e.clientX-r.left)+'px');
    stage.style.setProperty('--my', (e.clientY-r.top) +'px');
  });
  stage.addEventListener('mouseleave',function(){
    stage.style.setProperty('--mx','50%');
    stage.style.setProperty('--my','50%');
  });
}

/* ── SWIPE TOUCH (mobile) ── */
var tsX=0, tsY=0, isDragging=false;
card.addEventListener('touchstart',function(e){
  tsX = e.touches[0].clientX;
  tsY = e.touches[0].clientY;
  isDragging = true;
},{passive:true});
card.addEventListener('touchmove',function(e){
  if(!isDragging) return;
  var dx = e.touches[0].clientX - tsX;
  var dy = e.touches[0].clientY - tsY;
  /* si swipe horizontal dominant, on bloque le scroll vertical */
  if(Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>8) e.preventDefault();
},{passive:false});
card.addEventListener('touchend',function(e){
  if(!isDragging) return;
  isDragging=false;
  var dx = e.changedTouches[0].clientX - tsX;
  var dy = e.changedTouches[0].clientY - tsY;
  if(Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>45){
    dx<0 ? next() : prev();
  }
},{passive:true});

/* ── GYROSCOPE MOBILE ── */
function applyGyro(e){
  var gx = Math.max(-1,Math.min(1,(e.gamma||0)/18));
  var gy = Math.max(-1,Math.min(1,((e.beta||0)-30)/18));
  tT.x = gx*.6; tT.y = gy*.45;
  if(!tilting){
    tilting=true;
    card.classList.add('tilting');
    tiltLoop();
  }
}
var gyroActive = false;
function startGyro(){
  if(gyroActive) return;
  if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
    // iOS 13+ demande permission
    DeviceOrientationEvent.requestPermission()
      .then(function(s){
        if(s==='granted'){
          window.addEventListener('deviceorientation',applyGyro,{passive:true});
          gyroActive = true;
        }
      })
      .catch(function(){});
  } else if(typeof DeviceOrientationEvent !== 'undefined') {
    // Android / autres — pas de permission nécessaire
    window.addEventListener('deviceorientation',applyGyro,{passive:true});
    gyroActive = true;
  }
}
// Démarrer le gyro dès le premier touch sur la section collabs ou carte
var collabsSection = document.getElementById('collabs');
if(window.DeviceOrientationEvent && window.matchMedia('(hover:none)').matches){
  function onFirstTouch(){
    startGyro();
    if(collabsSection) collabsSection.removeEventListener('touchstart', onFirstTouch);
    document.removeEventListener('touchstart', onFirstTouch);
  }
  if(collabsSection) collabsSection.addEventListener('touchstart', onFirstTouch, {once:true, passive:true});
  document.addEventListener('touchstart', onFirstTouch, {once:true, passive:true});
}

/* ── INIT ── */
renderCard('right');
resetProgress();

})();

/* ─────────────────────────────── */

function faqToggle(btn){
  var item = btn.closest('.faq-item, .faq-item2');
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open, .faq-item2.open').forEach(function(el){ el.classList.remove('open'); });
  if(!isOpen) item.classList.add('open');
}

/* ─────────────────────────────── */

(function(){
  var form = document.getElementById('cqfForm');
  if(!form) return;
  // Prevent double-binding
  if (form._web3bound) return;
  form._web3bound = true;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = document.getElementById('cqfBtn');
    var origHTML = btn.innerHTML;
    btn.textContent = 'Envoi…';
    btn.disabled = true;

    // Collect form data — formulaire 1 étape
    var fd = new FormData(form);
    var activeChip = document.querySelector('.cqf-chip.active');
    var serviceTxt = activeChip ? activeChip.textContent.trim() : (fd.get('service') || 'Non précisé');
    // Sync service chip vers hidden input
    var hiddenSvc = document.getElementById('cqfServiceHiddenForm');
    if (hiddenSvc) hiddenSvc.value = serviceTxt;
    var name    = (document.getElementById('cqf-name') || {}).value || fd.get('nom') || '';
    var email   = (document.getElementById('cqf-contact') || {}).value || fd.get('contact') || '';
    var budget  = fd.get('budget') || 'Non précisé';
    var message = (document.getElementById('cqf-msg') || {}).value || fd.get('message') || '';
    var refLink = (document.getElementById('cqf-refs') || {}).value || '';

    // Validation inline
    var invalid = false;
    [['cqf-name', name], ['cqf-contact', email], ['cqf-msg', message]].forEach(function(pair){
      var el = document.getElementById(pair[0]);
      if(el){ el.style.borderColor = pair[1].trim() ? '' : 'rgba(220,50,50,.6)'; }
      if(!pair[1].trim()) invalid = true;
    });
    if(invalid){ btn.innerHTML = origHTML; btn.disabled = false; return; }

    var WEB3FORMS_KEY = '7db2eac5-7a46-40db-a864-8b99ea9f4b7b';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'Nouveau devis — ' + serviceTxt + ' | MDG Creative Studio',
        from_name: 'MDG Creative Studio',
        name: name,
        email: email.includes('@') ? email : 'noreply@mdgcreative.studio',
        message: 'Service : ' + serviceTxt
          + '\nNom : ' + name
          + '\nContact : ' + email
          + '\nBudget : ' + budget
          + (refLink ? '\nRéférence : ' + refLink : '')
          + '\n\nProjet :\n' + message
      })
    }).then(function(r){ return r.json(); }).then(function(data){
      if(data.success){
        var bodyEl = document.getElementById('cqfFormBody');
        if (bodyEl) bodyEl.style.display = 'none';
        else form.style.display = 'none';
        var success = document.getElementById('cqfSuccess');
        if (success) success.classList.add('show');
      } else {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        btn.textContent = 'Erreur — réessaie';
      }
    }).catch(function(){
      btn.innerHTML = origHTML;
      btn.disabled = false;
      btn.textContent = 'Erreur réseau — réessaie';
    });
  });
})();

/* ─────────────────────────────── */

// ── POPUP CONTACT ──
(function(){
  const overlay = document.getElementById('cPopOverlay');
  const pop = document.getElementById('cPop');
  const closeBtn = document.getElementById('cPopClose');

  let lastFocusedEl = null;
  function openPop(e){
    if(e && e.preventDefault) e.preventDefault();
    lastFocusedEl = document.activeElement;
    overlay.classList.add('active');
    pop.classList.add('active');
    const _sy = window.scrollY;
    document.documentElement.style.overflow='hidden';
    document.documentElement.style.height='100%';
    document.body.dataset.popScrollY=_sy;
    setTimeout(()=>{const f=pop.querySelector('input,button,a');if(f)f.focus();},80);
  }
  // Expose globalement pour les boutons footer/inline
  window.openContact = openPop;
  function trapFocus(e){
    if(!pop.classList.contains('active'))return;
    const focusable=pop.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.key==='Tab'){
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  }
  function closePop(){
    overlay.classList.remove('active');
    pop.classList.remove('active');
    const _sy2 = parseInt(document.body.dataset.popScrollY||'0');
    document.documentElement.style.overflow='';
    document.documentElement.style.height='';
    window.scrollTo({top:_sy2,behavior:'instant'});
    if(lastFocusedEl)lastFocusedEl.focus();
  }

  // Tous les boutons "Travaillons ensemble" + svc-cta
  document.querySelectorAll('.hero-btn-primary, .nav-cta, .svc-cta').forEach(function(btn){
    btn.addEventListener('click', openPop);
  });

  overlay.addEventListener('click', closePop);
  closeBtn.addEventListener('click', closePop);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closePop(); trapFocus(e); });

  // Bouton email dans #contact ouvre aussi le popup
  document.querySelectorAll('.cta-btn').forEach(function(btn){
    if(btn.href && btn.href.includes('mailto')){
      btn.addEventListener('click', openPop);
    }
  });
})();

// ── POPUP TABS ──
function cpopSwitch(tab){
  document.getElementById('cpopFormView').style.display   = tab==='form'  ? 'block' : 'none';
  document.getElementById('cpopLinksView').style.display  = tab==='links' ? 'block' : 'none';
  document.getElementById('cpopTabForm').classList.toggle('active',  tab==='form');
  document.getElementById('cpopTabLinks').classList.toggle('active', tab==='links');
}

// ── FORMULAIRE → WhatsApp ──
function cpopSend(){
  const name    = document.getElementById('cpopName').value.trim();
  const project = document.getElementById('cpopProject').value;
  const budget  = document.getElementById('cpopBudget').value;
  const msg     = document.getElementById('cpopMsg').value.trim();
  if(!name || !project || !msg){
    const btn = document.getElementById('cpopSubmitBtn');
    btn.style.background='rgba(255,80,80,.8)';
    document.getElementById('cpopSubmitLabel').textContent='Remplis les champs requis';
    setTimeout(()=>{ btn.style.background=''; document.getElementById('cpopSubmitLabel').textContent='Envoyer via WhatsApp'; },2000);
    return;
  }
  // Envoi Web3Forms en arrière-plan
  var WEB3FORMS_KEY = '7db2eac5-7a46-40db-a864-8b99ea9f4b7b';
  fetch('https://api.web3forms.com/submit', {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: 'Popup contact — ' + project + ' | MDG Creative Studio',
      from_name: 'MDG Creative Studio',
      name: name,
      email: 'noreply@mdgcreative.studio',
      message: 'Nom : ' + name + '\nProjet : ' + project + '\nBudget : ' + (budget||'Non précisé') + '\n\nMessage :\n' + msg + '\n\nSource : popup'
    })
  }).catch(function(){});
  // Redirection WhatsApp
  const text = `Bonjour MDG 👋%0A%0A*Nom :* ${encodeURIComponent(name)}%0A*Projet :* ${encodeURIComponent(project)}%0A*Budget :* ${encodeURIComponent(budget||'Non précisé')}%0A%0A*Message :*%0A${encodeURIComponent(msg)}`;
  window.open('https://wa.me/221763772208?text='+text, '_blank');
}

/* ─────────────────────────────── */

// ── Toujours démarrer en haut de page au rechargement ──
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', function() {
  window.scrollTo(0, 0);
});
window.addEventListener('load', function() {
  window.scrollTo(0, 0);
});

/* ─────────────────────────────── */

// ── IMAGES RESPONSIVES : thumbnails galeries w_1200 → w_600 sur mobile ──
(function(){
  if (window.innerWidth > 767) return; // desktop : on garde w_1200
  document.addEventListener('DOMContentLoaded', function(){
    // Sélectionne uniquement les imgs dans les cartes galerie (pas le hero ni les portraits)
    var imgs = document.querySelectorAll(
      '.work-img, .cov-img'
    );
    imgs.forEach(function(img){
      // src thumbnail
      if (img.src && img.src.indexOf('w_1200') > -1) {
        img.src = img.src.replace('w_1200', 'w_600');
      }
      // srcset si présent
      if (img.srcset && img.srcset.indexOf('w_1200') > -1) {
        img.srcset = img.srcset.replace(/w_1200/g, 'w_600');
      }
    });
  });
})();

/* ─────────────────────────────── */

(function(){
  var menu = document.getElementById('quick-nav-menu');
  var toggle = document.getElementById('quick-nav-toggle');
  var label = document.getElementById('qn-current-label');
  var open = false;

  window.toggleQN = function(){
    open = !open;
    menu.classList.toggle('open', open);
  };

  window.qnGo = function(id){
    var el = document.getElementById(id);
    if(el){
      if(typeof lenis !== 'undefined' && lenis){
        lenis.scrollTo(el, {offset: -80, duration: 1.4});
      } else {
        el.scrollIntoView({behavior:'smooth'});
      }
    }
    open = false;
    menu.classList.remove('open');
  };

  // Fermer au clic extérieur
  document.addEventListener('click', function(e){
    if(open && !document.getElementById('quick-nav').contains(e.target)){
      open = false;
      menu.classList.remove('open');
    }
  });

  // Mettre à jour le label selon la section visible
  var sections = ['hero','about','portfolio-accordion','collabs','services','process','pricing','uranus','faq','contact'];
  var sectionLabelsFr = {
    'hero':'Accueil', 'about':'À propos', 'portfolio-accordion':'Réalisations',
    'collabs':'Collabs', 'services':'Services', 'process':'Process',
    'pricing':'Tarifs', 'uranus':'URANUS GFX', 'faq':'FAQ', 'contact':'Contact'
  };
  var sectionLabelsEn = {
    'hero':'Home', 'about':'About', 'portfolio-accordion':'Portfolio',
    'collabs':'Collabs', 'services':'Services', 'process':'Process',
    'pricing':'Pricing', 'uranus':'URANUS GFX', 'faq':'FAQ', 'contact':'Contact'
  };
  var sectionLabels = sectionLabelsFr;

  var qnObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id = entry.target.id;
        if(sectionLabels[id]){
          label.textContent = sectionLabels[id];
          // Active state
          document.querySelectorAll('.qn-item').forEach(function(item){
            item.classList.remove('active');
          });
          var active = document.querySelector('.qn-item[onclick="qnGo(\''+id+'\')"]');
          if(active) active.classList.add('active');
        }
      }
    });
  }, {threshold: 0.3});

  sections.forEach(function(id){
    var el = document.getElementById(id);
    if(el) qnObs.observe(el);
  });
})();

/* ─────────────────────────────── */

// ── Skeleton: marquer images chargées ──
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  if(img.complete) img.classList.add('loaded');
  else img.addEventListener('load', () => img.classList.add('loaded'));
});

/* ─────────────────────────────── */

(function(){
  var btn = document.getElementById('backToTop');
  window.addEventListener('scroll', function(){
    var show = window.scrollY > 600;
    btn.style.opacity = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(12px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, {passive:true});
  btn.addEventListener('click', function(){
    window.scrollTo({top:0, behavior:'smooth'});
  });
  btn.addEventListener('mouseenter', function(){
    btn.style.borderColor = 'var(--accent)';
    btn.style.color = 'var(--accent)';
  });
  btn.addEventListener('mouseleave', function(){
    btn.style.borderColor = '';
    btn.style.color = '';
  });
})();

/* ─────────────────────────────── */

(function(){
  function initMarquee(){
    var el = document.querySelector('.collabs-marquee');
    if(!el) return;
    // Reset complet
    el.style.cssText = 'display:flex;align-items:center;gap:0;width:max-content;will-change:transform;';
    void el.offsetWidth; // force reflow
    var w = el.scrollWidth;
    el.style.animation = 'marquee ' + Math.max(20, (w/2)/80) + 's linear infinite';
    // Hover pause
    var wrap = el.closest('.collabs-marquee-wrap');
    if(wrap){
      wrap.onmouseenter = function(){ el.style.animationPlayState='paused'; };
      wrap.onmouseleave = function(){ el.style.animationPlayState='running'; };
    }
  }
  // Attendre fonts + layout
  window.addEventListener('load', function(){
    requestAnimationFrame(function(){ requestAnimationFrame(initMarquee); });
  });
})();

/* ─────────────────────────────── */

(function(){
  var bar = document.getElementById('readingProgress');
  var ticking = false;
  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(function(){
        var scrolled = window.scrollY;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled/total*100) : 0) + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, {passive:true});
})();

/* ─────────────────────────────── */

/* ── LAZY BACKGROUND IMAGES ── */
(function(){
  if(!('IntersectionObserver' in window)) return;
  var lazyBgObs = new IntersectionObserver(function(entries, obs){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('bg-loaded');
        obs.unobserve(e.target);
      }
    });
  },{rootMargin:'200px'});
  document.querySelectorAll('[data-lazy-bg]').forEach(function(el){
    lazyBgObs.observe(el);
  });
})();

/* ─────────────────────────────── */

(function(){
  /* Stop CSS background animations when sections are off-screen */
  if('IntersectionObserver' in window){
    var animSections = document.querySelectorAll('#about');
    var animObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var before = e.target;
        if(e.isIntersecting){
          before.style.animationPlayState = 'running';
          before.classList.remove('anim-paused');
        } else {
          before.classList.add('anim-paused');
        }
      });
    },{rootMargin:'200px'});
    animSections.forEach(function(s){ animObs.observe(s); });
  }

  /* Stagger reveal delays for grid children */
  var staggerParents = document.querySelectorAll(
    '.svc-grid, .packs-grid, .advanced-grid, .process-grid, .trust-grid'
  );
  staggerParents.forEach(function(parent){
    var children = parent.querySelectorAll(
      '.svc-card, .pack-card, .adv-card, .process-step, .trust-item'
    );
    children.forEach(function(child, i){
      child.style.transitionDelay = (i * 0.055) + 's';
    });
  });

  /* Micro-glow on accent buttons */
  document.querySelectorAll('.nav-cta, .hero-btn-primary, .pack-cta, .adv-cta, .rollout-price-cta, .mob-cta').forEach(function(btn){
    btn.addEventListener('mouseenter', function(){
      this.style.boxShadow = '0 6px 28px rgba(200,250,100,.45)';
    });
    btn.addEventListener('mouseleave', function(){
      this.style.boxShadow = '';
    });
  });

  /* Card tilt 3D on hover — desktop only */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.work-card, .svc-card, .pack-card, .tcard').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var currentBase = card.classList.contains('work-card') ? 'translateY(-4px)' : 'translateY(-6px)';
        card.style.transform = currentBase + ' rotateY('+(x*5)+'deg) rotateX('+(-y*4)+'deg)';
        card.style.transformOrigin = 'center center';
        card.style.perspective = '800px';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transform = '';
        card.style.transformOrigin = '';
        card.style.perspective = '';
      });
    });
  }

  /* Ambient glow pulsation on featured card */
  var featured = document.querySelector('.pack-card.featured, .adv-card.featured');
  if(featured){
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;border-radius:24px;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 50% 0%,rgba(200,250,100,0.07) 0%,transparent 60%);animation:featGlow 3s ease-in-out infinite alternate;';
    featured.style.position = 'relative';
    featured.insertBefore(glow, featured.firstChild);
  }

  /* CSS for anim-paused class + featGlow */
  var style = document.createElement('style');
  style.textContent = [
    '.anim-paused::before{animation-play-state:paused !important}',
    '@keyframes featGlow{0%{opacity:.6}100%{opacity:1}}'
  ].join('');
  document.head.appendChild(style);

})();

/* ─────────────────────────────── */

(function(){
  var A   = document.getElementById('heroVidA');
  var B   = document.getElementById('heroVidB');
  var IMG = document.getElementById('heroMobileImg');
  if(!A || !B) return;

  var sequenceStarted = false; // guard contre double startSequence
  var active          = null;  // vidéo actuellement en lecture
  var fallbackTimer   = null;

  /* ── Fallback image si rien ne démarre dans les 4s ── */
  function armFallback(){
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(function(){
      if(!active){
        if(IMG){ IMG.style.opacity = '.9'; }
        A.style.opacity = '0';
        B.style.opacity = '0';
      }
    }, 4000);
  }

  /* ── Crossfade propre entre deux vidéos ── */
  function crossfade(from, to){
    to.currentTime = 0;
    // iOS : changer preload seul ne suffit pas — load() force le fetch
    /* Pas de load() ici — B préchargé dans startSequence */
    var p = to.play();
    if(p !== undefined){
      p.then(function(){
        clearTimeout(fallbackTimer);
        to.style.opacity   = '.9';
        if(from){ from.style.opacity = '0'; }
        if(IMG){  IMG.style.opacity  = '0'; }
        active = to;
      }).catch(function(){
        /* Autoplay bloqué (politique navigateur) — image reste visible */
        to.style.opacity = '0';
        if(IMG){ IMG.style.opacity = '.9'; }
        active = null;
      });
    } else {
      /* Vieux navigateur sans Promise */
      clearTimeout(fallbackTimer);
      to.style.opacity = '.9';
      if(from){ from.style.opacity = '0'; }
      if(IMG){  IMG.style.opacity  = '0'; }
      active = to;
    }
  }

  /* ── Attache les listeners de séquence (une seule fois) ── */
  function startSequence(){
    if(sequenceStarted) return;
    sequenceStarted = true;

    /* Ping-pong A→B→A */
    /* Pré-lancer la suivante à 88% pour crossfade sans blanc */
    A.addEventListener('timeupdate',function(){
      if(!A.duration)return;
      if(A.currentTime/A.duration>=0.88&&B.readyState<3){B.currentTime=0;B.play().catch(function(){});}
    },{passive:true});
    B.addEventListener('timeupdate',function(){
      if(!B.duration)return;
      if(B.currentTime/B.duration>=0.88&&A.readyState<3){A.currentTime=0;A.play().catch(function(){});}
    },{passive:true});
    A.addEventListener('ended', function(){ crossfade(A, B); }, {passive:true});
    B.addEventListener('ended', function(){ crossfade(B, A); }, {passive:true});

    /* Buffer stall : légère transparence pendant le rebuffering, jamais d'image par-dessus */
    A.addEventListener('waiting', function(){ if(active===A){ A.style.opacity='.6'; } }, {passive:true});
    A.addEventListener('playing', function(){ if(active===A){ A.style.opacity='.9'; if(IMG){ IMG.style.opacity='0'; } } }, {passive:true});
    B.addEventListener('waiting', function(){ if(active===B){ B.style.opacity='.6'; } }, {passive:true});
    B.addEventListener('playing', function(){ if(active===B){ B.style.opacity='.9'; if(IMG){ IMG.style.opacity='0'; } } }, {passive:true});

    /* Précharger B pendant que A joue */
    B.preload='auto'; B.load();
    crossfade(null, A);
  }

  /* ── Démarre le chargement et lance la séquence dès que possible ── */
  function initVideo(){
    A.preload = 'auto';
    B.preload = 'none'; // B chargé en différé, load() déclenché dans crossfade()
    armFallback();

    if(A.readyState >= 3){
      /* Assez de données pour commencer */
      startSequence();
    } else {
      /* Attendre canplay — {once:true} sur les deux pour éviter tout double-fire */
      var fired = false;
      function onCanPlay(){
        if(fired) return;
        fired = true;
        startSequence();
      }
      A.addEventListener('canplay',      onCanPlay, {once:true, passive:true});
      A.addEventListener('canplaythrough', onCanPlay, {once:true, passive:true});
    }
  }

  /* ── Détection navigateur interne TikTok / ByteDance ── */
  var ua = navigator.userAgent || '';
  var isTikTokBrowser = /musical_ly|TikTok|BytedanceWebview|ByteLocale|Aweme/i.test(ua);
  if(isTikTokBrowser){
    A.style.display = 'none';
    B.style.display = 'none';
    if(IMG){ IMG.style.opacity = '.9'; }
    return;
  }

  /* ── Init immédiate ── */
  initVideo();

  /* ── Récupération sur premier geste (iOS Safari strict autoplay) ──
     On ne recharge PAS la vidéo si elle buffer déjà — on tente juste play() */
  var recoveryDone = false;
  function recoverAfterGesture(){
    if(recoveryDone) return;
    recoveryDone = true;
    if(active){
      /* Déjà en lecture — s'assurer qu'elle n'est pas suspendue */
      active.play().catch(function(){});
      return;
    }
    if(A.readyState >= 1){
      /* Buffer en cours — tenter play() directement sans load() */
      var p = A.play();
      if(p !== undefined){
        p.then(function(){
          clearTimeout(fallbackTimer);
          A.style.opacity = '.9';
          if(IMG){ IMG.style.opacity = '0'; }
          active = A;
          if(!sequenceStarted){ startSequence(); }
        }).catch(function(){
          /* Toujours bloqué — rien de plus à faire */
        });
      }
    } else {
      /* Pas encore de données — reset propre puis relance */
      sequenceStarted = false;
      A.preload = 'auto';
      A.load();
      initVideo();
    }
  }
  document.addEventListener('touchstart', recoverAfterGesture, {once:true, passive:true});
  document.addEventListener('click',      recoverAfterGesture, {once:true, passive:true});

  /* ── Pause / reprise selon visibilité onglet ── */
  document.addEventListener('visibilitychange', function(){
    if(document.hidden){
      if(active) active.pause();
    } else {
      if(active) active.play().catch(function(){});
    }
  }, {passive:true});

  /* ── Reprise après appswitch mobile (iOS bfcache / pageshow) ── */
  window.addEventListener('pageshow', function(e){
    /* e.persisted = vrai si page restaurée depuis le cache navigateur */
    if(active) active.play().catch(function(){});
  }, {passive:true});

  /* ── Focus window : reprise après alt-tab Android Chrome ── */
  window.addEventListener('focus', function(){
    if(active && active.paused) active.play().catch(function(){});
  }, {passive:true});

})();

/* ─────────────────────────────── */

/* ── SERVICES SECONDAIRES → ouvre modal existante ── */
document.querySelectorAll('.svc-secondary-item').forEach(function(item){
  item.addEventListener('click', function(){
    var modal = item.dataset.modal;
    if (modal && typeof openSvcModal === 'function') openSvcModal(modal);
    else if (modal && typeof openModal === 'function') openModal(modal);
  });
});

/* ─────────────────────────────── */

/* ── UPLOAD RÉFÉRENCES CONTACT ── */
(function(){
  var drop = document.getElementById('cqfDrop');
  var grid = document.getElementById('cqfGrid');
  var imgData = document.getElementById('cqfImgData');
  var files = [];
  if (!drop || !grid) return;

  function addFiles(newFiles) {
    Array.from(newFiles).slice(0, 4 - files.length).forEach(function(f) {
      if (!f.type.startsWith('image/') || f.size > 5 * 1024 * 1024) return;
      files.push(f);
      var reader = new FileReader();
      reader.onload = function(e) {
        var thumb = document.createElement('div');
        thumb.className = 'cqf-ref-thumb';
        thumb.innerHTML = '<img src="' + e.target.result + '" alt="Référence"><button type="button" onclick="this.parentNode.remove()" title="Supprimer">×</button>';
        grid.appendChild(thumb);
      };
      reader.readAsDataURL(f);
    });
  }

  drop.addEventListener('dragover', function(e){ e.preventDefault(); drop.style.borderColor = 'var(--accent)'; });
  drop.addEventListener('dragleave', function(){ drop.style.borderColor = ''; });
  drop.addEventListener('drop', function(e){ e.preventDefault(); drop.style.borderColor = ''; addFiles(e.dataTransfer.files); });

  window.cqfHandleFiles = function(f) { addFiles(f); };
})();

/* ─────────────────────────────── */

/* ── CHIPS CONTACT ── */
function cqfToggleChip(btn, val) {
  document.querySelectorAll('.cqf-chip').forEach(function(c){ c.classList.remove('active'); });
  btn.classList.add('active');
  var hidden = document.getElementById('cqfServiceHiddenForm');
  if (hidden) hidden.value = val;
}
/* cqfGoStep2 / cqfGoBack supprimés — formulaire 1 étape */

/* ─────────────────────────────── */

// ── SWIPE HINTS — masquer après premier scroll ──
(function(){
  ['workTrack','covTrack','motTrack'].forEach(function(id) {
    var track = document.getElementById(id);
    if (!track) return;
    var hint = track.parentNode.querySelector('.swipe-hint');
    if (!hint) return;
    track.addEventListener('scroll', function() {
      hint.classList.add('hidden');
    }, { passive: true, once: true });
    // Aussi masquer au toucher
    track.addEventListener('touchstart', function() {
      hint.classList.add('hidden');
    }, { passive: true, once: true });
  });

  // ── PORT-TABS : indicateur scroll droite ──
  var portTabs = document.querySelector('.port-tabs');
  var portTabsWrap = document.querySelector('.port-tabs-wrap');
  if (portTabs && portTabsWrap) {
    portTabs.addEventListener('scroll', function() {
      var atEnd = portTabs.scrollLeft + portTabs.offsetWidth >= portTabs.scrollWidth - 8;
      portTabsWrap.classList.toggle('at-end', atEnd);
    }, { passive: true });
  }
})();

/* ── BOTTOM TAB BAR : sync active avec scroll ── */
(function(){
  var tabBar = document.getElementById('mob-tab-bar');
  if (!tabBar) return;

  var tabs = tabBar.querySelectorAll('.mob-tab');
  var sections = ['hero','portfolio-accordion','services','pricing','contact'];

  function getActiveSection() {
    var scrollY = window.scrollY + window.innerHeight * 0.35;
    var active = sections[0];
    sections.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) active = id;
    });
    return active;
  }

  function updateTabs() {
    var activeId = getActiveSection();
    tabs.forEach(function(tab) {
      tab.classList.toggle('active', tab.dataset.section === activeId && !tab.classList.contains('mob-tab-cta'));
    });
  }

  window.addEventListener('scroll', updateTabs, {passive: true});
  updateTabs();

  /* Smooth scroll au clic — sauf contact qui ouvre popup */
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      if (tab.classList.contains('mob-tab-cta')) return; // géré par onclick
      var targetId = tab.dataset.section;
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        window.lenisScroll(targetId);
      }
    });
  });
})();

/* ─────────────────────────────── */

/* ── ORDRE MOBILE : About avant Portfolio ── */
(function(){
  function reorderMobile(){
    if(window.innerWidth > 767) return;
    var about = document.getElementById('about');
    var portfolio = document.getElementById('portfolio-accordion');
    if(!about || !portfolio) return;
    // Check if about is already before portfolio
    var allSections = Array.from(document.querySelectorAll('section[id]'));
    var aIdx = allSections.indexOf(about);
    var pIdx = allSections.indexOf(portfolio);
    if(aIdx < pIdx) return; // already in right order
    // Move about to before portfolio
    portfolio.parentNode.insertBefore(about, portfolio);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', reorderMobile);
  } else {
    reorderMobile();
  }
})();

/* ─────────────────────────────── */

(function(){
  var fcta = document.getElementById('floating-cta');
  var hero = document.getElementById('hero') || document.querySelector('section');
  var contact = document.getElementById('contact');
  if(!fcta) return;
  function onScroll(){
    var scrollY = window.scrollY || window.pageYOffset;
    var heroH = hero ? hero.offsetHeight * 0.7 : 600;
    var contactTop = contact ? contact.getBoundingClientRect().top + scrollY - 200 : Infinity;
    fcta.classList.toggle('visible', scrollY > heroH && scrollY < contactTop);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
})();