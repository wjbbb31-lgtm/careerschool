import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TwilightSkyAndSeaProps {
  lowSpec: boolean;
}

export function TwilightSkyAndSea({ lowSpec }: TwilightSkyAndSeaProps) {
  const starsRef = useRef<THREE.Points>(null);
  const sparklesRef = useRef<THREE.Points>(null);
  const waveUniformRef = useRef({ value: 0 });

  // Custom twilight sunset-to-night sky dome shader
  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uHorizonWarm: { value: new THREE.Color('#7C5248') },
        uHorizonNavy: { value: new THREE.Color('#273352') },
        uZenithNight: { value: new THREE.Color('#101726') },
        uSunDir: { value: new THREE.Vector3(0.55, 0.08, -0.82).normalize() },
      },
      vertexShader: `
        varying vec3 vWorldDir;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldDir = normalize(worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uHorizonWarm;
        uniform vec3 uHorizonNavy;
        uniform vec3 uZenithNight;
        uniform vec3 uSunDir;
        varying vec3 vWorldDir;

        void main() {
          float h = clamp(vWorldDir.y, 0.0, 1.0);
          float sunGlow = pow(max(dot(normalize(vWorldDir), uSunDir), 0.0), 5.0);
          vec3 horizon = mix(uHorizonNavy, uHorizonWarm, 0.35 + sunGlow * 0.65);
          vec3 midSky = mix(horizon, uHorizonNavy, smoothstep(0.0, 0.24, h));
          vec3 finalColor = mix(midSky, uZenithNight, smoothstep(0.18, 0.72, h));
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, []);

  // Ocean geometry rotated once so Y is vertical wave axis
  const oceanGeometry = useMemo(() => {
    const segs = lowSpec ? 26 : 42;
    const geom = new THREE.PlaneGeometry(240, 240, segs, segs);
    geom.rotateX(-Math.PI / 2);
    return geom;
  }, [lowSpec]);

  const oceanMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#1A2B45',
      roughness: 0.34,
      metalness: 0.24,
      flatShading: true,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = waveUniformRef.current;
      shader.vertexShader = `
        uniform float uTime;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float wave1 = sin(transformed.x * 0.19 + uTime * 1.15) * cos(transformed.z * 0.16 + uTime * 0.9);
        float wave2 = sin((transformed.x + transformed.z) * 0.32 - uTime * 1.45);
        transformed.y += wave1 * 0.16 + wave2 * 0.07;
        `,
      );
    };

    return mat;
  }, []);

  // Stars <= 160 (90 in lowSpec)
  const starGeo = useMemo(() => {
    const count = lowSpec ? 90 : 150;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.14 + Math.random() * 0.86); // Upper sky hemisphere
      const r = 135;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [lowSpec]);

  // Sea shimmer / firefly particles <= 70 (total particles <= 220 < 300)
  const sparkleGeo = useMemo(() => {
    const count = lowSpec ? 35 : 70;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 76;
      positions[i * 3 + 1] = 0.25 + Math.random() * 1.8;
      positions[i * 3 + 2] = -14 + (Math.random() - 0.5) * 62;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [lowSpec]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    waveUniformRef.current.value = t;

    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.004;
    }
    if (sparklesRef.current) {
      sparklesRef.current.position.y = Math.sin(t * 0.9) * 0.12;
    }
  });

  return (
    <group>
      {/* Sunset-to-night gradient sky dome */}
      <mesh material={skyMaterial} frustumCulled={false}>
        <sphereGeometry args={[165, 24, 16]} />
      </mesh>

      {/* Soft crescent moon & warm sunset horizon disc */}
      <group position={[-42, 46, -95]}>
        <mesh>
          <sphereGeometry args={[3.4, 16, 12]} />
          <meshBasicMaterial color="#F7F3EA" />
        </mesh>
        <mesh position={[1.1, 0.4, 0.8]}>
          <sphereGeometry args={[3.1, 16, 12]} />
          <meshBasicMaterial color="#162038" />
        </mesh>
      </group>

      {/* Stars */}
      <points ref={starsRef} geometry={starGeo} frustumCulled={false}>
        <pointsMaterial
          color="#F7F3EA"
          size={lowSpec ? 0.65 : 0.72}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Gentle sea / sky sparkles */}
      <points ref={sparklesRef} geometry={sparkleGeo} frustumCulled={false}>
        <pointsMaterial
          color="#E8A33D"
          size={0.28}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Shimmering low-poly sea */}
      <mesh geometry={oceanGeometry} material={oceanMaterial} receiveShadow />
    </group>
  );
}
