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


for f in (c_js, c_parite, c_traductions, c_medias, c_vignettes, c_video, c_apercus, c_lexique):
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
