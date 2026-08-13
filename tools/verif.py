# -*- coding: utf-8 -*-
"""Controles a passer avant chaque mise en ligne.

    python tools/verif.py

Sortie 0 si tout passe, 1 sinon. Chaque controle vient d'une panne
reellement survenue : ce ne sont pas des precautions theoriques.

  1. syntaxe JS      un guillemet mal place dans un bloc <script> le rend
                     entierement muet, sans rien signaler dans la console
                     au chargement. Deux modules ont ete livres morts.
  2. parite FR/EN    les deux pages sont des copies : un id ajoute d'un
                     seul cote casse le routeur de sections sur l'autre.
  3. traductions     un libelle francais sans paire ni cle reste en
                     francais sur la page anglaise.
  4. medias          une reference cassee ne se voit qu'a l'oeil, et
                     seulement si on descend jusque-la.
  5. vignettes       data-lb-src doit pointer vers le fichier COMPLET :
                     s'il pointe vers une vignette, l'agrandissement
                     s'affiche flou sans que rien ne le signale.
  6. codecs video    une piste HEVC donne le son sans l'image sur tout
                     ce qui n'est pas Safari.
  7. apercus sociaux og:image en WebP n'est pas lu par WhatsApp.
  8. lexique         une action doit porter un seul nom.
"""
import io, os, re, sys, glob, subprocess, tempfile

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PAGES = sorted(glob.glob('*.html') + glob.glob('en/*.html'))
FR, EN = 'index.html', 'en/index.html'
echecs = []


def titre(n, t):
    print()
    print('%d. %s' % (n, t))
    print('   ' + '-' * (len(t) + 2))


def ok(msg):
    print('   ok   %s' % msg)


def ko(msg):
    print('   !!   %s' % msg)
    echecs.append(msg)


def lire(p):
    return io.open(p, encoding='utf-8', errors='ignore').read()


# ── 1. syntaxe des blocs JS ───────────────────────────────────────────
def c_js():
    titre(1, 'Syntaxe des blocs <script>')
    node = subprocess.run(['node', '--version'], capture_output=True)
    if node.returncode != 0:
        ko('node introuvable : controle impossible'); return
    for p in PAGES:
        s = lire(p)
        bons = mauvais = 0
        for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, re.S):
            code = m.group(1)
            if not code.strip():
                continue
            # Un <script> peut porter autre chose que du JavaScript : carte
            # d'imports, donnees structurees, gabarit. Seuls les types vides
            # ou explicitement JS sont du code a verifier.
            t = re.search(r'\btype\s*=\s*["\']([^"\']+)["\']', m.group(0))
            if t and not re.match(r'(text|application)/(java|ecma)script$|module$', t.group(1).strip()):
                continue
            f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8')
            f.write(code); f.close()
            r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
            os.unlink(f.name)
            if r.returncode:
                mauvais += 1
                ligne = s[:m.start()].count('\n') + 1
                detail = (r.stderr.split('\n')[4] if len(r.stderr.split('\n')) > 4 else '').strip()
                ko('%s ligne ~%d : %s' % (p, ligne, detail[:70]))
            else:
                bons += 1
        if not mauvais:
            ok('%-18s %d blocs valides' % (p, bons))


# ── 2. parite des id entre les deux langues ───────────────────────────
def c_parite():
    titre(2, 'Parite des id FR / EN')
    a = sorted(set(re.findall(r'\sid="([^"]+)"', lire(FR))))
    b = sorted(set(re.findall(r'\sid="([^"]+)"', lire(EN))))
    manque = [x for x in a if x not in b]
    trop = [x for x in b if x not in a]
    if manque or trop:
        for x in manque[:6]: ko('absent de la page EN : #%s' % x)
        for x in trop[:6]: ko('absent de la page FR : #%s' % x)
    else:
        ok('%d id identiques des deux cotes' % len(a))


