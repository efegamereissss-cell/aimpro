import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

export const Arena: React.FC = () => {
  const arenaTheme = useSettingsStore(state => state.settings.video.arenaTheme);

  const themeConfig = useMemo(() => {
    switch (arenaTheme) {
      case 'studio':
        return {
          floor: '#161922',
          grid: '#2b3447',
          walls: '#0f121a',
          accent: '#00f0ff',
          neon2: '#7928ca',
          fog: '#0b0d13'
        };
      case 'tactical':
        return {
          floor: '#121214',
          grid: '#2d2d30',
          walls: '#0a0a0c',
          accent: '#ffb700',
          neon2: '#ff3366',
          fog: '#070708'
        };
      case 'synthwave':
        return {
          floor: '#16082e',
          grid: '#ff007f',
          walls: '#0b0219',
          accent: '#00f0ff',
          neon2: '#ff007f',
          fog: '#06010f'
        };
      case 'dark':
        return {
          floor: '#0a0b0e',
          grid: '#181b22',
          walls: '#040507',
          accent: '#475569',
          neon2: '#334155',
          fog: '#020304'
        };
      case 'cyber':
      default:
        return {
          floor: '#080c16',
          grid: '#16233b',
          walls: '#05070d',
          accent: '#00f0ff',
          neon2: '#ff007f',
          fog: '#03050a'
        };
    }
  }, [arenaTheme]);

  return (
    <group>
      {/* Volumetric Atmosphere Fog */}
      <fog attach="fog" args={[themeConfig.fog, 18, 65]} />

      {/* Main Ground Floor with Reflective PBR Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial
          color={themeConfig.floor}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* High-Contrast Tactical Ground Grid */}
      <gridHelper
        args={[70, 70, themeConfig.accent, themeConfig.grid]}
        position={[0, 0.005, 0]}
      />

      {/* Arena Front Backwall (Target Backboard) */}
      <mesh position={[0, 10, -15]} receiveShadow>
        <planeGeometry args={[44, 22]} />
        <meshStandardMaterial color={themeConfig.walls} roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Front Wall Grid Matrix */}
      <group position={[0, 10, -14.94]}>
        <gridHelper args={[44, 22, themeConfig.accent, themeConfig.grid]} rotation={[Math.PI / 2, 0, 0]} />
      </group>

      {/* Arena Back Wall */}
      <mesh position={[0, 10, 15]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[44, 22]} />
        <meshStandardMaterial color={themeConfig.walls} roughness={0.8} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-22, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 22]} />
        <meshStandardMaterial color={themeConfig.walls} roughness={0.8} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[22, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 22]} />
        <meshStandardMaterial color={themeConfig.walls} roughness={0.8} />
      </mesh>

      {/* Ceiling Frame Mesh */}
      <mesh position={[0, 21, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 32]} />
        <meshStandardMaterial color={themeConfig.walls} roughness={0.9} />
      </mesh>

      {/* Glowing Neon Runway Strips */}
      <mesh position={[0, 0.04, -14.8]}>
        <boxGeometry args={[44, 0.08, 0.15]} />
        <meshBasicMaterial color={themeConfig.accent} />
      </mesh>
      <mesh position={[-21.8, 0.04, 0]}>
        <boxGeometry args={[0.15, 0.08, 30]} />
        <meshBasicMaterial color={themeConfig.accent} />
      </mesh>
      <mesh position={[21.8, 0.04, 0]}>
        <boxGeometry args={[0.15, 0.08, 30]} />
        <meshBasicMaterial color={themeConfig.accent} />
      </mesh>
      <mesh position={[0, 0.04, 14.8]}>
        <boxGeometry args={[44, 0.08, 0.15]} />
        <meshBasicMaterial color={themeConfig.neon2} />
      </mesh>

      {/* Center Shooting Box Podium Marker */}
      <group position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.8, 32]} />
          <meshBasicMaterial color={themeConfig.accent} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Distance Measurement Floor Strips (5m, 10m, 15m) */}
      {[-5, -10, -14].map((z, idx) => (
        <group key={z} position={[0, 0.02, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 0.04]} />
            <meshBasicMaterial color={themeConfig.accent} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}

      {/* High-Tech Lighting Rig */}
      <pointLight position={[0, 14, -8]} intensity={2.2} color={themeConfig.accent} distance={35} />
      <pointLight position={[0, 8, 2]} intensity={1.5} color="#ffffff" distance={25} />
      <pointLight position={[-12, 10, -10]} intensity={1.0} color={themeConfig.neon2} distance={20} />
      <pointLight position={[12, 10, -10]} intensity={1.0} color={themeConfig.accent} distance={20} />
    </group>
  );
};
