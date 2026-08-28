import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

// Procedural Canvas Texture Generator for High-End Carbon Fiber / Titanium Studio Panels
function createProceduralStudioTexture(type: 'carbon' | 'wall' | 'floor'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (type === 'carbon') {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#131926';
    const size = 16;
    for (let y = 0; y < 512; y += size) {
      for (let x = 0; x < 512; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  } else if (type === 'floor') {
    ctx.fillStyle = '#06080e';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 512, 512);
  } else {
    ctx.fillStyle = '#080a11';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 512; i += 6) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(type === 'floor' ? 24 : 12, type === 'floor' ? 24 : 12);
  texture.anisotropy = 16;
  return texture;
}

export const Arena: React.FC = () => {
  const arenaTheme = useSettingsStore(state => state.settings.video.arenaTheme);

  // Motorized component refs
  const scanlineRef = useRef<THREE.Mesh>(null);
  const gantryRef = useRef<THREE.Group>(null);
  const gyroGroupRef = useRef<THREE.Group>(null);
  const hexPanelsGroupRef = useRef<THREE.Group>(null);

  const textures = useMemo(() => ({
    floor: createProceduralStudioTexture('floor'),
    carbon: createProceduralStudioTexture('carbon'),
    wall: createProceduralStudioTexture('wall')
  }), []);

  const themeConfig = useMemo(() => {
    switch (arenaTheme) {
      case 'studio':
        return {
          floorColor: '#141822',
          wallColor: '#0e111a',
          pillarColor: '#1a202c',
          accent: '#00f0ff',
          neonSecondary: '#7928ca',
          fogColor: '#090c12',
          metalness: 0.88,
          roughness: 0.16
        };
      case 'tactical':
        return {
          floorColor: '#121214',
          wallColor: '#0a0a0c',
          pillarColor: '#18181c',
          accent: '#ffb700',
          neonSecondary: '#ff3366',
          fogColor: '#070708',
          metalness: 0.92,
          roughness: 0.2
        };
      case 'synthwave':
        return {
          floorColor: '#16082e',
          wallColor: '#0c021a',
          pillarColor: '#220d48',
          accent: '#00f0ff',
          neonSecondary: '#ff007f',
          fogColor: '#06010f',
          metalness: 0.82,
          roughness: 0.14
        };
      case 'dark':
        return {
          floorColor: '#08090c',
          wallColor: '#030406',
          pillarColor: '#0f1116',
          accent: '#64748b',
          neonSecondary: '#334155',
          fogColor: '#020203',
          metalness: 0.94,
          roughness: 0.24
        };
      case 'cyber':
      default:
        return {
          floorColor: '#070a14',
          wallColor: '#05070e',
          pillarColor: '#0f172a',
          accent: '#00f0ff',
          neonSecondary: '#ff007f',
          fogColor: '#030408',
          metalness: 0.9,
          roughness: 0.15
        };
    }
  }, [arenaTheme]);

  // Frame animations for motorized machinery
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Moving Laser Scanline sweeping down the back wall
    if (scanlineRef.current) {
      scanlineRef.current.position.y = 11 + Math.sin(t * 1.2) * 8.5;
    }

    // 2. Motorized Overhead Gantry Crane carriage moving along ceiling rails
    if (gantryRef.current) {
      gantryRef.current.position.x = Math.sin(t * 0.4) * 12.0;
    }

    // 3. Motorized Gyro containment reactors in 4 corners
    if (gyroGroupRef.current) {
      gyroGroupRef.current.children.forEach((pillar, idx) => {
        const ring1 = pillar.getObjectByName('ring1');
        const ring2 = pillar.getObjectByName('ring2');
        const ring3 = pillar.getObjectByName('ring3');
        if (ring1) ring1.rotation.y += delta * (1.5 + idx * 0.2);
        if (ring2) ring2.rotation.x -= delta * (1.8 + idx * 0.2);
        if (ring3) ring3.rotation.z += delta * (1.2 + idx * 0.2);
      });
    }

    // 4. Hydraulic breathing backboard panels
    if (hexPanelsGroupRef.current) {
      hexPanelsGroupRef.current.children.forEach((panel, i) => {
        const offset = Math.sin(t * 1.5 + i * 0.4) * 0.08;
        panel.position.z = -15.8 + offset;
      });
    }
  });

  return (
    <group>
      {/* Volumetric Atmosphere Depth Fog */}
      <fog attach="fog" args={[themeConfig.fogColor, 22, 70]} />

      {/* Main Ground Floor with Reflective PBR Texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[75, 75]} />
        <meshStandardMaterial
          map={textures.floor}
          color={themeConfig.floorColor}
          roughness={themeConfig.roughness}
          metalness={themeConfig.metalness}
        />
      </mesh>

      {/* Razor-Sharp Sub-Millimeter Ground Tactical Grid */}
      <gridHelper
        args={[75, 75, themeConfig.accent, 'rgba(30, 41, 66, 0.45)']}
        position={[0, 0.006, 0]}
      />

      {/* Front Target Wall (Carbon Composite Backboard) */}
      <mesh position={[0, 11, -16]} receiveShadow>
        <planeGeometry args={[46, 24]} />
        <meshStandardMaterial
          map={textures.carbon}
          color={themeConfig.wallColor}
          roughness={0.5}
          metalness={0.6}
        />
      </mesh>

      {/* Front Wall Laser Hologram Grid */}
      <group position={[0, 11, -15.94]}>
        <gridHelper args={[46, 24, themeConfig.accent, 'rgba(30, 41, 66, 0.3)']} rotation={[Math.PI / 2, 0, 0]} />
      </group>

      {/* Motorized Hydraulic Acoustic Wall Panels Grid */}
      <group ref={hexPanelsGroupRef}>
        {[-14, -7, 0, 7, 14].map((px, idx) => (
          <mesh key={idx} position={[px, 11, -15.8]} castShadow receiveShadow>
            <boxGeometry args={[4.8, 14, 0.25]} />
            <meshStandardMaterial
              color={themeConfig.pillarColor}
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* Motorized Vertical Laser Scanline Beam on Backboard */}
      <mesh ref={scanlineRef} position={[0, 11, -15.75]}>
        <boxGeometry args={[45, 0.06, 0.08]} />
        <meshBasicMaterial color={themeConfig.accent} transparent opacity={0.8} />
      </mesh>

      {/* Motorized Overhead Gantry Crane System */}
      <group position={[0, 21.2, -6]}>
        {/* Steel Cross Rails */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[45, 0.4, 0.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Moving Carriage Trolley */}
        <group ref={gantryRef} position={[0, -0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.5, 0.6, 1.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.95} />
          </mesh>
          {/* Warning Flashing Beacon */}
          <pointLight position={[0, -0.4, 0]} color="#ffb700" intensity={2.0} distance={12} />
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#ffb700" />
          </mesh>
        </group>
      </group>

      {/* Left Wall with Architectural Bevelled Panels */}
      <mesh position={[-23, 11, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 24]} />
        <meshStandardMaterial
          map={textures.wall}
          color={themeConfig.wallColor}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>

      {/* Right Wall with Architectural Bevelled Panels */}
      <mesh position={[23, 11, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 24]} />
        <meshStandardMaterial
          map={textures.wall}
          color={themeConfig.wallColor}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>

      {/* Back Wall (Behind Player) */}
      <mesh position={[0, 11, 16]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[46, 24]} />
        <meshStandardMaterial
          map={textures.wall}
          color={themeConfig.wallColor}
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Ceiling Frame & Acoustic Dampeners */}
      <mesh position={[0, 22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[46, 34]} />
        <meshStandardMaterial color={themeConfig.wallColor} roughness={0.9} />
      </mesh>

      {/* 4 Corner Motorized Gyro Plasma Reactor Pillars */}
      <group ref={gyroGroupRef}>
        {[
          [-22.5, -15.5],
          [22.5, -15.5],
          [-22.5, 15.5],
          [22.5, 15.5]
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            {/* Base Pillar Column */}
            <mesh position={[0, 11, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.55, 0.65, 22, 16]} />
              <meshStandardMaterial color={themeConfig.pillarColor} roughness={0.2} metalness={0.88} />
            </mesh>
            {/* Spinning Gyro Ring 1 */}
            <mesh name="ring1" position={[0, 5, 0]}>
              <torusGeometry args={[1.1, 0.04, 16, 32]} />
              <meshStandardMaterial color={themeConfig.accent} emissive={themeConfig.accent} emissiveIntensity={0.6} />
            </mesh>
            {/* Spinning Gyro Ring 2 */}
            <mesh name="ring2" position={[0, 5, 0]}>
              <torusGeometry args={[0.85, 0.035, 16, 32]} />
              <meshStandardMaterial color={themeConfig.neonSecondary} emissive={themeConfig.neonSecondary} emissiveIntensity={0.6} />
            </mesh>
            {/* Spinning Gyro Ring 3 */}
            <mesh name="ring3" position={[0, 5, 0]}>
              <torusGeometry args={[0.6, 0.03, 16, 32]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Inner Floating Plasma Core */}
            <mesh position={[0, 5, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial color={themeConfig.accent} />
            </mesh>
            <pointLight position={[0, 5, 0]} color={themeConfig.accent} intensity={1.5} distance={10} />
          </group>
        ))}
      </group>

      {/* Ultra-Crisp Glowing Neon Runway Border Trims */}
      <mesh position={[0, 0.05, -15.8]}>
        <boxGeometry args={[46, 0.08, 0.12]} />
        <meshBasicMaterial color={themeConfig.accent} />
      </mesh>
      <mesh position={[-22.8, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.08, 32]} />
        <meshBasicMaterial color={themeConfig.accent} />
      </mesh>
      <mesh position={[22.8, 0.05, 0]}>
        <boxGeometry args={[0.12, 0.08, 32]} />
        <meshBasicMaterial color={themeConfig.accent} />
      </mesh>
      <mesh position={[0, 0.05, 15.8]}>
        <boxGeometry args={[46, 0.08, 0.12]} />
        <meshBasicMaterial color={themeConfig.neonSecondary} />
      </mesh>

      {/* Distance Floor Markers (5m, 10m, 15m) */}
      {[-5, -10, -14.5].map((z, idx) => (
        <group key={z} position={[0, 0.02, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[36, 0.05]} />
            <meshBasicMaterial color={themeConfig.accent} transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {/* High-Tech Dynamic Arena Spotlight Rigs */}
      <pointLight position={[0, 15, -7]} intensity={2.5} color={themeConfig.accent} distance={40} />
      <pointLight position={[0, 8, 2]} intensity={1.8} color="#ffffff" distance={30} />
      <pointLight position={[-14, 12, -8]} intensity={1.2} color={themeConfig.neonSecondary} distance={25} />
      <pointLight position={[14, 12, -8]} intensity={1.2} color={themeConfig.accent} distance={25} />
    </group>
  );
};