# ── 3. libelles sans traduction ───────────────────────────────────────
def c_traductions():
    titre(3, 'Libelles sans traduction')
    s = lire(EN)
    paires = set(m.group(1) for m in re.finditer(r'\[`([^`]+)`,`[^`]*`\]', s))
    cles = set()
    for m in re.finditer(r"\w+:\s*\{\s*fr:\s*'([^']*)'", s):
        cles.add(m.group(1))
    connus = paires | cles
    # libelles de boutons et de liens, la ou une omission se voit
    manquants = []
    for m in re.finditer(r'<(?:a|button)\b[^>]*>([^<>]{3,44})</(?:a|button)>', s):
        t = ' '.join(m.group(1).split())
        if not re.search(r'[a-zA-Z]', t):
            continue
        if not re.search(r'[àâçéèêëîïôûù]|\b(le|la|les|des|du|une|pour|avec|voir|lancer|nos|mes)\b', t, re.I):
            continue
        if t in connus:
            continue
        manquants.append(t)
    manquants = sorted(set(manquants))
    if manquants:
        for t in manquants[:8]:
            ko('sans paire de traduction : "%s"' % t)
    else:
        ok('tous les libelles cliquables ont une traduction')


# ── 4. references de medias ───────────────────────────────────────────
def c_medias():
    titre(4, 'References de medias')
    from urllib.parse import unquote
    refs = set()
    for p in PAGES + glob.glob('*.css'):
        refs |= set(unquote(x) for x in re.findall(
            r'/media/(?:img|video)/([A-Za-z0-9_.%\-]+\.(?:png|jpg|jpeg|webp|mp4))', lire(p)))
    casse = [r for r in sorted(refs)
             if not any(os.path.exists(os.path.join('media', d, r)) for d in ('img', 'video'))]
    if casse:
        for r in casse[:8]: ko('fichier absent : %s' % r)
    else:
        ok('%d references, toutes resolues' % len(refs))


# ── 5. les vignettes ne doivent pas servir d'agrandissement ───────────
def c_vignettes():
    titre(5, 'Vignettes et agrandissements')
    mauvais = 0
    for p in PAGES:
        n = len(re.findall(r'data-lb-src="[^"]*-t\.webp"', lire(p)))
        if n:
            ko('%s : %d data-lb-src pointent vers une vignette' % (p, n)); mauvais += n
    if not mauvais:
        ok('aucun agrandissement servi depuis une vignette')


# ── 6. codecs video ───────────────────────────────────────────────────
def c_video():
    titre(6, 'Codecs video')
    if subprocess.run(['ffprobe', '-version'], capture_output=True).returncode != 0:
        ko('ffprobe introuvable : controle impossible'); return
    mauvais = 0
    fichiers = sorted(glob.glob('media/video/*.mp4'))
    for f in fichiers:
        r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                            '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', f],
                           capture_output=True, text=True)
        c = r.stdout.strip()
        if c != 'h264':
            ko('%s : %s (son sans image hors Safari)' % (os.path.basename(f), c)); mauvais += 1
    if not mauvais:
        ok('%d videos, toutes en H.264' % len(fichiers))


# ── 7. images d'apercu social ─────────────────────────────────────────
def c_apercus():
    titre(7, 'Apercus sociaux')
    mauvais = 0
    for p in PAGES:
        for m in re.finditer(r'<meta[^>]*(?:og:image|twitter:image)[^>]*content="([^"]+)"', lire(p)):
            if m.group(1).lower().endswith('.webp'):
                ko('%s : og:image en WebP, non lu par WhatsApp' % p); mauvais += 1
    if not mauvais:
        ok('toutes les images d\'apercu sont dans un format lu partout')


# ── 8. lexique ────────────────────────────────────────────────────────
def c_lexique():
    titre(8, 'Lexique : une action, un terme')
    # "Confier un projet" vivait dans les quatre etudes de cas : meme
    # action que "Lancer un projet", deux mots differents selon la page.
    concurrents = ['Démarrer un projet', 'Discuter de ce projet',
                   'Demander un devis', 'Démarrer ce pack',
                   'Confier un projet']
    mauvais = 0
    for p in PAGES:
        s = lire(p)
        for t in concurrents:
            if t in s:
                ko('%s : "%s" concurrence "Lancer un projet"' % (p, t)); mauvais += 1
    if not mauvais:
        ok('aucun terme concurrent pour l\'action principale')


