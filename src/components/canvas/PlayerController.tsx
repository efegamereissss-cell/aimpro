import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateMouseRadians } from '../../utils/sensitivity';
import { soundEngine } from '../../audio/SoundEngine';
import { WeaponViewmodel } from './WeaponViewmodel';

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const MAX_PITCH = Math.PI / 2 - 0.01; // ~89.4 degrees

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

  const mouseDeltaRef = useRef({ x: 0, y: 0 });
  const movementRef = useRef({ forward: false, backward: false, left: false, right: false });
  const isMouseDownRef = useRef(false);
  const isADSDownRef = useRef(false);
  const lastShotTimeRef = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());

  // Base camera setup
  useEffect(() => {
    camera.position.set(0, 1.7, 0); // Standard FPS eye height (1.7m)
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

    const muzzleWorld = new THREE.Vector3(0.28, -0.25, -0.55).applyMatrix4(camera.matrixWorld);

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
    let ignoreInitialDeltas = 0;

    const handlePointerLockChange = () => {
      ignoreInitialDeltas = 3; // ignore first 3 mousemove ticks to filter any recentering spike
      mouseDeltaRef.current = { x: 0, y: 0 };
      if (document.pointerLockElement !== gl.domElement) {
        if (gameStatusRef.current === 'playing') {
          pauseGame();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;

      if (ignoreInitialDeltas > 0) {
        ignoreInitialDeltas--;
        return;
      }

      const deltaX = e.movementX || 0;
      const deltaY = e.movementY || 0;

      // Filter hardware or OS screen-recenter glitch
      if (Math.abs(deltaX) > 400 || Math.abs(deltaY) > 400) {
        return;
      }

      mouseDeltaRef.current = { x: deltaX, y: deltaY };

      const currentSettings = settingsRef.current;
      const sens = currentSettings.controls.inGameSens;
      const preset = currentSettings.controls.gamePreset;
      const adsFactor = isADSDownRef.current ? currentSettings.controls.adsMultiplier : 1.0;

      const radX = calculateMouseRadians(deltaX, sens * adsFactor, preset);
      const radY = calculateMouseRadians(deltaY, sens * adsFactor, preset);

      // True Gimbal-Lock Free Quaternion rotation
      _euler.setFromQuaternion(camera.quaternion, 'YXZ');
      _euler.y -= radX;
      _euler.x -= currentSettings.controls.invertY ? -radY : radY;

      // Clamp vertical pitch [-89.4 deg, 89.4 deg]
      _euler.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, _euler.x));
      _euler.z = 0;

      camera.quaternion.setFromEuler(_euler);
    };

    const handleMouseDown = (e: MouseEvent) => {
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
      if (e.code === 'KeyW') movementRef.current.forward = true;
      if (e.code === 'KeyS') movementRef.current.backward = true;
      if (e.code === 'KeyA') movementRef.current.left = true;
      if (e.code === 'KeyD') movementRef.current.right = true;

      if (e.code === 'Escape' || e.code === 'KeyP') {
        pauseGame();
      }
      if (e.code === 'KeyR') {
        restartGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') movementRef.current.forward = false;
      if (e.code === 'KeyS') movementRef.current.backward = false;
      if (e.code === 'KeyA') movementRef.current.left = false;
      if (e.code === 'KeyD') movementRef.current.right = false;
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

  // Main Loop
  useFrame((_, delta) => {
    // 1. Advance Game Simulation
    if (gameStatusRef.current === 'playing') {
      tickGame(delta);
    }

    // Reset mouse delta smoothly
    mouseDeltaRef.current = {
      x: THREE.MathUtils.lerp(mouseDeltaRef.current.x, 0, delta * 20),
      y: THREE.MathUtils.lerp(mouseDeltaRef.current.y, 0, delta * 20)
    };

    // 2. Continuous Firing / Tracking Handling
    if (isMouseDownRef.current && gameStatusRef.current === 'playing') {
      const currentScenario = activeScenarioRef.current;
      const targets = activeTargetsRef.current;

      if (currentScenario.weaponType === 'beam') {
        // Continuous Beam Tracking Tick
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

  return (
    <WeaponViewmodel
      isFiring={isMouseDownRef.current && gameStatus === 'playing'}
      isADS={isADSDownRef.current}
      mouseDelta={mouseDeltaRef.current}
      movementSpeed={0}
    />
  );
};
