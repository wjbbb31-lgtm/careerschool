import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WoodenBoatProps {
  children?: React.ReactNode;
}

export function WoodenBoat({ children }: WoodenBoatProps) {
  const hullGroupRef = useRef<THREE.Group>(null);

  const boatHullGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.35); // pointed bow (+Z)
    shape.quadraticCurveTo(0.72, 0.65, 0.68, -0.75);
    shape.lineTo(0.46, -1.18);
    shape.lineTo(-0.46, -1.18);
    shape.lineTo(-0.68, -0.75);
    shape.quadraticCurveTo(-0.72, 0.65, 0, 1.35);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 2,
    });
    geom.rotateX(Math.PI / 2);
    geom.translate(0, 0.32, 0);
    return geom;
  }, []);

  useFrame(({ clock }) => {
    if (!hullGroupRef.current) return;
    const t = clock.getElapsedTime();
    hullGroupRef.current.position.y = Math.sin(t * 2.1) * 0.05;
    hullGroupRef.current.rotation.z = Math.sin(t * 1.6) * 0.03;
    hullGroupRef.current.rotation.x = Math.cos(t * 1.8) * 0.022;
  });

  return (
    <group ref={hullGroupRef}>
      {/* Main carved wooden hull */}
      <mesh geometry={boatHullGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#7C5236" roughness={0.82} flatShading />
      </mesh>

      {/* Recessed deck floor */}
      <mesh position={[0, 0.24, -0.05]} receiveShadow>
        <boxGeometry args={[0.96, 0.06, 1.78]} />
        <meshStandardMaterial color="#583925" roughness={0.88} />
      </mesh>

      {/* Front and back wooden benches */}
      <mesh position={[0, 0.38, 0.35]} castShadow>
        <boxGeometry args={[1.05, 0.07, 0.28]} />
        <meshStandardMaterial color="#A47652" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.38, -0.45]} castShadow>
        <boxGeometry args={[1.0, 0.07, 0.28]} />
        <meshStandardMaterial color="#A47652" roughness={0.75} />
      </mesh>

      {/* Bow lantern post & warm amber lantern */}
      <group position={[0, 0.42, 1.1]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.035, 0.5, 6]} />
          <meshStandardMaterial color="#4A3222" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.16, 6]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={1.5}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.63, 0]}>
          <coneGeometry args={[0.11, 0.08, 6]} />
          <meshStandardMaterial color="#172033" roughness={0.6} />
        </mesh>
      </group>

      {/* Left & Right wooden oars */}
      <group position={[-0.74, 0.39, -0.1]} rotation={[0.1, 0.12, 0.25]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.5, 6]} />
          <meshStandardMaterial color="#B78D66" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0, -0.82]}>
          <boxGeometry args={[0.16, 0.03, 0.34]} />
          <meshStandardMaterial color="#8E6443" roughness={0.78} />
        </mesh>
      </group>
      <group position={[0.74, 0.39, -0.1]} rotation={[0.1, -0.12, -0.25]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.5, 6]} />
          <meshStandardMaterial color="#B78D66" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0, -0.82]}>
          <boxGeometry args={[0.16, 0.03, 0.34]} />
          <meshStandardMaterial color="#8E6443" roughness={0.78} />
        </mesh>
      </group>

      {/* Seated passenger slot */}
      <group position={[0, 0.42, -0.36]}>{children}</group>
    </group>
  );
}