# ── 9. empreinte du CSS ───────────────────────────────────────────────
def c_css():
    titre(9, 'Empreintes des fichiers assets')
    import hashlib, glob as g
    fichiers = [f for f in g.glob('assets/*') if os.path.isfile(f)]
    if not fichiers:
        ok('pas de fichier dans assets/'); return
    reel = {}
    for f in fichiers:
        reel['/' + f.replace('\\', '/')] = hashlib.md5(io.open(f, 'rb').read()).hexdigest()[:8]

    # vercel.json sert /assets/(.*) en cache immuable d'un an : une
    # empreinte perimee, ou absente, fige le fichier chez tout visiteur
    # deja venu, pour douze mois.
    mauvais = 0
    pages = sorted(set(g.glob('*.html') + g.glob('projets/*.html')
                       + g.glob('en/*.html') + g.glob('en/projets/*.html')))
    for p in pages:
        s = lire(p)
        for m in re.finditer(r'(/assets/[A-Za-z0-9_.\-]+)(?:\?v=([a-f0-9]+))?', s):
            chemin, vu = m.group(1), m.group(2)
            att = reel.get(chemin)
            if att is None:
                continue                      # fichier absent : controle 4
            if vu is None:
                ko('%s : %s sans empreinte' % (p, chemin)); mauvais += 1
            elif vu != att:
                ko('%s : %s empreinte %s, fichier %s' % (p, chemin, vu, att)); mauvais += 1
    if not mauvais:
        ok('%d fichier(s) assets, empreintes a jour dans %d page(s)'
           % (len(fichiers), len(pages)))


# ── 10. la page anglaise est-elle bien generee ? ──────────────────────
def c_generation():
    titre(10, 'Page anglaise generee depuis la source')
    if not os.path.exists('tools/gen-en.py'):
        ok('pas de generateur'); return
    r = subprocess.run([sys.executable, 'tools/gen-en.py'], capture_output=True, text=True)
    sortie = (r.stdout or '') + (r.stderr or '')
    if 'identique au fichier actuel' in sortie:
        ok('en/index.html correspond a la generation')
        return
    # Une page anglaise modifiee a la main derive de la source : la
    # prochaine generation ecraserait la modification sans prevenir.
    for l in sortie.split('\n'):
        if "ligne(s) d ecart" in l or l.strip().startswith('!!'):
            ko(l.strip()[:100])
    if not any("ecart" in l for l in sortie.split('\n')):
        ko('generation impossible : %s' % sortie.strip().split('\n')[-1][:70])


