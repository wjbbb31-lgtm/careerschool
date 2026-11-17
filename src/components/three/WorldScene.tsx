import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getIslandById } from '../../data/islands';
import { HairStyleId, IslandId } from '../../types/game';
import { Islands } from './Islands';
import { MagicBook3D } from './MagicBook3D';
import { StudentAvatar } from './StudentAvatar';
import { TwilightSkyAndSea } from './TwilightSkyAndSea';
import { WoodenBoat } from './WoodenBoat';

interface WorldSceneProps {
  hairStyle: HairStyleId;
  outfitColor: string;
  currentIslandId: IslandId;
  sailingTargetId: IslandId | null;
  lowSpec: boolean;
  shadowsEnabled: boolean;
  isWritingOpen: boolean;
  showStartScreen: boolean;
  ch3Completed: boolean;
  finaleAnimating: boolean;
  onArriveIsland: (islandId: IslandId) => void;
  onSelectIsland: (islandId: IslandId) => void;
  onOpenWriting: (islandId: IslandId) => void;
  onOpenChapter3Bottle: () => void;
  onOpenChapter4Book: () => void;
  onNearLibraryBookChange: (near: boolean) => void;
  onFinaleAnimationComplete: () => void;
}

// Pre-allocated math helpers (zero GC inside useFrame)
const _desiredCamPos = new THREE.Vector3();
const _desiredLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.2, 0);
const _moveVec = new THREE.Vector3();
const _boatPos = new THREE.Vector3();
const _boatNextPos = new THREE.Vector3();
const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _p2 = new THREE.Vector3();

