import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

// Procedural Canvas Texture Generator for High-End Carbon Fiber / Titanium Studio Panels
function createProceduralStudioTexture(type: 'carbon' | 'wall' | 'floor'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (type === 'carbon') {
    // Carbon fiber weave pattern
    ctx.fillStyle = '#0c0f17';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#141a29';
    const size = 16;
    for (let y = 0; y < 512; y += size) {
      for (let x = 0; x < 512; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  } else if (type === 'floor') {
    // Polished dark tactical tiles
    ctx.fillStyle = '#080b12';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(30, 41, 66, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 512, 512);
  } else {
    // Brushed titanium matte wall
    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

  const textures = useMemo(() => ({
    floor: createProceduralStudioTexture('floor'),
    carbon: createProceduralStudioTexture('carbon'),
    wall: createProceduralStudioTexture('wall')
  }), []);

  const themeConfig = useMemo(() => {
    switch (arenaTheme) {
      case 'studio':
        return {
          floorColor: '#161a24',
          wallColor: '#10131c',
          pillarColor: '#1c2230',
          accent: '#00f0ff',
          neonSecondary: '#7928ca',
          fogColor: '#0c0f16',
          metalness: 0.85,
          roughness: 0.18
        };
      case 'tactical':
        return {
          floorColor: '#141416',
          wallColor: '#0d0d0f',
          pillarColor: '#1a1a1e',
          accent: '#ffb700',
          neonSecondary: '#ff3366',
          fogColor: '#09090a',
          metalness: 0.9,
          roughness: 0.22
        };
      case 'synthwave':
        return {
          floorColor: '#180a33',
          wallColor: '#0e0421',
          pillarColor: '#240f4c',
          accent: '#00f0ff',
          neonSecondary: '#ff007f',
          fogColor: '#070114',
          metalness: 0.8,
          roughness: 0.15
        };
      case 'dark':
        return {
          floorColor: '#090a0d',
          wallColor: '#040507',
          pillarColor: '#111318',
          accent: '#64748b',
          neonSecondary: '#334155',
          fogColor: '#020304',
          metalness: 0.92,
          roughness: 0.25
        };
      case 'cyber':
      default:
        return {
          floorColor: '#090d18',
          wallColor: '#060810',
          pillarColor: '#111827',
          accent: '#00f0ff',
          neonSecondary: '#ff007f',
          fogColor: '#04060c',
          metalness: 0.88,
          roughness: 0.16
        };
    }
  }, [arenaTheme]);

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

      {/* Front Target Wall (High-Tech Carbon Composite Backboard) */}
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

      {/* Left Wall with Architectural Panels */}
      <mesh position={[-23, 11, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 24]} />
        <meshStandardMaterial
          map={textures.wall}
          color={themeConfig.wallColor}
          roughness={0.6}
          metalness={0.5}
        />
      </mesh>

      {/* Right Wall with Architectural Panels */}
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

      {/* Architectural Bevelled Edge Pillars (4 Corners) */}
      {[
        [-22.8, -15.8],
        [22.8, -15.8],
        [-22.8, 15.8],
        [22.8, 15.8]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 11, z]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 22, 0.8]} />
          <meshStandardMaterial color={themeConfig.pillarColor} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

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

      {/* Ceiling Overhead Light Truss Beams */}
      {[-8, 0, 8].map(x => (
        <group key={x} position={[x, 21.5, 0]}>
          <mesh>
            <boxGeometry args={[0.3, 0.2, 32]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.12, 0.04, 30]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

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
