# -*- coding: utf-8 -*-
"""Ecrit le graphe d'identite dans chaque page, depuis une seule source.

    python tools/identite.py            verifie sans ecrire
    python tools/identite.py --apply    ecrit

POURQUOI. Une personne peut etre cherchee sous des noms tres
differents : Mouhamed Diawara, Mouhamed Al Amine Diawara, Al Amine
Diawara, MDG, MDG Design. Un moteur ne devine pas que ces chaines
designent la meme identite ; il faut le lui dire, et le lui dire au
meme endroit partout.

Le site le disait mal. "Diawara" n'apparaissait NULLE PART, ni dans le
contenu ni dans les donnees structurees : la moitie des recherches qui
auraient du mener ici ne pouvaient pas aboutir. Et index.html portait
deux blocs concurrents — un ProfessionalService sans @id, avec sa
propre copie du fondateur, plus un @graph avec un #person. Deux
descriptions de la meme personne, sans lien entre elles : au lieu d'une
identite affirmee, deux entites floues.

COMMENT. Une seule definition ici, recopiee entre les deux marqueurs de
chaque page. Les noeuds portent un @id stable et se citent entre eux :
la personne travaille pour le studio, le studio a la personne pour
fondateur, le site a le studio pour editeur. Les variantes de nom sont
des alternateName sur le noeud qu'elles designent.

Les donnees propres a une page — l'etude de cas, le fil d'Ariane —
restent dans la page. Ce fichier ne possede que l'identite.

RIEN ICI N'EST DECORATIF. Aucun superlatif, aucune distinction : une
affirmation inventee se retourne contre le site le jour ou elle est
verifiee.

ORDRE. Ce script passe APRES gen-en.py et gen-en-pages.py : ceux-ci
recopient la page francaise, celui-ci repose ensuite la bonne langue
dans la region marquee, des deux cotes. Les @id, eux, ne changent pas
d'une langue a l'autre — c'est tout leur interet : une seule entite,
deux pages, un seul sujet aux yeux du moteur.
"""
import io, json, os, sys, glob

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

BASE = 'https://www.mdgcreative.studio'
ID_PERSONNE = BASE + '/#person'
ID_STUDIO   = BASE + '/#business'
ID_SITE     = BASE + '/#website'

DEBUT = '<!-- IDENTITE : genere par tools/identite.py, ne pas editer a la main -->'
FIN   = '<!-- /IDENTITE -->'

PROFILS = [
    'https://www.instagram.com/_its.mdg',
    'https://www.tiktok.com/@_its.mdg',
    'https://www.behance.net/itsmdg',
    'https://x.com/_itsmdg'
]

# Les noms sous lesquels on peut le chercher. Ce ne sont pas des
# mots-cles : ce sont les chaines qu'une personne tape reellement
# quand elle cherche cette personne-ci.
AUTRES_NOMS = [
    'Mouhamed Diawara',
    'Al Amine Diawara',
    'Mouhamed Al Amine',
    'MDG',
    'MDG Design',
    'MDG Design 221',
    'MDG Creative',
    'MDG Creative Studio'
]

NOMS_STUDIO = ['MDG', 'MDG Design', 'MDG Design 221', 'MDG Creative']

OFFRES_FR = ['Direction artistique musicale', "Identité d'artiste", 'Motion design',
             'Web design', 'Design éditorial & print', 'Contenu social media',
             'Merchandising', 'Scénographie & événementiel']

FR = {
    'jobTitle':   ['Directeur artistique', 'Graphiste', 'Designer graphique'],
    'occupation': 'Directeur artistique et graphiste',
    'savoir':     ['Direction artistique', 'Design graphique', 'Identité visuelle',
                   'Cover art', 'Motion design', 'Web design', 'Design éditorial',
                   'Création visuelle', 'Merchandising'],
    'pays':       'Sénégal',
    'ouest':      "Afrique de l'Ouest",
    'personne':   ("Mouhamed Al Amine Diawara, connu sous le nom de MDG, est directeur "
                   "artistique et graphiste sénégalais. Depuis Kaolack, il conçoit "
                   "l'identité visuelle, les cover art, le motion design et les sites "
                   "d'artistes et de marques, au Sénégal et à l'international."),
    'studio':     ("MDG Creative Studio est le studio de direction artistique et de "
                   "design graphique de Mouhamed Al Amine Diawara. Identité de marque, "
                   "cover art, motion design, web design et print, pour des artistes "
                   "et des marques."),
    'offres':     OFFRES_FR,
    'catalogue':  'Services MDG Creative Studio'
}

# La meme identite, dite en anglais. Les noms et les @id ne bougent pas :
# seuls les libelles lisibles par un humain sont traduits.
EN = {
    'jobTitle':   ['Art Director', 'Graphic Designer'],
    'occupation': 'Art director and graphic designer',
    'savoir':     ['Art Direction', 'Graphic Design', 'Visual Identity', 'Cover Art',
                   'Motion Design', 'Web Design', 'Editorial Design',
                   'Visual Creation', 'Merchandising'],
    'pays':       'Senegal',
    'ouest':      'West Africa',
    'personne':   ("Mouhamed Al Amine Diawara, known as MDG, is a Senegalese art "
                   "director and graphic designer. From Kaolack, he designs the visual "
                   "identity, cover art, motion design and websites of artists and "
                   "brands, in Senegal and abroad."),
    'studio':     ("MDG Creative Studio is the art direction and graphic design studio "
                   "of Mouhamed Al Amine Diawara. Brand identity, cover art, motion "
                   "design, web design and print, for artists and brands."),
    'offres':     ['Music art direction', 'Artist identity', 'Motion design',
                   'Web design', 'Editorial & print design', 'Social media content',
                   'Merchandising', 'Set design & events'],
    'catalogue':  'MDG Creative Studio services'
}


