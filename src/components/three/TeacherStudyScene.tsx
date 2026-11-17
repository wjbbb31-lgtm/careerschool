import { useEffect, useMemo, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SheetRowPayload } from '../../utils/sheetClient';

const SPINE_COLOR_BY_HOLLAND: Record<string, string> = {
  R: '#B56357',
  I: '#236B67',
  A: '#E8A33D',
  S: '#4B725B',
  E: '#344970',
  C: '#8D735B',
};

function getSpineColor(hollandCode: string): string {
  const first = (hollandCode || '').trim().charAt(0).toUpperCase();
  return SPINE_COLOR_BY_HOLLAND[first] ?? '#236B67';
}

interface ShelfBookProps {
  row: SheetRowPayload;
  position: [number, number, number];
  isNew: boolean;
  isSelected: boolean;
  onSelect: (row: SheetRowPayload) => void;
}

function ShelfBook({ row, position, isNew, isSelected, onSelect }: ShelfBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const slideOffsetRef = useRef(isNew ? 1.15 : 0);

  // Subtle deterministic height & tilt per nickname for natural shelf feel
  const { height, width, spineColor } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < row.nickname.length; i++) {
      hash = (hash * 31 + row.nickname.charCodeAt(i)) | 0;
    }
    const h = 0.68 + (Math.abs(hash) % 5) * 0.04;
    const w = 0.22 + (Math.abs(hash >> 3) % 3) * 0.025;
    return {
      height: h,
      width: w,
      spineColor: getSpineColor(row.holland_code),
    };
  }, [row.nickname, row.holland_code]);

  useEffect(() => {
    if (isNew) {
      slideOffsetRef.current = 1.15;
    }
  }, [isNew]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const targetZ = isSelected ? 0.34 : 0;
    slideOffsetRef.current = THREE.MathUtils.damp(slideOffsetRef.current, targetZ, 4.5, dt);
    groupRef.current.position.z = position[2] + slideOffsetRef.current;
    groupRef.current.position.y =
      position[1] + (slideOffsetRef.current > 0.35 ? (slideOffsetRef.current - 0.35) * 0.12 : 0);
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2] + (isNew ? 1.15 : 0)]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(row);
      }}
    >
      {/* Hardcover spine & boards */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.52]} />
        <meshStandardMaterial
          color={spineColor}
          emissive={isSelected ? '#E8A33D' : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0}
          roughness={0.62}
        />
      </mesh>
      {/* Cream paper block slightly recessed */}
      <mesh position={[0, height / 2, -0.02]}>
        <boxGeometry args={[width * 0.78, height * 0.94, 0.48]} />
        <meshStandardMaterial color="#F7F3EA" roughness={0.75} />
      </mesh>
      {/* Gold spine label band */}
      <mesh position={[0, height * 0.72, 0.265]}>
        <boxGeometry args={[width * 0.76, 0.09, 0.015]} />
        <meshStandardMaterial
          color={row.share_ok === 'Y' ? '#E8A33D' : '#ECE4D3'}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

interface TeacherStudySceneProps {
  books: SheetRowPayload[];
  newBookKeys: Set<string>;
  selectedNickname: string | null;
  isSoftwareGl: boolean;
  shadowsEnabled: boolean;
  onSelectBook: (row: SheetRowPayload) => void;
}

