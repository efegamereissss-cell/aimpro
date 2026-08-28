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
          baseColor={target.maxHealth > 1 ? '#ff9900' : targetColorSetting}
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
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Rotation for cube targets
    if (target.shape === 'cube') {
      meshRef.current.rotation.x += delta * 1.5;
      meshRef.current.rotation.y += delta * 1.8;
    }

    // Dynamic pulse for boss / tracking targets
    if (glowMeshRef.current) {
      const scale = 1.0 + Math.sin(Date.now() * 0.008) * 0.08;
      glowMeshRef.current.scale.set(scale, scale, scale);
    }
  });

  const isHit = target.isHitThisFrame;
  const healthPercent = target.maxHealth > 1 ? target.currentHealth / target.maxHealth : 1;

  return (
    <group position={target.position} userData={{ targetId: target.id }}>
      {/* Primary Target Body Mesh */}
      <mesh
        ref={meshRef}
        userData={{ targetId: target.id }}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        {target.shape === 'sphere' && <sphereGeometry args={[target.radius, 32, 32]} />}
        {target.shape === 'cube' && <boxGeometry args={[target.radius * 1.6, target.radius * 1.6, target.radius * 1.6]} />}
        {target.shape === 'capsule' && <capsuleGeometry args={[target.radius * 0.7, target.radius * 1.6, 16, 32]} />}

        <meshStandardMaterial
          color={isHit ? hitColor : baseColor}
          emissive={isHit ? hitColor : baseColor}
          emissiveIntensity={isHit ? 1.0 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Target Halo Glow */}
      <mesh ref={glowMeshRef} scale={[1.15, 1.15, 1.15]} userData={{ targetId: target.id }}>
        <sphereGeometry args={[target.radius, 16, 16]} />
        <meshBasicMaterial
          color={baseColor}
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Multi-HP Health Bar */}
      {target.maxHealth > 1 && (
        <group position={[0, target.radius + 0.35, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.2, 0.12]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
          <mesh position={[(healthPercent - 1) * 0.6, 0, 0.01]}>
            <planeGeometry args={[1.2 * healthPercent, 0.1]} />
            <meshBasicMaterial color={healthPercent > 0.3 ? '#00f0ff' : '#ff0055'} />
          </mesh>
        </group>
      )}
    </group>
  );
};