def graphe(L):
    personne = {
        '@type': 'Person',
        '@id': ID_PERSONNE,
        'name': 'Mouhamed Al Amine Diawara',
        'alternateName': AUTRES_NOMS,
        'givenName': 'Mouhamed Al Amine',
        'familyName': 'Diawara',
        'jobTitle': L['jobTitle'],
        'description': L['personne'],
        'url': BASE + '/',
        'image': BASE + '/media/img/about_5_jdxu46.webp',
        'nationality': {'@type': 'Country', 'name': L['pays']},
        'address': {'@type': 'PostalAddress',
                    'addressLocality': 'Kaolack',
                    'addressRegion': 'Kaolack',
                    'addressCountry': 'SN'},
        'workLocation': [
            {'@type': 'Place', 'name': 'Kaolack, ' + L['pays']},
            {'@type': 'Place', 'name': 'Dakar, ' + L['pays']}
        ],
        'hasOccupation': {
            '@type': 'Occupation',
            'name': L['occupation'],
            'occupationLocation': {'@type': 'Country', 'name': L['pays']}
        },
        'knowsAbout': L['savoir'],
        'knowsLanguage': ['fr', 'en', 'wo'],
        'worksFor': {'@id': ID_STUDIO},
        'sameAs': PROFILS,
        'mainEntityOfPage': {'@id': ID_SITE}
    }

    studio = {
        '@type': ['ProfessionalService', 'Organization'],
        '@id': ID_STUDIO,
        'name': 'MDG Creative Studio',
        'alternateName': NOMS_STUDIO,
        'description': L['studio'],
        'url': BASE + '/',
        'logo': BASE + '/media/img/NEW_LOGO_w_rxvoil.png',
        'image': BASE + '/media/img/about_5_jdxu46.webp',
        'founder': {'@id': ID_PERSONNE},
        'employee': {'@id': ID_PERSONNE},
        'address': {'@type': 'PostalAddress',
                    'addressLocality': 'Kaolack',
                    'addressRegion': 'Kaolack',
                    'addressCountry': 'SN'},
        'areaServed': [
            {'@type': 'Country', 'name': L['pays']},
            {'@type': 'City', 'name': 'Dakar'},
            {'@type': 'City', 'name': 'Kaolack'},
            {'@type': 'Place', 'name': L['ouest']}
        ],
        'knowsAbout': L['savoir'],
        'knowsLanguage': ['fr', 'en', 'wo'],
        'priceRange': '25 000 – 500 000+ XOF',
        'currenciesAccepted': 'XOF',
        'contactPoint': {
            '@type': 'ContactPoint',
            'email': 'contact@mdgcreative.studio',
            'contactType': 'customer service',
            'areaServed': 'SN',
            'availableLanguage': ['French', 'English', 'Wolof']
        },
        'sameAs': PROFILS,
        'hasOfferCatalog': {
            '@type': 'OfferCatalog',
            'name': L['catalogue'],
            'itemListElement': [
                {'@type': 'Offer',
                 'itemOffered': {'@type': 'Service', 'name': n,
                                 'provider': {'@id': ID_STUDIO}}}
                for n in L['offres']
            ]
        }
    }

    site = {
        '@type': 'WebSite',
        '@id': ID_SITE,
        'name': 'MDG Creative Studio',
        'alternateName': NOMS_STUDIO,
        'url': BASE + '/',
        'inLanguage': ['fr', 'en'],
        'publisher': {'@id': ID_STUDIO},
        'about': {'@id': ID_PERSONNE},
        'copyrightHolder': {'@id': ID_STUDIO}
    }

    return {'@context': 'https://schema.org', '@graph': [personne, studio, site]}


def bloc(L):
    corps = json.dumps(graphe(L), ensure_ascii=False, indent=1)
    return (DEBUT + '\n<script type="application/ld+json">\n'
            + corps + '\n</script>\n' + FIN)


def pages():
    """Toutes les pages du site, les anglaises comprises : l'identite se
    declare des deux cotes, avec les memes @id."""
    tout = (glob.glob('*.html') + glob.glob('projets/*.html')
            + glob.glob('en/*.html') + glob.glob('en/projets/*.html'))
    return sorted(set(p.replace('\\', '/') for p in tout)
                  - {'google5f7c51c0a8fda053.html'})


def poser(texte, nouveau):
    """Remplace la region marquee, ou la cree juste avant </head>."""
    i = texte.find(DEBUT)
    if i != -1:
        j = texte.index(FIN, i) + len(FIN)
        return texte[:i] + nouveau + texte[j:]
    k = texte.find('</head>')
    if k == -1:
        return None
    return texte[:k] + nouveau + '\n' + texte[k:]


def main():
    blocs = {'fr': bloc(FR), 'en': bloc(EN)}
    change = 0
    for p in pages():
        t = io.open(p, encoding='utf-8').read()
        t2 = poser(t, blocs['en' if p.startswith('en/') else 'fr'])
        if t2 is None:
            print('  !! pas de </head> :', p)
            continue
        if t2 == t:
            continue
        change += 1
        print(('  ecrit    ' if APPLY else '  a poser  ') + p)
        if APPLY:
            io.open(p, 'w', encoding='utf-8', newline='').write(t2)
    print('\n%d page(s) %s' % (change, 'ecrite(s)' if APPLY else 'a mettre a jour'))
    if not APPLY:
        print('MODE : VERIFICATION (ajouter --apply pour ecrire)')


main()