export function TeacherStudyScene({
  books,
  newBookKeys,
  selectedNickname,
  isSoftwareGl,
  shadowsEnabled,
  onSelectBook,
}: TeacherStudySceneProps) {
  const shelfHeights = [0.78, 1.88, 2.98, 4.08];
  const colsPerShelf = 18;

  return (
    <>
      <color attach="background" args={['#172033']} />
      <fogExp2 attach="fog" args={['#172033', 0.025]} />

      {/* Warm calm study lighting (3 lights) */}
      <hemisphereLight args={['#8599C4', '#261D17', 0.9]} />
      <directionalLight
        position={[7, 10, 8]}
        intensity={1.45}
        color="#F4C782"
        castShadow={shadowsEnabled}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-6, 6, -5]} intensity={0.45} color="#4A9A94" />

      {/* Wooden Study Floor & Teal Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[18, 32]} />
        <meshStandardMaterial color="#2D2018" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 1.8]} receiveShadow>
        <planeGeometry args={[8.5, 4.4]} />
        <meshStandardMaterial color="#236B67" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 1.8]}>
        <ringGeometry args={[1.6, 1.78, 24]} />
        <meshBasicMaterial color="#ECE4D3" />
      </mesh>

      {/* Grand Bookshelf Structure */}
      <group position={[0, 0, -0.4]}>
        {/* Backboard */}
        <mesh position={[0, 2.65, -0.34]} receiveShadow>
          <boxGeometry args={[7.8, 5.1, 0.14]} />
          <meshStandardMaterial color="#463123" roughness={0.85} />
        </mesh>

        {/* Left & Right Pillars + Center Dividers */}
        {[-3.82, -1.28, 1.28, 3.82].map((px, idx) => (
          <mesh key={idx} position={[px, 2.65, 0]} castShadow receiveShadow>
            <boxGeometry args={[idx === 0 || idx === 3 ? 0.22 : 0.12, 5.1, 0.72]} />
            <meshStandardMaterial color="#5E412D" roughness={0.82} />
          </mesh>
        ))}

        {/* Base & Crown */}
        <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 0.72, 0.84]} />
          <meshStandardMaterial color="#523827" roughness={0.84} />
        </mesh>
        <mesh position={[0, 5.22, 0.02]} castShadow>
          <boxGeometry args={[8.16, 0.24, 0.9]} />
          <meshStandardMaterial color="#5E412D" roughness={0.8} />
        </mesh>

        {/* 4 Shelf Planks */}
        {shelfHeights.map((sy, idx) => (
          <mesh key={idx} position={[0, sy - 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[7.6, 0.12, 0.72]} />
            <meshStandardMaterial color="#704E36" roughness={0.8} />
          </mesh>
        ))}

        {/* Side Lantern Sconces */}
        {[-4.12, 4.12].map((lx, idx) => (
          <group key={idx} position={[lx, 3.7, 0.22]}>
            <mesh>
              <boxGeometry args={[0.3, 0.08, 0.24]} />
              <meshStandardMaterial color="#172033" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.18, 0.04]}>
              <cylinderGeometry args={[0.11, 0.09, 0.24, 6]} />
              <meshStandardMaterial
                color="#E8A33D"
                emissive="#E8A33D"
                emissiveIntensity={1.6}
                roughness={0.25}
              />
            </mesh>
          </group>
        ))}

        {/* Placed Student Books */}
        {books.map((row, index) => {
          const shelfIdx = Math.floor(index / colsPerShelf) % shelfHeights.length;
          const colIdx = index % colsPerShelf;
          // Distribute evenly across 3 bays (6 books per bay)
          const bay = Math.floor(colIdx / 6);
          const posInBay = colIdx % 6;
          const bayCenterX = bay === 0 ? -2.55 : bay === 1 ? 0 : 2.55;
          const x = bayCenterX - 0.92 + posInBay * 0.36;
          const y = shelfHeights[shelfIdx];
          const z = 0.05;
          const isNew = newBookKeys.has(`${row.nickname}::${row.created_at}`);

          return (
            <ShelfBook
              key={row.nickname}
              row={row}
              position={[x, y, z]}
              isNew={isNew}
              isSelected={selectedNickname === row.nickname}
              onSelect={onSelectBook}
            />
          );
        })}
      </group>

      {/* Cozy Side Reading Table & Lamp */}
      <group position={[-4.9, 0, 1.4]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.1, 0.95]} />
          <meshStandardMaterial color="#6D4C35" roughness={0.82} />
        </mesh>
        {[
          [-0.62, 0.37, -0.36],
          [0.62, 0.37, -0.36],
          [-0.62, 0.37, 0.36],
          [0.62, 0.37, 0.36],
        ].map((leg, i) => (
          <mesh key={i} position={leg as [number, number, number]}>
            <boxGeometry args={[0.1, 0.74, 0.1]} />
            <meshStandardMaterial color="#4A3222" roughness={0.88} />
          </mesh>
        ))}
        {/* Desk Lamp */}
        <mesh position={[0.36, 0.84, -0.15]}>
          <cylinderGeometry args={[0.14, 0.18, 0.06, 8]} />
          <meshStandardMaterial color="#172033" roughness={0.5} />
        </mesh>
        <mesh position={[0.36, 1.05, -0.15]}>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 6]} />
          <meshStandardMaterial color="#E8A33D" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0.36, 1.28, -0.15]}>
          <coneGeometry args={[0.24, 0.22, 8]} />
          <meshStandardMaterial
            color="#F7F3EA"
            emissive="#E8A33D"
            emissiveIntensity={0.85}
            roughness={0.45}
          />
        </mesh>
      </group>

      <OrbitControls
        target={[0, 2.6, 0]}
        autoRotate={selectedNickname === null}
        autoRotateSpeed={0.45}
        enableDamping={!isSoftwareGl}
        dampingFactor={0.06}
        enablePan={false}
        minPolarAngle={Math.PI * 0.24}
        maxPolarAngle={Math.PI * 0.48}
        minDistance={5.5}
        maxDistance={13.5}
      />
    </>
  );
}