# ── 11. du francais reste-t-il cote anglais ? ─────────────────────────
def c_francais_en():
    titre(11, 'Francais residuel dans les pages anglaises')
    # Mots sans equivalent anglais, hors noms propres. La liste est
    # volontairement courte : mieux vaut ne rien signaler que crier au loup.
    MOTS = (r'\b(et|ou|les|des|une|pour|avec|votre|vos|notre|nos|dans|sur|'
            r'chaque|tous|toutes|sans|selon|entre|apr[eè]s|avant|depuis|'
            r'sont|seront|faire|voir|d[eé]j[aà]|seule?|compl[eè]te|clair|'
            r'incluses?|livraison|paiement|devis|acompte|calqu[eé]s?|'
            r'graphistes|cr[eé]ateurs)\b')
    mauvais = 0
    for p in sorted(glob.glob('en/*.html')):
        s = lire(p)
        trouves = []
        # Les metas et le titre sont lus par les moteurs AVANT tout
        # JavaScript : aucune traduction a l'execution ne peut les sauver.
        # Ce controle vaut donc pour toutes les pages anglaises.
        for m in re.finditer(r'<meta[^>]*(?:name|property)="([^"]*)"[^>]*content="([^"]*)"', s):
            if re.search(MOTS, m.group(2), re.I):
                trouves.append('meta %s : %s' % (m.group(1), m.group(2)[:56]))
        m = re.search(r'<title>([^<]*)</title>', s)
        if m and re.search(MOTS, m.group(1), re.I):
            trouves.append('title : %s' % m.group(1)[:56])

        # Le corps n'est verifie que sur les pages dont le HTML livre EST
        # deja l'anglais. Deux cas y echappent, et leur source francaise
        # est normale :
        #   - l'accueil, traduit a l'execution par applyLang
        #   - atelier, dont la tete est generee mais dont le corps se
        #     traduit aussi a l'execution
        # Les deux se reconnaissent au traducteur embarque dans la page.
        genere = os.path.exists('tools/i18n/%s.json' % os.path.basename(p)[:-5])
        # Trois facons de traduire a l'execution coexistent sur le site :
        # un dictionnaire (accueil), une table de textes (atelier), et un
        # composant qui porte les deux langues et retire la branche
        # inutile (learning center). Toutes laissent du francais dans la
        # source alors que l'ecran affiche l'anglais.
        traducteur = re.search(r'documentElement\.lang\s*=|applyLang|translateText|'
                               r'setState\(\{\s*lang:|isFr\s*:', s)
        if genere and not traducteur:
            corps = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', ' ', s, flags=re.S)
            corps = re.sub(r'<[^>]+>', ' ', corps)
            for phrase in re.split(r'\s{2,}|\n', corps):
                t = ' '.join(phrase.split())
                if len(t) >= 12 and re.search(MOTS, t, re.I):
                    trouves.append('texte : %s' % t[:56])

        if trouves:
            for x in trouves[:5]:
                ko('%s : %s' % (p, x))
            mauvais += len(trouves)
    if not mauvais:
        ok('aucun francais residuel dans les metas ni dans les pages generees')


# ── 12. chaque page francaise a-t-elle sa version anglaise ? ──────────
def c_couverture_en():
    titre(12, 'Couverture anglaise des pages francaises')
    fr_pages = sorted(p for p in glob.glob('*.html') if 'google' not in p)
    generees, embarquees, sans = [], [], []
    for p in fr_pages:
        if os.path.exists('en/' + p):
            generees.append(p)
        elif re.search(r"lang\s*=\s*['\"]en['\"]|=== *'en'|navigator\.language", lire(p)):
            # La page bascule elle-meme selon l'URL ou le navigateur : elle
            # est accessible en anglais sans fichier separe.
            embarquees.append(p)
        else:
            sans.append(p)
    if embarquees:
        print('   --   bilingue(s) a l execution, sans fichier separe : %s'
              % ', '.join(embarquees))
    if sans:
        # Pas un echec : c'est l'etat connu du chantier. On le compte pour
        # qu'il ne se degrade pas en silence.
        ko('%d page(s) sans anglais du tout : %s' % (len(sans), ', '.join(sans)))
    ok('%d page(s) sur %d accessibles en anglais (%d generees, %d a l execution)'
       % (len(generees) + len(embarquees), len(fr_pages), len(generees), len(embarquees)))


# ── 13. les pages generees depuis une table sont-elles a jour ? ───────
def c_generation_pages():
    titre(13, 'Pages anglaises generees depuis une table')
    if not os.path.exists('tools/gen-en-pages.py'):
        ok('pas de generateur de pages'); return
    r = subprocess.run([sys.executable, 'tools/gen-en-pages.py'], capture_output=True, text=True)
    sortie = (r.stdout or '') + (r.stderr or '')
    ecarts = [l.strip() for l in sortie.split('\n') if "ligne(s) d ecart" in l]
    absentes = [l.strip() for l in sortie.split('\n') if 'introuvable' in l]
    for l in absentes:
        # Une phrase francaise a bouge sans que sa traduction suive.
        ko(l[:100])
    for l in ecarts:
        ko('page anglaise modifiee a la main : %s' % l[:80])
    if not ecarts and not absentes:
        n = len(glob.glob('tools/i18n/*.json'))
        ok('%d page(s) correspondent a leur generation' % n)


