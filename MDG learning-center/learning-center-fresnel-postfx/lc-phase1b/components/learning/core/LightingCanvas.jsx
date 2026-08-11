'use client';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import PostFX from './PostFX';

export default function LightingCanvas({ children }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows
      camera={{ position: [0, 0.6, 3.2], fov: 42 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#0B0C0D']} />
      <ambientLight intensity={0.08} />
      {children}
      <ContactShadows position={[0, -0.62, 0]} opacity={0.55} scale={4} blur={2.4} far={2} />
      <PostFX />
    </Canvas>
  );
}
