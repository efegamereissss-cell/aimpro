import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { soundEngine } from '../../audio/SoundEngine';
import { RGXKarambitModel } from './RGXKarambitModel';

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
  const karambitSpinRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.PointLight>(null);
  const recoilRef = useRef({ z: 0, pitch: 0 });
  const inspectProgressRef = useRef(0);
  const isInspectingRef = useRef(false);

  const activeWeaponSlot = useGameStore(state => state.activeWeaponSlot);
  const [rgbColor, setRgbColor] = useState('#00ff66');

  // Knife slash animation state
  const slashProgressRef = useRef(0);
  const isSlashingRef = useRef(false);

  const scenario = useGameStore(state => state.activeScenario);
  const settings = useSettingsStore(state => state.settings);
  const { camera } = useThree();

  const weaponType = scenario.weaponType;

  // Listen for F key for inspect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF' && !isInspectingRef.current) {
        isInspectingRef.current = true;
        inspectProgressRef.current = 0;
        if (activeWeaponSlot === 'knife') {
          soundEngine.playKarambitSpin();
        } else {
          soundEngine.playWeaponInspect();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWeaponSlot]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();

    // 1. Dynamic RGX 11z Pro RGB Chroma Color Shift
    const chromaHue = (t * 0.3) % 1.0;
    const chromaRgb = new THREE.Color().setHSL(chromaHue, 1.0, 0.55);
    setRgbColor('#' + chromaRgb.getHexString());

    // 2. Weapon Sway
    const swayX = -mouseDelta.x * 0.0006;
    const swayY = -mouseDelta.y * 0.0006;

    // 3. Weapon Bobbing
    const bobFreq = movementSpeed > 0.1 ? 12 : 3;
    const bobAmp = movementSpeed > 0.1 ? 0.015 : 0.003;
    const bobX = Math.cos(t * bobFreq) * bobAmp;
    const bobY = Math.abs(Math.sin(t * bobFreq)) * bobAmp;

    // 4. Recoil & Knife Slash
    if (isFiring) {
      isInspectingRef.current = false;
      if (activeWeaponSlot === 'knife') {
        isSlashingRef.current = true;
        slashProgressRef.current = 0;
      } else {
        const kickZ = weaponType === 'sniper' ? 0.14 : (weaponType === 'rifle' ? 0.07 : 0.05);
        const kickPitch = weaponType === 'sniper' ? 0.16 : (weaponType === 'rifle' ? 0.08 : 0.06);
        recoilRef.current.z = Math.min(recoilRef.current.z + kickZ, 0.16);
        recoilRef.current.pitch = Math.min(recoilRef.current.pitch + kickPitch, 0.18);
      }
    }
    recoilRef.current.z = THREE.MathUtils.lerp(recoilRef.current.z, 0, delta * 16);
    recoilRef.current.pitch = THREE.MathUtils.lerp(recoilRef.current.pitch, 0, delta * 16);

    // Knife slash progress
    let slashRotX = 0;
    let slashPosZ = 0;
    if (isSlashingRef.current) {
      slashProgressRef.current += delta * 14;
      if (slashProgressRef.current >= Math.PI) {
        isSlashingRef.current = false;
        slashProgressRef.current = 0;
      } else {
        slashRotX = Math.sin(slashProgressRef.current) * 1.5;
        slashPosZ = Math.sin(slashProgressRef.current) * 0.22;
      }
    }

    // 5. Inspect Animation (F Key)
    let inspectRotZ = 0;
    let inspectRotY = 0;
    let karambitSpinAngle = 0;

    if (isInspectingRef.current) {
      const speed = activeWeaponSlot === 'knife' ? 9.0 : 2.2;
      inspectProgressRef.current += delta * speed;

      if (activeWeaponSlot === 'knife') {
        karambitSpinAngle = inspectProgressRef.current;
        if (inspectProgressRef.current >= Math.PI * 4) {
          isInspectingRef.current = false;
          inspectProgressRef.current = 0;
        }
      } else {
        if (inspectProgressRef.current >= Math.PI * 2) {
          isInspectingRef.current = false;
          inspectProgressRef.current = 0;
        } else {
          const p = inspectProgressRef.current;
          inspectRotZ = Math.sin(p) * 0.6;
          inspectRotY = Math.sin(p * 0.5) * 0.5;
        }
      }
    }

    if (karambitSpinRef.current) {
      karambitSpinRef.current.rotation.z = karambitSpinAngle;
    }

    // 6. Target Local Position
    const gunHipfirePos = new THREE.Vector3(0.24, -0.21, -0.48);
    const gunAdsPos = new THREE.Vector3(0.0, -0.148, -0.38);
    const knifePos = new THREE.Vector3(0.23, -0.23, -0.45 - slashPosZ);
    const basePos = activeWeaponSlot === 'knife' ? knifePos : (isADS ? gunAdsPos : gunHipfirePos);

    const localPos = new THREE.Vector3(
      basePos.x + swayX + bobX,
      basePos.y + swayY + bobY,
      basePos.z + recoilRef.current.z
    );
    const worldPos = localPos.applyMatrix4(camera.matrixWorld);
    groupRef.current.position.copy(worldPos);

    groupRef.current.quaternion.copy(camera.quaternion);
    groupRef.current.rotateX(recoilRef.current.pitch + swayY * 0.4 + slashRotX);
    groupRef.current.rotateY(swayX * 0.6 + inspectRotY);
    groupRef.current.rotateZ(swayX * 1.0 + inspectRotZ);

    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.intensity = isFiring && activeWeaponSlot === 'gun' ? 5.0 : 0;
    }
  });

  const neonAccent = settings.video.targetColor || '#00f0ff';

  return (
    <group ref={groupRef}>
      <group rotation={[0, Math.PI, 0]}>
        {/* ========================================================================= */}
        {/* WEAPON: VALORANT RGX 11z PRO 3.0 BLADE / KARAMBIT CLAW KNIFE */}
        {/* ========================================================================= */}
        <group
          visible={activeWeaponSlot === 'knife'}
          position={[0, 0, 0]}
          rotation={[0.3, 0.45, -0.4]}
          scale={[1.1, 1.1, 1.1]}
        >
          <group ref={karambitSpinRef} position={[0.0, 0.12, 0]}>
            <group position={[0.0, -0.12, 0]}>
              <RGXKarambitModel rgbColor={rgbColor} />
            </group>
          </group>
        </group>

        {/* ========================================================================= */}
        {/* PRIMARY WEAPONS (GUN SLOT) */}
        {/* ========================================================================= */}
        <group visible={activeWeaponSlot === 'gun'}>
          {/* WEAPON TYPE: ASSAULT RIFLE (VANDAL / CARBINE) */}
          {weaponType === 'rifle' && (
            <group>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.065, 0.085, 0.42]} />
                <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.88} />
              </mesh>
              <mesh position={[0, 0.052, 0.03]}>
                <boxGeometry args={[0.05, 0.02, 0.44]} />
                <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.92} />
              </mesh>
              <mesh position={[0, 0.035, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.24, 16]} />
                <meshStandardMaterial color="#334155" roughness={0.15} metalness={0.95} />
              </mesh>
              <mesh position={[0, 0.035, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.024, 0.02, 0.06, 8]} />
                <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.9} />
              </mesh>
              <mesh position={[0, -0.09, 0.06]} rotation={[0.25, 0, 0]}>
                <boxGeometry args={[0.045, 0.16, 0.08]} />
                <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.8} />
              </mesh>
              <mesh position={[0, -0.09, -0.1]} rotation={[-0.32, 0, 0]}>
                <boxGeometry args={[0.048, 0.14, 0.065]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
              </mesh>
              <mesh position={[0, -0.01, -0.28]}>
                <boxGeometry args={[0.05, 0.08, 0.18]} />
                <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.3} />
              </mesh>
              <mesh position={[0, 0.082, 0.04]}>
                <boxGeometry args={[0.04, 0.038, 0.06]} />
                <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.088, 0.04]}>
                <planeGeometry args={[0.028, 0.028]} />
                <meshBasicMaterial color={neonAccent} transparent opacity={0.7} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.005, 0.02]}>
                <boxGeometry args={[0.068, 0.015, 0.28]} />
                <meshBasicMaterial color={neonAccent} />
              </mesh>
            </group>
          )}

          {/* WEAPON TYPE: TACTICAL PISTOL (PHANTOM BLASTER) */}
          {weaponType === 'pistol' && (
            <group>
              <mesh position={[0, 0.035, 0.02]} castShadow>
                <boxGeometry args={[0.058, 0.05, 0.26]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
              </mesh>
              <mesh position={[0, -0.005, -0.01]}>
                <boxGeometry args={[0.054, 0.04, 0.22]} />
                <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.035, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.016, 0.016, 0.08, 16]} />
                <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
              </mesh>
              <mesh position={[0, -0.08, -0.06]} rotation={[-0.28, 0, 0]}>
                <boxGeometry args={[0.05, 0.13, 0.06]} />
                <meshStandardMaterial color="#020617" roughness={0.8} metalness={0.2} />
              </mesh>
              <mesh position={[0, 0.065, -0.08]}>
                <boxGeometry args={[0.02, 0.012, 0.015]} />
                <meshBasicMaterial color={neonAccent} />
              </mesh>
              <mesh position={[0, 0.065, 0.13]}>
                <boxGeometry args={[0.008, 0.012, 0.012]} />
                <meshBasicMaterial color={neonAccent} />
              </mesh>
              <mesh position={[0, 0.02, 0.02]}>
                <boxGeometry args={[0.061, 0.008, 0.18]} />
                <meshBasicMaterial color={neonAccent} />
              </mesh>
            </group>
          )}

          {/* WEAPON TYPE: CONTINUOUS BEAM LASER */}
          {weaponType === 'beam' && (
            <group>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.07, 0.09, 0.34]} />
                <meshStandardMaterial color="#0b0f19" roughness={0.3} metalness={0.85} />
              </mesh>
              <mesh position={[0, 0.02, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.028, 0.028, 0.14, 16]} />
                <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.95} />
              </mesh>
              <mesh position={[0, 0.02, 0.0]}>
                <boxGeometry args={[0.075, 0.06, 0.22]} />
                <meshBasicMaterial color={neonAccent} transparent opacity={0.8} />
              </mesh>
              <mesh position={[0, -0.09, -0.05]} rotation={[-0.3, 0, 0]}>
                <boxGeometry args={[0.05, 0.13, 0.065]} />
                <meshStandardMaterial color="#020617" roughness={0.8} metalness={0.2} />
              </mesh>
              {isFiring && (
                <mesh position={[0, 0.02, 8.0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 16, 8]} />
                  <meshBasicMaterial color={neonAccent} transparent opacity={0.85} />
                </mesh>
              )}
            </group>
          )}

          {/* WEAPON TYPE: RAILGUN / SNIPER */}
          {weaponType === 'sniper' && (
            <group>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.07, 0.09, 0.55]} />
                <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.92} />
              </mesh>
              <mesh position={[-0.02, 0.035, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.015, 0.35, 0.015]} />
                <meshStandardMaterial color="#475569" roughness={0.1} metalness={0.98} />
              </mesh>
              <mesh position={[0.02, 0.035, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.015, 0.35, 0.015]} />
                <meshStandardMaterial color="#475569" roughness={0.1} metalness={0.98} />
              </mesh>
              <mesh position={[0, 0.1, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.28, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.95} />
              </mesh>
              <mesh position={[0, 0.1, 0.19]}>
                <circleGeometry args={[0.026, 16]} />
                <meshBasicMaterial color={neonAccent} transparent opacity={0.8} />
              </mesh>
              <mesh position={[0, 0.01, 0.12]}>
                <boxGeometry args={[0.076, 0.03, 0.28]} />
                <meshBasicMaterial color={neonAccent} />
              </mesh>
              <mesh position={[0, -0.1, -0.12]} rotation={[-0.3, 0, 0]}>
                <boxGeometry args={[0.052, 0.15, 0.07]} />
                <meshStandardMaterial color="#0b0f19" roughness={0.8} metalness={0.2} />
              </mesh>
            </group>
          )}

          {/* Dynamic Muzzle Flash Point Light */}
          <pointLight
            ref={muzzleFlashRef}
            position={[0, 0.035, 0.45]}
            color={neonAccent}
            distance={8}
            intensity={0}
          />
        </group>
      </group>
    </group>
  );
};
