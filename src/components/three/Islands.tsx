import { useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ISLANDS } from '../../data/islands';
import { IslandDefinition, IslandId } from '../../types/game';

interface IslandsProps {
  currentIslandId: IslandId;
  isSailing: boolean;
  hideLabels: boolean;
  ch3Completed: boolean;
  nearLibraryBook: boolean;
  finaleAnimating: boolean;
  onGroundClick: (point: THREE.Vector3) => void;
  onIslandSelect: (islandId: IslandId) => void;
  onOpenWriting: (islandId: IslandId) => void;
  onOpenChapter3Bottle: () => void;
  onOpenChapter4Book: () => void;
}

function LanternPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 1.4, 6]} />
        <meshStandardMaterial color="#4A3526" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.42, 0.14]}>
        <boxGeometry args={[0.06, 0.06, 0.34]} />
        <meshStandardMaterial color="#4A3526" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.27, 0.27]}>
        <cylinderGeometry args={[0.1, 0.08, 0.18, 6]} />
        <meshStandardMaterial
          color="#E8A33D"
          emissive="#E8A33D"
          emissiveIntensity={1.6}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 1.39, 0.27]}>
        <coneGeometry args={[0.13, 0.09, 6]} />
        <meshStandardMaterial color="#172033" roughness={0.6} />
      </mesh>
    </group>
  );
}

function LowPolyTree({
  position,
  scale = 1,
  tint = '#236B67',
}: {
  position: [number, number, number];
  scale?: number;
  tint?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.7, 6]} />
        <meshStandardMaterial color="#59402E" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <coneGeometry args={[0.62, 1.0, 6]} />
        <meshStandardMaterial color={tint} roughness={0.82} flatShading />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <coneGeometry args={[0.46, 0.85, 6]} />
        <meshStandardMaterial color={tint} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

function WoodenPier({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const { mid, length, angle } = useMemo(() => {
    const dx = end[0] - start[0];
    const dz = end[2] - start[2];
    const len = Math.sqrt(dx * dx + dz * dz);
    const ang = Math.atan2(dx, dz);
    return {
      mid: [(start[0] + end[0]) / 2, 0.24, (start[2] + end[2]) / 2] as [number, number, number],
      length: len,
      angle: ang,
    };
  }, [start, end]);

  return (
    <group position={mid} rotation={[0, angle, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.28, 0.12, length]} />
        <meshStandardMaterial color="#7C563B" roughness={0.86} />
      </mesh>
      {/* Pier support posts */}
      {[-0.45, 0.45].map((x) =>
        [-length * 0.35, 0, length * 0.35].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.25, z]}>
            <cylinderGeometry args={[0.07, 0.08, 0.65, 6]} />
            <meshStandardMaterial color="#4D3424" roughness={0.9} />
          </mesh>
        )),
      )}
      <LanternPost position={[0.52, 0.05, length * 0.42]} />
    </group>
  );
}

