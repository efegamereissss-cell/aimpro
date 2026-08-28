import React, { useMemo } from 'react';
import * as THREE from 'three';

// Ultra-Optimized Procedural PBR Canvas Textures for CS2 Dust 2 Sandstone Architecture
function generateDust2Texture(type: 'sandstone_wall' | 'sandstone_floor' | 'crate_wood'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (type === 'sandstone_floor') {
    // Warm Mediterranean sandstone floor pavers
    ctx.fillStyle = '#caba9e';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle grain texture
    ctx.fillStyle = '#bda98c';
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 2, 2);
    }

    // Sandstone tile mortar seams
    ctx.strokeStyle = '#9c876c';
    ctx.lineWidth = 3;
    const tileSize = 128;
    for (let x = 0; x < 512; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  } else if (type === 'sandstone_wall') {
    // Clean, flat, smooth Dust 2 plaster/sandstone wall
    ctx.fillStyle = '#d4c5a9';
    ctx.fillRect(0, 0, 512, 512);

    // Fine smooth plaster grain
    ctx.fillStyle = '#cbba9d';
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 2, 2);
    }

    // Subtle architectural horizontal mortar line
    ctx.strokeStyle = 'rgba(156, 135, 108, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();
  } else {
    // Military supply wooden crate texture
    ctx.fillStyle = '#8d6841';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#7a5732';
    for (let i = 0; i < 1500; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }

    ctx.strokeStyle = '#543b20';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, 512, 512);
    // Diagonal brace
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(512, 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(type === 'sandstone_floor' ? 12 : 6, type === 'sandstone_floor' ? 12 : 6);
  texture.anisotropy = 8;
  return texture;
}

// Singletons to prevent any memory re-allocation on re-renders
const floorTex = generateDust2Texture('sandstone_floor');
const wallTex = generateDust2Texture('sandstone_wall');
const crateTex = generateDust2Texture('crate_wood');

export const Arena: React.FC = () => {
  return (
    <group>
      {/* Warm Mediterranean Dust 2 Sunlight Atmosphere */}
      <fog attach="fog" args={['#e8dfcf', 28, 80]} />

      {/* Main Ground Floor - Smooth Sandstone Tile Arena */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial
          map={floorTex}
          color="#caba9e"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle Distance Grid */}
      <gridHelper
        args={[70, 35, 'rgba(156, 135, 108, 0.4)', 'rgba(156, 135, 108, 0.15)']}
        position={[0, 0.005, 0]}
      />

      {/* Front Target Wall (Clean, Smooth, Flat Sandstone Wall for 100% Target Visibility) */}
      <mesh position={[0, 11, -16]} receiveShadow>
        <planeGeometry args={[46, 24]} />
        <meshStandardMaterial
          map={wallTex}
          color="#dfd2b9"
          roughness={0.7}
          metalness={0.02}
        />
      </mesh>

      {/* Top Wall Architectural Stone Cornice */}
      <mesh position={[0, 22.8, -15.7]} castShadow receiveShadow>
        <boxGeometry args={[46.2, 0.6, 0.8]} />
        <meshStandardMaterial color="#bda98c" roughness={0.8} />
      </mesh>

      {/* Wall Bottom Kickboard Trim */}
      <mesh position={[0, 0.25, -15.8]} castShadow receiveShadow>
        <boxGeometry args={[46.2, 0.5, 0.4]} />
        <meshStandardMaterial color="#a89578" roughness={0.8} />
      </mesh>

      {/* Left Sandstone Wall */}
      <mesh position={[-23, 11, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 24]} />
        <meshStandardMaterial
          map={wallTex}
          color="#d4c5a9"
          roughness={0.75}
          metalness={0.02}
        />
      </mesh>

      {/* Right Sandstone Wall */}
      <mesh position={[23, 11, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[34, 24]} />
        <meshStandardMaterial
          map={wallTex}
          color="#d4c5a9"
          roughness={0.75}
          metalness={0.02}
        />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 11, 16]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[46, 24]} />
        <meshStandardMaterial
          map={wallTex}
          color="#d4c5a9"
          roughness={0.8}
          metalness={0.02}
        />
      </mesh>

      {/* Open Sky Ceiling Frame (Warm Blue Moroccan Sky) */}
      <mesh position={[0, 22.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[46, 34]} />
        <meshBasicMaterial color="#94b8e8" />
      </mesh>

      {/* 4 Architectural Corner Sandstone Columns */}
      {[
        [-22.6, -15.6],
        [22.6, -15.6],
        [-22.6, 15.6],
        [22.6, 15.6]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 11, z]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 22, 1.2]} />
          <meshStandardMaterial color="#c2b093" roughness={0.7} />
        </mesh>
      ))}

      {/* CS2 Tactical Supply Crates (Corner Props for Authentic Dust 2 Feel) */}
      {/* Left Stacked Wooden Crates */}
      <group position={[-18, 0, -12]}>
        {/* Bottom Crate 1 */}
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTex} roughness={0.8} />
        </mesh>
        {/* Bottom Crate 2 */}
        <mesh position={[2.1, 1.0, 0.2]} rotation={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTex} roughness={0.8} />
        </mesh>
        {/* Top Crate */}
        <mesh position={[0.8, 3.0, 0.1]} rotation={[0, -0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTex} roughness={0.8} />
        </mesh>
      </group>

      {/* Right Stacked Wooden Crates */}
      <group position={[18, 0, -12]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTex} roughness={0.8} />
        </mesh>
        <mesh position={[-2.1, 1.0, 0.2]} rotation={[0, -0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTex} roughness={0.8} />
        </mesh>
        <mesh position={[-0.8, 3.0, 0.1]} rotation={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 2.0, 2.0]} />
          <meshStandardMaterial map={crateTex} roughness={0.8} />
        </mesh>
      </group>

      {/* Distance Floor Markings (5m, 10m, 15m) */}
      {[-5, -10, -14.5].map((z, idx) => (
        <group key={z} position={[0, 0.02, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[32, 0.06]} />
            <meshBasicMaterial color="#b39d7f" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
