'use client';
import { create } from 'zustand';

// État partagé entre les sliders (UI), le gizmo (drag 3D) et le rig de
// lumière réel. Même séparation que la Phase 1 initiale — on ajoute
// simplement deux nouvelles familles de paramètres : le rim/Fresnel
// (Ch.5) et l'ambiance/postprocessing (validation direction visuelle
// vs. les références posters).
export const useLightStore = create((set) => ({
  // Lumière (Ch.1 — Anatomie)
  intensity: 1.5,
  softness: 0.3,
  distance: 2.3,
  kelvin: 5600,
  azimuth: 42,
  elevation: 30,

  // Rim / Fresnel (Ch.5)
  rimWrap: 0.5, // 0 = source de face (rim serré) → 1 = source arrière (rim large)
  rimIntensity: 1.2,
  rimColor: '#3DBFA3',
  showFresnelMask: false,

  // Ambiance / postprocessing — pas prévu avant la Phase 4 dans le doc
  // d'architecture initial, avancé volontairement pour juger si le
  // rendu peut se rapprocher des références (poster Match Day, carte
  // Light Study #02) avant de commander le modèle 3D final.
  bloom: 0.6,
  grain: 0.12,
  vignette: 0.5,
  gradeStrength: 0.35,
  gradeTint: '#FF9329',

  setLight: (partial) => set(partial),
}));
