import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { RemotePlayerState, HatType } from '../../types/multiplayer';

interface RedmatchPlayerModelProps {
  player: RemotePlayerState;
}

export const RedmatchPlayerModel: React.FC<RedmatchPlayerModelProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);

  const targetPos = useRef(new THREE.Vector3(...player.position));
  const targetYaw = useRef(player.rotation[1]);
  const targetPitch = useRef(player.rotation[0]);

  // Smooth position and rotation interpolation (60fps lerp)
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    targetPos.current.set(...player.position);
    targetYaw.current = player.rotation[1];
    targetPitch.current = player.rotation[0];

    // Lerp position for silky smooth 144Hz movement
    groupRef.current.position.lerp(targetPos.current, Math.min(1, delta * 24));
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetYaw.current, Math.min(1, delta * 20));

    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetPitch.current, Math.min(1, delta * 20));
    }

    // Walking leg swing animation
    const speed = Math.hypot(player.velocity[0], player.velocity[2]);
    if (speed > 0.5 && leftLegRef.current && rightLegRef.current) {
      const legSwing = Math.sin(Date.now() * 0.012) * 0.45;
      leftLegRef.current.rotation.x = legSwing;
      rightLegRef.current.rotation.x = -legSwing;
    } else if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 12);
      rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 12);
    }
  });

  if (!player.isAlive) {
    return null; // Death particle explosion handled in ParticleSystem
  }

  const color = player.color || '#00f0ff';
  const healthPercent = Math.max(0, Math.min(1, player.health / (player.maxHealth || 100)));

  return (
    <group ref={groupRef} position={player.position} userData={{ targetId: player.id, isRemotePlayer: true }}>
      {/* 3D Floating Nameplate & 100 HP Health Bar */}
      <Html position={[0, 2.25, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className="px-2 py-0.5 rounded-md bg-black/80 border border-white/20 backdrop-blur-sm text-[11px] font-black text-white whitespace-nowrap shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span>{player.nickname}</span>
          </div>

          {/* 100 HP Bar */}
          <div className="w-20 h-1.5 bg-black/90 rounded-full mt-1 border border-white/20 overflow-hidden shadow-md">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${healthPercent * 100}%`,
                backgroundColor: healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        </div>
      </Html>

      {/* Head & Headshot Hitbox */}
      <group ref={headRef} position={[0, 1.55, 0]}>
        {/* Head Mesh (Beveled Cube / Prism) */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Visor / Eye Slit */}
        <mesh position={[0, 0.04, 0.215]}>
          <planeGeometry args={[0.34, 0.12]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.04, 0.22]}>
          <planeGeometry args={[0.26, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Geometric Hats / Accessories */}
        {renderGeometricHat(player.hatType, color)}

        {/* Invisible Headshot Raycast Hitbox */}
        <mesh userData={{ targetId: player.id, isHeadshot: true, isRemotePlayer: true }} visible={false}>
          <sphereGeometry args={[0.28, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Torso / Body Armor */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.55, 0.75, 0.36]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.65} />
      </mesh>

      {/* Torso Neon Core Light */}
      <mesh position={[0, 0.98, 0.185]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Backpack Thruster */}
      <mesh position={[0, 1.0, -0.21]} castShadow>
        <boxGeometry args={[0.32, 0.42, 0.12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Floating Geometric Hands / Weapon Carrier */}
      <group position={[0.32, 0.85, 0.32]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.12, 0.18]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      <group position={[-0.32, 0.85, 0.32]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.12, 0.18]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* 3D Weapon Model Held by Remote Player */}
      <group position={[0.26, 0.82, 0.36]} rotation={[0, 0, 0]}>
        {renderWeaponModel(player.activeWeapon)}
      </group>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.16, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.16, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Invisible Precision Torso Raycast Hitbox */}
      <mesh position={[0, 0.95, 0]} userData={{ targetId: player.id, isHeadshot: false, isRemotePlayer: true }} visible={false}>
        <cylinderGeometry args={[0.34, 0.34, 0.9, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

function renderGeometricHat(hatType: HatType, color: string) {
  switch (hatType) {
    case 'triangle':
      return (
        <mesh position={[0, 0.32, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.28, 0.45, 4]} />
          <meshStandardMaterial color="#ffea00" roughness={0.2} metalness={0.8} />
        </mesh>
      );
    case 'crown':
      return (
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.26, 0.22, 0.18, 5]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.9} emissive="#fbbf24" emissiveIntensity={0.4} />
        </mesh>
      );
    case 'horns':
      return (
        <group position={[0, 0.24, 0]}>
          <mesh position={[-0.18, 0.14, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.07, 0.28, 8]} />
            <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.18, 0.14, 0]} rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.07, 0.28, 8]} />
            <meshBasicMaterial color="#ff0055" />
          </mesh>
        </group>
      );
    case 'pyramid':
      return (
        <mesh position={[0, 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.25, 0.35, 4]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
        </mesh>
      );
    case 'cube':
      return (
        <mesh position={[0, 0.28, 0]} rotation={[0.2, 0.2, 0]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial color="#a855f7" roughness={0.3} metalness={0.7} />
        </mesh>
      );
    default:
      return null;
  }
}

function renderWeaponModel(weapon: 'vandal' | 'sheriff' | 'knife') {
  if (weapon === 'knife') {
    return (
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.7}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.03, 0.36, 0.08]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.5} roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.04, 0.16, 0.05]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
        </mesh>
      </group>
    );
  }

  if (weapon === 'sheriff') {
    return (
      <group scale={0.75} position={[0, 0, -0.1]}>
        <mesh position={[0, 0.04, -0.15]}>
          <boxGeometry args={[0.06, 0.1, 0.32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.06, 0.02]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.05, 0.16, 0.07]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    );
  }

  // Rifle (Vandal)
  return (
    <group scale={0.65} position={[0, 0, -0.22]}>
      <mesh position={[0, 0.04, -0.2]}>
        <boxGeometry args={[0.07, 0.12, 0.65]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.3} emissive="#00f0ff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, -0.08, 0.08]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.05, 0.18, 0.07]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, -0.14, -0.12]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.04, 0.22, 0.09]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}
