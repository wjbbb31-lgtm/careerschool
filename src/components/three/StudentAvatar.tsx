import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HairStyleId } from '../../types/game';

interface StudentAvatarProps {
  hairStyle: HairStyleId;
  outfitColor: string;
  isMovingRef: React.MutableRefObject<boolean>;
  isSitting?: boolean;
}

export function StudentAvatar({
  hairStyle,
  outfitColor,
  isMovingRef,
  isSitting = false,
}: StudentAvatarProps) {
  const bodyGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const walkPhaseRef = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const moving = isMovingRef.current && !isSitting;

    if (moving) {
      walkPhaseRef.current += dt * 9.5;
    } else {
      // Smoothly settle walk phase back to neutral
      walkPhaseRef.current = THREE.MathUtils.damp(walkPhaseRef.current, Math.round(walkPhaseRef.current / Math.PI) * Math.PI, 8, dt);
    }

    const swing = moving ? Math.sin(walkPhaseRef.current) * 0.52 : 0;
    const bob = moving ? Math.abs(Math.sin(walkPhaseRef.current)) * 0.05 : 0;

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = THREE.MathUtils.damp(
        leftLegRef.current.rotation.x,
        isSitting ? -Math.PI / 2.4 : swing,
        14,
        dt,
      );
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = THREE.MathUtils.damp(
        rightLegRef.current.rotation.x,
        isSitting ? -Math.PI / 2.4 : -swing,
        14,
        dt,
      );
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = THREE.MathUtils.damp(
        leftArmRef.current.rotation.x,
        isSitting ? -0.25 : -swing * 0.75,
        14,
        dt,
      );
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.damp(
        rightArmRef.current.rotation.x,
        isSitting ? -0.25 : swing * 0.75,
        14,
        dt,
      );
    }
    if (bodyGroupRef.current) {
      const targetY = isSitting ? -0.24 : bob;
      bodyGroupRef.current.position.y = THREE.MathUtils.damp(bodyGroupRef.current.position.y, targetY, 14, dt);
    }
  });

  const skinColor = '#F1CEB2';
  const pantsColor = '#253147';
  const shoeColor = '#ECE4D3';
  const hairColor = '#2B211D';

  return (
    <group>
      {/* Subtle contact shadow disc grounded at feet */}
      {!isSitting && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[0.34, 16]} />
          <meshBasicMaterial color="#0D1422" transparent opacity={0.34} depthWrite={false} />
        </mesh>
      )}

      <group ref={bodyGroupRef}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.12, 0.56, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.16, 0.44, 0.17]} />
            <meshStandardMaterial color={pantsColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.49, 0.04]} castShadow>
            <boxGeometry args={[0.17, 0.12, 0.25]} />
            <meshStandardMaterial color={shoeColor} roughness={0.65} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.12, 0.56, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.16, 0.44, 0.17]} />
            <meshStandardMaterial color={pantsColor} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.49, 0.04]} castShadow>
            <boxGeometry args={[0.17, 0.12, 0.25]} />
            <meshStandardMaterial color={shoeColor} roughness={0.65} />
          </mesh>
        </group>

        {/* Torso / Sweater */}
        <mesh position={[0, 0.84, 0]} castShadow>
          <boxGeometry args={[0.46, 0.54, 0.28]} />
          <meshStandardMaterial color={outfitColor} roughness={0.78} />
        </mesh>

        {/* Paper-colored Collar / Scarf Trim */}
        <mesh position={[0, 1.09, 0.02]} castShadow>
          <boxGeometry args={[0.34, 0.09, 0.27]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.65} />
        </mesh>

        {/* Satchel / Backpack */}
        <group position={[0, 0.86, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.38, 0.15]} />
            <meshStandardMaterial color="#7C593F" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.05, -0.08]}>
            <boxGeometry args={[0.28, 0.12, 0.03]} />
            <meshStandardMaterial color="#E8A33D" roughness={0.4} metalness={0.35} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.31, 1.02, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <boxGeometry args={[0.14, 0.4, 0.15]} />
            <meshStandardMaterial color={outfitColor} roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.41, 0]}>
            <boxGeometry args={[0.12, 0.1, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.31, 1.02, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <boxGeometry args={[0.14, 0.4, 0.15]} />
            <meshStandardMaterial color={outfitColor} roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.41, 0]}>
            <boxGeometry args={[0.12, 0.1, 0.12]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Head & Neck */}
        <group position={[0, 1.32, 0]}>
          <mesh position={[0, -0.17, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.12, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.4, 0.4]} />
            <meshStandardMaterial color={skinColor} roughness={0.68} />
          </mesh>

          {/* Subtle friendly eyes */}
          <mesh position={[-0.09, 0.0, 0.205]}>
            <boxGeometry args={[0.045, 0.06, 0.02]} />
            <meshStandardMaterial color="#1D222E" roughness={0.3} />
          </mesh>
          <mesh position={[0.09, 0.0, 0.205]}>
            <boxGeometry args={[0.045, 0.06, 0.02]} />
            <meshStandardMaterial color="#1D222E" roughness={0.3} />
          </mesh>

          {/* Hair Style 1: 단정한 단발 (bob) */}
          {hairStyle === 'bob' && (
            <group>
              <mesh position={[0, 0.16, -0.01]} castShadow>
                <boxGeometry args={[0.46, 0.15, 0.44]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0, -0.02, -0.17]} castShadow>
                <boxGeometry args={[0.46, 0.42, 0.13]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[-0.21, -0.04, 0.02]} castShadow>
                <boxGeometry args={[0.08, 0.36, 0.34]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0.21, -0.04, 0.02]} castShadow>
                <boxGeometry args={[0.08, 0.36, 0.34]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0, 0.12, 0.2]}>
                <boxGeometry args={[0.4, 0.09, 0.05]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
            </group>
          )}

          {/* Hair Style 2: 자연스러운 숏컷 (short) */}
          {hairStyle === 'short' && (
            <group>
              <mesh position={[0, 0.17, -0.01]} castShadow>
                <boxGeometry args={[0.45, 0.14, 0.43]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0.03, 0.24, 0.02]} rotation={[0.08, 0, -0.1]} castShadow>
                <boxGeometry args={[0.36, 0.08, 0.34]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0, 0.04, -0.18]} castShadow>
                <boxGeometry args={[0.44, 0.28, 0.1]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[-0.21, 0.08, -0.03]}>
                <boxGeometry args={[0.06, 0.18, 0.26]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0.21, 0.08, -0.03]}>
                <boxGeometry args={[0.06, 0.18, 0.26]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[-0.05, 0.12, 0.2]} rotation={[0, 0, -0.12]}>
                <boxGeometry args={[0.32, 0.08, 0.05]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
            </group>
          )}

          {/* Hair Style 3: 묶은 머리 (ponytail) */}
          {hairStyle === 'ponytail' && (
            <group>
              <mesh position={[0, 0.15, -0.01]} castShadow>
                <boxGeometry args={[0.45, 0.14, 0.43]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0, 0.04, -0.18]} castShadow>
                <boxGeometry args={[0.44, 0.28, 0.1]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[-0.12, 0.12, 0.2]} rotation={[0, 0, 0.14]}>
                <boxGeometry args={[0.2, 0.08, 0.05]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              <mesh position={[0.12, 0.12, 0.2]} rotation={[0, 0, -0.14]}>
                <boxGeometry args={[0.2, 0.08, 0.05]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
              {/* Hair tie */}
              <mesh position={[0, 0.1, -0.25]}>
                <cylinderGeometry args={[0.075, 0.075, 0.05, 10]} />
                <meshStandardMaterial color="#E8A33D" roughness={0.45} />
              </mesh>
              {/* Ponytail */}
              <mesh position={[0, -0.02, -0.34]} rotation={[-0.45, 0, 0]} castShadow>
                <coneGeometry args={[0.11, 0.36, 7]} />
                <meshStandardMaterial color={hairColor} roughness={0.88} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
}
