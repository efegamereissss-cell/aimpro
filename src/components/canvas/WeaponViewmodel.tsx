import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface WeaponViewmodelProps {
  isFiring: boolean;
  isADS: boolean;
  mouseDelta: { x: number; y: number };
  movementSpeed: number;
}

export const WeaponViewmodel: React.FC<WeaponViewmodelProps> = ({
  isFiring,
  isADS,
  mouseDelta,
  movementSpeed
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.PointLight>(null);
  const recoilRef = useRef({ z: 0, pitch: 0 });
  const scenario = useGameStore(state => state.activeScenario);
  const { camera } = useThree();

  const isBeam = scenario.weaponType === 'beam';

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Weapon Sway (lag behind mouse rotation)
    const swayX = -mouseDelta.x * 0.0006;
    const swayY = -mouseDelta.y * 0.0006;

    // 2. Weapon Bobbing (breathing + walking movement)
    const time = state.clock.getElapsedTime();
    const bobFreq = movementSpeed > 0.1 ? 12 : 3;
    const bobAmp = movementSpeed > 0.1 ? 0.015 : 0.003;
    const bobX = Math.cos(time * bobFreq) * bobAmp;
    const bobY = Math.abs(Math.sin(time * bobFreq)) * bobAmp;

    // 3. Recoil Kickback
    if (isFiring) {
      recoilRef.current.z = Math.min(recoilRef.current.z + 0.05, 0.1);
      recoilRef.current.pitch = Math.min(recoilRef.current.pitch + 0.06, 0.12);
    }
    recoilRef.current.z = THREE.MathUtils.lerp(recoilRef.current.z, 0, delta * 15);
    recoilRef.current.pitch = THREE.MathUtils.lerp(recoilRef.current.pitch, 0, delta * 15);

    // 4. Target Local Position (Hipfire vs ADS)
    const hipfirePos = new THREE.Vector3(0.26, -0.22, -0.52);
    const adsPos = new THREE.Vector3(0.0, -0.155, -0.4);
    const basePos = isADS ? adsPos : hipfirePos;

    // Transform local weapon position into Camera World Space
    const localPos = new THREE.Vector3(
      basePos.x + swayX + bobX,
      basePos.y + swayY + bobY,
      basePos.z + recoilRef.current.z
    );
    const worldPos = localPos.applyMatrix4(camera.matrixWorld);
    groupRef.current.position.copy(worldPos);

    // Apply Camera Rotation + Weapon Sway Tilt
    groupRef.current.quaternion.copy(camera.quaternion);

    // Apply local rotation tilts (recoil pitch & sway roll)
    groupRef.current.rotateX(recoilRef.current.pitch + swayY * 0.4);
    groupRef.current.rotateY(swayX * 0.6);
    groupRef.current.rotateZ(swayX * 1.0);

    // Muzzle Flash Light intensity
    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.intensity = isFiring ? 4.5 : 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* High-Tech Tactical Blaster Weapon Model */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Main Body Chassis */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.07, 0.09, 0.32]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Top Rail / Slide */}
        <mesh position={[0, 0.055, 0.02]}>
          <boxGeometry args={[0.06, 0.03, 0.34]} />
          <meshStandardMaterial color="#1f293d" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Barrel Assembly */}
        <mesh position={[0, 0.04, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 16]} />
          <meshStandardMaterial color="#374151" roughness={0.2} metalness={0.95} />
        </mesh>

        {/* Neon Energy Core / Battery Strip */}
        <mesh position={[0, 0.005, -0.02]}>
          <boxGeometry args={[0.074, 0.025, 0.18]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>

        {/* Weapon Grip / Handle */}
        <mesh position={[0, -0.09, -0.06]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.055, 0.14, 0.07]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Holographic Reflex Sight Frame */}
        <mesh position={[0, 0.088, 0.02]}>
          <boxGeometry args={[0.04, 0.04, 0.05]} />
          <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Holographic Sight Reticle Glass */}
        <mesh position={[0, 0.095, 0.02]}>
          <planeGeometry args={[0.032, 0.032]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>

        {/* Muzzle Flash Point Light */}
        <pointLight
          ref={muzzleFlashRef}
          position={[0, 0.04, 0.3]}
          color="#00f0ff"
          distance={6}
          intensity={0}
        />

        {/* Continuous Beam Emitter for Tracking Scenarios */}
        {isBeam && isFiring && (
          <mesh position={[0, 0.04, 5.0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 10, 8]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} />
          </mesh>
        )}
      </group>
    </group>
  );
};
