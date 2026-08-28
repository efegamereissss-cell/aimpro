import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateMouseRadians } from '../../utils/sensitivity';
import { calculateAirAcceleration, CS_16_CONFIG } from '../../utils/movementPhysics';
import { BHOP_PLATFORMS } from './BhopParkourMap';
import { soundEngine } from '../../audio/SoundEngine';
import { WeaponViewmodel } from './WeaponViewmodel';

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const MAX_PITCH = 1.553;

export const PlayerController: React.FC = () => {
  const { camera, gl, scene } = useThree();
  const gameStatus = useGameStore(state => state.status);
  const activeScenario = useGameStore(state => state.activeScenario);
  const activeTargets = useGameStore(state => state.activeTargets);
  const activeWeaponSlot = useGameStore(state => state.activeWeaponSlot);
  const setWeaponSlot = useGameStore(state => state.setWeaponSlot);
  const registerShot = useGameStore(state => state.registerShot);
  const registerTrackingTick = useGameStore(state => state.registerTrackingTick);
  const addBulletTracer = useGameStore(state => state.addBulletTracer);
  const tickGame = useGameStore(state => state.tickGame);
  const pauseGame = useGameStore(state => state.pauseGame);
  const restartGame = useGameStore(state => state.restartGame);

  const settings = useSettingsStore(state => state.settings);

  // Synchronized persistent refs
  const gameStatusRef = useRef(gameStatus);
  gameStatusRef.current = gameStatus;

  const activeScenarioRef = useRef(activeScenario);
  activeScenarioRef.current = activeScenario;

  const activeTargetsRef = useRef(activeTargets);
  activeTargetsRef.current = activeTargets;

  const activeWeaponSlotRef = useRef(activeWeaponSlot);
  activeWeaponSlotRef.current = activeWeaponSlot;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Pure scalar accumulators
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  const mouseDeltaRef = useRef({ x: 0, y: 0 });
  const rawMouseDeltaX = useRef(0);
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
  });

  // Kinematic CS 1.6 Movement Physics Engine State
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const isGroundedRef = useRef(true);
  const isMouseDownRef = useRef(false);
  const isADSDownRef = useRef(false);
  const lastShotTimeRef = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());

  // Checkpoint respawn location
  const lastCheckpointPos = useRef(new THREE.Vector3(0, 2.7, 0));
  const prevPositionRef = useRef(new THREE.Vector3(0, 2.7, 0));

  // Base camera setup
  useEffect(() => {
    camera.position.set(0, 2.7, 0);
    prevPositionRef.current.set(0, 2.7, 0);
    yawRef.current = 0;
    pitchRef.current = 0;
    velocityRef.current.set(0, 0, 0);
    _euler.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(_euler);
  }, [camera, activeScenario]);

  const handleFire = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return;

    const currentScenario = activeScenarioRef.current;
    const currentSettings = settingsRef.current;
    const targets = activeTargetsRef.current;
    const currentSlot = activeWeaponSlotRef.current;

    const now = Date.now();
    const intervalMs = currentSlot === 'knife' ? 350 : 1000 / currentScenario.fireRateRps;
    if (now - lastShotTimeRef.current < intervalMs) return;
    lastShotTimeRef.current = now;

    if (currentSlot === 'knife') {
      soundEngine.playKnifeSlash();
    } else {
      soundEngine.playGunshot(currentScenario.weaponType);
    }

    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const ray = raycaster.current.ray;

    const intersects = raycaster.current.intersectObjects(scene.children, true);
    let hitTargetId: string | null = null;
    let hitPoint: [number, number, number] | null = null;
    let isHeadshot = false;

    for (const item of intersects) {
      const tid = item.object.userData?.targetId || (item.object.parent && item.object.parent.userData?.targetId);
      if (tid) {
        hitTargetId = tid;
        hitPoint = [item.point.x, item.point.y, item.point.z];
        isHeadshot = item.point.y > item.object.position.y + 0.15;
        break;
      }
    }

    if (!hitTargetId && targets.length > 0) {
      for (const target of targets) {
        const center = new THREE.Vector3(...target.position);
        const sphere = new THREE.Sphere(center, target.radius * 1.05);
        const intersectPt = new THREE.Vector3();
        if (ray.intersectSphere(sphere, intersectPt)) {
          hitTargetId = target.id;
          hitPoint = [intersectPt.x, intersectPt.y, intersectPt.z];
          isHeadshot = intersectPt.y > target.position[1] + target.radius * 0.4;
          break;
        }
      }
    }

    const muzzleWorld = new THREE.Vector3(0.26, -0.21, -0.48).applyMatrix4(camera.matrixWorld);

    if (hitTargetId && hitPoint) {
      registerShot(hitTargetId, hitPoint, isHeadshot);
      if (currentSlot !== 'knife') {
        addBulletTracer(
          [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z],
          hitPoint,
          currentSettings.video.targetColor
        );
      }
    } else {
      registerShot();
      if (currentSlot !== 'knife') {
        const missPos = ray.origin.clone().add(ray.direction.clone().multiplyScalar(40));
        addBulletTracer(
          [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z],
          [missPos.x, missPos.y, missPos.z],
          '#64748b'
        );
      }
    }
  }, [camera, registerShot, addBulletTracer, scene]);

  const handleFireRef = useRef(handleFire);
  handleFireRef.current = handleFire;

  const requestLock = useCallback(() => {
    if (document.pointerLockElement !== gl.domElement) {
      gl.domElement.requestPointerLock();
    }
  }, [gl]);

  // Event Listeners
  useEffect(() => {
    let ignoreTicks = 0;

    const handlePointerLockChange = () => {
      ignoreTicks = 3;
      mouseDeltaRef.current = { x: 0, y: 0 };
      if (document.pointerLockElement !== gl.domElement) {
        if (gameStatusRef.current === 'playing') {
          pauseGame();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (gameStatusRef.current !== 'playing' || document.pointerLockElement !== gl.domElement) {
        return;
      }

      if (ignoreTicks > 0) {
        ignoreTicks--;
        return;
      }

      const deltaX = e.movementX || 0;
      const deltaY = e.movementY || 0;

      if (Math.abs(deltaX) > 300 || Math.abs(deltaY) > 300) {
        return;
      }

      mouseDeltaRef.current = { x: deltaX, y: deltaY };
      rawMouseDeltaX.current = deltaX;

      const currentSettings = settingsRef.current;
      const sens = currentSettings.controls.inGameSens;
      const preset = currentSettings.controls.gamePreset;
      const adsFactor = isADSDownRef.current ? currentSettings.controls.adsMultiplier : 1.0;

      const radX = calculateMouseRadians(deltaX, sens * adsFactor, preset);
      const radY = calculateMouseRadians(deltaY, sens * adsFactor, preset);

      yawRef.current -= radX;
      pitchRef.current -= currentSettings.controls.invertY ? -radY : radY;
      pitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchRef.current));

      _euler.set(pitchRef.current, yawRef.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(_euler);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (gameStatusRef.current !== 'playing') {
        return;
      }

      if (document.pointerLockElement !== gl.domElement) {
        requestLock();
        return;
      }

      if (e.button === 0) {
        isMouseDownRef.current = true;
        handleFireRef.current();
      } else if (e.button === 2) {
        isADSDownRef.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = false;
      } else if (e.button === 2) {
        isADSDownRef.current = false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (gameStatusRef.current === 'playing' && e.deltaY !== 0) {
        keysRef.current.jump = true;
        setTimeout(() => {
          keysRef.current.jump = false;
        }, 120);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatusRef.current !== 'playing') return;

      if (e.code === 'KeyW') keysRef.current.forward = true;
      if (e.code === 'KeyS') keysRef.current.backward = true;
      if (e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'KeyD') keysRef.current.right = true;
      if (e.code === 'Space') keysRef.current.jump = true;

      // Weapon Switching
      if (e.code === 'Digit1' || e.code === 'Numpad1' || e.key === '1') {
        setWeaponSlot('gun');
        soundEngine.playWeaponInspect();
      }
      if (e.code === 'Digit3' || e.code === 'Numpad3' || e.key === '3') {
        setWeaponSlot('knife');
        soundEngine.playKarambitSpin();
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        pauseGame();
      }
      if (e.code === 'KeyR') {
        restartGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keysRef.current.forward = false;
      if (e.code === 'KeyS') keysRef.current.backward = false;
      if (e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'Space') keysRef.current.jump = false;
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, gl, requestLock, pauseGame, restartGame, setWeaponSlot]);

  // Main Simulation Loop with Smooth Progressive Acceleration & Continuous Swept Collision
  useFrame((_, delta) => {
    if (gameStatusRef.current === 'playing') {
      tickGame(delta);

      const keys = keysRef.current;
      const isBhopScenario = activeScenarioRef.current.category === 'strafing' || activeScenarioRef.current.id.includes('bhop');

      // 1. Wish Direction in Camera Space
      const wishDir = new THREE.Vector3();
      if (keys.forward) wishDir.z -= 1;
      if (keys.backward) wishDir.z += 1;
      if (keys.left) wishDir.x -= 1;
      if (keys.right) wishDir.x += 1;

      if (wishDir.lengthSq() > 0) {
        wishDir.normalize();
        wishDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
      }

      // 2. Ground vs Air Acceleration
      if (isGroundedRef.current) {
        // Ground Friction
        const currentSpeed = new THREE.Vector2(velocityRef.current.x, velocityRef.current.z).length();
        if (currentSpeed > 0) {
          const drop = currentSpeed * CS_16_CONFIG.groundFriction * delta;
          const newSpeed = Math.max(0, currentSpeed - drop);
          velocityRef.current.x *= newSpeed / currentSpeed;
          velocityRef.current.z *= newSpeed / currentSpeed;
        }

        // Ground Accelerate (Starts at standard 250 UPS base walk)
        if (wishDir.lengthSq() > 0) {
          velocityRef.current.x += wishDir.x * CS_16_CONFIG.groundAccel * delta;
          velocityRef.current.z += wishDir.z * CS_16_CONFIG.groundAccel * delta;
          const hVel = new THREE.Vector2(velocityRef.current.x, velocityRef.current.z);
          if (hVel.length() > CS_16_CONFIG.groundMaxSpeed) {
            hVel.setLength(CS_16_CONFIG.groundMaxSpeed);
            velocityRef.current.x = hVel.x;
            velocityRef.current.z = hVel.y;
          }
        }

        // Jump Execution
        if (keys.jump) {
          velocityRef.current.y = CS_16_CONFIG.jumpImpulse;
          isGroundedRef.current = false;
        }
      } else {
        // In the Air: Progressive CS 1.6 Strafe-Jump Air Acceleration Math
        if (wishDir.lengthSq() > 0) {
          calculateAirAcceleration(velocityRef.current, wishDir, delta, CS_16_CONFIG);
        }

        // Gravity
        velocityRef.current.y -= CS_16_CONFIG.gravity * delta;
      }

      // Save previous position for continuous swept collision
      prevPositionRef.current.copy(camera.position);

      // 3. Integrate Position
      camera.position.x += velocityRef.current.x * delta;
      camera.position.y += velocityRef.current.y * delta;
      camera.position.z += velocityRef.current.z * delta;

      // 4. Continuous Swept Collision Detection (Never clips through blocks)
      let onPlatform = false;
      let platformTopY = 0;

      if (isBhopScenario) {
        const pX = camera.position.x;
        const pY = camera.position.y - 1.7; // feet height
        const prevY = prevPositionRef.current.y - 1.7;
        const pZ = camera.position.z;

        for (const plat of BHOP_PLATFORMS) {
          const [platX, platY, platZ] = plat.position;
          const [w, h, d] = plat.size;
          const halfW = w / 2 + 0.45;
          const halfD = d / 2 + 0.45;
          const topSurface = platY + h / 2;

          if (
            pX >= platX - halfW &&
            pX <= platX + halfW &&
            pZ >= platZ - halfD &&
            pZ <= platZ + halfD
          ) {
            const isSweepingLanding = prevY >= topSurface - 0.25 && pY <= topSurface + 0.5;
            const isCurrentlyOnTop = pY >= topSurface - 0.3 && pY <= topSurface + 0.65;

            if ((isSweepingLanding || isCurrentlyOnTop) && velocityRef.current.y <= 0.1) {
              onPlatform = true;
              platformTopY = topSurface + 1.7;

              // Speed booster pad (Smooth launch arc)
              if (plat.isBooster) {
                const boostDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
                velocityRef.current.x += boostDir.x * 6.5;
                velocityRef.current.z += boostDir.z * 6.5;
                velocityRef.current.y = 7.2;
                isGroundedRef.current = false;
              }

              if (plat.isCheckpoint) {
                lastCheckpointPos.current.set(platX, topSurface + 1.7, platZ);
              }
              break;
            }
          }
        }

        // Fall into void reset (Instant checkpoint respawn)
        if (camera.position.y < -3.0) {
          camera.position.copy(lastCheckpointPos.current);
          prevPositionRef.current.copy(lastCheckpointPos.current);
          velocityRef.current.set(0, 0, 0);
          isGroundedRef.current = true;
        }
      } else {
        // Standard Arena Floor Collision
        if (camera.position.y <= 1.7) {
          onPlatform = true;
          platformTopY = 1.7;
        }
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -21, 21);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -14, 14);
      }

      if (onPlatform) {
        camera.position.y = platformTopY;
        if (velocityRef.current.y < 0) {
          velocityRef.current.y = 0;
        }
        isGroundedRef.current = true;
      } else if (camera.position.y > platformTopY + 0.1) {
        isGroundedRef.current = false;
      }
    }

    mouseDeltaRef.current = {
      x: THREE.MathUtils.lerp(mouseDeltaRef.current.x, 0, delta * 20),
      y: THREE.MathUtils.lerp(mouseDeltaRef.current.y, 0, delta * 20)
    };

    if (isMouseDownRef.current && gameStatusRef.current === 'playing') {
      const currentScenario = activeScenarioRef.current;
      const targets = activeTargetsRef.current;

      if (activeWeaponSlotRef.current !== 'knife') {
        if (currentScenario.weaponType === 'beam') {
          raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
          const ray = raycaster.current.ray;
          for (const target of targets) {
            const center = new THREE.Vector3(...target.position);
            const sphere = new THREE.Sphere(center, target.radius * 1.1);
            if (ray.intersectsSphere(sphere)) {
              registerTrackingTick(target.id, delta);
              break;
            }
          }
        } else if (activeScenario.isAutomatic) {
          handleFireRef.current();
        }
      }
    }
  });

  const currentHorizSpeed = new THREE.Vector2(velocityRef.current.x, velocityRef.current.z).length();

  return (
    <WeaponViewmodel
      isFiring={isMouseDownRef.current && gameStatus === 'playing'}
      isADS={isADSDownRef.current}
      mouseDelta={mouseDeltaRef.current}
      movementSpeed={currentHorizSpeed}
    />
  );
};
