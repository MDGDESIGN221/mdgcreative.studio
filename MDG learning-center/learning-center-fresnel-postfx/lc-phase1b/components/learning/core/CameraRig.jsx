'use client';
import { OrbitControls } from '@react-three/drei';

// Le buste ne doit jamais être vu sous un angle qui casse la lecture
// pédagogique (par en dessous, à la verticale, etc.).
export default function CameraRig() {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      minDistance={2.2}
      maxDistance={5}
      minPolarAngle={Math.PI * 0.18}
      maxPolarAngle={Math.PI * 0.62}
      enableDamping
      dampingFactor={0.12}
    />
  );
}
