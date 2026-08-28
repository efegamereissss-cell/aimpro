import React, { useMemo } from 'react';
import * as THREE from 'three';

export interface BhopPlatform {
  id: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isBooster?: boolean;
  isCheckpoint?: boolean;
  isFinish?: boolean;
}

export const BHOP_PLATFORMS: BhopPlatform[] = [
  // 1. Start Platform Zone
  { id: 1, position: [0, 1.0, 0], size: [8, 0.8, 8], color: '#00f0ff', isCheckpoint: true },
  
  // 2. Initial Straight Hops (Speed building blocks)
  { id: 2, position: [0, 1.2, -7], size: [3.5, 0.6, 3.5], color: '#38bdf8' },
  { id: 3, position: [0, 1.4, -14], size: [3.2, 0.6, 3.2], color: '#38bdf8' },
  { id: 4, position: [0, 1.6, -21], size: [3.0, 0.6, 3.0], color: '#38bdf8' },

  // 3. Left Strafe Curve (Requires A + Turn Left)
  { id: 5, position: [-4, 2.0, -28], size: [2.8, 0.6, 2.8], color: '#a855f7' },
  { id: 6, position: [-10, 2.4, -33], size: [2.8, 0.6, 2.8], color: '#a855f7' },
  { id: 7, position: [-17, 2.8, -35], size: [3.5, 0.6, 3.5], color: '#00f0ff', isCheckpoint: true },

  // 4. Right S-Curve Strafe Hops (Requires alternating D -> A -> D)
  { id: 8, position: [-23, 3.2, -31], size: [2.6, 0.6, 2.6], color: '#ec4899' },
  { id: 9, position: [-28, 3.6, -24], size: [2.6, 0.6, 2.6], color: '#ec4899' },
  { id: 10, position: [-30, 4.0, -16], size: [2.6, 0.6, 2.6], color: '#ec4899' },
  { id: 11, position: [-28, 4.4, -8], size: [3.2, 0.6, 3.2], color: '#10b981', isBooster: true },

  // 5. Long Gap Jump (High speed boost launch across gap)
  { id: 12, position: [-25, 5.0, 4], size: [3.5, 0.6, 3.5], color: '#00f0ff', isCheckpoint: true },

  // 6. Ascending Staircase Spiral
  { id: 13, position: [-18, 5.8, 8], size: [2.5, 0.6, 2.5], color: '#f59e0b' },
  { id: 14, position: [-11, 6.6, 10], size: [2.5, 0.6, 2.5], color: '#f59e0b' },
  { id: 15, position: [-4, 7.4, 8], size: [2.5, 0.6, 2.5], color: '#f59e0b' },
  { id: 16, position: [3, 8.2, 4], size: [2.5, 0.6, 2.5], color: '#f59e0b' },

  // 7. Micro Ledge Precision Chain (Final High-Speed Gauntlet)
  { id: 17, position: [8, 9.0, -2], size: [2.0, 0.6, 2.0], color: '#ef4444' },
  { id: 18, position: [12, 9.6, -8], size: [1.8, 0.6, 1.8], color: '#ef4444' },
  { id: 19, position: [15, 10.2, -15], size: [1.8, 0.6, 1.8], color: '#ef4444' },

  // 8. Grand Golden Finish Portal Platform
  { id: 20, position: [18, 10.8, -23], size: [8, 1.0, 8], color: '#eab308', isFinish: true }
];

export const BhopParkourMap: React.FC = () => {
  return (
    <group>
      {/* Dynamic Cyber Void Sky Atmosphere */}
      <fog attach="fog" args={['#040711', 30, 110]} />

      {/* Deep Cyber Horizon Grid in the Abyss */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]}>
        <planeGeometry args={[250, 250]} />
        <meshBasicMaterial color="#02040a" />
      </mesh>
      <gridHelper
        args={[250, 50, '#00f0ff', '#1e293b']}
        position={[0, -14.9, 0]}
      />

      {/* Render all 20 Parkour Platforms */}
      {BHOP_PLATFORMS.map(platform => {
        const [w, h, d] = platform.size;
        return (
          <group key={platform.id} position={platform.position}>
            {/* Main Solid Platform Block */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial
                color="#0f172a"
                roughness={0.2}
                metalness={0.88}
              />
            </mesh>

            {/* Glowing Neon Edge Frame */}
            <mesh position={[0, h / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w * 0.94, d * 0.94]} />
              <meshBasicMaterial
                color={platform.color}
                transparent
                opacity={platform.isFinish ? 0.9 : 0.4}
              />
            </mesh>

            {/* Neon Border Line */}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[w + 0.04, 0.08, d + 0.04]} />
              <meshBasicMaterial color={platform.color} />
            </mesh>

            {/* Checkpoint / Finish Arches */}
            {platform.isCheckpoint && (
              <group position={[0, h / 2 + 1.8, 0]}>
                <mesh>
                  <torusGeometry args={[1.8, 0.12, 16, 32]} />
                  <meshBasicMaterial color={platform.color} />
                </mesh>
                <pointLight color={platform.color} intensity={3.5} distance={8} />
              </group>
            )}

            {platform.isFinish && (
              <group position={[0, h / 2 + 2.5, 0]}>
                <mesh>
                  <torusGeometry args={[2.5, 0.2, 16, 32]} />
                  <meshBasicMaterial color="#eab308" />
                </mesh>
                <pointLight color="#eab308" intensity={6.0} distance={15} />
              </group>
            )}

            {/* Under-Glow Point Light for each Jump Pad */}
            <pointLight
              position={[0, -0.6, 0]}
              color={platform.color}
              intensity={1.8}
              distance={6}
            />
          </group>
        );
      })}
    </group>
  );
};
