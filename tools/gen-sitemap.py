# -*- coding: utf-8 -*-
"""Genere sitemap.xml a partir des fichiers reellement presents.

    python tools/gen-sitemap.py            compare sans ecrire
    python tools/gen-sitemap.py --apply    ecrit

POURQUOI. Le sitemap etait tenu a la main. Il annoncait donc l'etat du
site au jour ou on y avait pense : les trois pages legales y figuraient
sans alternate, et leurs versions anglaises n'y etaient pas du tout.
Un sitemap en retard fait indexer une partie du site seulement.

Ici il decoule des fichiers : une page ajoutee y entre, une page
supprimee en sort, et les alternates hreflang apparaissent des que la
version anglaise existe.

lastmod vient de la date du fichier. C'est la seule date verifiable ;
une date saisie a la main vieillit sans que personne s'en apercoive.
"""
import io, os, sys, glob, datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

BASE = 'https://www.mdgcreative.studio'
# 404 n'a rien a faire dans un sitemap, le fichier de verification Google
# non plus. Les pages EN sont listees via leur source francaise.
EXCLUES = {'404.html', 'google5f7c51c0a8fda053.html'}

# Priorites : l'accueil d'abord, puis les pages qui vendent, puis le
# reste. Ce sont des indications, pas des ordres, mais autant qu'elles
# reflechissent l'importance reelle.
PRIORITES = {'index.html': '1.0', 'tarifs.html': '0.9', 'uranus.html': '0.9',
             'atelier.html': '0.8', 'learning-center.html': '0.8'}


def url_de(chemin):
    # Sous Windows glob rend des antislashs : une URL n'en contient jamais.
    chemin = chemin.replace('\\', '/')
    if chemin == 'index.html':
        return BASE + '/'
    return BASE + '/' + chemin[:-5]          # cleanUrls retire le .html


def date_de(chemin):
    t = os.path.getmtime(chemin)
    return datetime.date.fromtimestamp(t).isoformat()


sources = sorted(p for p in glob.glob('*.html') + glob.glob('projets/*.html')
                 if os.path.basename(p) not in EXCLUES)

lignes = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
          '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']

nb_urls = 0
nb_alt = 0
for src in sources:
    en = 'en/' + src
    a_en = os.path.exists(en)
    prio = PRIORITES.get(src, '0.6')

    # une entree par version, les alternates sont identiques sur les deux
    versions = [(src, url_de(src))]
    if a_en:
        versions.append((en, url_de(src).replace(BASE + '/', BASE + '/en/', 1)
                         if src != 'index.html' else BASE + '/en/'))

    for fichier, url in versions:
        lignes.append('  <url>')
        lignes.append('    <loc>%s</loc>' % url)
        lignes.append('    <lastmod>%s</lastmod>' % date_de(fichier))
        lignes.append('    <priority>%s</priority>' % prio)
        if a_en:
            fr_url = url_de(src)
            en_url = versions[1][1]
            lignes.append('    <xhtml:link rel="alternate" hreflang="fr" href="%s"/>' % fr_url)
            lignes.append('    <xhtml:link rel="alternate" hreflang="en" href="%s"/>' % en_url)
            lignes.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % fr_url)
            nb_alt += 3
        lignes.append('  </url>')
        nb_urls += 1

lignes.append('</urlset>')
sortie = '\n'.join(lignes) + '\n'

print('  %d URL, %d alternates hreflang' % (nb_urls, nb_alt))
sans_en = [s for s in sources if not os.path.exists('en/' + s)]
if sans_en:
    print('  sans version anglaise : %s' % ', '.join(sans_en))

actuel = io.open('sitemap.xml', encoding='utf-8').read() if os.path.exists('sitemap.xml') else ''
if actuel == sortie:
    print('  identique au fichier actuel.')
else:
    import re
    a = set(re.findall(r'<loc>([^<]+)</loc>', actuel))
    b = set(re.findall(r'<loc>([^<]+)</loc>', sortie))
    for u in sorted(b - a):
        print('    + %s' % u)
    for u in sorted(a - b):
        print('    - %s' % u)

if APPLY:
    io.open('sitemap.xml', 'w', encoding='utf-8', newline='\n').write(sortie)
    print('  sitemap.xml ecrit.')
else:
    print()
    print('MODE : VERIFICATION (ajouter --apply pour ecrire)')