function clampToIslandWalkable(islandId: IslandId, pos: THREE.Vector3) {
  const island = getIslandById(islandId);
  const cx = island.position[0];
  const cz = island.position[2];
  let dx = pos.x - cx;
  let dz = pos.z - cz;
  let dist = Math.hypot(dx, dz);

  const maxR = island.walkRadius;
  const minR = island.walkInnerRadius ?? 0;

  if (dist < 0.0001) {
    if (minR > 0) {
      dx = minR;
      dz = 0;
      dist = minR;
    }
  }

  if (dist > maxR) {
    const scale = maxR / dist;
    dx *= scale;
    dz *= scale;
  } else if (minR > 0 && dist < minR) {
    const scale = minR / dist;
    dx *= scale;
    dz *= scale;
  }

  // Keep character on the crescent shoal for Serendipity Island
  if (islandId === 'serendipity') {
    // Shape angle before rotateX(-PI/2): atan2(-dz, dx) in [-0.56*PI, 1.24*PI]
    // Clamp slightly inside [-0.50*PI, 1.18*PI]
    let shapeAngle = Math.atan2(-dz, dx);
    if (shapeAngle < -Math.PI * 0.7) {
      shapeAngle += Math.PI * 2;
    }
    const minAngle = -Math.PI * 0.5;
    const maxAngle = Math.PI * 1.18;
    if (shapeAngle < minAngle) shapeAngle = minAngle;
    if (shapeAngle > maxAngle) shapeAngle = maxAngle;
    const clampedDist = THREE.MathUtils.clamp(Math.hypot(dx, dz), minR, maxR);
    dx = Math.cos(shapeAngle) * clampedDist;
    dz = -Math.sin(shapeAngle) * clampedDist;
  }

  pos.x = cx + dx;
  pos.z = cz + dz;
  pos.y = 0.35;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function evalQuadBezier(p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, t: number, out: THREE.Vector3) {
  const u = 1 - t;
  out.set(
    u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    0,
    u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z,
  );
}

export function WorldScene({
  hairStyle,
  outfitColor,
  currentIslandId,
  sailingTargetId,
  lowSpec,
  shadowsEnabled,
  isWritingOpen,
  showStartScreen,
  ch3Completed,
  finaleAnimating,
  onArriveIsland,
  onSelectIsland,
  onOpenWriting,
  onOpenChapter3Bottle,
  onOpenChapter4Book,
  onNearLibraryBookChange,
  onFinaleAnimationComplete,
}: WorldSceneProps) {
  const { camera } = useThree();
  const playerGroupRef = useRef<THREE.Group>(null);
  const boatGroupRef = useRef<THREE.Group>(null);
  const targetRingRef = useRef<THREE.Mesh>(null);

  const playerPosRef = useRef(new THREE.Vector3(0, 0.35, 1.6));
  const playerYawRef = useRef(0);
  const walkTargetRef = useRef<THREE.Vector3 | null>(null);
  const isMovingRef = useRef(false);
  const keysRef = useRef<Record<string, boolean>>({});
  const ringTimerRef = useRef(0);
  const nearBookRef = useRef(false);
  const [nearLibraryBook, setNearLibraryBook] = useState(false);

  // Sailing state
  const sailProgressRef = useRef(0);
  const sailFromIdRef = useRef<IslandId>(currentIslandId);
  const isSailing = sailingTargetId !== null;
  const [renderSeatedInBoat, setRenderSeatedInBoat] = useState(false);

  // Start / stop sailing when sailingTargetId changes
  useEffect(() => {
    if (sailingTargetId) {
      sailFromIdRef.current = currentIslandId;
      sailProgressRef.current = 0;
      walkTargetRef.current = null;
      isMovingRef.current = false;
      setRenderSeatedInBoat(true);
    } else {
      setRenderSeatedInBoat(false);
    }
  }, [sailingTargetId, currentIslandId]);

  // Place docked boat cleanly at current island dock on mount or arrival
  useEffect(() => {
    if (!sailingTargetId && boatGroupRef.current) {
      const dock = getIslandById(currentIslandId).dockPosition;
      boatGroupRef.current.position.set(dock[0], 0, dock[2]);
      const center = getIslandById(currentIslandId).position;
      boatGroupRef.current.rotation.y = Math.atan2(dock[0] - center[0], dock[2] - center[2]);
    }
  }, [currentIslandId, sailingTargetId]);

  // Position player gracefully before the giant open book monument during finale animation
  useEffect(() => {
    if (finaleAnimating) {
      walkTargetRef.current = null;
      isMovingRef.current = false;
      playerPosRef.current.set(1.0, 0.35, -29.2);
      playerYawRef.current = Math.PI * 0.85;
      if (playerGroupRef.current) {
        playerGroupRef.current.position.copy(playerPosRef.current);
        playerGroupRef.current.rotation.y = playerYawRef.current;
      }
    }
  }, [finaleAnimating]);

  // Keyboard listeners for WASD & Arrow keys
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      keysRef.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    const onBlur = () => {
      keysRef.current = {};
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Clear keys when writing or start screen opens
  useEffect(() => {
    if (isWritingOpen || showStartScreen) {
      keysRef.current = {};
      walkTargetRef.current = null;
      isMovingRef.current = false;
    }
  }, [isWritingOpen, showStartScreen]);

  const handleGroundClick = (point: THREE.Vector3) => {
    if (isWritingOpen || showStartScreen || isSailing) return;
    const clamped = point.clone();
    clampToIslandWalkable(currentIslandId, clamped);
    walkTargetRef.current = clamped;
    ringTimerRef.current = 0.75;
    if (targetRingRef.current) {
      targetRingRef.current.position.set(clamped.x, 0.4, clamped.z);
      targetRingRef.current.visible = true;
    }
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    if (sailingTargetId) {
      // Sailing animation between docks
      const fromIsland = getIslandById(sailFromIdRef.current);
      const toIsland = getIslandById(sailingTargetId);

      _p0.set(fromIsland.dockPosition[0], 0, fromIsland.dockPosition[2]);
      _p2.set(toIsland.dockPosition[0], 0, toIsland.dockPosition[2]);

      // Offset midpoint outward into open sea to avoid grazing islands
      const midX = (_p0.x + _p2.x) * 0.5;
      const midZ = (_p0.z + _p2.z) * 0.5;
      const dirX = _p2.x - _p0.x;
      const dirZ = _p2.z - _p0.z;
      _p1.set(midX - dirZ * 0.16, 0, midZ + dirX * 0.16);

      const sailDuration = 2.6;
      sailProgressRef.current = Math.min(1, sailProgressRef.current + dt / sailDuration);
      const easedT = easeInOutCubic(sailProgressRef.current);

      evalQuadBezier(_p0, _p1, _p2, easedT, _boatPos);
      evalQuadBezier(_p0, _p1, _p2, Math.min(1, easedT + 0.02), _boatNextPos);

      if (boatGroupRef.current) {
        boatGroupRef.current.position.copy(_boatPos);
        const dx = _boatNextPos.x - _boatPos.x;
        const dz = _boatNextPos.z - _boatPos.z;
        if (dx * dx + dz * dz > 0.00001) {
          const targetAngle = Math.atan2(dx, dz);
          const diff = Math.atan2(
            Math.sin(targetAngle - boatGroupRef.current.rotation.y),
            Math.cos(targetAngle - boatGroupRef.current.rotation.y),
          );
          boatGroupRef.current.rotation.y += diff * Math.min(1, dt * 8);
        }
      }

      // Camera follows boat smoothly
      _desiredCamPos.set(_boatPos.x + 2, 8.6, _boatPos.z + 12.6);
      _desiredLookAt.set(_boatPos.x, 0.9, _boatPos.z);

      if (sailProgressRef.current >= 1) {
        const landing = toIsland.landingPosition;
        playerPosRef.current.set(landing[0], landing[1], landing[2]);
        playerYawRef.current = Math.atan2(
          toIsland.position[0] - landing[0],
          toIsland.position[2] - landing[2],
        );
        if (playerGroupRef.current) {
          playerGroupRef.current.position.copy(playerPosRef.current);
          playerGroupRef.current.rotation.y = playerYawRef.current;
        }
        onArriveIsland(sailingTargetId);
      }
    } else {
      // Walking on current island
      const controlsDisabled = isWritingOpen || showStartScreen;
      let moveX = 0;
      let moveZ = 0;

      if (!controlsDisabled) {
        const keys = keysRef.current;
        if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
      }

      if (!controlsDisabled && (moveX !== 0 || moveZ !== 0)) {
        // Keyboard input cancels click-to-walk target
        walkTargetRef.current = null;
        _moveVec.set(moveX, 0, moveZ).normalize();
        const speed = 4.6;
        playerPosRef.current.addScaledVector(_moveVec, speed * dt);
        clampToIslandWalkable(currentIslandId, playerPosRef.current);

        const targetYaw = Math.atan2(_moveVec.x, _moveVec.z);
        const diff = Math.atan2(
          Math.sin(targetYaw - playerYawRef.current),
          Math.cos(targetYaw - playerYawRef.current),
        );
        playerYawRef.current += diff * Math.min(1, dt * 12);
        isMovingRef.current = true;
      } else if (!controlsDisabled && walkTargetRef.current) {
        _moveVec.subVectors(walkTargetRef.current, playerPosRef.current);
        _moveVec.y = 0;
        const dist = _moveVec.length();
        if (dist < 0.14) {
          walkTargetRef.current = null;
          isMovingRef.current = false;
        } else {
          _moveVec.normalize();
          const speed = 4.4;
          playerPosRef.current.addScaledVector(_moveVec, Math.min(dist, speed * dt));
          clampToIslandWalkable(currentIslandId, playerPosRef.current);

          const targetYaw = Math.atan2(_moveVec.x, _moveVec.z);
          const diff = Math.atan2(
            Math.sin(targetYaw - playerYawRef.current),
            Math.cos(targetYaw - playerYawRef.current),
          );
          playerYawRef.current += diff * Math.min(1, dt * 12);
          isMovingRef.current = true;
        }
      } else {
        isMovingRef.current = false;
      }

      if (playerGroupRef.current) {
        playerGroupRef.current.position.copy(playerPosRef.current);
        playerGroupRef.current.rotation.y = playerYawRef.current;
      }

      // Proximity check for Library Island Giant Book Monument
      const isNearBookNow =
        currentIslandId === 'library' &&
        !isSailing &&
        Math.hypot(playerPosRef.current.x - 1.0, playerPosRef.current.z - -32.35) < 3.9;
      if (isNearBookNow !== nearBookRef.current) {
        nearBookRef.current = isNearBookNow;
        setNearLibraryBook(isNearBookNow);
        onNearLibraryBookChange(isNearBookNow);
      }

      // Target click ring fade
      if (targetRingRef.current) {
        if (ringTimerRef.current > 0) {
          ringTimerRef.current = Math.max(0, ringTimerRef.current - dt);
          const s = 0.7 + (1 - ringTimerRef.current / 0.75) * 0.55;
          targetRingRef.current.scale.set(s, s, 1);
          const mat = targetRingRef.current.material as THREE.MeshBasicMaterial;
          mat.opacity = (ringTimerRef.current / 0.75) * 0.85;
          if (ringTimerRef.current === 0) targetRingRef.current.visible = false;
        }
      }

      if (finaleAnimating) {
        // Frame student and descending 3D book in front of the glowing monument
        _desiredCamPos.set(
          playerPosRef.current.x + 1.3,
          3.1,
          playerPosRef.current.z + 3.5,
        );
        _desiredLookAt.set(
          playerPosRef.current.x,
          1.35,
          playerPosRef.current.z - 0.85,
        );
      } else if (showStartScreen) {
        // Gentle scenic framing behind start screen
        _desiredCamPos.set(playerPosRef.current.x + 1.8, 5.4, playerPosRef.current.z + 8.8);
        _desiredLookAt.set(playerPosRef.current.x - 1.2, 1.35, playerPosRef.current.z - 2.0);
      } else {
        _desiredCamPos.set(playerPosRef.current.x, 7.6, playerPosRef.current.z + 10.6);
        _desiredLookAt.set(playerPosRef.current.x, 1.15, playerPosRef.current.z);
      }
    }

    // Smooth 3rd-person camera damping
    camera.position.x = THREE.MathUtils.damp(camera.position.x, _desiredCamPos.x, 5.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _desiredCamPos.y, 5.2, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _desiredCamPos.z, 5.2, dt);

    _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _desiredLookAt.x, 6.2, dt);
    _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _desiredLookAt.y, 6.2, dt);
    _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _desiredLookAt.z, 6.2, dt);
    camera.lookAt(_currentLookAt);
  });

  return (
    <>
      <color attach="background" args={['#172033']} />
      <fogExp2 attach="fog" args={['#172033', 0.012]} />

      {/* Strictly 3 lights for Chromebook/tablet smoothness */}
      <hemisphereLight args={['#758AB8', '#172033', 0.92]} />
      <directionalLight
        position={[24, 28, 16]}
        intensity={1.5}
        color="#F3BE70"
        castShadow={shadowsEnabled}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-18, 10, -26]} intensity={0.48} color="#4A9A94" />

      <TwilightSkyAndSea lowSpec={lowSpec} />

      <Islands
        currentIslandId={currentIslandId}
        isSailing={isSailing}
        hideLabels={showStartScreen || isWritingOpen || finaleAnimating}
        ch3Completed={ch3Completed}
        nearLibraryBook={nearLibraryBook}
        finaleAnimating={finaleAnimating}
        onGroundClick={handleGroundClick}
        onIslandSelect={onSelectIsland}
        onOpenWriting={onOpenWriting}
        onOpenChapter3Bottle={onOpenChapter3Bottle}
        onOpenChapter4Book={onOpenChapter4Book}
      />

      {/* Descending 3D Book for Finale */}
      <MagicBook3D
        active={finaleAnimating}
        startPosition={[1.0, 2.7, -32.2]}
        targetPosition={[0.68, 1.38, -29.75]}
        onAnimationComplete={onFinaleAnimationComplete}
      />

      {/* Click-to-walk ground target ring */}
      <mesh ref={targetRingRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.24, 0.38, 18]} />
        <meshBasicMaterial color="#E8A33D" transparent opacity={0.8} depthWrite={false} />
      </mesh>

      {/* Wooden Boat */}
      <group ref={boatGroupRef}>
        <WoodenBoat>
          {renderSeatedInBoat && (
            <StudentAvatar
              hairStyle={hairStyle}
              outfitColor={outfitColor}
              isMovingRef={isMovingRef}
              isSitting
            />
          )}
        </WoodenBoat>
      </group>

      {/* Walking Student Avatar on Island */}
      <group
        ref={playerGroupRef}
        position={[0, 0.35, 1.6]}
        visible={!renderSeatedInBoat}
      >
        <StudentAvatar
          hairStyle={hairStyle}
          outfitColor={outfitColor}
          isMovingRef={isMovingRef}
        />
      </group>
    </>
  );
}