# ── 14. le sitemap suit-il les fichiers reels ? ───────────────────────
def c_sitemap():
    titre(14, 'Sitemap a jour')
    if not os.path.exists('tools/gen-sitemap.py'):
        ok('pas de generateur de sitemap'); return
    r = subprocess.run([sys.executable, 'tools/gen-sitemap.py'], capture_output=True, text=True)
    sortie = (r.stdout or '') + (r.stderr or '')
    if 'identique au fichier actuel' in sortie:
        s = lire('sitemap.xml')
        ok('%d URL, %d alternates, conforme aux fichiers presents'
           % (s.count('<loc>'), s.count('hreflang=')))
        return
    # Une page ajoutee ou retiree sans regenerer : le sitemap annonce un
    # site qui n'existe plus tout a fait.
    for l in sortie.split('\n'):
        l = l.strip()
        if l.startswith(('+ http', '- http')):
            ko('sitemap decale : %s' % l[:88])


# ── 15. bases du referencement ────────────────────────────────────────
def c_seo():
    titre(15, 'Bases du referencement')
    import json as _json, glob as g
    pages = sorted(set(g.glob('*.html') + g.glob('projets/*.html')
                       + g.glob('en/*.html') + g.glob('en/projets/*.html')))
    pages = [p for p in pages if 'google' not in p]
    mauvais = 0
    for p in pages:
        s = lire(p)
        est_404 = os.path.basename(p) == '404.html'

        # Un seul h1 : c'est le signal de sujet le plus fort de la page.
        # uranus n'en avait aucun, son titre principal etait un h2.
        n_h1 = len(re.findall(r'<h1[\s>]', s))
        if n_h1 != 1:
            ko('%s : %d h1 (il en faut un)' % (p, n_h1)); mauvais += 1

        # Au-dela d'environ 60 et 160 caracteres, la fin est coupee dans
        # les resultats : ce qui compte doit tenir avant la coupe.
        m = re.search(r'<title>([^<]*)</title>', s)
        if not m:
            ko('%s : pas de <title>' % p); mauvais += 1
        elif len(m.group(1)) > 60:
            ko('%s : titre de %d caracteres, coupe vers 60' % (p, len(m.group(1)))); mauvais += 1
        m = re.search(r'<meta name="description"[^>]*content="([^"]*)"', s)
        if not m:
            if not est_404:                       # une page 404 n'est pas indexee
                ko('%s : pas de description' % p); mauvais += 1
        elif len(m.group(1)) > 160:
            ko('%s : description de %d caracteres, coupee vers 160'
               % (p, len(m.group(1)))); mauvais += 1

        # Donnees structurees : JSON valide, et url du bon cote.
        for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
            try:
                d = _json.loads(b)
            except Exception as e:
                ko('%s : JSON-LD invalide (%s)' % (p, str(e)[:44])); mauvais += 1
                continue
            u = d.get('url') if isinstance(d, dict) else None
            # Le cote de la langue ne se verifie que sur NOS pages. Une
            # etude de cas web decrit le site d'un client : son url est
            # sur un autre domaine et n'a pas de version /en/.
            if isinstance(u, str) and 'mdgcreative.studio' in u:
                if p.startswith('en') != ('/en/' in u):
                    ko('%s : JSON-LD url %s' % (p, u.replace('https://www.mdgcreative.studio', '')))
                    mauvais += 1
    if not mauvais:
        ok('%d pages : un h1 chacune, titres et descriptions dans les limites, '
           'JSON-LD valide' % len(pages))


for f in (c_js, c_parite, c_traductions, c_medias, c_vignettes, c_video,
          c_apercus, c_lexique, c_css, c_generation,
          c_francais_en, c_couverture_en, c_generation_pages, c_sitemap, c_seo):
    try:
        f()
    except Exception as e:
        ko('controle interrompu : %s' % e)

print()
print('=' * 62)
if echecs:
    print('ECHEC : %d probleme(s)' % len(echecs))
    sys.exit(1)
print('Tout passe.')
sys.exit(0)
