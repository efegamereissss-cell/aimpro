import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '../../store/useSettingsStore';

// High-Definition Procedural Canvas Textures for AAA Tactical Arena
function createArenaTexture(
  theme: 'cyber' | 'valorant' | 'tactical' | 'dark',
  type: 'floor' | 'wall' | 'trim' | 'crate'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  if (type === 'floor') {
    if (theme === 'valorant') {
      // Valorant Ascent Warm Stone Paver
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#3a475c';
      for (let i = 0; i < 15000; i++) {
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
      }
      ctx.strokeStyle = '#1a202c';
      ctx.lineWidth = 4;
      const size = 256;
      for (let x = 0; x <= 1024; x += size) {
        ctx.strokeRect(x, 0, size, 1024);
        ctx.strokeRect(0, x, 1024, size);
      }
    } else if (theme === 'tactical') {
      // CS2 Dust Sandstone Paver
      ctx.fillStyle = '#3c3226';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#4a3e30';
      for (let i = 0; i < 20000; i++) {
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
      }
      ctx.strokeStyle = '#282118';
      ctx.lineWidth = 6;
      for (let x = 0; x <= 1024; x += 256) {
        ctx.strokeRect(x, 0, 256, 1024);
        ctx.strokeRect(0, x, 1024, 256);
      }
    } else if (theme === 'dark') {
      // Abyss Minimal Pitch Black
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 1024; x += 128) {
        ctx.strokeRect(x, 0, 128, 1024);
        ctx.strokeRect(0, x, 1024, 128);
      }
    } else {
      // Cyber Neon Paver
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 12000; i++) {
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
      }
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 4;
      for (let x = 0; x <= 1024; x += 256) {
        ctx.strokeRect(x, 0, 256, 1024);
        ctx.strokeRect(0, x, 1024, 256);
      }
      // Glowing Cyan Dots
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      for (let x = 0; x <= 1024; x += 256) {
        for (let y = 0; y <= 1024; y += 256) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else if (type === 'wall') {
    if (theme === 'valorant') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#3f4f66';
      for (let i = 0; i < 9000; i++) ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    } else if (theme === 'tactical') {
      ctx.fillStyle = '#44382b';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#544636';
      for (let i = 0; i < 12000; i++) ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    } else if (theme === 'dark') {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, 1024, 1024);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#293548';
      for (let i = 0; i < 8000; i++) ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
  } else {
    // Crate Texture
    ctx.fillStyle = theme === 'tactical' ? '#5c4830' : '#1e293b';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = theme === 'tactical' ? '#3c2e1e' : '#00f0ff';
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, 944, 944);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(80, 80, 864, 864);
    ctx.fillStyle = theme === 'tactical' ? '#e2d3b5' : '#00f0ff';
    ctx.font = 'bold 64px monospace';
    ctx.fillText('AIMPRO // SPEC', 120, 200);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  return texture;
}

export const Arena: React.FC = () => {
  const arenaThemeSetting = useSettingsStore(state => state.settings.video.arenaTheme) || 'cyber';
  const particlesRef = useRef<THREE.Points>(null);

  const activeTheme: 'cyber' | 'valorant' | 'tactical' | 'dark' =
    arenaThemeSetting === 'tactical'
      ? 'tactical'
      : arenaThemeSetting === 'studio'
      ? 'valorant'
      : arenaThemeSetting === 'dark'
      ? 'dark'
      : 'cyber';

  const textures = useMemo(() => {
    const floor = createArenaTexture(activeTheme, 'floor');
    floor.repeat.set(16, 16);
    const wall = createArenaTexture(activeTheme, 'wall');
    wall.repeat.set(8, 4);
    const crate = createArenaTexture(activeTheme, 'crate');
    return { floor, wall, crate };
  }, [activeTheme]);

  // Floating Ambient Volumetric Particles
  const particleData = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = Math.random() * 16 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 32;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= delta * 0.25;
        positions[i * 3] += Math.sin(time * 0.5 + i) * 0.003;
        if (positions[i * 3 + 1] < 0.5) {
          positions[i * 3 + 1] = 16.5;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const neonColor =
    activeTheme === 'tactical'
      ? '#f59e0b'
      : activeTheme === 'valorant'
      ? '#38bdf8'
      : activeTheme === 'dark'
      ? '#00f0ff'
      : '#00f0ff';

  const fogColor =
    activeTheme === 'tactical'
      ? '#1f1912'
      : activeTheme === 'valorant'
      ? '#0f172a'
      : activeTheme === 'dark'
      ? '#020408'
      : '#070a12';

  return (
    <group>
      {/* Dynamic Atmospheric Fog */}
      <fog attach="fog" args={[fogColor, 22, 75]} />

      {/* 1. Main Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          map={textures.floor}
          roughness={0.65}
          metalness={0.2}
          color="#ffffff"
        />
      </mesh>

      {/* 2. Target Shooting Area Floor Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -10]} receiveShadow>
        <planeGeometry args={[44, 22]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* 3. Distance Range Markers */}
      {[-5, -10, -15, -20].map(z => (
        <group key={z} position={[0, 0.015, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[36, 0.08]} />
            <meshBasicMaterial color={neonColor} transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {/* 4. Center Primary Target Wall */}
      <mesh position={[0, 11, -16]} receiveShadow>
        <planeGeometry args={[46, 22]} />
        <meshStandardMaterial map={textures.wall} roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Wall Recessed Ambient Neon LED Strip */}
      <mesh position={[0, 21.8, -15.8]}>
        <boxGeometry args={[46, 0.12, 0.15]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
      <mesh position={[0, 0.2, -15.8]}>
        <boxGeometry args={[46, 0.12, 0.15]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* 5. Left & Right Tactical Walls */}
      <mesh position={[-23, 11, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial map={textures.wall} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[23, 11, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial map={textures.wall} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 6. Back Arena Wall */}
      <mesh position={[0, 11, 16]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[46, 22]} />
        <meshStandardMaterial map={textures.wall} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 7. Corner Architectural Columns with Vertical LED Accents */}
      {[
        [-22.8, -15.8],
        [22.8, -15.8],
        [-22.8, 15.8],
        [22.8, 15.8]
      ].map(([x, z], idx) => (
        <group key={idx} position={[x, 11, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 22, 1.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.88} />
          </mesh>
          <mesh position={[0, 0, 0.82]}>
            <boxGeometry args={[0.08, 21.6, 0.05]} />
            <meshBasicMaterial color={neonColor} />
          </mesh>
        </group>
      ))}

      {/* 8. Tactical Corner Crates & Peeking Covers (Crucial for Bot Duels) */}
      <group position={[-14, 0, -10]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={textures.crate} roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[2.2, 1.0, 0.2]} rotation={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={textures.crate} roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0.8, 3.0, 0.1]} rotation={[0, -0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={textures.crate} roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      <group position={[14, 0, -10]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={textures.crate} roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[-2.2, 1.0, 0.2]} rotation={[0, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={textures.crate} roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      {/* 9. Atmospheric Volumetric Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={neonColor} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};
