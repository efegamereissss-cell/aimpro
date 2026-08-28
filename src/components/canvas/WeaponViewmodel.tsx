import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { soundEngine } from '../../audio/SoundEngine';
import { RGXKarambitModel } from './RGXKarambitModel';
import { ArcaneSheriffModel } from './ArcaneSheriffModel';
import { PreludeVandalModel } from './PreludeVandalModel';

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
  const sheriffSpinRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.PointLight>(null);
  const recoilRef = useRef({ z: 0, pitch: 0 });
  const inspectProgressRef = useRef(0);
  const isInspectingRef = useRef(false);

  const activeWeaponSlot = useGameStore(state => state.activeWeaponSlot);
  const [rgbColor, setRgbColor] = useState('#00ff66');

  // Knife slash animation state
  const slashProgressRef = useRef(0);
  const isSlashingRef = useRef(false);

  const settings = useSettingsStore(state => state.settings);
  const { camera } = useThree();

  // Listen for F key for inspect (can re-trigger/loop infinitely)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
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
    const chromaHue = (t * 0.4) % 1.0;
    const chromaRgb = new THREE.Color().setHSL(chromaHue, 1.0, 0.55);
    setRgbColor('#' + chromaRgb.getHexString());

    // 2. Weapon Sway with Smooth Inertia
    const swayX = -mouseDelta.x * 0.0006;
    const swayY = -mouseDelta.y * 0.0006;

    // 3. Realistic Weapon Bobbing
    const isMoving = movementSpeed > 0.2;
    const bobFreq = isMoving ? 12 : 2.5;
    const bobAmp = isMoving ? 0.012 : 0.0025;
    const bobX = Math.cos(t * bobFreq) * bobAmp;
    const bobY = Math.abs(Math.sin(t * bobFreq)) * bobAmp;

    // 4. Recoil & Knife Slash
    if (isFiring) {
      isInspectingRef.current = false;
      if (activeWeaponSlot === 'knife') {
        isSlashingRef.current = true;
        slashProgressRef.current = 0;
      } else {
        const kickZ = activeWeaponSlot === 'sheriff' ? 0.09 : 0.07;
        const kickPitch = activeWeaponSlot === 'sheriff' ? 0.13 : 0.08;
        recoilRef.current.z = Math.min(recoilRef.current.z + kickZ, 0.18);
        recoilRef.current.pitch = Math.min(recoilRef.current.pitch + kickPitch, 0.22);
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
        slashRotX = Math.sin(slashProgressRef.current) * 1.4;
        slashPosZ = Math.sin(slashProgressRef.current) * 0.2;
      }
    }

    // 5. Inspect Animations (Valorant RGX Karambit vs Arcane Sheriff vs Prelude Vandal)
    let inspectRotX = 0;
    let inspectRotY = 0;
    let inspectRotZ = 0;
    let inspectOffsetPos = new THREE.Vector3(0, 0, 0);
    let karambitSpinAngle = 0;
    let sheriffSpinAngle = 0;

    if (isInspectingRef.current) {
      if (activeWeaponSlot === 'knife') {
        // RGX 11z Pro Karambit 3-Phase Choreography
        const totalDuration = 2.4;
        inspectProgressRef.current += delta / totalDuration;
        const p = inspectProgressRef.current;

        if (p >= 1.0) {
          isInspectingRef.current = false;
          inspectProgressRef.current = 0;
        } else {
          if (p < 0.15) {
            const ease = Math.sin((p / 0.15) * (Math.PI / 2));
            inspectOffsetPos.set(-0.03 * ease, 0.04 * ease, 0.03 * ease);
            inspectRotX = 0.15 * ease;
            inspectRotY = -0.1 * ease;
          } else if (p < 0.82) {
            const spinP = (p - 0.15) / 0.67;
            const fullSpins = 5.0;
            karambitSpinAngle = spinP * Math.PI * 2 * fullSpins;

            inspectOffsetPos.set(
              -0.03 + Math.sin(karambitSpinAngle * 0.5) * 0.015,
              0.04 + Math.cos(karambitSpinAngle * 0.5) * 0.012,
              0.03
            );
            inspectRotX = Math.sin(karambitSpinAngle) * 0.14;
            inspectRotY = -0.1 + Math.cos(karambitSpinAngle) * 0.12;
            inspectRotZ = Math.sin(karambitSpinAngle * 0.5) * 0.08;
          } else {
            const catchP = (p - 0.82) / 0.18;
            const easeOut = 1.0 - Math.pow(1.0 - catchP, 3);
            karambitSpinAngle = Math.PI * 2 * 5.0 + Math.sin(catchP * Math.PI) * 0.4;

            inspectOffsetPos.set(
              -0.03 * (1.0 - easeOut),
              0.04 * (1.0 - easeOut),
              0.03 * (1.0 - easeOut)
            );
            inspectRotX = Math.sin((1.0 - catchP) * Math.PI) * 0.12;
            inspectRotY = -0.1 * (1.0 - easeOut);
          }
        }
      } else if (activeWeaponSlot === 'sheriff') {
        // Valorant Arcane Sheriff Cowboy Gun-Spin Inspect
        const totalDuration = 2.0;
        inspectProgressRef.current += delta / totalDuration;
        const p = inspectProgressRef.current;

        if (p >= 1.0) {
          isInspectingRef.current = false;
          inspectProgressRef.current = 0;
        } else {
          if (p < 0.45) {
            const spinP = p / 0.45;
            sheriffSpinAngle = spinP * Math.PI * 2;
            inspectOffsetPos.set(-0.03 * Math.sin(spinP * Math.PI), 0.04 * Math.sin(spinP * Math.PI), 0);
          } else if (p < 0.8) {
            const tiltP = (p - 0.45) / 0.35;
            inspectRotY = Math.sin(tiltP * Math.PI) * 0.35;
            inspectRotX = Math.sin(tiltP * Math.PI) * -0.15;
          } else {
            const endP = (p - 0.8) / 0.2;
            inspectRotY = (1.0 - endP) * 0.1;
          }
        }
      } else {
        // Prelude Vandal Inspect
        const speed = 2.2;
        inspectProgressRef.current += delta * speed;
        if (inspectProgressRef.current >= Math.PI * 2) {
          isInspectingRef.current = false;
          inspectProgressRef.current = 0;
        } else {
          const p = inspectProgressRef.current;
          inspectRotZ = Math.sin(p) * 0.55;
          inspectRotY = Math.sin(p * 0.5) * 0.45;
        }
      }
    }

    if (karambitSpinRef.current) {
      karambitSpinRef.current.rotation.z = karambitSpinAngle;
    }
    if (sheriffSpinRef.current) {
      sheriffSpinRef.current.rotation.x = sheriffSpinAngle;
    }

    // 6. Target Local Position
    const vandalHipfirePos = new THREE.Vector3(0.23, -0.21, -0.46);
    const vandalAdsPos = new THREE.Vector3(0.0, -0.152, -0.38);
    const sheriffHipfirePos = new THREE.Vector3(0.23, -0.21, -0.44);
    const sheriffAdsPos = new THREE.Vector3(0.0, -0.142, -0.36);

    const knifePos = new THREE.Vector3(
      0.23 + inspectOffsetPos.x,
      -0.22 + inspectOffsetPos.y,
      -0.42 - slashPosZ + inspectOffsetPos.z
    );

    let activeBasePos = vandalHipfirePos;
    if (activeWeaponSlot === 'knife') {
      activeBasePos = knifePos;
    } else if (activeWeaponSlot === 'sheriff') {
      activeBasePos = isADS ? sheriffAdsPos : new THREE.Vector3(
        sheriffHipfirePos.x + inspectOffsetPos.x,
        sheriffHipfirePos.y + inspectOffsetPos.y,
        sheriffHipfirePos.z + inspectOffsetPos.z
      );
    } else {
      activeBasePos = isADS ? vandalAdsPos : new THREE.Vector3(
        vandalHipfirePos.x + inspectOffsetPos.x,
        vandalHipfirePos.y + inspectOffsetPos.y,
        vandalHipfirePos.z + inspectOffsetPos.z
      );
    }

    const localPos = new THREE.Vector3(
      activeBasePos.x + swayX + bobX,
      activeBasePos.y + swayY + bobY,
      activeBasePos.z + recoilRef.current.z
    );
    const worldPos = localPos.applyMatrix4(camera.matrixWorld);
    groupRef.current.position.copy(worldPos);

    groupRef.current.quaternion.copy(camera.quaternion);
    groupRef.current.rotateX(recoilRef.current.pitch + swayY * 0.4 + slashRotX + inspectRotX);
    groupRef.current.rotateY(swayX * 0.6 + inspectRotY);
    groupRef.current.rotateZ(swayX * 1.0 + inspectRotZ);

    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.intensity = isFiring && activeWeaponSlot !== 'knife' ? 5.0 : 0;
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[0, Math.PI, 0]}>
        {/* ========================================================================= */}
        {/* WEAPON SLOT 3: VALORANT RGX 11z PRO 3.0 BLADE / KARAMBIT CLAW KNIFE */}
        {/* ========================================================================= */}
        <group
          visible={activeWeaponSlot === 'knife'}
          position={[0, 0, 0]}
          rotation={[0.16, 0.38, -0.32]}
          scale={[1.0, 1.0, 1.0]}
        >
          <group ref={karambitSpinRef} position={[0.0, 0.08, 0]}>
            <group position={[0.0, -0.08, 0]}>
              <RGXKarambitModel rgbColor={rgbColor} />
            </group>
          </group>
        </group>

        {/* ========================================================================= */}
        {/* WEAPON SLOT 2: VALORANT ARCANE SHERIFF (REVOLVER) */}
        {/* ========================================================================= */}
        <group
          visible={activeWeaponSlot === 'sheriff'}
          position={[0, 0, 0]}
          rotation={[0.04, 0.06, -0.03]}
        >
          <group ref={sheriffSpinRef} position={[0, -0.04, 0]}>
            <group position={[0, 0.04, 0]}>
              <ArcaneSheriffModel />
            </group>
          </group>
        </group>

        {/* ========================================================================= */}
        {/* WEAPON SLOT 1: VALORANT PRELUDE TO CHAOS VANDAL (BLUE) */}
        {/* ========================================================================= */}
        <group
          visible={activeWeaponSlot === 'vandal' || activeWeaponSlot === 'gun'}
          position={[0, 0, 0]}
          rotation={[0.03, 0.05, -0.02]}
        >
          <PreludeVandalModel />
        </group>

        {/* Dynamic Muzzle Flash Point Light */}
        <pointLight
          ref={muzzleFlashRef}
          position={[0, 0.035, 0.52]}
          color="#00f0ff"
          distance={8}
          intensity={0}
        />
      </group>
    </group>
  );
};