function WritingLandmark({
  position,
  isCurrentIsland,
  onClick,
}: {
  position: [number, number, number];
  isCurrentIsland: boolean;
  onClick: () => void;
}) {
  const gemRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!gemRef.current) return;
    const t = clock.getElapsedTime();
    gemRef.current.position.y = 1.28 + Math.sin(t * 2.2) * 0.08;
    gemRef.current.rotation.y = t * 0.9;
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Pedestal base */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.42, 0.76, 6]} />
        <meshStandardMaterial color="#ECE4D3" roughness={0.75} />
      </mesh>
      {/* Open small stone/paper book on pedestal */}
      <mesh position={[0, 0.79, 0]} rotation={[0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.56, 0.08, 0.4]} />
        <meshStandardMaterial color="#F7F3EA" roughness={0.6} />
      </mesh>
      {/* Floating amber prompt beacon */}
      <mesh ref={gemRef} position={[0, 1.28, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#E8A33D"
          emissive="#E8A33D"
          emissiveIntensity={isCurrentIsland ? 1.5 : 0.7}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

export function Islands({
  currentIslandId,
  isSailing,
  hideLabels,
  ch3Completed,
  nearLibraryBook,
  finaleAnimating,
  onGroundClick,
  onIslandSelect,
  onOpenWriting,
  onOpenChapter3Bottle,
  onOpenChapter4Book,
}: IslandsProps) {
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const makeGroundClickHandler = (island: IslandDefinition) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (pointerDownRef.current) {
      const dx = e.clientX - pointerDownRef.current.x;
      const dy = e.clientY - pointerDownRef.current.y;
      if (dx * dx + dy * dy > 64) return; // Ignore drag gestures
    }

    if (isSailing) return;

    if (island.id === currentIslandId) {
      onGroundClick(e.point.clone());
    } else {
      onIslandSelect(island.id);
    }
  };

  return (
    <group>
      {/* 1. 흥미의 섬 (육각형 모양 광장) */}
      <InterestIslandMesh
        island={ISLANDS[0]}
        isCurrent={currentIslandId === 'interest'}
        hideLabels={hideLabels}
        onPointerDown={handlePointerDown}
        onClick={makeGroundClickHandler(ISLANDS[0])}
        onSelectIsland={() => onIslandSelect('interest')}
        onOpenWriting={() => onOpenWriting('interest')}
      />

      {/* 2. 전환의 등대 섬 */}
      <LighthouseIslandMesh
        island={ISLANDS[1]}
        isCurrent={currentIslandId === 'lighthouse'}
        hideLabels={hideLabels}
        onPointerDown={handlePointerDown}
        onClick={makeGroundClickHandler(ISLANDS[1])}
        onSelectIsland={() => onIslandSelect('lighthouse')}
        onOpenWriting={() => onOpenWriting('lighthouse')}
      />

      {/* 3. 우연의 바다 (소용돌이와 떠다니는 병) */}
      <SerendipityIslandMesh
        island={ISLANDS[2]}
        isCurrent={currentIslandId === 'serendipity'}
        hideLabels={hideLabels}
        ch3Completed={ch3Completed}
        onPointerDown={handlePointerDown}
        onClick={makeGroundClickHandler(ISLANDS[2])}
        onSelectIsland={() => onIslandSelect('serendipity')}
        onOpenWriting={() => onOpenChapter3Bottle()}
        onOpenChapter3Bottle={onOpenChapter3Bottle}
      />

      {/* 4. 서재의 섬 (커다란 펼쳐진 책 조형물) */}
      <LibraryIslandMesh
        island={ISLANDS[3]}
        isCurrent={currentIslandId === 'library'}
        hideLabels={hideLabels}
        nearLibraryBook={nearLibraryBook}
        finaleAnimating={finaleAnimating}
        onPointerDown={handlePointerDown}
        onClick={makeGroundClickHandler(ISLANDS[3])}
        onSelectIsland={() => onIslandSelect('library')}
        onOpenWriting={() => onOpenChapter4Book()}
        onOpenChapter4Book={onOpenChapter4Book}
      />
    </group>
  );
}

interface IslandMeshProps {
  island: IslandDefinition;
  isCurrent: boolean;
  hideLabels: boolean;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onSelectIsland: () => void;
  onOpenWriting: () => void;
}

function IslandLabel({
  island,
  isCurrent,
  hideLabels,
  height,
  onSelectIsland,
}: {
  island: IslandDefinition;
  isCurrent: boolean;
  hideLabels: boolean;
  height: number;
  onSelectIsland: () => void;
}) {
  if (hideLabels) return null;
  return (
    <Html position={[0, height, 0]} center distanceFactor={28} zIndexRange={[10, 0]}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectIsland();
        }}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-transform duration-150 shadow-md border cursor-pointer ${
          isCurrent
            ? 'bg-[#E8A33D] text-[#172033] border-[#F7F3EA]/70 font-semibold'
            : 'bg-[#172033]/90 text-[#F7F3EA] border-[#ECE4D3]/30 hover:bg-[#236B67] hover:scale-105'
        }`}
      >
        {island.orderLabel}. {island.name}
        {!isCurrent ? ' · 배 타기' : ''}
      </button>
    </Html>
  );
}

function InterestIslandMesh({
  island,
  isCurrent,
  hideLabels,
  onPointerDown,
  onClick,
  onSelectIsland,
  onOpenWriting,
}: IslandMeshProps) {
  const [x, y, z] = island.position;
  const writingLocal: [number, number, number] = [
    island.writingSpotPosition[0] - x,
    0.35,
    island.writingSpotPosition[2] - z,
  ];

  return (
    <group position={[x, y, z]}>
      {/* Hexagonal foundation & walkable plaza */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <cylinderGeometry args={[6.9, 7.6, 0.9, 6]} />
        <meshStandardMaterial color="#7C746A" roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[6.3, 6.6, 0.3, 6]} />
        <meshStandardMaterial color="#236B67" roughness={0.86} flatShading />
      </mesh>
      {/* Walkable hexagonal plaza floor */}
      <mesh
        position={[0, 0.3, 0]}
        receiveShadow
        onPointerDown={onPointerDown}
        onClick={onClick}
      >
        <cylinderGeometry args={[5.5, 5.7, 0.12, 6]} />
        <meshStandardMaterial color="#ECE4D3" roughness={0.78} flatShading />
      </mesh>

      {/* Inner hexagonal inlay ring */}
      <mesh position={[0, 0.37, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.04, 6]} />
        <meshStandardMaterial color="#D9CEB8" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.04, 6]} />
        <meshStandardMaterial color="#E8A33D" roughness={0.55} />
      </mesh>

      {/* Wooden Bench */}
      <group position={[-2.9, 0.36, 1.5]} rotation={[0, 0.65, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[1.3, 0.08, 0.45]} />
          <meshStandardMaterial color="#7C563B" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.5, -0.18]} castShadow>
          <boxGeometry args={[1.3, 0.32, 0.07]} />
          <meshStandardMaterial color="#7C563B" roughness={0.82} />
        </mesh>
        <mesh position={[-0.5, 0.13, 0]}>
          <boxGeometry args={[0.1, 0.26, 0.36]} />
          <meshStandardMaterial color="#3B2A1E" roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.13, 0]}>
          <boxGeometry args={[0.1, 0.26, 0.36]} />
          <meshStandardMaterial color="#3B2A1E" roughness={0.9} />
        </mesh>
      </group>

      {/* Artist Easel */}
      <group position={[2.8, 0.36, 1.4]} rotation={[0, -0.5, 0]}>
        <mesh position={[-0.22, 0.55, 0]} rotation={[0, 0, -0.14]} castShadow>
          <boxGeometry args={[0.06, 1.2, 0.06]} />
          <meshStandardMaterial color="#7C563B" roughness={0.85} />
        </mesh>
        <mesh position={[0.22, 0.55, 0]} rotation={[0, 0, 0.14]} castShadow>
          <boxGeometry args={[0.06, 1.2, 0.06]} />
          <meshStandardMaterial color="#7C563B" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.52, -0.22]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.06, 1.15, 0.06]} />
          <meshStandardMaterial color="#7C563B" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.82, 0.05]} rotation={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.68, 0.52, 0.05]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.6} />
        </mesh>
      </group>

      {/* Low-poly Trees & Lanterns */}
      <LowPolyTree position={[-3.9, 0.35, -1.9]} scale={1.1} tint="#236B67" />
      <LowPolyTree position={[-4.5, 0.35, -0.5]} scale={0.82} tint="#2F7A6F" />
      <LowPolyTree position={[3.8, 0.35, -2.4]} scale={0.95} tint="#236B67" />
      <LanternPost position={[-1.9, 0.35, -3.5]} />
      <LanternPost position={[1.8, 0.35, 3.2]} />

      {/* Pier to dock */}
      <WoodenPier
        start={[3.2, 0, -2.8]}
        end={[island.dockPosition[0] - x, 0, island.dockPosition[2] - z]}
      />

      {/* Writing landmark */}
      <WritingLandmark
        position={writingLocal}
        isCurrentIsland={isCurrent}
        onClick={() => (isCurrent ? onOpenWriting() : onSelectIsland())}
      />

      <IslandLabel
        island={island}
        isCurrent={isCurrent}
        hideLabels={hideLabels}
        height={3.6}
        onSelectIsland={onSelectIsland}
      />
    </group>
  );
}

function LighthouseIslandMesh({
  island,
  isCurrent,
  hideLabels,
  onPointerDown,
  onClick,
  onSelectIsland,
  onOpenWriting,
}: IslandMeshProps) {
  const beamRef = useRef<THREE.Group>(null);
  const [x, y, z] = island.position;
  const writingLocal: [number, number, number] = [
    island.writingSpotPosition[0] - x,
    0.35,
    island.writingSpotPosition[2] - z,
  ];

  useFrame((_, delta) => {
    if (beamRef.current) {
      beamRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* Coastal rocky base & grass island */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <cylinderGeometry args={[6.4, 7.2, 0.9, 9]} />
        <meshStandardMaterial color="#6D6965" roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[5.9, 6.2, 0.25, 9]} />
        <meshStandardMaterial color="#D8C9AE" roughness={0.85} flatShading />
      </mesh>
      {/* Walkable island surface */}
      <mesh
        position={[0, 0.28, 0]}
        receiveShadow
        onPointerDown={onPointerDown}
        onClick={onClick}
      >
        <cylinderGeometry args={[5.1, 5.4, 0.16, 10]} />
        <meshStandardMaterial color="#2D6A62" roughness={0.82} flatShading />
      </mesh>

      {/* Composite Lighthouse Tower */}
      <group position={[1.4, 0.35, -1.2]}>
        {/* Stone plinth */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.05, 1.25, 0.7, 8]} />
          <meshStandardMaterial color="#878077" roughness={0.88} flatShading />
        </mesh>
        {/* Alternating white/teal tower tiers */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <cylinderGeometry args={[0.84, 1.0, 1.5, 8]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.65} flatShading />
        </mesh>
        <mesh position={[0, 2.75, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.84, 1.1, 8]} />
          <meshStandardMaterial color="#236B67" roughness={0.7} flatShading />
        </mesh>
        <mesh position={[0, 3.85, 0]} castShadow>
          <cylinderGeometry args={[0.58, 0.7, 1.1, 8]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.65} flatShading />
        </mesh>
        {/* Gallery Deck */}
        <mesh position={[0, 4.48, 0]} castShadow>
          <cylinderGeometry args={[0.84, 0.78, 0.16, 8]} />
          <meshStandardMaterial color="#172033" roughness={0.55} />
        </mesh>
        {/* Glowing Lantern Room */}
        <mesh position={[0, 4.9, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.68, 8]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={1.8}
            roughness={0.2}
          />
        </mesh>
        {/* Roof Cap */}
        <mesh position={[0, 5.45, 0]} castShadow>
          <coneGeometry args={[0.64, 0.52, 8]} />
          <meshStandardMaterial color="#172033" roughness={0.55} flatShading />
        </mesh>

        {/* Slowly rotating translucent amber light beam */}
        <group ref={beamRef} position={[0, 4.9, 0]}>
          <mesh position={[0, -0.15, 4.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[1.6, 8.2, 10, 1, true]} />
            <meshBasicMaterial
              color="#E8A33D"
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      {/* Keeper's Cottage */}
      <group position={[-1.5, 0.35, -1.6]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.6, 1.0, 1.3]} />
          <meshStandardMaterial color="#F7F3EA" roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.25, 0.72, 4]} />
          <meshStandardMaterial color="#4D372C" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.42, 0.55, 0.66]}>
          <boxGeometry args={[0.32, 0.34, 0.04]} />
          <meshStandardMaterial color="#E8A33D" emissive="#E8A33D" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Coastal Rocks & Trees */}
      <LowPolyTree position={[-2.9, 0.35, 1.5]} scale={0.95} tint="#236B67" />
      <LanternPost position={[-2.4, 0.35, 2.7]} />

      {/* Pier to dock */}
      <WoodenPier
        start={[-2.8, 0, 2.0]}
        end={[island.dockPosition[0] - x, 0, island.dockPosition[2] - z]}
      />

      <WritingLandmark
        position={writingLocal}
        isCurrentIsland={isCurrent}
        onClick={() => (isCurrent ? onOpenWriting() : onSelectIsland())}
      />

      <IslandLabel
        island={island}
        isCurrent={isCurrent}
        hideLabels={hideLabels}
        height={6.6}
        onSelectIsland={onSelectIsland}
      />
    </group>
  );
}

function SerendipityIslandMesh({
  island,
  isCurrent,
  hideLabels,
  ch3Completed,
  onPointerDown,
  onClick,
  onSelectIsland,
  onOpenWriting,
  onOpenChapter3Bottle,
}: IslandMeshProps & {
  ch3Completed: boolean;
  onOpenChapter3Bottle: () => void;
}) {
  const vortexRef = useRef<THREE.Group>(null);
  const bottlesRef = useRef<THREE.Group>(null);
  const approachingBottleRef = useRef<THREE.Group>(null);
  const starRef = useRef<THREE.Group>(null);
  const vortexAngleRef = useRef(0);
  const starProgressRef = useRef(ch3Completed ? 1 : 0);
  const approachProgressRef = useRef(0);

  const [x, y, z] = island.position;
  const writingLocal: [number, number, number] = [
    island.writingSpotPosition[0] - x,
    0.35,
    island.writingSpotPosition[2] - z,
  ];

  // Curved crescent sand/stone shoal geometry around the vortex
  const crescentGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerR = 5.4;
    const innerR = 2.45;
    const startAngle = -Math.PI * 0.56;
    const endAngle = Math.PI * 1.24;

    shape.absarc(0, 0, outerR, startAngle, endAngle, false);
    shape.absarc(0, 0, innerR, endAngle, startAngle, true);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.45,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 2,
    });
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();

    // Vortex slows down calmly after completing Chapter 3
    const speedFactor = ch3Completed ? 0.14 : 1.0;
    vortexAngleRef.current += dt * speedFactor;

    if (vortexRef.current) {
      vortexRef.current.children.forEach((child, idx) => {
        child.rotation.z = vortexAngleRef.current * (0.45 + idx * 0.25);
      });
    }
    if (bottlesRef.current) {
      bottlesRef.current.rotation.y += dt * (ch3Completed ? 0.08 : 0.3);
      bottlesRef.current.children.forEach((bottle, idx) => {
        bottle.position.y = 0.08 + Math.sin(t * 2.1 + idx * 1.5) * 0.05;
        bottle.rotation.z = Math.sin(t * 1.6 + idx) * (ch3Completed ? 0.06 : 0.16);
      });
    }

    // Approaching bottle drifts smoothly toward the dock when player arrives on Serendipity
    if (approachingBottleRef.current) {
      const targetApproach = isCurrent ? 1 : 0;
      approachProgressRef.current = THREE.MathUtils.damp(
        approachProgressRef.current,
        targetApproach,
        1.6,
        dt,
      );
      const p = approachProgressRef.current;
      approachingBottleRef.current.position.x = THREE.MathUtils.lerp(1.8, 4.95, p);
      approachingBottleRef.current.position.z = THREE.MathUtils.lerp(0.8, 2.55, p);
      approachingBottleRef.current.position.y = 0.14 + Math.sin(t * 2.2) * 0.06;
      approachingBottleRef.current.rotation.z = Math.sin(t * 1.5) * 0.12;
    }

    // Glowing star rises from the bottle up to the sky upon completion
    if (starRef.current) {
      if (ch3Completed) {
        starProgressRef.current = Math.min(1, starProgressRef.current + dt * 0.25);
        const eased = 1 - Math.pow(1 - starProgressRef.current, 2);
        starRef.current.position.set(
          THREE.MathUtils.lerp(4.95, 0.2, eased),
          THREE.MathUtils.lerp(0.45, 11.5, eased) + Math.sin(t * 2) * 0.25,
          THREE.MathUtils.lerp(2.55, 0.0, eased),
        );
        starRef.current.rotation.y = t * 1.2;
      } else {
        starProgressRef.current = 0;
      }
    }
  });

  const bottlePositions: [number, number, number][] = [
    [1.65, 0.08, 0.2],
    [-1.4, 0.08, 0.85],
    [0.45, 0.08, -1.55],
    [-0.95, 0.08, -1.15],
  ];

  return (
    <group position={[x, y, z]}>
      {/* Crescent walkable shoal */}
      <mesh
        geometry={crescentGeometry}
        position={[0, -0.08, 0]}
        receiveShadow
        castShadow
        onPointerDown={onPointerDown}
        onClick={onClick}
      >
        <meshStandardMaterial color="#DFD3BC" roughness={0.84} flatShading />
      </mesh>

      {/* Also allow clicking on the central lagoon area to sail here if not current */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        onPointerDown={onPointerDown}
        onClick={(e) => {
          e.stopPropagation();
          if (!isCurrent) onSelectIsland();
        }}
      >
        <circleGeometry args={[2.5, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Swirling Vortex Rings */}
      <group ref={vortexRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[1.9, 2.25, 20, 1, 0, Math.PI * 1.6]} />
          <meshStandardMaterial
            color="#236B67"
            emissive="#236B67"
            emissiveIntensity={0.65}
            transparent
            opacity={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <ringGeometry args={[1.25, 1.58, 18, 1, 0.8, Math.PI * 1.5]} />
          <meshStandardMaterial
            color="#3CA39C"
            emissive="#236B67"
            emissiveIntensity={0.75}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <ringGeometry args={[0.68, 0.95, 16, 1, 1.5, Math.PI * 1.4]} />
          <meshStandardMaterial
            color="#ECE4D3"
            emissive="#E8A33D"
            emissiveIntensity={0.45}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <ringGeometry args={[0.25, 0.44, 12, 1, 0.2, Math.PI * 1.3]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={1.1}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Floating Corked Message Bottles */}
      <group ref={bottlesRef}>
        {bottlePositions.map((pos, idx) => (
          <group key={idx} position={pos} rotation={[0.45, idx * 1.1, 0.2]}>
            {/* Glass body */}
            <mesh>
              <cylinderGeometry args={[0.14, 0.16, 0.42, 8]} />
              <meshStandardMaterial
                color="#A6E0DA"
                roughness={0.18}
                transparent
                opacity={0.75}
              />
            </mesh>
            {/* Rolled paper note inside */}
            <mesh>
              <cylinderGeometry args={[0.07, 0.07, 0.26, 6]} />
              <meshStandardMaterial color="#F7F3EA" roughness={0.7} />
            </mesh>
            {/* Bottle neck */}
            <mesh position={[0, 0.27, 0]}>
              <cylinderGeometry args={[0.06, 0.1, 0.14, 8]} />
              <meshStandardMaterial
                color="#A6E0DA"
                roughness={0.18}
                transparent
                opacity={0.78}
              />
            </mesh>
            {/* Cork */}
            <mesh position={[0, 0.36, 0]}>
              <cylinderGeometry args={[0.055, 0.05, 0.08, 6]} />
              <meshStandardMaterial color="#9D7048" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Approaching interactive message bottle near dock */}
      <group
        ref={approachingBottleRef}
        position={[1.8, 0.14, 0.8]}
        scale={1.35}
        onClick={(e) => {
          e.stopPropagation();
          if (isCurrent) onOpenChapter3Bottle();
          else onSelectIsland();
        }}
      >
        <group rotation={[0.45, 0.4, 0.2]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.16, 0.42, 8]} />
            <meshStandardMaterial
              color="#B8ECE6"
              emissive="#236B67"
              emissiveIntensity={ch3Completed ? 0.2 : 0.65}
              roughness={0.18}
              transparent
              opacity={0.82}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.26, 6]} />
            <meshStandardMaterial
              color="#F7F3EA"
              emissive="#E8A33D"
              emissiveIntensity={ch3Completed ? 0.1 : 0.6}
              roughness={0.65}
            />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 0.14, 8]} />
            <meshStandardMaterial color="#B8ECE6" roughness={0.18} transparent opacity={0.82} />
          </mesh>
          {!ch3Completed && (
            <mesh position={[0, 0.36, 0]}>
              <cylinderGeometry args={[0.055, 0.05, 0.08, 6]} />
              <meshStandardMaterial color="#9D7048" roughness={0.9} />
            </mesh>
          )}
        </group>
        {!ch3Completed && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
            <ringGeometry args={[0.26, 0.36, 16]} />
            <meshBasicMaterial color="#E8A33D" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* Rising golden star when Chapter 3 is completed */}
      {ch3Completed && (
        <group ref={starRef} position={[4.95, 0.45, 2.55]}>
          <mesh>
            <octahedronGeometry args={[0.28, 0]} />
            <meshStandardMaterial
              color="#F7F3EA"
              emissive="#E8A33D"
              emissiveIntensity={2.1}
              roughness={0.2}
            />
          </mesh>
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial
              color="#E8A33D"
              emissive="#E8A33D"
              emissiveIntensity={1.6}
              roughness={0.25}
            />
          </mesh>
        </group>
      )}

      {/* Rocks & Lantern on the crescent shore */}
      <mesh position={[-3.8, 0.55, 0.5]} castShadow>
        <dodecahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color="#7B746C" roughness={0.9} flatShading />
      </mesh>
      <LowPolyTree position={[-3.3, 0.36, -1.8]} scale={0.85} tint="#236B67" />
      <LanternPost position={[-1.2, 0.36, -3.5]} />

      {/* Pier to dock */}
      <WoodenPier
        start={[3.5, 0, 2.2]}
        end={[island.dockPosition[0] - x, 0, island.dockPosition[2] - z]}
      />

      <WritingLandmark
        position={writingLocal}
        isCurrentIsland={isCurrent}
        onClick={() => (isCurrent ? onOpenWriting() : onSelectIsland())}
      />

      <IslandLabel
        island={island}
        isCurrent={isCurrent}
        hideLabels={hideLabels}
        height={3.6}
        onSelectIsland={onSelectIsland}
      />
    </group>
  );
}

function LibraryIslandMesh({
  island,
  isCurrent,
  hideLabels,
  nearLibraryBook,
  finaleAnimating,
  onPointerDown,
  onClick,
  onSelectIsland,
  onOpenWriting,
  onOpenChapter4Book,
}: IslandMeshProps & {
  nearLibraryBook: boolean;
  finaleAnimating: boolean;
  onOpenChapter4Book: () => void;
}) {
  const flipPage1Ref = useRef<THREE.Group>(null);
  const flipPage2Ref = useRef<THREE.Group>(null);
  const [x, y, z] = island.position;
  const writingLocal: [number, number, number] = [
    island.writingSpotPosition[0] - x,
    0.35,
    island.writingSpotPosition[2] - z,
  ];

  // Curved open book page wings using ExtrudeGeometry
  const pageArchGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.95, 0.42, 1.9, 0.06);
    shape.lineTo(1.9, 0.24);
    shape.quadraticCurveTo(0.95, 0.6, 0, 0.16);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 2.3,
      bevelEnabled: false,
    });
    geom.translate(0, 0, -1.15);
    return geom;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const shouldFlip = isCurrent && (nearLibraryBook || finaleAnimating);
    if (flipPage1Ref.current) {
      if (shouldFlip) {
        const cycle = (t * 0.7) % 1;
        flipPage1Ref.current.visible = true;
        flipPage1Ref.current.rotation.z = THREE.MathUtils.lerp(0.18, Math.PI - 0.18, cycle);
      } else {
        flipPage1Ref.current.visible = false;
      }
    }
    if (flipPage2Ref.current) {
      if (shouldFlip) {
        const cycle = (t * 0.7 + 0.5) % 1;
        flipPage2Ref.current.visible = true;
        flipPage2Ref.current.rotation.z = THREE.MathUtils.lerp(0.18, Math.PI - 0.18, cycle);
      } else {
        flipPage2Ref.current.visible = false;
      }
    }
  });

  return (
    <group position={[x, y, z]}>
      {/* Stone & moss foundation */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <cylinderGeometry args={[6.8, 7.5, 0.9, 8]} />
        <meshStandardMaterial color="#7B746C" roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[6.2, 6.5, 0.28, 8]} />
        <meshStandardMaterial color="#236B67" roughness={0.84} flatShading />
      </mesh>
      {/* Walkable stone terrace */}
      <mesh
        position={[0, 0.3, 0]}
        receiveShadow
        onPointerDown={onPointerDown}
        onClick={onClick}
      >
        <cylinderGeometry args={[5.4, 5.6, 0.14, 8]} />
        <meshStandardMaterial color="#ECE4D3" roughness={0.78} flatShading />
      </mesh>

      {/* Grand Open Book Sculpture */}
      <group
        position={[0, 0.36, -1.35]}
        rotation={[0.14, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (isCurrent) onOpenChapter4Book();
          else onSelectIsland();
        }}
      >
        {/* Pedestal */}
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.1, 0.48, 2.7]} />
          <meshStandardMaterial color="#8F867A" roughness={0.85} />
        </mesh>

        {/* Book Spine & Hardcover Boards */}
        <mesh position={[0, 0.56, 0]} castShadow>
          <boxGeometry args={[0.42, 0.18, 2.48]} />
          <meshStandardMaterial color="#172033" roughness={0.7} />
        </mesh>
        <mesh position={[-1.08, 0.56, 0]} rotation={[0, 0, -0.06]} castShadow>
          <boxGeometry args={[2.06, 0.1, 2.44]} />
          <meshStandardMaterial color="#236B67" roughness={0.72} />
        </mesh>
        <mesh position={[1.08, 0.56, 0]} rotation={[0, 0, 0.06]} castShadow>
          <boxGeometry args={[2.06, 0.1, 2.44]} />
          <meshStandardMaterial color="#236B67" roughness={0.72} />
        </mesh>

        {/* Left & Right Curved Open Pages */}
        <mesh geometry={pageArchGeometry} position={[0, 0.6, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color="#F7F3EA"
            emissive="#E8A33D"
            emissiveIntensity={finaleAnimating ? 0.55 : nearLibraryBook ? 0.18 : 0}
            roughness={0.62}
          />
        </mesh>
        <mesh
          geometry={pageArchGeometry}
          position={[0, 0.6, 0]}
          scale={[-1, 1, 1]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#F7F3EA"
            emissive="#E8A33D"
            emissiveIntensity={finaleAnimating ? 0.55 : nearLibraryBook ? 0.18 : 0}
            roughness={0.62}
          />
        </mesh>

        {/* Animated turning pages when standing before the book monument */}
        <group ref={flipPage1Ref} position={[0, 0.74, 0]} visible={false}>
          <mesh position={[0.88, 0, 0]}>
            <boxGeometry args={[1.76, 0.02, 2.2]} />
            <meshStandardMaterial
              color="#F7F3EA"
              emissive="#E8A33D"
              emissiveIntensity={0.2}
              roughness={0.55}
            />
          </mesh>
        </group>
        <group ref={flipPage2Ref} position={[0, 0.74, 0]} visible={false}>
          <mesh position={[0.88, 0, 0]}>
            <boxGeometry args={[1.76, 0.02, 2.2]} />
            <meshStandardMaterial
              color="#ECE4D3"
              emissive="#E8A33D"
              emissiveIntensity={0.15}
              roughness={0.55}
            />
          </mesh>
        </group>

        {/* Amber Bookmark Ribbon */}
        <mesh position={[0.14, 0.72, 0.9]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[0.14, 0.04, 1.1]} />
          <meshStandardMaterial
            color="#E8A33D"
            emissive="#E8A33D"
            emissiveIntensity={finaleAnimating ? 1.2 : 0.4}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* Reading desk & stacked books */}
      <group position={[-2.9, 0.36, 0.8]} rotation={[0, 0.55, 0]}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[1.1, 0.08, 0.7]} />
          <meshStandardMaterial color="#7C563B" roughness={0.82} />
        </mesh>
        <mesh position={[-0.45, 0.18, -0.25]}>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
          <meshStandardMaterial color="#4A3222" roughness={0.9} />
        </mesh>
        <mesh position={[0.45, 0.18, -0.25]}>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
          <meshStandardMaterial color="#4A3222" roughness={0.9} />
        </mesh>
        <mesh position={[-0.45, 0.18, 0.25]}>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
          <meshStandardMaterial color="#4A3222" roughness={0.9} />
        </mesh>
        <mesh position={[0.45, 0.18, 0.25]}>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
          <meshStandardMaterial color="#4A3222" roughness={0.9} />
        </mesh>
        {/* Stacked small books */}
        <mesh position={[-0.22, 0.45, 0.05]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.34, 0.1, 0.26]} />
          <meshStandardMaterial color="#236B67" roughness={0.7} />
        </mesh>
        <mesh position={[-0.2, 0.54, 0.04]} rotation={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.08, 0.22]} />
          <meshStandardMaterial color="#E8A33D" roughness={0.6} />
        </mesh>
      </group>

      {/* Trees & Lanterns */}
      <LowPolyTree position={[3.3, 0.35, 0.8]} scale={1.05} tint="#236B67" />
      <LowPolyTree position={[-3.6, 0.35, -1.8]} scale={0.9} tint="#2E7469" />
      <LanternPost position={[-2.2, 0.35, 2.8]} />
      <LanternPost position={[2.4, 0.35, 2.7]} />

      {/* Pier to dock */}
      <WoodenPier
        start={[0.2, 0, 3.8]}
        end={[island.dockPosition[0] - x, 0, island.dockPosition[2] - z]}
      />

      <WritingLandmark
        position={writingLocal}
        isCurrentIsland={isCurrent}
        onClick={() => (isCurrent ? onOpenWriting() : onSelectIsland())}
      />

      <IslandLabel
        island={island}
        isCurrent={isCurrent}
        hideLabels={hideLabels}
        height={4.4}
        onSelectIsland={onSelectIsland}
      />
    </group>
  );
}
