import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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

  const isBeam = scenario.weaponType === 'beam';

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Weapon Sway (lag behind mouse rotation)
    const swayX = -mouseDelta.x * 0.0008;
    const swayY = -mouseDelta.y * 0.0008;

    // 2. Weapon Bobbing (breathing + walking movement)
    const time = state.clock.getElapsedTime();
    const bobFreq = movementSpeed > 0.1 ? 12 : 3;
    const bobAmp = movementSpeed > 0.1 ? 0.015 : 0.003;
    const bobX = Math.cos(time * bobFreq) * bobAmp;
    const bobY = Math.abs(Math.sin(time * bobFreq)) * bobAmp;

    // 3. Recoil Kickback
    if (isFiring) {
      recoilRef.current.z = Math.min(recoilRef.current.z + 0.06, 0.12);
      recoilRef.current.pitch = Math.min(recoilRef.current.pitch + 0.08, 0.15);
    }
    // Smooth recoil recovery
    recoilRef.current.z = THREE.MathUtils.lerp(recoilRef.current.z, 0, delta * 15);
    recoilRef.current.pitch = THREE.MathUtils.lerp(recoilRef.current.pitch, 0, delta * 15);

    // 4. Target Position (Hipfire vs ADS)
    const hipfirePos = new THREE.Vector3(0.28, -0.25, -0.55);
    const adsPos = new THREE.Vector3(0.0, -0.165, -0.42);

    const targetPos = isADS ? adsPos : hipfirePos;

    // Apply Sway, Bobbing and Recoil to viewmodel position
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetPos.x + swayX + bobX,
      delta * 14
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetPos.y + swayY + bobY,
      delta * 14
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetPos.z + recoilRef.current.z,
      delta * 18
    );

    // Viewmodel Rotation (sway tilt + recoil kick)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      recoilRef.current.pitch + swayY * 0.5,
      delta * 14
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      swayX * 0.8,
      delta * 14
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      swayX * 1.2,
      delta * 14
    );

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
