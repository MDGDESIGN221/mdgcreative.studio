'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useLightStore } from '../../../lib/learning/store';

// Buste placeholder : sphère (tête) + cylindre (cou/épaules). Isolé
// exprès — le jour où le .glb final arrive, seul ce fichier change.
//
// Le rim/Fresnel n'est PAS un shader de remplacement : c'est un patch
// injecté dans le shader standard PBR via onBeforeCompile. L'éclairage
// réel (Lambert/Blinn-Phong depuis LightRig) reste géré par Three ;
// on ajoute juste un terme additif basé sur l'angle caméra/normale,
// exactement ce que le Ch.5 explique : le bord s'allume parce que
// l'angle devient rasant, pas parce que la lumière y est plus forte.
export default function Bust() {
  const rimWrap = useLightStore((s) => s.rimWrap);
  const rimIntensity = useLightStore((s) => s.rimIntensity);
  const rimColor = useLightStore((s) => s.rimColor);
  const showFresnelMask = useLightStore((s) => s.showFresnelMask);

  const headMatRef = useRef();
  const bodyMatRef = useRef();

  const uniforms = useMemo(
    () => ({
      uRimColor: { value: new THREE.Color(rimColor) },
      uRimIntensity: { value: rimIntensity },
      uRimPower: { value: THREE.MathUtils.lerp(8.0, 1.5, rimWrap) },
      uShowMask: { value: showFresnelMask ? 1 : 0 },
    }),
    [] // créés une fois ; mis à jour via useEffect ci-dessous
  );

  useEffect(() => {
    uniforms.uRimColor.value.set(rimColor);
    uniforms.uRimIntensity.value = rimIntensity;
    // wrap 0 (face) → power haut → rim serré. wrap 1 (arrière) → power bas → rim large.
    uniforms.uRimPower.value = THREE.MathUtils.lerp(8.0, 1.5, rimWrap);
    uniforms.uShowMask.value = showFresnelMask ? 1 : 0;
  }, [rimWrap, rimIntensity, rimColor, showFresnelMask, uniforms]);

  const patchFresnel = (material) => {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uRimColor = uniforms.uRimColor;
      shader.uniforms.uRimIntensity = uniforms.uRimIntensity;
      shader.uniforms.uRimPower = uniforms.uRimPower;
      shader.uniforms.uShowMask = uniforms.uShowMask;

      // Varyings maison plutôt que de dépendre de vNormal/vViewPosition
      // internes à Three (dont la disponibilité/convention varie selon
      // les chunks compilés) — plus portable.
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          varying vec3 vRimNormal;
          varying vec3 vRimViewDir;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vRimNormal = normalize(normalMatrix * normal);
          vec4 rimMV = modelViewMatrix * vec4(position, 1.0);
          vRimViewDir = normalize(-rimMV.xyz);`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          varying vec3 vRimNormal;
          varying vec3 vRimViewDir;
          uniform vec3 uRimColor;
          uniform float uRimIntensity;
          uniform float uRimPower;
          uniform float uShowMask;`
        )
        .replace(
          '#include <dithering_fragment>',
          `
          float rimFresnel = pow(1.0 - clamp(dot(normalize(vRimNormal), normalize(vRimViewDir)), 0.0, 1.0), uRimPower);
          vec3 rimGlow = uRimColor * rimFresnel * uRimIntensity;

          if (uShowMask > 0.5) {
            gl_FragColor = vec4(vec3(rimFresnel), 1.0);
          } else {
            gl_FragColor.rgb += rimGlow;
          }
          #include <dithering_fragment>`
        );
    };
    material.needsUpdate = true;
  };

  useEffect(() => {
    if (headMatRef.current) patchFresnel(headMatRef.current);
    if (bodyMatRef.current) patchFresnel(bodyMatRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshStandardMaterial ref={headMatRef} color="#C79A73" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.58, 0.9, 32]} />
        <meshStandardMaterial ref={bodyMatRef} color="#1B1D1F" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}
