# -*- coding: utf-8 -*-
"""Tamponne chaque reference a /assets/ avec l'empreinte du fichier.

    python tools/empreintes.py            verifie sans ecrire
    python tools/empreintes.py --apply    ecrit

POURQUOI. vercel.json sert /assets/(.*) en cache immuable d'un an. Sans
empreinte dans l'URL, une correction posee aujourd'hui n'atteindrait
jamais un visiteur deja venu : son navigateur garderait l'ancien fichier
pendant douze mois, sans jamais redemander.

L'empreinte change avec le contenu, donc l'URL change, donc le cache est
contourne exactement quand il faut et jamais autrement.

mdg.css etait deja tamponne a la main. transition.js ne l'etait pas, et
c'est ce qui a montre le trou : rien ne garantissait que la regle vaille
pour les fichiers suivants.
"""
import io, os, re, sys, glob, hashlib

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

# Les pages anglaises sont generees : les tamponner ici les ferait
# diverger de leur source. On ne touche qu'aux sources francaises.
PAGES = sorted(set(glob.glob('*.html') + glob.glob('projets/*.html')))

empreintes = {}
for f in glob.glob('assets/*'):
    if os.path.isfile(f):
        empreintes['/' + f.replace('\\', '/')] = \
            hashlib.md5(io.open(f, 'rb').read()).hexdigest()[:8]

if not empreintes:
    print('Aucun fichier dans assets/.')
    sys.exit(0)

print('Empreintes courantes :')
for chemin, e in sorted(empreintes.items()):
    print('  %-28s %s' % (chemin, e))
print()

motif = re.compile(r'(/assets/[A-Za-z0-9_.\-]+)(\?v=([a-f0-9]+))?')
ecarts = 0
touchees = 0

for p in PAGES:
    s = io.open(p, encoding='utf-8', newline='').read()
    lignes = []

    def remplace(m):
        global ecarts
        chemin, ancien = m.group(1), m.group(3)
        reel = empreintes.get(chemin)
        if reel is None:
            # reference vers un fichier absent : c'est le controle 4 qui
            # le signale, pas celui-ci
            return m.group(0)
        if ancien == reel:
            return m.group(0)
        lignes.append('%s : %s -> %s' % (chemin, ancien or '(aucune)', reel))
        ecarts += 1
        return chemin + '?v=' + reel

    s2 = motif.sub(remplace, s)
    if lignes:
        print('%s' % p)
        for l in lignes:
            print('    %s' % l)
        touchees += 1
        if APPLY:
            io.open(p, 'w', encoding='utf-8', newline='').write(s2)

if not ecarts:
    print('Toutes les references sont a jour.')
else:
    print()
    print('%d reference(s) a corriger dans %d page(s)' % (ecarts, touchees))
    if APPLY:
        print('Ecrit.')

if not APPLY:
    print()
    print('MODE : VERIFICATION (ajouter --apply pour ecrire)')
sys.exit(1 if (ecarts and not APPLY) else 0)
