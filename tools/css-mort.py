# -*- coding: utf-8 -*-
"""Retire de mdg.css les regles mortes qu'on peut retirer SANS RISQUE.

    python tools/css-mort.py            liste et chiffre
    python tools/css-mort.py --apply    ecrit

CE QUI EST RETIRE, ET SEULEMENT CELA : les lignes qui contiennent une
regle entiere, ouverte et fermee sur la meme ligne, dont TOUTES les
classes du selecteur sont introuvables ailleurs dans le site. Supprimer
une telle ligne ne peut pas deranger la structure : elle emporte son
accolade ouvrante et sa fermante.

POURQUOI PAS PLUS. Un tiers des classes de la feuille ne correspond plus
a rien — de quoi liberer 82 Ko. Mais les atteindre demande de decouper
la feuille en regles, et trois tentatives d'analyseur maison ont produit
du CSS MALFORME : cette feuille compte 1 250 commentaires, dont certains
renferment des accolades, et des regles reparties sur plusieurs lignes a
l'interieur de blocs @media imbriques.

Le calcul est simple. Le gain complet vaut environ 11 Ko une fois la
feuille compressee, et elle est mise en cache un an. Le risque, lui,
porte sur l'apparence de tout le site. On prend donc les 31 Ko surs et
on laisse le reste : une regle morte ne fait de mal a personne, une
regle vivante supprimee, si.

CE QUE CETTE PASSE A TROUVE DE PLUS UTILE QUE SON PROPRE GAIN : la
feuille etait MALFORMEE. Une accolade fermante en trop, ligne 3530,
refermait un bloc @supports une regle trop tot.
"""
import io, os, re, sys, glob

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv
FEUILLE = 'assets/mdg.css'

MOTIFS_SOURCE = ('*.html', 'projets/*.html', 'en/*.html', 'en/projets/*.html',
                 'assets/*.js', 'assets/vendor/*.js')


def corpus():
    """Tout ce qui peut nommer une classe : pages, scripts du site, et
    scripts tiers — Lenis pose lui-meme des classes sur la racine du
    document, l'oublier reviendrait a les declarer mortes."""
    return '\n'.join(io.open(f, encoding='utf-8', errors='replace').read()
                     for m in MOTIFS_SOURCE for f in glob.glob(m))


def classes(texte):
    return set(re.findall(r'\.(-?[A-Za-z_][\w-]*)', texte))


def main():
    src = corpus()
    css = io.open(FEUILLE, encoding='utf-8').read()
    mortes = {c for c in classes(css) if len(c) > 2 and c not in src}

    gardees, retirees = [], []
    for l in css.split('\n'):
        n = l.strip()
        selecteur = n.split('{')[0] if '{' in n else ''
        if (n.startswith('.') and re.fullmatch(r'\.[^{}]*\{[^{}]*\}', n)
                and classes(selecteur) and classes(selecteur) <= mortes):
            retirees.append(l)
        else:
            gardees.append(l)

    neuf = '\n'.join(gardees)
    print('%d classes definies, %d introuvables ailleurs' % (len(classes(css)), len(mortes)))
    print('%d regle(s) retirees sans risque, %.0f Ko (%.1f %%)'
          % (len(retirees), (len(css) - len(neuf)) / 1024,
             100.0 * (len(css) - len(neuf)) / len(css)))
    print('avant %.0f Ko -> apres %.0f Ko' % (len(css) / 1024, len(neuf) / 1024))

    if APPLY:
        io.open(FEUILLE, 'w', encoding='utf-8', newline='').write(neuf)
        print('ecrit. Comparer les captures avant/apres avant de publier.')
    else:
        print('exemples :', ' | '.join(r.strip()[:46] for r in retirees[:3]))
        print('MODE : SIMULATION (ajouter --apply)')


main()
