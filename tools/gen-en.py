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
SOURCE, CIBLE = 'index.html', 'en/index.html'

# 1. metas de tete. Elles ne passent pas par le dictionnaire : ce sont des
#    phrases de page, pas des libelles d'interface.
TETE = [
 ('<html lang="fr">', '<html lang="en">'),
 ('<title>Mouhamed Al Amine, Creative Director à Kaolack, Sénégal</title>',
  '<title>Mouhamed Al Amine, Creative Director in Kaolack, Senegal</title>'),
 ('<link rel="canonical" href="https://www.mdgcreative.studio">',
  '<link rel="canonical" href="https://www.mdgcreative.studio/en/">'),
 ('<meta property="og:url" content="https://www.mdgcreative.studio">',
  '<meta property="og:url" content="https://www.mdgcreative.studio/en/">'),
 ('<meta property="og:locale" content="fr_FR">',
  '<meta property="og:locale" content="en_US">'),
 ('<meta property="og:title" content="MDG Creative Studio, Creative Director, Kaolack">',
  '<meta property="og:title" content="MDG Creative Studio · Creative Director, Kaolack">'),
]
# les descriptions, trop longues pour etre lisibles ci-dessus
TETE_DESC = [
 ('name="description"',
  'Creative Director in Kaolack: cover art, brand identity, motion design & web for African '
  'artists and brands. 7 years of exacting work, 50+ artists, 9 countries.'),
 ('property="og:description"',
  'Brand identity, cover art, motion design & web. 7 years of experience. Based in Kaolack, Senegal.'),
 ('name="twitter:description"',
  'Brand identity, cover art, motion design & web. Kaolack, Senegal.'),
]

# 1 bis. donnees structurees. Elles sont lues avant tout JavaScript,
#        exactement comme les metas : la bascule a l'execution ne peut
#        rien pour elles. La page anglaise annoncait donc une
#        description francaise et l'URL de la page francaise.
#
#        Les @id ne changent PAS : ils identifient la meme entite dans
#        les deux langues, c'est tout leur interet. Seuls le texte et
#        les url de page suivent.
TETE.extend([
 ('"description":"Creative Director à Kaolack : cover art, brand identity, '
  'motion design & web pour artistes et marques africaines.",',
  '"description":"Creative Director in Kaolack: cover art, brand identity, '
  'motion design & web for African artists and brands.",'),
 ('"url":"https://www.mdgcreative.studio",',
  '"url":"https://www.mdgcreative.studio/en/",'),
 ('"description": "Studio de design créatif spécialisé en brand identity, '
  'cover art, motion design et web. Basé à Kaolack, Sénégal.",',
  '"description": "Creative design studio specialising in brand identity, '
  'cover art, motion design and web. Based in Kaolack, Senegal.",'),
])

# Chaines de donnees structurees qui reviennent a plusieurs endroits.
# TETE exige une occurrence unique ; celles-ci en ont plusieurs, et
# toutes doivent basculer.
TETE_TOUS = [
 ('"url": "https://www.mdgcreative.studio",',
  '"url": "https://www.mdgcreative.studio/en/",'),
 ('"name": "Identité d\'Artiste"', '"name": "Artist Identity"'),
]

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
