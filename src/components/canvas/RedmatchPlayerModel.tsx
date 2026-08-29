import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { RemotePlayerState, HatType } from '../../types/multiplayer';

interface RedmatchPlayerModelProps {
  player: RemotePlayerState;
}

/**
 * Authentic Redmatch 2 Minimalist Bean/Capsule Character Model
 * Features smooth capsule body, glowing visor slit, dynamic geometric hats, and floating 3D weapon.
 */
export const RedmatchPlayerModel: React.FC<RedmatchPlayerModelProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const upperBodyRef = useRef<THREE.Group>(null);

  // Smooth position and rotation interpolation
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetYaw = useRef(0);
  const currentYaw = useRef(0);
  const targetPitch = useRef(0);
  const currentPitch = useRef(0);
  const isInitialized = useRef(false);

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

    // Smooth 20x follow speed
    const factor = Math.min(1, delta * 20);
    currentPos.current.lerp(targetPos.current, factor);

    let dYaw = (targetYaw.current - currentYaw.current) % (Math.PI * 2);
    if (dYaw > Math.PI) dYaw -= Math.PI * 2;
    if (dYaw < -Math.PI) dYaw += Math.PI * 2;
    currentYaw.current += dYaw * factor;

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
  const hatType: HatType = player.hatType || 'triangle';
  const healthPercent = Math.max(0, Math.min(1, (player.health !== undefined ? player.health : 100) / 100));

  return (
    <group ref={groupRef} userData={{ targetId: player.id, isRemotePlayer: true }}>
      {/* Floating Nameplate & Health Bar */}
      <Html position={[0, 2.2, 0]} center distanceFactor={13} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className="px-2.5 py-0.5 rounded-lg bg-black/90 border border-white/20 text-[11px] font-black text-white whitespace-nowrap shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} />
            <span>{player.nickname || 'Player'}</span>
          </div>
          <div className="w-22 h-2 bg-black/90 rounded-full mt-1 border border-white/20 overflow-hidden p-0.5 shadow-lg">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${healthPercent * 100}%`,
                background: healthPercent > 0.5 
                  ? 'linear-gradient(90deg, #10b981, #34d399)' 
                  : healthPercent > 0.25 
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                  : 'linear-gradient(90deg, #ef4444, #f87171)'
              }}
            />
          </div>
        </div>
      </Html>

      {/* UPPER BODY & HEAD PITCH GROUP */}
      <group ref={upperBodyRef} position={[0, 0.9, 0]}>
        {/* Authentic Redmatch 2 Rounded Capsule/Bean Body */}
        <mesh position={[0, 0, 0]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
          <capsuleGeometry args={[0.38, 0.85, 16, 16]} />
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.35}
            emissive={color}
            emissiveIntensity={0.12}
          />
        </mesh>

        {/* Glossy Dark Visor Eye Plate */}
        <group position={[0, 0.42, 0.3]}>
          <mesh userData={{ targetId: player.id, isHeadshot: true, isRemotePlayer: true }}>
            <boxGeometry args={[0.42, 0.2, 0.16]} />
            <meshStandardMaterial color="#050811" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Glowing Neon Visor Eye Slit */}
          <mesh position={[0, 0, 0.085]}>
            <planeGeometry args={[0.34, 0.06]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.086]}>
            <planeGeometry args={[0.36, 0.08]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
        </group>

        {/* Headshot Sphere Hitbox & Visual Cap */}
        <mesh position={[0, 0.55, 0]} userData={{ targetId: player.id, isHeadshot: true, isRemotePlayer: true }}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Custom Hat / Headwear */}
        <group position={[0, 0.82, 0]}>
          {renderGeometricHat(hatType, color, player.id)}
        </group>

        {/* Hands & 3D Weapon */}
        <group position={[0.32, -0.05, 0.38]}>
          {/* Floating Right Hand */}
          <mesh castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
          </mesh>
          {/* Forward Weapon */}
          <group position={[0, 0, -0.2]} scale={0.75}>
            <mesh position={[0, 0.04, -0.3]}>
              <boxGeometry args={[0.07, 0.11, 0.8]} />
              <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.2} emissive="#00f0ff" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, 0.02, 0.08]}>
              <boxGeometry args={[0.09, 0.15, 0.42]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.12, -0.05]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.05, 0.22, 0.1]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Floating Left Hand */}
        <mesh position={[-0.32, -0.1, 0.32]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
        </mesh>
      </group>

      {/* Full Body Physics Hitbox */}
      <mesh position={[0, 0.95, 0]} userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
        <cylinderGeometry args={[0.48, 0.48, 1.9, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

function renderGeometricHat(hatType: HatType, color: string, playerId: string) {
  const ud = { targetId: playerId, isHeadshot: true, isRemotePlayer: true };
  switch (hatType) {
    case 'triangle':
      return (
        <mesh position={[0, 0.12, 0]} userData={ud}>
          <coneGeometry args={[0.26, 0.5, 4]} />
          <meshStandardMaterial color="#ffea00" roughness={0.15} metalness={0.8} emissive="#ffea00" emissiveIntensity={0.3} />
        </mesh>
      );
    case 'crown':
      return (
        <group position={[0, 0.05, 0]}>
          <mesh userData={ud}>
            <cylinderGeometry args={[0.28, 0.22, 0.22, 5]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.15} metalness={0.9} emissive="#fbbf24" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} emissive="#ef4444" emissiveIntensity={1.0} />
          </mesh>
        </group>
      );
    case 'horns':
      return (
        <group position={[0, 0.05, 0]}>
          <mesh position={[-0.18, 0.12, 0]} rotation={[0, 0, 0.45]} userData={ud}>
            <coneGeometry args={[0.08, 0.32, 8]} />
            <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.18, 0.12, 0]} rotation={[0, 0, -0.45]} userData={ud}>
            <coneGeometry args={[0.08, 0.32, 8]} />
            <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1.2} />
          </mesh>
        </group>
      );
    case 'pyramid':
      return (
        <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 4, 0]} userData={ud}>
          <coneGeometry args={[0.28, 0.42, 4]} />
          <meshStandardMaterial color="#00f0ff" roughness={0.1} metalness={0.8} emissive="#00f0ff" emissiveIntensity={0.9} />
        </mesh>
      );
    case 'cube':
      return (
        <mesh position={[0, 0.14, 0]} rotation={[0.25, 0.25, 0]} userData={ud}>
          <boxGeometry args={[0.26, 0.26, 0.26]} />
          <meshStandardMaterial color="#a855f7" roughness={0.2} metalness={0.7} emissive="#a855f7" emissiveIntensity={0.5} />
        </mesh>
      );
    default:
      return null;
  }
}
