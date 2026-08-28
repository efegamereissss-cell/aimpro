import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ActiveTarget } from '../../types/game';

export const TargetManager: React.FC = () => {
  const activeTargets = useGameStore(state => state.activeTargets);
  const targetColorSetting = useSettingsStore(state => state.settings.video.targetColor);
  const targetHitColorSetting = useSettingsStore(state => state.settings.video.targetHitColor);

  return (
    <group>
      {activeTargets.map(target => (
        <TargetMesh
          key={target.id}
          target={target}
          baseColor={target.maxHealth > 1 ? '#ffb700' : targetColorSetting}
          hitColor={targetHitColorSetting}
        />
      ))}
    </group>
  );
};

interface TargetMeshProps {
  target: ActiveTarget;
  baseColor: string;
  hitColor: string;
}

const TargetMesh: React.FC<TargetMeshProps> = ({ target, baseColor, hitColor }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const thrusterRef = useRef<THREE.Mesh>(null);

  const isHumanoid = target.shape === 'capsule';

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Concentric Gyroscope Motorized Rotation
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 2.2;
    if (ring2Ref.current) ring2Ref.current.rotation.x -= delta * 2.8;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 1.9;

    // Pulsating Core Breathing
    if (coreRef.current) {
      const s = 0.85 + Math.sin(Date.now() * 0.008) * 0.08;
      coreRef.current.scale.set(s, s, s);
    }

    // Strafe Thruster Flicker
    if (thrusterRef.current) {
      const ts = 0.8 + Math.random() * 0.4;
      thrusterRef.current.scale.set(ts, ts * 1.3, ts);
    }
  });

  const isHit = target.isHitThisFrame;
  const healthPercent = target.maxHealth > 1 ? target.currentHealth / target.maxHealth : 1;
  const activeColor = isHit ? hitColor : baseColor;

  return (
    <group ref={groupRef} position={target.position} userData={{ targetId: target.id }}>
      {/* 1. CYBERNETIC HUMANOID AIM BOT (FOR STRAFE & BOT DUELS) */}
      {isHumanoid ? (
        <group position={[0, 0, 0]}>
          {/* Head & Headshot Hitbox */}
          <group position={[0, target.radius * 0.95, 0]}>
            <mesh userData={{ targetId: target.id }} castShadow>
              <boxGeometry args={[target.radius * 0.75, target.radius * 0.85, target.radius * 0.75]} />
              <meshStandardMaterial
                color={isHit ? hitColor : '#0f172a'}
                roughness={0.2}
                metalness={0.9}
                emissive={isHit ? hitColor : '#000000'}
              />
            </mesh>
            {/* Glowing Tactical Visor (Headshot Target Marker) */}
            <mesh position={[0, 0.02, target.radius * 0.38]}>
              <planeGeometry args={[target.radius * 0.65, target.radius * 0.22]} />
              <meshBasicMaterial color={activeColor} />
            </mesh>
          </group>

          {/* Articulated Torso / Chest Chassis */}
          <mesh position={[0, 0, 0]} userData={{ targetId: target.id }} castShadow>
            <boxGeometry args={[target.radius * 1.1, target.radius * 1.3, target.radius * 0.75]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>

          {/* Torso Arc Reactor Energy Core */}
          <mesh position={[0, 0.1, target.radius * 0.38]}>
            <circleGeometry args={[target.radius * 0.28, 16]} />
            <meshBasicMaterial color={activeColor} />
          </mesh>

          {/* Arm Shoulders */}
          <mesh position={[-target.radius * 0.75, 0.3, 0]} castShadow>
            <boxGeometry args={[target.radius * 0.35, target.radius * 0.8, target.radius * 0.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.88} />
          </mesh>
          <mesh position={[target.radius * 0.75, 0.3, 0]} castShadow>
            <boxGeometry args={[target.radius * 0.35, target.radius * 0.8, target.radius * 0.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.88} />
          </mesh>

          {/* Under-Chassis Strafe Plasma Thruster Flame */}
          <group position={[0, -target.radius * 0.75, 0]}>
            <mesh ref={thrusterRef}>
              <coneGeometry args={[target.radius * 0.25, target.radius * 0.6, 12]} />
              <meshBasicMaterial color={activeColor} transparent opacity={0.85} />
            </mesh>
          </group>
        </group>
      ) : (
        /* 2. MOTORIZED MULTI-RING CONCENTRIC GYROSCOPE TARGET */
        <group>
          {/* Central Solid Collision Sphere */}
          <mesh userData={{ targetId: target.id }} castShadow>
            <sphereGeometry args={[target.radius, 32, 32]} />
            <meshStandardMaterial
              color={activeColor}
              emissive={activeColor}
              emissiveIntensity={isHit ? 1.4 : 0.45}
              roughness={0.15}
              metalness={0.85}
            />
          </mesh>

          {/* Inner Glowing Crystal Core */}
          <mesh ref={coreRef} userData={{ targetId: target.id }}>
            <sphereGeometry args={[target.radius * 0.75, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
          </mesh>

          {/* Outer Motorized Gyro Ring 1 */}
          <mesh ref={ring1Ref} userData={{ targetId: target.id }}>
            <torusGeometry args={[target.radius * 1.25, 0.016, 16, 32]} />
            <meshBasicMaterial color={activeColor} transparent opacity={0.7} />
          </mesh>

          {/* Outer Motorized Gyro Ring 2 */}
          <mesh ref={ring2Ref} userData={{ targetId: target.id }}>
            <torusGeometry args={[target.radius * 1.38, 0.014, 16, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>

          {/* Outer Motorized Gyro Ring 3 */}
          <mesh ref={ring3Ref} userData={{ targetId: target.id }}>
            <torusGeometry args={[target.radius * 1.5, 0.012, 16, 32]} />
            <meshBasicMaterial color={activeColor} transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* Multi-HP Health Bar & Text for Tracking & Switching Modes */}
      {target.maxHealth > 1 && (
        <group position={[0, target.radius + (isHumanoid ? 0.75 : 0.45), 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.3, 0.14]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh position={[(healthPercent - 1) * 0.65, 0, 0.01]}>
            <planeGeometry args={[1.3 * healthPercent, 0.12]} />
            <meshBasicMaterial color={healthPercent > 0.3 ? '#00f0ff' : '#ff0055'} />
          </mesh>
        </group>
      )}
    </group>
  );
};
