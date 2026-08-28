import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

export const Arena: React.FC = () => {
  const arenaTheme = useSettingsStore(state => state.settings.video.arenaTheme);

  const colors = useMemo(() => {
    switch (arenaTheme) {
      case 'studio':
        return {
          floor: '#1a1e29',
          grid: '#2a344d',
          walls: '#121620',
          accent: '#00f0ff',
          fog: '#0e111a'
        };
      case 'tactical':
        return {
          floor: '#1c1c1c',
          grid: '#333333',
          walls: '#141414',
          accent: '#ffb700',
          fog: '#111111'
        };
      case 'synthwave':
        return {
          floor: '#14092b',
          grid: '#ff007f',
          walls: '#0d041a',
          accent: '#00f0ff',
          fog: '#080212'
        };
      case 'dark':
        return {
          floor: '#0a0a0a',
          grid: '#181818',
          walls: '#050505',
          accent: '#555555',
          fog: '#020202'
        };
      case 'cyber':
      default:
        return {
          floor: '#0c101d',
          grid: '#1e2946',
          walls: '#080a14',
          accent: '#00f0ff',
          fog: '#060810'
        };
    }
  }, [arenaTheme]);

  return (
    <group>
      {/* Atmosphere Fog */}
      <fog attach="fog" args={[colors.fog, 20, 60]} />

      {/* Main Ground Floor with Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={colors.floor} roughness={0.7} metalness={0.2} />
      </mesh>
      <gridHelper args={[60, 60, colors.accent, colors.grid]} position={[0, 0, 0]} />

      {/* Arena Front Backwall (Target Backboard) */}
      <mesh position={[0, 10, -15]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color={colors.walls} roughness={0.8} />
      </mesh>
      {/* Front Wall Grid Accent */}
      <group position={[0, 10, -14.95]}>
        <gridHelper args={[40, 20, colors.accent, colors.grid]} rotation={[Math.PI / 2, 0, 0]} />
      </group>

      {/* Back Wall (Behind Player) */}
      <mesh position={[0, 10, 15]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color={colors.walls} roughness={0.9} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-20, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={colors.walls} roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[20, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color={colors.walls} roughness={0.9} />
      </mesh>

      {/* Ceiling Accent Frame */}
      <mesh position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color={colors.walls} roughness={0.9} />
      </mesh>

      {/* High-Tech Glowing Boundary Strips */}
      <mesh position={[0, 0.05, -14.8]}>
        <boxGeometry args={[40, 0.1, 0.2]} />
        <meshBasicMaterial color={colors.accent} />
      </mesh>
      <mesh position={[-19.8, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.1, 30]} />
        <meshBasicMaterial color={colors.accent} />
      </mesh>
      <mesh position={[19.8, 0.05, 0]}>
        <boxGeometry args={[0.2, 0.1, 30]} />
        <meshBasicMaterial color={colors.accent} />
      </mesh>

      {/* Target Arena Focus Light Markers */}
      <pointLight position={[0, 12, -8]} intensity={1.8} color={colors.accent} distance={30} />
      <pointLight position={[0, 6, 0]} intensity={1.2} color="#ffffff" distance={25} />
    </group>
  );
};
