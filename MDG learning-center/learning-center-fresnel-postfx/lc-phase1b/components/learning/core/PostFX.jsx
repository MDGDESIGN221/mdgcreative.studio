'use client';
import { useEffect, useMemo } from 'react';
import { Color } from 'three';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useLightStore } from '../../../lib/learning/store';
import { ColorGradeEffect } from '../../../lib/learning/ColorGradeEffect';

function ColorGrade({ tint, strength }) {
  // L'effet est créé une seule fois ; ses uniforms sont mis à jour en
  // continu via useEffect plutôt que de recréer l'objet à chaque slider
  // (recréer un Effect à chaque frame casse le pipeline du composer).
  const effect = useMemo(() => new ColorGradeEffect({ tint: new Color(tint), strength }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    effect.uniforms.get('tint').value.set(tint);
    effect.uniforms.get('strength').value = strength;
  }, [effect, tint, strength]);

  return <primitive object={effect} dispose={null} />;
}

export default function PostFX() {
  const bloom = useLightStore((s) => s.bloom);
  const grain = useLightStore((s) => s.grain);
  const vignette = useLightStore((s) => s.vignette);
  const gradeStrength = useLightStore((s) => s.gradeStrength);
  const gradeTint = useLightStore((s) => s.gradeTint);

  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.2} intensity={bloom} mipmapBlur />
      <ColorGrade tint={gradeTint} strength={gradeStrength} />
      <Vignette eskil={false} offset={0.25} darkness={vignette} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={grain} />
    </EffectComposer>
  );
}
