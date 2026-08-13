# -*- coding: utf-8 -*-
"""Genere les pages en/<page>.html a partir de leur source francaise.

    python tools/gen-en-pages.py            verifie sans ecrire
    python tools/gen-en-pages.py --apply    ecrit

POURQUOI. en/tarifs.html et en/uranus.html etaient des copies entieres,
tenues a la main. Elles avaient deja derive : trois metas y etaient
restees en francais, alors que la page d'accueil anglaise, elle, est
generee et donc propre. Une copie manuelle ne reste jamais synchronisee :
une correction posee du cote francais ne traverse pas.

COMMENT. Chaque page a une table de lignes dans tools/i18n/<page>.json,
recuperee des traductions deja ecrites par tools/extraire-i18n.py. La
generation part du fichier francais et applique la table.

Une ligne de la table dont le texte francais n'existe plus dans la
source est signalee : c'est le signe qu'une phrase a bouge du cote
francais et que sa traduction doit suivre. Sans ce signal, la page
anglaise garderait silencieusement l'ancienne version.

L'accueil n'est pas traite ici : il se traduit a l'execution par un
dictionnaire, et c'est tools/gen-en.py qui s'en charge.
"""
import io, json, os, sys, difflib

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

TABLES = 'tools/i18n'
echecs = 0


def pages():
    if not os.path.isdir(TABLES):
        return []
    return sorted(f[:-5] + '.html' for f in os.listdir(TABLES) if f.endswith('.json'))


def generer(nom):
    global echecs
    source = nom
    cible = 'en/' + nom
    table = json.load(io.open('%s/%s.json' % (TABLES, nom[:-5]), encoding='utf-8'))

    s = io.open(source, encoding='utf-8', newline='').read()
    posees, absentes = 0, []
    for fr, en in table:
        if fr not in s:
            absentes.append(fr.strip()[:72])
            continue
        posees += s.count(fr)
        s = s.replace(fr, en)

    print('  %-16s %3d/%3d lignes posees' % (nom, posees, len(table)), end='')
    if absentes:
        # Le francais a bouge sans que la traduction suive : la page
        # anglaise afficherait encore l'ancienne phrase.
        print(', %d introuvable(s) dans la source :' % len(absentes))
        for a in absentes[:6]:
            print('  %-16s   %s' % ('', a))
        echecs += 1
    else:
        print()

    actuel = io.open(cible, encoding='utf-8', newline='').read() if os.path.exists(cible) else ''
    if actuel == s:
        print('  %-16s identique au fichier actuel.' % '')
    else:
        d = [x for x in difflib.unified_diff(actuel.split('\n'), s.split('\n'), lineterm='', n=0)
             if x.startswith(('+', '-')) and not x.startswith(('+++', '---'))]
        print('  %-16s %d ligne(s) d ecart avec le fichier actuel' % ('', len(d)))
        for x in d[:8]:
            print('  %-16s   %s' % ('', x[:110]))

    if APPLY:
        io.open(cible, 'w', encoding='utf-8', newline='').write(s)
        print('  %-16s %s ecrit.' % ('', cible))
    return s


liste = pages()
if not liste:
    print('Aucune table dans %s : rien a generer.' % TABLES)
    sys.exit(0)

print('Pages generees depuis leur source francaise :')
print()
for nom in liste:
    if not os.path.exists(nom):
        print('  %-16s source absente, ignoree' % nom)
        continue
    generer(nom)
    print()

if not APPLY:
    print('MODE : VERIFICATION (ajouter --apply pour ecrire)')
sys.exit(1 if echecs else 0)
