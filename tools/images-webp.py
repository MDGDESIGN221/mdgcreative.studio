# -*- coding: utf-8 -*-
"""Convertit les images de media/img/ en WebP, sans les redimensionner.

    python tools/images-webp.py            simule et chiffre
    python tools/images-webp.py --apply    convertit et reecrit les liens

POURQUOI. Les images sont ce qui voyage le plus mal. Le HTML et le CSS
se compressent a environ 80 % sur le reseau ; une image, non. Sur une
connexion mobile, c'est elle qui fait le temps d'attente.

Aucune image du site ne depassait 2 000 px : elles n'etaient pas trop
grandes, elles etaient mal encodees — une photo de 1080x1350 pesait
2,6 Mo parce qu'elle avait ete enregistree en PNG. On ne redimensionne
donc RIEN. La definition reste la meme au pixel pres, seul le codage
change. C'est un portfolio : la qualite de l'image est le produit.

COMMENT. Deux regimes, choisis sur le contenu et non sur l'extension :

  - peu de couleurs (aplats, logos, captures d'interface) : WebP SANS
    PERTE. Sur ces images il bat le PNG largement, et il n'y a
    strictement rien a perdre ;
  - photographie : plusieurs qualites sont essayees, et l'ecart avec
    l'original est MESURE a chaque fois. On retient la plus legere dont
    l'ecart reste negligeable. Rien n'est pris sur parole.

Un fichier n'est remplace que si le gain est franc. Une conversion qui
alourdit, ou qui abime, est refusee — les deux sont arrivees.
"""
import io, os, re, sys, glob, json, shutil
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

DOSSIER = 'media/img'
SOURCES = ('.png', '.jpg', '.jpeg')

# Certains fichiers restent dans leur format d'origine :
#   - les icones du site et du manifeste, reclamees telles quelles ;
#   - about_5_jdxu46.jpg, qui ne sert que d'apercu de partage. Il n'est
#     jamais telecharge par un visiteur, seulement par les robots des
#     reseaux sociaux, et tous ne lisent pas encore le WebP. 129 Ko qui
#     ne pesent sur personne : le risque depasserait le gain.
GARDER = {'favicon.ico', 'about_5_jdxu46.jpg'}
GARDER_MOTIF = re.compile(r'(New_logo_black|NEW_LOGO_w)', re.I)


def pages_et_scripts():
    return (glob.glob('*.html') + glob.glob('projets/*.html')
            + glob.glob('en/*.html') + glob.glob('en/projets/*.html')
            + glob.glob('assets/*.js') + glob.glob('tools/i18n/*.json')
            + ['site.webmanifest'])


def references():
    """Toutes les images citees, quelle que soit la forme du lien.

    ATTENTION : atelier.html ne stocke QUE des noms de fichiers dans ses
    tableaux de planches, et reconstruit le chemin en JavaScript. Une
    recherche limitee a "/media/img/..." les prend pour des orphelines.

    C'est precisement l'erreur qui a casse quatorze images : une passe
    d'optimisation passee a supprime des PNG en ne mettant a jour que
    les pages ou le chemin complet apparaissait. Les quatre etudes de
    cas de l'Atelier affichaient des images manquantes depuis.
    """
    src = ''
    for p in pages_et_scripts():
        if os.path.exists(p):
            src += io.open(p, encoding='utf-8', errors='replace').read()
    noms = set(re.findall(r'/media/img/([A-Za-z0-9_.\-]+\.[A-Za-z0-9]+)', src))
    noms |= set(re.findall(r"'([A-Za-z0-9_.\-]+\.(?:png|jpe?g|webp|gif|svg))'", src))
    return noms


def peu_de_couleurs(im):
    """Aplats, logos, captures : moins de 4096 teintes distinctes."""
    petite = im.convert('RGB').resize((min(im.width, 400), min(im.height, 400)))
    return len(petite.getcolors(maxcolors=4096) or []) > 0


def ecart(a, b):
    """Ecart quadratique moyen entre deux images, sur 0-255.

    C'est la mesure qui autorise a descendre en qualite sans avoir a
    croire sur parole : en dessous de 3, l'oeil ne distingue pas les
    deux images d'une photo. Au-dela, on refuse."""
    from PIL import ImageChops, ImageStat
    d = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
    s = ImageStat.Stat(d)
    return (sum(v ** 2 for v in s.rms) / 3) ** .5


