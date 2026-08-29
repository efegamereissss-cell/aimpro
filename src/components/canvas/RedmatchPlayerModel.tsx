import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { RemotePlayerState, HatType } from '../../types/multiplayer';
import { multiplayerService } from '../../services/multiplayer/MultiplayerService';

interface RedmatchPlayerModelProps {
  player: RemotePlayerState;
}

export const RedmatchPlayerModel: React.FC<RedmatchPlayerModelProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const upperBodyRef = useRef<THREE.Group>(null);
  const hpBarRef = useRef<HTMLDivElement>(null);

  // Directly sample interpolated transform every frame at 144Hz
  useFrame(() => {
    if (!groupRef.current) return;

    const transform = multiplayerService.getInterpolatedTransform(player.id, 45);
    if (!transform) {
      const pPos = player.position || [0, 1.62, 0];
      groupRef.current.position.set(pPos[0], Math.max(0, pPos[1] - 1.62), pPos[2]);
      return;
    }

    if (!transform.isAlive) {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;
    groupRef.current.position.set(transform.x, transform.y, transform.z);
    groupRef.current.rotation.y = transform.yaw;

    if (upperBodyRef.current) {
      upperBodyRef.current.rotation.x = transform.pitch;
    }

    // Walking animation
    const speed = Math.hypot(transform.vx, transform.vz);
    if (speed > 0.3 && leftLegRef.current && rightLegRef.current) {
      const legSwing = Math.sin(performance.now() * 0.012) * 0.55;
      leftLegRef.current.rotation.x = legSwing;
      rightLegRef.current.rotation.x = -legSwing;
    } else if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x *= 0.8;
      rightLegRef.current.rotation.x *= 0.8;
    }

    // Direct DOM HP Bar update (zero React re-render overhead!)
    if (hpBarRef.current) {
      const hpPct = Math.max(0, Math.min(1, transform.health / 100));
      hpBarRef.current.style.width = `${hpPct * 100}%`;
      hpBarRef.current.style.background = hpPct > 0.5 
        ? 'linear-gradient(90deg, #059669, #10b981)' 
        : hpPct > 0.25 
        ? 'linear-gradient(90deg, #d97706, #f59e0b)' 
        : 'linear-gradient(90deg, #dc2626, #ef4444)';
    }
  });

  const color = player.color || '#00f0ff';
  const weapon = player.activeWeapon || 'vandal';

  return (
    <group ref={groupRef} userData={{ targetId: player.id, isRemotePlayer: true }}>
      {/* Floating Nameplate & HP Bar */}
      <Html position={[0, 2.25, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className="px-2.5 py-0.5 rounded-lg bg-black/85 border border-white/20 text-[11px] font-black text-white whitespace-nowrap shadow-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span>{player.nickname}</span>
          </div>
          <div className="w-22 h-2 bg-black/90 rounded-full mt-1 border border-white/20 overflow-hidden p-0.5">
            <div
              ref={hpBarRef}
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.max(0, Math.min(1, (player.health || 100) / 100)) * 100}%`,
                background: 'linear-gradient(90deg, #059669, #10b981)'
              }}
            />
          </div>
        </div>
      </Html>

      {/* UPPER BODY GROUP (Pitches with vertical aim) */}
      <group ref={upperBodyRef} position={[0, 1.0, 0]}>
        {/* Torso */}
        <mesh position={[0, 0, 0]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
          <boxGeometry args={[0.54, 0.72, 0.34]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Torso accent stripe */}
        <mesh position={[0, 0.05, 0.172]}>
          <planeGeometry args={[0.36, 0.18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.05, 0.174]}>
          <planeGeometry args={[0.28, 0.06]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* HEAD */}
        <group position={[0, 0.55, 0]}>
          <mesh castShadow userData={{ targetId: player.id, isHeadshot: true, isRemotePlayer: true }}>
            <boxGeometry args={[0.42, 0.42, 0.42]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.55} />
          </mesh>
          <mesh position={[0, 0.02, 0.212]}>
            <planeGeometry args={[0.34, 0.14]} />
            <meshBasicMaterial color="#090d16" />
          </mesh>
          <mesh position={[0, 0.02, 0.215]}>
            <planeGeometry args={[0.26, 0.04]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {renderGeometricHat(player.hatType, color, player.id)}
          <mesh userData={{ targetId: player.id, isHeadshot: true, isRemotePlayer: true }}>
            <sphereGeometry args={[0.32, 8, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>

        {/* Hands + weapon */}
        <group position={[0.32, -0.05, 0.35]}>
          <mesh castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
            <boxGeometry args={[0.12, 0.12, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
        <group position={[-0.22, -0.1, 0.42]}>
          <mesh castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
            <boxGeometry args={[0.12, 0.12, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
        <group position={[0.26, -0.06, 0.38]}>
          {renderWeaponModel(weapon)}
        </group>
      </group>

      {/* LEGS */}
      <mesh ref={leftLegRef} position={[-0.15, 0.32, 0]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
        <boxGeometry args={[0.18, 0.64, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.15, 0.32, 0]} castShadow userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
        <boxGeometry args={[0.18, 0.64, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Full body hitbox cylinder */}
      <mesh position={[0, 0.95, 0]} userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }}>
        <cylinderGeometry args={[0.45, 0.45, 1.9, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

function renderGeometricHat(hatType: HatType, color: string, playerId: string) {
  const ud = { targetId: playerId, isHeadshot: true, isRemotePlayer: true };
  switch (hatType) {
    case 'triangle':
      return (<mesh position={[0, 0.35, 0]} userData={ud}><coneGeometry args={[0.28, 0.48, 4]} /><meshStandardMaterial color="#ffea00" roughness={0.2} metalness={0.8} /></mesh>);
    case 'crown':
      return (<mesh position={[0, 0.28, 0]} userData={ud}><cylinderGeometry args={[0.26, 0.22, 0.18, 5]} /><meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.9} emissive="#fbbf24" emissiveIntensity={0.3} /></mesh>);
    case 'horns':
      return (<group position={[0, 0.24, 0]}><mesh position={[-0.16, 0.14, 0]} rotation={[0, 0, 0.4]} userData={ud}><coneGeometry args={[0.07, 0.26, 8]} /><meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1.0} /></mesh><mesh position={[0.16, 0.14, 0]} rotation={[0, 0, -0.4]} userData={ud}><coneGeometry args={[0.07, 0.26, 8]} /><meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1.0} /></mesh></group>);
    case 'pyramid':
      return (<mesh position={[0, 0.36, 0]} rotation={[0, Math.PI / 4, 0]} userData={ud}><coneGeometry args={[0.26, 0.36, 4]} /><meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} /></mesh>);
    case 'cube':
      return (<mesh position={[0, 0.3, 0]} rotation={[0.2, 0.2, 0]} userData={ud}><boxGeometry args={[0.22, 0.22, 0.22]} /><meshStandardMaterial color="#a855f7" roughness={0.3} metalness={0.7} /></mesh>);
    default: return null;
  }
}

function renderWeaponModel(weapon: 'vandal' | 'sheriff' | 'knife') {
  if (weapon === 'knife') {
    return (
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.8} position={[0, 0, -0.15]}>
        <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.025, 0.4, 0.07]} /><meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.8} roughness={0.1} metalness={0.9} /></mesh>
        <mesh position={[0, -0.05, 0]}><boxGeometry args={[0.035, 0.16, 0.05]} /><meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} /></mesh>
      </group>
    );
  }
  if (weapon === 'sheriff') {
    return (
      <group scale={0.85} position={[0, 0, -0.2]}>
        <mesh position={[0, 0.05, -0.22]}><boxGeometry args={[0.07, 0.12, 0.42]} /><meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} emissive="#fbbf24" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, -0.06, -0.04]} rotation={[0.4, 0, 0]}><boxGeometry args={[0.055, 0.18, 0.08]} /><meshStandardMaterial color="#0f172a" roughness={0.7} /></mesh>
      </group>
    );
  }
  return (
    <group scale={0.75} position={[0, 0, -0.32]}>
      <mesh position={[0, 0.05, -0.35]}><boxGeometry args={[0.07, 0.1, 0.75]} /><meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.25} emissive="#00f0ff" emissiveIntensity={0.8} /></mesh>
      <mesh position={[0, 0.03, 0.05]}><boxGeometry args={[0.09, 0.14, 0.45]} /><meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} /></mesh>
      <mesh position={[0, -0.15, -0.08]} rotation={[-0.25, 0, 0]}><boxGeometry args={[0.05, 0.24, 0.11]} /><meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, 0.02, 0.32]}><boxGeometry args={[0.06, 0.12, 0.26]} /><meshStandardMaterial color="#0f172a" roughness={0.6} /></mesh>
    </group>
  );
}
