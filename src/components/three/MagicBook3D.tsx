import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MagicBook3DProps {
  active: boolean;
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  onAnimationComplete: () => void;
}

export function MagicBook3D({
  active,
  startPosition,
  targetPosition,
  onAnimationComplete,
}: MagicBook3DProps) {
  const rootRef = useRef<THREE.Group>(null);
  const frontCoverPivotRef = useRef<THREE.Group>(null);
  const page1PivotRef = useRef<THREE.Group>(null);
  const page2PivotRef = useRef<THREE.Group>(null);
  const page3PivotRef = useRef<THREE.Group>(null);

  const elapsedRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (active) {
      elapsedRef.current = 0;
      completedRef.current = false;
    }
  }, [active]);

  useFrame((_, delta) => {
    if (!active || !rootRef.current) return;
    const dt = Math.min(delta, 0.05);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    // Phase 1 (0 -> 1.3s): Descend from giant monument into student's hands
    const descendT = THREE.MathUtils.clamp(t / 1.3, 0, 1);
    const easedDescend = 1 - Math.pow(1 - descendT, 3);

    rootRef.current.position.set(
      THREE.MathUtils.lerp(startPosition[0], targetPosition[0], easedDescend),
      THREE.MathUtils.lerp(startPosition[1], targetPosition[1], easedDescend) +
        Math.sin(descendT * Math.PI) * 1.4,
      THREE.MathUtils.lerp(startPosition[2], targetPosition[2], easedDescend),
    );

    const scale = THREE.MathUtils.lerp(0.6, 1.15, easedDescend);
    rootRef.current.scale.setScalar(scale);
    rootRef.current.rotation.x = THREE.MathUtils.lerp(0.1, 0.55, easedDescend);
    rootRef.current.rotation.y = Math.sin(t * 1.5) * 0.06;

    // Phase 2 (1.2 -> 2.1s): Front cover opens smoothly
    const coverT = THREE.MathUtils.clamp((t - 1.2) / 0.85, 0, 1);
    const easedCover = coverT < 0.5 ? 2 * coverT * coverT : 1 - Math.pow(-2 * coverT + 2, 2) / 2;
    if (frontCoverPivotRef.current) {
      frontCoverPivotRef.current.rotation.y = -easedCover * Math.PI * 0.88;
    }

    // Phase 3 (1.9 -> 3.4s): Inner pages flip one by one
    const p1T = THREE.MathUtils.clamp((t - 1.85) / 0.55, 0, 1);
    const p2T = THREE.MathUtils.clamp((t - 2.25) / 0.55, 0, 1);
    const p3T = THREE.MathUtils.clamp((t - 2.65) / 0.55, 0, 1);

    if (page1PivotRef.current) page1PivotRef.current.rotation.y = -p1T * Math.PI * 0.84;
    if (page2PivotRef.current) page2PivotRef.current.rotation.y = -p2T * Math.PI * 0.8;
    if (page3PivotRef.current) page3PivotRef.current.rotation.y = -p3T * Math.PI * 0.76;

    if (t >= 3.45 && !completedRef.current) {
      completedRef.current = true;
      onAnimationComplete();
    }
  });

  if (!active) return null;

  return (
    <group ref={rootRef} position={startPosition}>
      {/* Back cover */}
      <mesh position={[0.32, 0, 0]} castShadow>
        <boxGeometry args={[0.64, 0.04, 0.88]} />
        <meshStandardMaterial color="#236B67" roughness={0.65} />
      </mesh>

      {/* Spine */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.9]} />
        <meshStandardMaterial
          color="#172033"
          emissive="#E8A33D"
          emissiveIntensity={0.35}
          roughness={0.5}
        />
      </mesh>

      {/* Base paper block */}
      <mesh position={[0.31, 0.04, 0]}>
        <boxGeometry args={[0.58, 0.05, 0.82]} />
        <meshStandardMaterial color="#F7F3EA" roughness={0.65} />
      </mesh>

      {/* Animated turning pages */}
      <group ref={page3PivotRef} position={[0.03, 0.068, 0]}>
        <mesh position={[0.28, 0, 0]}>
          <boxGeometry args={[0.56, 0.012, 0.8]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.6} />
        </mesh>
      </group>
      <group ref={page2PivotRef} position={[0.03, 0.074, 0]}>
        <mesh position={[0.28, 0, 0]}>
          <boxGeometry args={[0.56, 0.012, 0.8]} />
          <meshStandardMaterial color="#ECE4D3" roughness={0.6} />
        </mesh>
      </group>
      <group ref={page1PivotRef} position={[0.03, 0.08, 0]}>
        <mesh position={[0.28, 0, 0]}>
          <boxGeometry args={[0.56, 0.012, 0.8]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.6} />
        </mesh>
      </group>

      {/* Front hardcover pivot */}
      <group ref={frontCoverPivotRef} position={[0, 0.095, 0]}>
        <mesh position={[0.32, 0, 0]} castShadow>
          <boxGeometry args={[0.64, 0.04, 0.88]} />
          <meshStandardMaterial color="#236B67" roughness={0.6} />
        </mesh>
        {/* Amber cover emblem */}
        <mesh position={[0.34, 0.024, 0]}>
          <boxGeometry args={[0.28, 0.01, 0.36]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={0.8}
            roughness={0.35}
          />
        </mesh>
      </group>
    </group>
  );
}
