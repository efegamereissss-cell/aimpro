import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { RemotePlayerState } from '../../types/multiplayer';

interface RedmatchPlayerModelProps {
  player: RemotePlayerState;
}

/**
 * Super Clean, Minimalist Redmatch 2 / Krunker Geometric Character
 * 100% Robust, Fast, Zero-Stutter Smooth Movement Lerp
 */
export const RedmatchPlayerModel: React.FC<RedmatchPlayerModelProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const upperBodyRef = useRef<THREE.Group>(null);

  // Smooth interpolation vectors
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetYaw = useRef(0);
  const currentYaw = useRef(0);
  const targetPitch = useRef(0);
  const currentPitch = useRef(0);
  const isInitialized = useRef(false);

  // Keep target transform updated from player props
  useEffect(() => {
    if (!player) return;
    const pPos = player.position || [0, 1.62, 0];
    const pRot = player.rotation || [0, 0, 0];

    const groundY = Math.max(0, pPos[1] - 1.62);
    targetPos.current.set(pPos[0], groundY, pPos[2]);
    targetYaw.current = pRot[1] || 0;
    targetPitch.current = pRot[0] || 0;

    if (!isInitialized.current) {
      currentPos.current.set(pPos[0], groundY, pPos[2]);
      currentYaw.current = targetYaw.current;
      currentPitch.current = targetPitch.current;
      isInitialized.current = true;
    }
  }, [player.position, player.rotation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!player.isAlive) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // Rock-solid 20x lerp (smoothly glides to target with zero stutter)
    const factor = Math.min(1, delta * 18);
    currentPos.current.lerp(targetPos.current, factor);

    // Shortest-arc angle lerp for yaw
    let dYaw = (targetYaw.current - currentYaw.current) % (Math.PI * 2);
    if (dYaw > Math.PI) dYaw -= Math.PI * 2;
    if (dYaw < -Math.PI) dYaw += Math.PI * 2;
    currentYaw.current += dYaw * factor;

    // Pitch lerp
    currentPitch.current += (targetPitch.current - currentPitch.current) * factor;

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.y = currentYaw.current;

    if (upperBodyRef.current) {
      upperBodyRef.current.rotation.x = currentPitch.current;
    }
  });

  if (!player.isAlive) {
    return null;
  }

  const color = player.color || '#00f0ff';
  const healthPercent = Math.max(0, Math.min(1, (player.health !== undefined ? player.health : 100) / 100));

  return (
    <group ref={groupRef} userData={{ targetId: player.id, isRemotePlayer: true }}>
      {/* Floating Nameplate & HP Bar */}
      <Html position={[0, 2.15, 0]} center distanceFactor={13} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className="px-2 py-0.5 rounded bg-black/85 border border-white/20 text-[11px] font-bold text-white whitespace-nowrap shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span>{player.nickname || 'Player'}</span>
          </div>
          <div className="w-20 h-1.5 bg-black/80 rounded-full mt-1 border border-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${healthPercent * 100}%`,
                background: healthPercent > 0.5 
                  ? '#10b981' 
                  : healthPercent > 0.25 
                  ? '#f59e0b' 
                  : '#ef4444'
              }}
            />
          </div>
        </div>
      </Html>

      {/* UPPER BODY (Pitches up/down with aim) */}
      <group ref={upperBodyRef} position={[0, 1.0, 0]}>
        {/* Main Torso */}
        <mesh position={[0, 0, 0]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
          <boxGeometry args={[0.55, 0.75, 0.35]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Chest Dark Plate */}
        <mesh position={[0, 0.05, 0.18]}>
          <planeGeometry args={[0.35, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* HEAD (Headshot Hitbox) */}
        <group position={[0, 0.55, 0]}>
          <mesh castShadow userData={{ targetId: player.id, isHeadshot: true, isRemotePlayer: true }}>
            <boxGeometry args={[0.42, 0.42, 0.42]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Glowing Dark Visor (Eye slit) */}
          <mesh position={[0, 0.02, 0.215]}>
            <planeGeometry args={[0.32, 0.12]} />
            <meshBasicMaterial color="#090d16" />
          </mesh>
          <mesh position={[0, 0.02, 0.218]}>
            <planeGeometry args={[0.26, 0.04]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Top Cone / Hat */}
          <mesh position={[0, 0.32, 0]} userData={{ targetId: player.id, isHeadshot: true, isRemotePlayer: true }}>
            <coneGeometry args={[0.22, 0.35, 4]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.7} />
          </mesh>
        </group>

        {/* 3D Weapon held forward */}
        <group position={[0.25, -0.05, 0.35]} scale={0.7}>
          <mesh position={[0, 0.05, -0.3]}>
            <boxGeometry args={[0.07, 0.1, 0.75]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} emissive="#00f0ff" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.02, 0.05]}>
            <boxGeometry args={[0.08, 0.13, 0.4]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* LEGS */}
      <mesh position={[-0.14, 0.32, 0]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
        <boxGeometry args={[0.18, 0.64, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0.14, 0.32, 0]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
        <boxGeometry args={[0.18, 0.64, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Invisible Full Body Hitbox Cylinder */}
      <mesh position={[0, 0.95, 0]} userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
        <cylinderGeometry args={[0.45, 0.45, 1.9, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};
