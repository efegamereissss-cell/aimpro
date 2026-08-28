import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ActiveTarget } from '../../types/game';
import { OmenBotModel } from './OmenBotModel';

export const TargetManager: React.FC = () => {
  const activeTargets = useGameStore(state => state.activeTargets);
  const tickGame = useGameStore(state => state.tickGame);
  const gameStatus = useGameStore(state => state.status);
  const targetColorSetting = useSettingsStore(state => state.settings.video.targetColor);
  const targetHitColorSetting = useSettingsStore(state => state.settings.video.targetHitColor);

  // Main game loop tick: drives target respawning, movement, tracer decay, and timer countdown
  useFrame((_, delta) => {
    if (gameStatus === 'playing') {
      tickGame(Math.min(delta, 0.05));
    }
  });

  return (
    <group>
      {activeTargets.map(target => (
        <TargetMesh
          key={target.id}
          target={target}
          baseColor={target.maxHealth > 1 ? '#ff3b30' : targetColorSetting}
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
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const isHumanoid = target.shape === 'capsule';

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
    }

    if (coreRef.current) {
      const s = 0.88 + Math.sin(Date.now() * 0.008) * 0.06;
      coreRef.current.scale.set(s, s, s);
    }
  });

  const isHit = target.isHitThisFrame;
  const healthPercent = target.maxHealth > 1 ? target.currentHealth / target.maxHealth : 1;
  const activeColor = isHit ? hitColor : baseColor;

  return (
    <group ref={groupRef} position={target.position} userData={{ targetId: target.id }}>
      {/* ========================================================================= */}
      {/* 1. 3D VALORANT OMEN AGENT BOT (TACTICAL BOT DUELLOSU & STRAFE ARENA) */}
      {/* ========================================================================= */}
      {isHumanoid ? (
        <group position={[0, 0, 0]} userData={{ targetId: target.id }}>
          {/* Valorant 3D Omen Model with PBR Textures & Glowing Facial Slits */}
          <OmenBotModel isHit={isHit} hitColor={hitColor} />

          {/* Precision Headshot Hitbox at Eye-Level (1.68m) */}
          <mesh position={[0, 1.68, 0]} userData={{ targetId: target.id, isHeadshot: true }} visible={false}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Precision Torso / Body Hitbox */}
          <mesh position={[0, 0.95, 0]} userData={{ targetId: target.id }} visible={false}>
            <cylinderGeometry args={[0.32, 0.35, 0.95, 12]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      ) : (
        /* ========================================================================= */
        /* 2. HIGH-VISIBILITY SPHERICAL AIM TARGET (GRIDSHOT / FLICKING / TRACKING) */
        /* ========================================================================= */
        <group userData={{ targetId: target.id }}>
          {/* Main Target Sphere with high contrast & smooth shading */}
          <mesh userData={{ targetId: target.id }} castShadow>
            <sphereGeometry args={[target.radius, 32, 32]} />
            <meshStandardMaterial
              color={activeColor}
              emissive={activeColor}
              emissiveIntensity={isHit ? 1.3 : 0.35}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Inner Glowing Crystal Core */}
          <mesh ref={coreRef} userData={{ targetId: target.id }}>
            <sphereGeometry args={[target.radius * 0.78, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>

          {/* Outer Rotating Energy Ring */}
          <mesh ref={ringRef} userData={{ targetId: target.id }}>
            <torusGeometry args={[target.radius * 1.25, 0.016, 16, 32]} />
            <meshBasicMaterial color={activeColor} transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {/* Multi-HP Health Bar for Tracking / Bot Duels */}
      {target.maxHealth > 1 && (
        <group position={[0, isHumanoid ? 2.05 : target.radius + 0.45, 0]}>
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
