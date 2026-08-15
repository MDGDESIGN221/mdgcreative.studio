# -*- coding: utf-8 -*-
"""Genere en/index.html a partir d'index.html.

    python tools/gen-en.py            verifie sans ecrire
    python tools/gen-en.py --apply    ecrit

POURQUOI. Les deux pages sont identiques a 98 % : sur 10 728 lignes,
221 different. Les maintenir a la main garantit qu'elles derivent — et
elles avaient deja derive : dix entrees du dictionnaire n'existaient que
cote anglais, et "Demarrer ce pack" avait survecu dans une page que le
passage sur le lexique n'avait pas couverte.

CE QUI DIFFERE, et rien d'autre :

  1. la langue du document
  2. huit metas de tete — elles sont lues par les robots AVANT tout
     JavaScript, donc elles ne peuvent pas etre traduites a l'execution
  3. les liens internes, qui pointent vers les versions anglaises
  4. les attributs traduisibles : aria-label, alt, title, placeholder,
     data-lb-title, data-lb-desc
  5. un script d'amorcage qui force la langue au chargement

Les attributs sont traduits avec LE MEME dictionnaire que la bascule a
l'execution. Il n'y a donc pas de seconde table a tenir a jour : une
paire ajoutee sert aux deux.
"""
import io, os, re, sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
APPLY = '--apply' in sys.argv

# ── Region reservee ──────────────────────────────────────────────
# Le graphe d'identite appartient a tools/identite.py : il n'est pas la
# traduction de la version francaise, c'est la meme entite dite dans
# l'autre langue. On garde donc ce que la cible porte deja, et on laisse
# identite.py repasser derriere.
ID_DEBUT = '<!-- IDENTITE : genere par tools/identite.py, ne pas editer a la main -->'
ID_FIN   = '<!-- /IDENTITE -->'


def garder_identite(produit, cible):
    """Reinjecte dans `produit` la region d'identite de `cible`."""
    if not os.path.exists(cible):
        return produit
    actuel = io.open(cible, encoding='utf-8').read()
    a = actuel.find(ID_DEBUT)
    b = produit.find(ID_DEBUT)
    if a == -1 or b == -1:
        return produit
    region = actuel[a:actuel.index(ID_FIN, a) + len(ID_FIN)]
    return produit[:b] + region + produit[produit.index(ID_FIN, b) + len(ID_FIN):]

SOURCE, CIBLE = 'index.html', 'en/index.html'

# 1. metas de tete. Elles ne passent pas par le dictionnaire : ce sont des
#    phrases de page, pas des libelles d'interface.
TETE = [
 ('<html lang="fr" data-mdg-page-unique>', '<html lang="en" data-mdg-page-unique>'),
 ('<title>Mouhamed Al Amine Diawara (MDG) — Directeur artistique, Sénégal</title>',
  '<title>Mouhamed Al Amine Diawara (MDG) — Art Director, Senegal</title>'),
 ('<link rel="canonical" href="https://www.mdgcreative.studio">',
  '<link rel="canonical" href="https://www.mdgcreative.studio/en/">'),
 ('<meta property="og:url" content="https://www.mdgcreative.studio">',
  '<meta property="og:url" content="https://www.mdgcreative.studio/en/">'),
 ('<meta property="og:locale" content="fr_FR">',
  '<meta property="og:locale" content="en_US">'),
 ('<meta property="og:title" content="Mouhamed Al Amine Diawara (MDG) — Directeur artistique, Sénégal">',
  '<meta property="og:title" content="Mouhamed Al Amine Diawara (MDG) — Art Director, Senegal">'),
 ('<meta name="twitter:title" content="Mouhamed Al Amine Diawara (MDG) — Directeur artistique">',
  '<meta name="twitter:title" content="Mouhamed Al Amine Diawara (MDG) — Art Director">'),
]
# les descriptions, trop longues pour etre lisibles ci-dessus
TETE_DESC = [
 ('name="description"',
  'Mouhamed Al Amine Diawara, known as MDG: Senegalese art director and graphic '
  'designer. Brand identity, cover art, motion design and web design for artists '
  'and brands, from Kaolack.'),
 ('property="og:description"',
  'Senegalese art director and graphic designer. Brand identity, cover art, motion '
  'design, web design. Kaolack, Senegal.'),
 ('name="twitter:description"',
  'Senegalese art director and graphic designer. Identity, cover art, motion, web.'),
]


# Aucune chaine multiple a basculer pour l instant : les deux blocs de
# donnees structurees qui en contenaient ont ete remplaces par la region
# d identite, laissee intacte par ce generateur.
TETE_TOUS = []

# 2. liens internes vers les versions anglaises
LIENS = [('href="/tarifs"', 'href="/en/tarifs"'),
         ('href="/uranus"', 'href="/en/uranus"')]

