# -*- coding: utf-8 -*-
"""Recupere les traductions deja ecrites dans les pages EN maintenues a la main.

    python tools/extraire-i18n.py            montre ce qui serait extrait
    python tools/extraire-i18n.py --apply    ecrit tools/i18n/<page>.json

POURQUOI. en/tarifs.html et en/uranus.html sont des copies entieres de
leur source francaise, tenues a la main. Elles ont deja derive : trois
metas y sont restees en francais alors que la page anglaise generee,
elle, est propre. Le reste de la traduction est bon et il n'y a aucune
raison de le refaire a la main.

Les deux fichiers ont le meme nombre de lignes que leur source, ligne
pour ligne. On peut donc apparier chaque ligne differente et en tirer
une table FR -> EN exacte, que le generateur rejouera.

Une ligne francaise doit etre UNIQUE dans sa page pour servir de cle :
sinon le remplacement toucherait un endroit non voulu. Les doublons
sont signales et laisses de cote plutot que devines.
"""
import io, json, os, sys, collections

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

PAGES = ['tarifs.html', 'uranus.html']


def lire(p):
    return io.open(p, encoding='utf-8', errors='ignore').read().split('\n')


total_paires = 0
total_doublons = 0

for nom in PAGES:
    src, cible = nom, 'en/' + nom
    if not os.path.exists(cible):
        print('%-16s pas de version anglaise, rien a extraire' % nom)
        continue

    fr, en = lire(src), lire(cible)
    if len(fr) != len(en):
        print('%-16s !! %d lignes contre %d : les fichiers ne sont plus alignes,'
              % (nom, len(fr), len(en)))
        print('%-16s    extraction impossible sans risque de decalage.' % '')
        continue

    # Une ligne francaise qui revient plusieurs fois reste utilisable si
    # elle est traduite pareil partout : le remplacement global donne
    # alors exactement le fichier attendu. Si les traductions divergent,
    # aucun choix n'est defendable et on s'arrete.
    rendus = collections.defaultdict(set)
    for a, b in zip(fr, en):
        rendus[a].add(b)

    compte = collections.Counter(fr)
    paires, ambigus, vu = [], [], set()
    for a, b in zip(fr, en):
        if a == b or a in vu:
            continue
        vu.add(a)
        if len(rendus[a]) > 1:
            ambigus.append(a.strip()[:70])
            continue
        paires.append([a, b])

    multiples = sum(1 for p in paires if compte[p[0]] > 1)
    print('%-16s %3d paires extraites (%d lignes repetees, traduites pareil partout)'
          % (nom, len(paires), multiples))
    if ambigus:
        print('%-16s !! %d ligne(s) traduites differemment selon l endroit :' % ('', len(ambigus)))
        for d in sorted(set(ambigus))[:5]:
            print('%-16s    %s' % ('', d))
    doublons = ambigus

    total_paires += len(paires)
    total_doublons += len(doublons)

    if APPLY:
        if not os.path.isdir('tools/i18n'):
            os.makedirs('tools/i18n')
        chemin = 'tools/i18n/%s.json' % nom[:-5]
        io.open(chemin, 'w', encoding='utf-8').write(
            json.dumps(paires, ensure_ascii=False, indent=1))
        print('%-16s -> %s' % ('', chemin))

print()
print('  total : %d paires, %d lignes non uniques' % (total_paires, total_doublons))
if not APPLY:
    print()
    print('MODE : SIMULATION (ajouter --apply pour ecrire)')
