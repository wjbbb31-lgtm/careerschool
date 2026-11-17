import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SheetRowPayload } from '../../utils/sheetClient';
import { TeacherStudyScene } from './TeacherStudyScene';

interface TeacherStudyCanvasProps {
  books: SheetRowPayload[];
  newBookKeys: Set<string>;
  selectedNickname: string | null;
  lowSpec: boolean;
  isTouchDevice: boolean;
  isSoftwareGl: boolean;
  onSelectBook: (row: SheetRowPayload) => void;
}

export function TeacherStudyCanvas({
  books,
  newBookKeys,
  selectedNickname,
  lowSpec,
  isTouchDevice,
  isSoftwareGl,
  onSelectBook,
}: TeacherStudyCanvasProps) {
  const shadowsEnabled = !lowSpec && !isTouchDevice && !isSoftwareGl;
  const maxDpr = lowSpec ? 1 : 1.5;

  return (
    <div className="w-full h-full">
      <Canvas
        dpr={[1, maxDpr]}
        shadows={shadowsEnabled}
        camera={{ fov: 44, near: 0.2, far: 100, position: [3.2, 4.2, 9.8] }}
        gl={{
          antialias: !lowSpec && !isSoftwareGl,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <TeacherStudyScene
          books={books}
          newBookKeys={newBookKeys}
          selectedNickname={selectedNickname}
          isSoftwareGl={isSoftwareGl}
          shadowsEnabled={shadowsEnabled}
          onSelectBook={onSelectBook}
        />
      </Canvas>
    </div>
  );
}
