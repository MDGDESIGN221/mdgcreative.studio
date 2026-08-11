# Learning Center — Phase 1 + Fresnel/Postprocessing

Suite du scaffold Phase 1 : le buste placeholder a maintenant un vrai
terme de Fresnel (Ch.5), et le rendu passe par un pipeline de
postprocessing (bloom, vignette, grain, grade colorimétrique) pour
juger si la direction visuelle peut se rapprocher des références
(poster Match Day, carte Light Study #02) avant de commander le
modèle 3D final.

Le doc d'architecture prévoyait le postprocessing pour la Phase 4.
Avancé volontairement ici, à titre de test — pas encore branché dans
les chapitres du site, uniquement sur la page de test isolée.

## Installer les dépendances

Dans ton projet Next.js existant :

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing zustand
```

## Copier les fichiers

Copie `components/learning/`, `lib/learning/` et `app/learning-center/`
à la racine du projet, à côté de `app/` et `components/` existants.
Si tu avais déjà la Phase 1 précédente, ces fichiers la remplacent
(store.js a de nouveaux champs, Bust.jsx a le patch Fresnel).

## Tester

```bash
npm run dev
```

Puis `/learning-center/phase1-test`. Trois blocs de contrôles :

- **Lumière (Ch.1)** — identique à la Phase 1 initiale.
- **Fresnel / Rim (Ch.5)** — `Wrap` fait varier la puissance du terme
  de Fresnel (face = rim serré, arrière = rim large, cohérent avec le
  texte du Ch.5 sur la position de la source). La case à cocher isole
  le masque de Fresnel en niveaux de gris — c'est littéralement ce que
  Rim Light Engine calcule en interne.
- **Ambiance (postprocessing)** — bloom / grain / vignette / grade.
  Pousse `Force du grade` + teinte `#FF9329` pour se rapprocher du
  poster Match Day ; teinte rouge + `Wrap` élevé pour se rapprocher de
  la carte Light Study #02.

## Ce que ça valide

- Que le Fresnel + postprocessing peuvent rapprocher le buste
  placeholder de l'esthétique des références, **sans** modèle 3D final.
- Que la séparation shader (Fresnel, patché dans le matériau standard
  via `onBeforeCompile`) / composer (bloom, vignette, grain, grade)
  reste lisible et modulaire pour la suite.

## Ce que ce n'est PAS encore

- Le buste est toujours un placeholder en primitives — le Fresnel
  fonctionne sur n'importe quelle géométrie, mais le rendu final
  dépendra beaucoup du vrai modèle (topologie du bord = où le rim
  accroche).
- Le grade colorimétrique est un duotone simple (`luminance × teinte`),
  pas une vraie LUT cinéma.
- Rien de ceci n'est branché dans `Learning_Center_dc.html` — c'est
  toujours un fichier séparé (mockup statique), pas connecté à ce
  code React.
- Non testé dans un vrai navigateur/WebGL ici — seulement validé en
  syntaxe (esbuild). Les erreurs de compilation de shader (GLSL) ne
  peuvent apparaître qu'à l'exécution dans `npm run dev`.

## Fichiers

```
lib/learning/
  store.js                → useLightStore (zustand), + rim/Fresnel + ambiance
  colorTemperature.js     → conversion Kelvin → RGB/hex
  ColorGradeEffect.js     → effet de postprocessing custom (grade duotone)

components/learning/core/
  LightingCanvas.jsx      → Canvas R3F, fond, ContactShadows, branche PostFX
  Bust.jsx                → buste placeholder + patch Fresnel (onBeforeCompile)
  LightRig.jsx             → la vraie lumière Three.js
  LightGizmo.jsx           → la poignée draggable
  CameraRig.jsx            → OrbitControls contraint
  PostFX.jsx                → EffectComposer (bloom, grade, vignette, grain)

app/learning-center/phase1-test/page.js   → page de test, sliders + scène
```
