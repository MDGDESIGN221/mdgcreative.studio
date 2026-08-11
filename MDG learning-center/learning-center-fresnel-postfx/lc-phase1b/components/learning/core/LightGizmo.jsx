'use client';
import { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLightStore } from '../../../lib/learning/store';

// Poignée visuelle séparée de LightRig (la vraie lumière) et du store
// (état partagé) — cette séparation permet au Ch.4 de togglable
// key/fill/rim individuellement sans dupliquer la logique de drag.
//
// Le mapping écran → azimuth/elevation ici est une approximation
// (projection directe, pas un vrai raycast sur une sphère autour du
// buste) — suffisant pour juger la sensation du drag, à raffiner si
// la précision angulaire doit être exacte au degré près.
export default function LightGizmo() {
  const meshRef = useRef();
  const { gl } = useThree();
  const [dragging, setDragging] = useState(false);
  const azimuth = useLightStore((s) => s.azimuth);
  const elevation = useLightStore((s) => s.elevation);
  const distance = useLightStore((s) => s.distance);
  const setLight = useLightStore((s) => s.setLight);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const az = THREE.MathUtils.degToRad(azimuth);
    const el = THREE.MathUtils.degToRad(elevation);
    mesh.position.set(
      distance * Math.cos(el) * Math.sin(az),
      distance * Math.sin(el) + 0.6,
      distance * Math.cos(el) * Math.cos(az)
    );
  });

  const onPointerDown = (e) => {
    e.stopPropagation();
    setDragging(true);
    gl.domElement.setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e) => {
    setDragging(false);
    gl.domElement.releasePointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const rect = gl.domElement.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const newAzimuth = THREE.MathUtils.radToDeg(Math.atan2(nx, 1)) * 2;
    const newElevation = THREE.MathUtils.clamp(ny * 80, -80, 85);
    setLight({ azimuth: newAzimuth, elevation: newElevation });
  };

  return (
    <mesh
      ref={meshRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerUp}
    >
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#3DBFA3" toneMapped={false} />
    </mesh>
  );
}