# Le seuil est SEVERE, et c'est voulu. A 3.0 la conversion gagnait un
# demi-megaoctet, mais en re-encodant des cover art a la limite du
# visible : sur un portfolio, l'image EST le produit. On ne descend donc
# que la ou le gain est franc et l'ecart negligeable. Les conversions
# sans perte (aplats, logos) ne sont pas concernees, leur ecart est nul.
ECART_MAX = 1.5
GAIN_MINI = 0.12    # en dessous, la conversion ne vaut pas le changement


def convertir(chemin):
    """Rend (octets, options, donnees, ecart) du meilleur essai, ou None."""
    im = Image.open(chemin)
    transparent = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if transparent else 'RGB')
    avant = os.path.getsize(chemin)

    essais = []
    if peu_de_couleurs(im):
        essais.append({'lossless': True, 'method': 6})
    essais += [{'quality': q, 'method': 6} for q in (92, 88, 84, 80)]

    meilleur = None
    for opts in essais:
        tampon = io.BytesIO()
        im.save(tampon, 'WEBP', **opts)
        taille = tampon.tell()
        if taille > avant * (1 - GAIN_MINI):
            continue
        donnees = tampon.getvalue()
        e = 0.0 if opts.get('lossless') else ecart(im, Image.open(io.BytesIO(donnees)))
        if e > ECART_MAX:
            continue
        if meilleur is None or taille < meilleur[0]:
            meilleur = (taille, opts, donnees, e)
    return meilleur


def main():
    utilisees = references()
    gagne = perdu = 0
    faits = []
    collisions = []

    for f in sorted(glob.glob(DOSSIER + '/*')):
        nom = os.path.basename(f)
        if not os.path.isfile(f): continue
        if not nom.lower().endswith(SOURCES): continue
        if nom in GARDER or GARDER_MOTIF.search(nom): continue
        if nom not in utilisees: continue          # les orphelines : autre sujet

        cible = os.path.splitext(f)[0] + '.webp'
        if os.path.exists(cible):
            collisions.append(nom)
            continue

        avant = os.path.getsize(f)
        try:
            resultat = convertir(f)
        except Exception as e:
            print('  !! %s : %r' % (nom, e)); continue

        if resultat is None:
            perdu += 1
            continue      # trop peu de gain, ou ecart visible : on ne touche pas
        taille, opts, donnees, e = resultat
        gagne += avant - taille
        faits.append((nom, os.path.basename(cible), avant, taille, opts, e))
        if APPLY:
            io.open(cible, 'wb').write(donnees)
            os.remove(f)

    print('%d image(s) converties, %d refusee(s) (gain trop faible ou ecart visible)'
          % (len(faits), perdu))
    if collisions:
        print('%d collision(s) — un .webp du meme nom existe deja : %s'
              % (len(collisions), ', '.join(collisions[:4])))
    for nom, neuf, a, b, opts, e in sorted(faits, key=lambda x: x[2] - x[3], reverse=True)[:12]:
        print('   %6.0f -> %5.0f Ko  %-10s ecart %.2f  %s'
              % (a/1024, b/1024,
                 'sans perte' if opts.get('lossless') else ('q%d' % opts['quality']),
                 e, nom[:40]))
    print('\ngain total : %.2f Mo' % (gagne / 1048576))

    if not APPLY:
        print('\nMODE : SIMULATION (ajouter --apply pour convertir)')
        return

    # ── reecriture des liens : seule l'extension change ──
    renommages = {a: b for a, b, _, _, _, _ in faits}
    touchees = 0
    for p in pages_et_scripts():
        if not os.path.exists(p): continue
        t = io.open(p, encoding='utf-8', errors='replace').read()
        t2 = t
        for ancien, neuf in renommages.items():
            t2 = t2.replace(ancien, neuf)
        if t2 != t:
            io.open(p, 'w', encoding='utf-8', newline='').write(t2)
            touchees += 1
    print('%d fichier(s) de reference mis a jour' % touchees)


main()
