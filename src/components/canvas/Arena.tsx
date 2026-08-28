import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// High-Definition Procedural Canvas Textures for AAA Tactical Arena
function createArenaTexture(type: 'floor_paver' | 'plaster_wall' | 'carbon_trim' | 'crate_metal'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  if (type === 'floor_paver') {
    // Ultra-clean high-end tactical floor (Polished Stone Paver)
    ctx.fillStyle = '#1e2430';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle stone micro-noise
    ctx.fillStyle = '#252c3b';
    for (let i = 0; i < 12000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      ctx.fillRect(x, y, 2, 2);
    }

    // Clean bevel tile grid
    ctx.strokeStyle = '#121620';
    ctx.lineWidth = 4;
    const size = 256;
    for (let x = 0; x <= 1024; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // High-tech subtle dot matrix in corners
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    for (let x = 0; x <= 1024; x += size) {
      for (let y = 0; y <= 1024; y += size) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (type === 'plaster_wall') {
    // Photorealistic clean neutral matte wall for maximum target contrast
    ctx.fillStyle = '#2b3446';
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine plaster micro-grain
    ctx.fillStyle = '#323c50';
    for (let i = 0; i < 8000; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }

    // Clean architectural horizontal panelling
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(1024, 512);
    ctx.stroke();
  } else if (type === 'carbon_trim') {
    // Brushed Dark Titanium / Carbon Fiber Trim
    ctx.fillStyle = '#0f141f';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.fillStyle = '#172030';
    for (let i = 0; i < 6000; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 4, 1);
    }
  } else {
    // High-Tech Military Metal Supply Crate
    ctx.fillStyle = '#1b2230';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 944, 944);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(80, 80, 864, 864);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 64px monospace';
    ctx.fillText('AIMPRO // SPEC-01', 120, 200);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  return texture;
}

const floorTexture = createArenaTexture('floor_paver');
floorTexture.repeat.set(16, 16);

const wallTexture = createArenaTexture('plaster_wall');
wallTexture.repeat.set(8, 4);

const carbonTexture = createArenaTexture('carbon_trim');
carbonTexture.repeat.set(12, 1);

const crateTexture = createArenaTexture('crate_metal');

export const Arena: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);

  // Floating Ambient Volumetric Dust Particles
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

  return (
    <group>
      {/* High-End Atmospheric Fog */}
      <fog attach="fog" args={['#0b0f19', 24, 75]} />

      {/* 1. Main Tactical Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          map={floorTexture}
          roughness={0.65}
          metalness={0.25}
          color="#d1d5db"
        />
      </mesh>

      {/* 2. Target Shooting Area Floor Plate (Brushed Carbon High-Friction Mat) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -10]} receiveShadow>
        <planeGeometry args={[44, 22]} />
        <meshStandardMaterial
          color="#151b26"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 3. Distance Floor Range Markers */}
      {[-5, -10, -15, -20].map((z, idx) => (
        <group key={z} position={[0, 0.015, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[36, 0.08]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {/* 4. Center Primary Target Wall (High-Contrast Clean Matte) */}
      <mesh position={[0, 11, -16]} receiveShadow>
        <planeGeometry args={[46, 22]} />
        <meshStandardMaterial
          map={wallTexture}
          roughness={0.65}
          metalness={0.05}
          color="#e2e8f0"
        />
      </mesh>

      {/* Wall Recessed Ambient Neon LED Strip */}
      <mesh position={[0, 21.8, -15.8]}>
        <boxGeometry args={[46, 0.12, 0.15]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <mesh position={[0, 0.2, -15.8]}>
        <boxGeometry args={[46, 0.12, 0.15]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* Brushed Carbon Wall Trim Cornices */}
      <mesh position={[0, 22.2, -15.7]} castShadow receiveShadow>
        <boxGeometry args={[46.4, 0.7, 0.8]} />
        <meshStandardMaterial map={carbonTexture} roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.35, -15.7]} castShadow receiveShadow>
        <boxGeometry args={[46.4, 0.7, 0.5]} />
        <meshStandardMaterial map={carbonTexture} roughness={0.3} metalness={0.9} />
      </mesh>

      {/* 5. Left Tactical Wall */}
      <mesh position={[-23, 11, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial map={wallTexture} roughness={0.7} metalness={0.05} color="#cbd5e1" />
      </mesh>

      {/* 6. Right Tactical Wall */}
      <mesh position={[23, 11, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial map={wallTexture} roughness={0.7} metalness={0.05} color="#cbd5e1" />
      </mesh>

      {/* 7. Back Arena Wall */}
      <mesh position={[0, 11, 16]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[46, 22]} />
        <meshStandardMaterial map={wallTexture} roughness={0.7} metalness={0.05} color="#cbd5e1" />
      </mesh>

      {/* 8. Architectural Columns with Vertical LED Accents */}
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
          {/* Vertical Blue Neon Strip */}
          <mesh position={[0, 0, 0.82]}>
            <boxGeometry args={[0.08, 21.6, 0.05]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
        </group>
      ))}

      {/* 9. Open Architectural Ceiling Skylight Grid */}
      <mesh position={[0, 22.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[46, 32]} />
        <meshBasicMaterial color="#080c14" />
      </mesh>

      {/* Ceiling Structural Metal Beams */}
      {[-8, 0, 8].map(x => (
        <mesh key={x} position={[x, 21.8, 0]} castShadow>
          <boxGeometry args={[0.6, 0.6, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* 10. High-Tech Tactical Supply Crates (Corner Props) */}
      <group position={[-18, 0, -12]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTexture} roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[2.2, 1.0, 0.2]} rotation={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTexture} roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0.8, 3.0, 0.1]} rotation={[0, -0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTexture} roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      <group position={[18, 0, -12]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTexture} roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[-2.2, 1.0, 0.2]} rotation={[0, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTexture} roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      {/* 11. Floating Atmospheric Volumetric Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#00f0ff"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
