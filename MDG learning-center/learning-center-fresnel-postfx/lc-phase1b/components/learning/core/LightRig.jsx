'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLightStore } from '../../../lib/learning/store';
import { kelvinToHex } from '../../../lib/learning/colorTemperature';

function positionFromAngles(azimuthDeg, elevationDeg, distance) {
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  const x = distance * Math.cos(el) * Math.sin(az);
  const y = distance * Math.sin(el) + 0.6; // recentré sur la tête du buste
  const z = distance * Math.cos(el) * Math.cos(az);
  return [x, y, z];
}

export default function LightRig() {
  const lightRef = useRef();
  const intensity = useLightStore((s) => s.intensity);
  const softness = useLightStore((s) => s.softness);
  const distance = useLightStore((s) => s.distance);
  const kelvin = useLightStore((s) => s.kelvin);
  const azimuth = useLightStore((s) => s.azimuth);
  const elevation = useLightStore((s) => s.elevation);

  useFrame(() => {
    const light = lightRef.current;
    if (!light) return;
    const [x, y, z] = positionFromAngles(azimuth, elevation, distance);
    light.position.set(x, y, z);
    light.target.position.set(0, 0.5, 0);
    light.target.updateMatrixWorld();
    light.intensity = intensity * 3; // compense la chute sur la distance/l'angle du spot
    light.color.set(kelvinToHex(kelvin));
    // Dureté ← taille apparente de la source (Ch.1). Approximation :
    // un vrai soft light serait une RectAreaLight, à revisiter si le
    // Ch.1 doit devenir physiquement exact plutôt que directionnellement correct.
    light.angle = THREE.MathUtils.lerp(0.15, 0.65, softness);
    light.penumbra = THREE.MathUtils.lerp(0.1, 1, softness);
  });

  return <spotLight ref={lightRef} castShadow distance={8} decay={2} shadow-mapSize={[1024, 1024]} />;
}
