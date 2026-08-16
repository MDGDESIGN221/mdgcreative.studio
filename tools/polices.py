# -*- coding: utf-8 -*-
"""Rapatrie les polices Google et ecrit assets/fonts.css.

    python tools/polices.py --apply

POURQUOI. La feuille de Google est BLOQUANTE AU RENDU. Le navigateur
doit d'abord joindre fonts.googleapis.com — resolution DNS, poignee de
main TLS, telechargement — pour seulement y APPRENDRE ou se trouvent
les fichiers de police, sur un second domaine, fonts.gstatic.com, qu'il
faut joindre a son tour. Deux hotes tiers avant que le premier mot ne
s'affiche dans la bonne police.

Servies par le site, elles arrivent sur la connexion deja ouverte, et
profitent du cache immuable d'un an comme le reste d'assets/.

CE QU'ON NE PREND PAS. Google propose aussi le cyrillique, le grec et
le vietnamien pour certaines familles. Le site n'en affiche pas une
lettre. On garde latin et latin-ext — les accents francais vivent dans
le premier, l'oe lie et quelques autres dans le second.

POURQUOI DEUX SOUS-ENSEMBLES PLUTOT QU'UN. Chaque declaration porte sa
plage de caracteres. Le navigateur ne telecharge un fichier que s'il
rencontre un caractere qui s'y trouve : declarer latin-ext ne coute
rien tant que la page n'en a pas besoin.

Une declaration inutilisee ne coute rien non plus : un @font-face ne
declenche aucun telechargement tant qu'aucun texte ne le reclame. Un
seul fichier commun a toutes les pages est donc plus simple, et pas
plus lourd, que trois feuilles separees.
"""
import io, os, re, sys, urllib.request

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')

# Trois familles seulement, et ce sont celles que le CSS reclame :
# --font-display, --font-body, --font-accent, ici comme dans
# case-study.css et legal.css.
#
# Les pages projet et les pages legales demandaient Syne, Inter et
# DM Serif Display a Google. Aucune des trois n'est utilisee nulle part
# — les seules mentions sont des commentaires, et "Inter" venait de
# setInterval et IntersectionObserver. Pendant ce temps les polices
# dont leur CSS a besoin n'etaient jamais chargees : ces pages
# s'affichaient dans la police de secours du systeme.
DEMANDES = [
    'family=Space+Grotesk:wght@400;500;600;700&family=Archivo:wght@300;400;500;600;700'
    '&family=Instrument+Serif:ital@0;1',
]
SOUS_ENSEMBLES = ('latin', 'latin-ext')
DOSSIER = 'assets/fonts'


def telecharger(url):
    r = urllib.request.Request(url, headers={'User-Agent': UA})
    return urllib.request.urlopen(r, timeout=30).read()


def main():
    css = ''
    for d in DEMANDES:
        css += telecharger('https://fonts.googleapis.com/css2?%s&display=swap' % d).decode('utf-8')

    blocs = re.findall(r'/\*\s*([\w\-\[\]]+)\s*\*/\s*@font-face\s*\{(.*?)\}', css, re.S)
    vus, sortie, poids_total = set(), [], 0
    if APPLY:
        os.makedirs(DOSSIER, exist_ok=True)

    for sous, corps in blocs:
        if sous not in SOUS_ENSEMBLES:
            continue
        fam   = re.search(r"font-family:\s*'([^']+)'", corps).group(1)
        style = re.search(r'font-style:\s*([^;]+);', corps).group(1).strip()
        gras  = re.search(r'font-weight:\s*([^;]+);', corps).group(1).strip()
        plage = re.search(r'unicode-range:\s*([^;]+);', corps).group(1).strip()
        url   = re.search(r'url\(([^)]+)\)', corps).group(1)

        nom = '%s-%s%s-%s.woff2' % (fam.replace(' ', ''), gras,
                                    '-italic' if style == 'italic' else '', sous)
        if nom in vus:
            continue
        vus.add(nom)

        chemin = os.path.join(DOSSIER, nom)
        if APPLY and not os.path.exists(chemin):
            io.open(chemin, 'wb').write(telecharger(url))
        if os.path.exists(chemin):
            poids_total += os.path.getsize(chemin)

        sortie.append(
            "@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:swap;"
            "src:url('/assets/fonts/%s') format('woff2');unicode-range:%s}"
            % (fam, style, gras, nom, plage))

    entete = (
        "/* Genere par tools/polices.py — ne pas editer a la main.\n"
        "   Les polices sont servies par le site : la feuille de Google etait\n"
        "   bloquante au rendu et imposait deux hotes tiers avant le premier\n"
        "   mot. font-display:swap laisse le texte s'afficher tout de suite,\n"
        "   dans une police de secours, plutot que de le retenir. */\n")
    contenu = entete + '\n'.join(sorted(sortie)) + '\n'

    print('%d declarations, %d fichiers, %.0f Ko' % (len(sortie), len(vus), poids_total / 1024))
    if APPLY:
        io.open('assets/fonts.css', 'w', encoding='utf-8', newline='').write(contenu)
        print('assets/fonts.css ecrit')
    else:
        print('MODE : SIMULATION (ajouter --apply)')


main()
