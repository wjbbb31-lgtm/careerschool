import { useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { HairStyleId, IslandId } from '../../types/game';
import { WorldScene } from './WorldScene';

interface WorldCanvasProps {
  hairStyle: HairStyleId;
  outfitColor: string;
  currentIslandId: IslandId;
  sailingTargetId: IslandId | null;
  lowSpec: boolean;
  isTouchDevice: boolean;
  isSoftwareGl: boolean;
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
  onContextLost: () => void;
}

export function WorldCanvas({
  hairStyle,
  outfitColor,
  currentIslandId,
  sailingTargetId,
  lowSpec,
  isTouchDevice,
  isSoftwareGl,
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
  onContextLost,
}: WorldCanvasProps) {
  const [contextLost, setContextLost] = useState(false);

  const shadowsEnabled = !lowSpec && !isTouchDevice && !isSoftwareGl;
  const maxDpr = lowSpec ? 1 : 1.5;

  const handleCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      const canvas = gl.domElement;
      canvas.addEventListener(
        'webglcontextlost',
        (e) => {
          e.preventDefault();
          setContextLost(true);
          onContextLost();
        },
        false,
      );
      canvas.addEventListener(
        'webglcontextrestored',
        () => {
          setContextLost(false);
        },
        false,
      );
    },
    [onContextLost],
  );

  // Blur & dim 3D world while WritingBox or modals are open and disable pointer interactions
  const writingBackdropClass = isWritingOpen
    ? lowSpec
      ? 'opacity-45 pointer-events-none'
      : 'blur-[6px] brightness-75 pointer-events-none scale-[1.01]'
    : 'opacity-100';

  return (
    <div
      className={`fixed inset-0 w-full h-full transition-[filter,opacity,transform] duration-300 ease-out no-print ${writingBackdropClass}`}
    >
      {!contextLost && (
        <Canvas
          dpr={[1, maxDpr]}
          shadows={shadowsEnabled}
          camera={{ fov: 46, near: 0.2, far: 250, position: [1.8, 5.4, 10.4] }}
          gl={{
            antialias: !lowSpec && !isSoftwareGl,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          onCreated={handleCreated}
        >
          <WorldScene
            hairStyle={hairStyle}
            outfitColor={outfitColor}
            currentIslandId={currentIslandId}
            sailingTargetId={sailingTargetId}
            lowSpec={lowSpec}
            shadowsEnabled={shadowsEnabled}
            isWritingOpen={isWritingOpen}
            showStartScreen={showStartScreen}
            ch3Completed={ch3Completed}
            finaleAnimating={finaleAnimating}
            onArriveIsland={onArriveIsland}
            onSelectIsland={onSelectIsland}
            onOpenWriting={onOpenWriting}
            onOpenChapter3Bottle={onOpenChapter3Bottle}
            onOpenChapter4Book={onOpenChapter4Book}
            onNearLibraryBookChange={onNearLibraryBookChange}
            onFinaleAnimationComplete={onFinaleAnimationComplete}
          />
        </Canvas>
      )}
    </div>
  );
}
