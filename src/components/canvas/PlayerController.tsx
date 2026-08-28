import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateMouseRadians } from '../../utils/sensitivity';
import { soundEngine } from '../../audio/SoundEngine';
import { WeaponViewmodel } from './WeaponViewmodel';

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const MAX_PITCH = 1.553; // ~89.0 degrees (prevents zenith lock)

export const PlayerController: React.FC = () => {
  const { camera, gl, scene } = useThree();
  const gameStatus = useGameStore(state => state.status);
  const activeScenario = useGameStore(state => state.activeScenario);
  const activeTargets = useGameStore(state => state.activeTargets);
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

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Pure scalar accumulators for 100% singularity-free rotation
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  const mouseDeltaRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
  });

  // Kinematic Physics Engine State
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const isGroundedRef = useRef(true);
  const isMouseDownRef = useRef(false);
  const isADSDownRef = useRef(false);
  const lastShotTimeRef = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());

  // Base camera setup
  useEffect(() => {
    camera.position.set(0, 1.7, 0); // Standard FPS eye height (1.7m)
    yawRef.current = 0;
    pitchRef.current = 0;
    _euler.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(_euler);
  }, [camera]);

  const handleFire = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return;

    const currentScenario = activeScenarioRef.current;
    const currentSettings = settingsRef.current;
    const targets = activeTargetsRef.current;

    const now = Date.now();
    const intervalMs = 1000 / currentScenario.fireRateRps;
    if (now - lastShotTimeRef.current < intervalMs) return;
    lastShotTimeRef.current = now;

    soundEngine.playGunshot(currentScenario.weaponType);

    // Cast Ray from center of screen (0, 0)
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const ray = raycaster.current.ray;

    // 1. Raycast Three.js scene objects
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

    // 2. Exact mathematical Ray-Sphere test fallback
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
      addBulletTracer(
        [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z],
        hitPoint,
        currentSettings.video.targetColor
      );
    } else {
      // Missed shot into distance
      const missPos = ray.origin.clone().add(ray.direction.clone().multiplyScalar(40));
      registerShot();
      addBulletTracer(
        [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z],
        [missPos.x, missPos.y, missPos.z],
        '#64748b'
      );
    }
  }, [camera, registerShot, addBulletTracer, scene]);

  const handleFireRef = useRef(handleFire);
  handleFireRef.current = handleFire;

  // Pointer Lock request helper
  const requestLock = useCallback(() => {
    if (document.pointerLockElement !== gl.domElement) {
      gl.domElement.requestPointerLock();
    }
  }, [gl]);

  // STABLE Event Listeners
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
      // ONLY process mouse move if currently playing AND pointer locked!
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

      const currentSettings = settingsRef.current;
      const sens = currentSettings.controls.inGameSens;
      const preset = currentSettings.controls.gamePreset;
      const adsFactor = isADSDownRef.current ? currentSettings.controls.adsMultiplier : 1.0;

      const radX = calculateMouseRadians(deltaX, sens * adsFactor, preset);
      const radY = calculateMouseRadians(deltaY, sens * adsFactor, preset);

      // Pure scalar accumulation
      yawRef.current -= radX;
      pitchRef.current -= currentSettings.controls.invertY ? -radY : radY;

      // Clamp vertical pitch
      pitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchRef.current));

      // Apply to camera
      _euler.set(pitchRef.current, yawRef.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(_euler);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // DO NOT request pointer lock if not playing! (Allows clicking menus, tabs, settings freely)
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatusRef.current !== 'playing') return;

      if (e.code === 'KeyW') keysRef.current.forward = true;
      if (e.code === 'KeyS') keysRef.current.backward = true;
      if (e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'KeyD') keysRef.current.right = true;
      if (e.code === 'Space') keysRef.current.jump = true;

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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, gl, requestLock, pauseGame, restartGame]);

  // Main Simulation Loop
  useFrame((_, delta) => {
    if (gameStatusRef.current === 'playing') {
      tickGame(delta);

      // Kinematic Player Movement
      const keys = keysRef.current;
      const moveDir = new THREE.Vector3();

      if (keys.forward) moveDir.z -= 1;
      if (keys.backward) moveDir.z += 1;
      if (keys.left) moveDir.x -= 1;
      if (keys.right) moveDir.x += 1;

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
      }

      const accel = 35.0;
      const friction = 12.0;
      const maxSpeed = isADSDownRef.current ? 3.0 : 6.2;

      if (moveDir.lengthSq() > 0) {
        velocityRef.current.x += moveDir.x * accel * delta;
        velocityRef.current.z += moveDir.z * accel * delta;
        const hVel = new THREE.Vector2(velocityRef.current.x, velocityRef.current.z);
        if (hVel.length() > maxSpeed) {
          hVel.setLength(maxSpeed);
          velocityRef.current.x = hVel.x;
          velocityRef.current.z = hVel.y;
        }
      } else {
        velocityRef.current.x = THREE.MathUtils.lerp(velocityRef.current.x, 0, delta * friction);
        velocityRef.current.z = THREE.MathUtils.lerp(velocityRef.current.z, 0, delta * friction);
      }

      const gravity = 18.0;
      const jumpImpulse = 5.8;

      if (keys.jump && isGroundedRef.current) {
        velocityRef.current.y = jumpImpulse;
        isGroundedRef.current = false;
      }

      if (!isGroundedRef.current) {
        velocityRef.current.y -= gravity * delta;
      }

      camera.position.x += velocityRef.current.x * delta;
      camera.position.y += velocityRef.current.y * delta;
      camera.position.z += velocityRef.current.z * delta;

      if (camera.position.y <= 1.7) {
        camera.position.y = 1.7;
        velocityRef.current.y = 0;
        isGroundedRef.current = true;
      }

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -18, 18);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -10, 10);
    }

    mouseDeltaRef.current = {
      x: THREE.MathUtils.lerp(mouseDeltaRef.current.x, 0, delta * 20),
      y: THREE.MathUtils.lerp(mouseDeltaRef.current.y, 0, delta * 20)
    };

    if (isMouseDownRef.current && gameStatusRef.current === 'playing') {
      const currentScenario = activeScenarioRef.current;
      const targets = activeTargetsRef.current;

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
