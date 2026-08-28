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
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Rotation
    if (target.shape === 'cube') {
      meshRef.current.rotation.x += delta * 1.5;
      meshRef.current.rotation.y += delta * 1.8;
    } else {
      meshRef.current.rotation.y += delta * 0.8;
    }

    // Outer halo pulse & counter-rotation
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 1.2;
      outerRingRef.current.rotation.x += delta * 0.6;
      const s = 1.15 + Math.sin(Date.now() * 0.006) * 0.06;
      outerRingRef.current.scale.set(s, s, s);
    }

    // Core glow pulsation
    if (coreRef.current) {
      const coreScale = 0.65 + Math.sin(Date.now() * 0.01) * 0.08;
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
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
          emissiveIntensity={isHit ? 1.2 : 0.45}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh ref={coreRef} userData={{ targetId: target.id }}>
        <sphereGeometry args={[target.radius * 0.8, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isHit ? 0.9 : 0.4}
        />
      </mesh>

      {/* Outer Hologram Orbit Ring */}
      <mesh ref={outerRingRef} userData={{ targetId: target.id }}>
        <torusGeometry args={[target.radius * 1.2, 0.012, 16, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Multi-HP Health Bar & Text for Tracking & Switching Modes */}
      {target.maxHealth > 1 && (
        <group position={[0, target.radius + 0.38, 0]}>
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
