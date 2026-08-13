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
    concurrents = ['Démarrer un projet', 'Discuter de ce projet',
                   'Demander un devis', 'Démarrer ce pack']
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
    titre(9, 'Empreinte du CSS')
    import hashlib
    if not os.path.exists('assets/mdg.css'):
        ok('pas de feuille extraite'); return
    reel = hashlib.md5(io.open('assets/mdg.css', 'rb').read()).hexdigest()[:8]
    mauvais = 0
    for p in (FR, EN):
        m = re.search(r'/assets/mdg\.css\?v=([a-f0-9]+)', lire(p))
        if not m:
            ko('%s : lien vers mdg.css sans empreinte' % p); mauvais += 1
        elif m.group(1) != reel:
            # Le fichier est servi en cache d'un an : une empreinte périmée
            # ferait resservir l'ancienne feuille pendant un an.
            ko('%s : empreinte %s, fichier %s' % (p, m.group(1), reel)); mauvais += 1
    if not mauvais:
        ok('empreinte %s a jour dans les deux pages' % reel)


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

        # Le corps n'est verifie que sur les pages GENEREES depuis une
        # table. L'accueil, lui, se traduit a l'execution : son corps est
        # francais dans la source et c'est normal.
        genere = os.path.exists('tools/i18n/%s.json' % os.path.basename(p)[:-5])
        if genere:
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
    sans = [p for p in fr_pages if not os.path.exists('en/' + p)]
    if sans:
        # Pas un echec : c'est l'etat connu du chantier. On le compte pour
        # qu'il ne se degrade pas en silence.
        print('   --   %d page(s) sans version anglaise : %s'
              % (len(sans), ', '.join(sans)))
    ok('%d page(s) francaise(s) sur %d ont leur version anglaise'
       % (len(fr_pages) - len(sans), len(fr_pages)))


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


for f in (c_js, c_parite, c_traductions, c_medias, c_vignettes, c_video,
          c_apercus, c_lexique, c_css, c_generation,
          c_francais_en, c_couverture_en, c_generation_pages):
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
