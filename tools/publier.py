# -*- coding: utf-8 -*-
"""Passe tous les generateurs, DANS L'ORDRE, avant une publication.

    python tools/publier.py           verifie sans rien ecrire
    python tools/publier.py --apply   ecrit

POURQUOI CET OUTIL EXISTE. Les garde-fous etaient deja la : gen-en.py
signale une valeur francaise sans traduction, gen-en-pages.py signale
une ligne de table qui ne correspond plus a la source, empreintes.py
signale une reference d'asset perimee. Ce qui manquait n'etait pas un
controle de plus — c'etait quelque chose qui les lance tous, sans avoir
a se souvenir de leur existence ni de leur ordre.

L'ORDRE N'EST PAS ARBITRAIRE, il a ete paye cher :

  1. empreintes  — tamponne les assets modifies dans les pages
                   francaises ;
  2. gen-en      — recopie index.html vers en/index.html, empreintes
                   comprises. Doit donc passer APRES ;
  3. gen-en-pages— idem pour les pages annexes ;
  4. identite    — repose le graphe d'identite dans la bonne langue de
                   chaque cote. Doit passer EN DERNIER : les deux
                   generateurs ci-dessus recopient la version francaise
                   et l'ecraseraient ;
  5. sitemap     — decoule des fichiers presents, donc a la fin.

Un echec arrete la chaine : continuer sur une base fausse ne ferait que
propager l'erreur.
"""
import os, subprocess, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RACINE)
APPLY = '--apply' in sys.argv

ETAPES = [
    ('empreintes',    'empreintes.py'),
    ('page anglaise', 'gen-en.py'),
    ('pages annexes', 'gen-en-pages.py'),
    ('identite',      'identite.py'),
    ('sitemap',       'gen-sitemap.py'),
]

# Ce qui, dans la sortie d'une etape, doit faire lever le nez.
ALERTES = ('introuvable', '!!', 'sans traduction', 'ECHEC', 'Traceback')

echecs = 0
for nom, script in ETAPES:
    cmd = [sys.executable, os.path.join('tools', script)] + (['--apply'] if APPLY else [])
    r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    sortie = (r.stdout or '') + (r.stderr or '')
    signale = [l for l in sortie.splitlines() if any(a in l for a in ALERTES)]
    etat = 'ok' if r.returncode == 0 and not signale else 'A VOIR'
    print('%-16s %s' % (nom, etat))
    for l in signale[:6]:
        print('    %s' % l.strip()[:110])
    if r.returncode != 0:
        echecs += 1
        print('    arret : %s a echoue' % script)
        break

print()
if echecs:
    print('Chaine interrompue.')
    sys.exit(1)
print('Chaine complete%s.' % ('' if APPLY else ' (verification seule)'))