# 3. attributs dont la valeur passe par le dictionnaire
ATTRS = ['aria-label', 'alt', 'title', 'placeholder', 'data-lb-title', 'data-lb-desc']

# Titres d'oeuvres et noms propres : ils restent en francais dans les deux
# langues. "Bal Poussiere" traduit ne designerait plus rien.
NOMS_PROPRES = re.compile(
    r'Bal Poussi|M[ée]rite|Dello Ma|Prince de la Ville|Match Day|Sadio|'
    r'Nouveau Standard|Cœurs Bris|Maarzer|KEY EM TI|OKG|VJ,', re.I)

AMORCE = ("<script>document.addEventListener('DOMContentLoaded',function(){"
          "try{if(typeof applyLang==='function')applyLang('en')}catch(e){}});</script>")


def dictionnaire(s):
    """Le meme dictionnaire que celui utilise a l'execution."""
    d = {}
    for m in re.finditer(r'\[`([^`]+)`,`([^`]*)`\]', s):
        d.setdefault(m.group(1), m.group(2))
    for m in re.finditer(r"\w+:\s*\{\s*fr:\s*'([^']*)',\s*en:\s*'([^']*)'", s):
        d.setdefault(m.group(1), m.group(2))
    return d


def generer():
    s = io.open(SOURCE, encoding='utf-8').read()
    D = dictionnaire(s)
    rapport = {'tete': 0, 'liens': 0, 'attributs': 0, 'sans_traduction': []}

    for a, b in TETE:
        if s.count(a) != 1:
            print('  !! meta introuvable ou multiple : %s' % a[:60]); return None, None
        s = s.replace(a, b); rapport['tete'] += 1

    for marque, texte in TETE_DESC:
        m = re.search(r'<meta [^>]*' + re.escape(marque) + r'[^>]*content="([^"]*)"', s)
        if not m:
            print('  !! meta introuvable : %s' % marque); return None, None
        s = s[:m.start(1)] + texte + s[m.end(1):]
        rapport['tete'] += 1

    for a, b in TETE_TOUS:
        n = s.count(a)
        if not n:
            print('  !! chaine introuvable : %s' % a[:66]); return None, None
        s = s.replace(a, b)
        rapport['tete'] += n

    for a, b in LIENS:
        rapport['liens'] += s.count(a)
        s = s.replace(a, b)

    def trad_attr(m):
        attr, v = m.group(1), m.group(2)
        if not v.strip():
            return m.group(0)
        t = D.get(v)
        if t is None:
            # Une valeur francaise sans traduction resterait en francais.
            # Les titres d'oeuvres n'en sont pas : traduire "Bal Poussiere"
            # ou "Merite" les rendrait meconnaissables. Ils sont declares
            # pour qu'un VRAI oubli ne se noie pas dans le bruit.
            if not NOMS_PROPRES.search(v) and (
               re.search(r'[àâçéèêîôû]', v) or
               re.search(r'\b(le|la|les|des|du|une|pour|avec|votre|ton)\b', v, re.I)):
                rapport['sans_traduction'].append(attr + ' : ' + v[:56])
            return m.group(0)
        rapport['attributs'] += 1
        return '%s="%s"' % (attr, t)

    s = re.sub(r'\b(' + '|'.join(ATTRS) + r')="([^"]*)"', trad_attr, s)

    i = s.rindex('</body>')
    s = s[:i] + AMORCE + '\n' + s[i:]
    return s, rapport


sortie, rap = generer()
if sortie is None:
    sys.exit(1)

print('  metas de tete      : %d' % rap['tete'])
print('  liens internes     : %d' % rap['liens'])
print('  attributs traduits : %d' % rap['attributs'])
sans = sorted(set(rap['sans_traduction']))
if sans:
    print('  !! %d valeur(s) francaise(s) sans traduction :' % len(sans))
    for x in sans[:10]:
        print('       %s' % x)

sortie = garder_identite(sortie, CIBLE)
actuel = io.open(CIBLE, encoding='utf-8').read() if os.path.exists(CIBLE) else ''
if actuel == sortie:
    print('  identique au fichier actuel.')
else:
    import difflib
    d = [x for x in difflib.unified_diff(actuel.split('\n'), sortie.split('\n'), lineterm='', n=0)
         if x.startswith(('+', '-')) and not x.startswith(('+++', '---'))]
    print('  %d ligne(s) d ecart avec le fichier actuel' % len(d))
    for x in d[:12]:
        print('    %s' % x[:130])

if APPLY:
    io.open(CIBLE, 'w', encoding='utf-8', newline='').write(sortie)
    print('  %s ecrit.' % CIBLE)
else:
    print()
    print('MODE : VERIFICATION (ajouter --apply pour ecrire)')
