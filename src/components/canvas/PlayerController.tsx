import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { soundEngine } from '../../audio/SoundEngine';
import { calculateMouseRadians } from '../../utils/sensitivity';
import { calculateAirAcceleration } from '../../utils/movementPhysics';
import { WeaponViewmodel } from './WeaponViewmodel';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';
import { multiplayerService } from '../../services/multiplayer/MultiplayerService';

const MAX_PITCH = Math.PI / 2 - 0.01;

// Swept AABB Continuous Collision Box
interface BoundingBox3D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

// 20 Obstacle Platforms Collision Table for Bhop Parkour
const PARKOUR_COLLISION_BOXES: BoundingBox3D[] = [
  { minX: -2.5, maxX: 2.5, minY: -1.0, maxY: 0.1, minZ: -3.0, maxZ: 3.0 },
  ...Array.from({ length: 20 }).map((_, i) => {
    const isLeft = i % 2 === 0;
    const x = isLeft ? -2.2 - (i % 3) * 0.4 : 2.2 + (i % 3) * 0.4;
    const y = 0.2 + i * 0.45;
    const z = -6.0 - i * 6.5;
    const width = Math.max(1.8, 3.2 - i * 0.06);
    const length = Math.max(2.0, 3.8 - i * 0.07);
    return {
      minX: x - width / 2,
      maxX: x + width / 2,
      minY: y - 0.5,
      maxY: y + 0.35,
      minZ: z - length / 2,
      maxZ: z + length / 2
    };
  })
];

export const PlayerController: React.FC = () => {
  const { camera, gl, scene } = useThree();

  const gameStatus = useGameStore(state => state.status);
  const scenario = useGameStore(state => state.activeScenario);
  const activeWeaponSlot = useGameStore(state => state.activeWeaponSlot);
  const setWeaponSlot = useGameStore(state => state.setWeaponSlot);
  const registerShot = useGameStore(state => state.registerShot);
  const registerTrackingTick = useGameStore(state => state.registerTrackingTick);
  const addBulletTracer = useGameStore(state => state.addBulletTracer);
  const pauseGame = useGameStore(state => state.pauseGame);
  const restartGame = useGameStore(state => state.restartGame);

  const settings = useSettingsStore(state => state.settings);

  const isBhopScenario = scenario.id === 'cs16_bhop_parkour_cyber' || scenario.id === 'movement_bhop_flick';

  // Movement & Physics Refs
  const posRef = useRef(new THREE.Vector3(0, 1.62, 0));
  const velRef = useRef(new THREE.Vector3(0, 0, 0));
  const isGroundedRef = useRef(true);

  // Rotation Euler
  const pitchRef = useRef(0);
  const yawRef = useRef(0);
  const _euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ')).current;

  // Input States
  const keysRef = useRef<{ [key: string]: boolean }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false
  });
  const isMouseDownRef = useRef(false);
  const isADSDownRef = useRef(false);
  const mouseDeltaRef = useRef({ x: 0, y: 0 });
  const rawMouseDeltaX = useRef(0);
  const lastShotTimeRef = useRef(0);

  // Sync state refs for callbacks
  const activeWeaponSlotRef = useRef(activeWeaponSlot);
  activeWeaponSlotRef.current = activeWeaponSlot;
  const gameStatusRef = useRef(gameStatus);
  gameStatusRef.current = gameStatus;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  const raycaster = useRef(new THREE.Raycaster());

  // Reset Player on scenario change
  useEffect(() => {
    const isMp = useMultiplayerStore.getState().isMultiplayerActive;
    const isHaven = !isMp && (scenario.id === 'tactical_bot_duel_peeking' || (scenario.tags && scenario.tags.includes('Bot Peeking')));
    const isBhop = scenario.id.includes('bhop');

    if (isMp) {
      setWeaponSlot('vandal');
      // Spawn on one of the flat open arena platforms facing center
      const spawnPads = [
        [-25, -25],
        [25, -25],
        [-25, 25],
        [25, 25],
        [0, -30],
        [0, 30],
        [-30, 0],
        [30, 0]
      ];
      const pad = spawnPads[Math.floor(Math.random() * spawnPads.length)];
      posRef.current.set(pad[0], 1.62, pad[1]);
      yawRef.current = Math.atan2(-pad[0], -pad[1]);
    } else if (isHaven) {
      posRef.current.set(-5.5, 1.62, 10.5);
      yawRef.current = 0;
    } else if (isBhop) {
      posRef.current.set(0, 1.62, 2.0);
      yawRef.current = 0;
    } else {
      posRef.current.set(0, 1.62, 0);
      yawRef.current = 0;
    }
    velRef.current.set(0, 0, 0);
    pitchRef.current = 0;
    isGroundedRef.current = true;
    camera.position.copy(posRef.current);
    camera.quaternion.set(0, 0, 0, 1);
  }, [scenario.id, camera, setWeaponSlot]);

  // Handle Weapon Firing
  const handleFire = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return;
    const isMultiplayerActive = useMultiplayerStore.getState().isMultiplayerActive;
    if (isMultiplayerActive && !useMultiplayerStore.getState().isAlive) return;

    const currentScenario = scenarioRef.current;
    const rawSlot = activeWeaponSlotRef.current;
    const currentSlot: 'vandal' | 'sheriff' | 'knife' = rawSlot === 'knife' ? 'knife' : rawSlot === 'sheriff' ? 'sheriff' : 'vandal';
    const targets = useGameStore.getState().activeTargets;
    const currentSettings = settingsRef.current;

    const now = Date.now();
    const intervalMs =
      currentSlot === 'knife'
        ? 180
        : currentSlot === 'sheriff'
        ? 30
        : 1000 / (currentScenario.fireRateRps || 9.75);

    if (now - lastShotTimeRef.current < intervalMs) return;
    lastShotTimeRef.current = now;

    if (currentSlot === 'knife') {
      soundEngine.playKnifeSlash();
    } else if (currentSlot === 'sheriff') {
      soundEngine.playGunshot('pistol');
    } else {
      soundEngine.playChaosVandal();
    }

    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const ray = raycaster.current.ray;
    const muzzleWorld = new THREE.Vector3(0.26, -0.21, -0.48).applyMatrix4(camera.matrixWorld);

    if (isMultiplayerActive) {
      multiplayerService.broadcastShoot(
        [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z],
        [ray.direction.x, ray.direction.y, ray.direction.z],
        currentSlot
      );
    }

    let hitTargetId: string | null = null;
    let hitRemotePlayerId: string | null = null;
    let hitPoint: [number, number, number] | null = null;
    let isHeadshot = false;

    // 1. Direct Three.js Mesh Raycasting (WYSIWYG Hit Detection)
    if (isMultiplayerActive) {
      const intersects = raycaster.current.intersectObjects(scene.children, true);
      for (const item of intersects) {
        let curr: THREE.Object3D | null = item.object;
        let tid: string | null = null;
        let isHs = false;
        let isRemote = false;

        while (curr) {
          if (curr.userData) {
            if (curr.userData.targetId) {
              tid = curr.userData.targetId;
              if (curr.userData.isHeadshot) isHs = true;
              if (curr.userData.isRemotePlayer) isRemote = true;
            }
          }
          curr = curr.parent;
        }

        if (tid && isRemote) {
          const remotePlayer = useMultiplayerStore.getState().remotePlayers[tid];
          if (remotePlayer && remotePlayer.isAlive) {
            hitRemotePlayerId = tid;
            hitPoint = [item.point.x, item.point.y, item.point.z];
            isHeadshot = isHs || item.point.y >= 1.35;
            break;
          }
        }
      }

      // 2. Mathematical Ray-to-Capsule Fallback (for wide-angle grazing shots)
      if (!hitRemotePlayerId) {
        const remotePlayers = useMultiplayerStore.getState().remotePlayers;
        let closestHitDist = Infinity;

        for (const p of Object.values(remotePlayers)) {
          if (!p.isAlive) continue;
          const pPos = p.position || [0, 1.62, 0];
          const px = pPos[0];
          const pz = pPos[2];
          const ox = ray.origin.x;
          const oy = ray.origin.y;
          const oz = ray.origin.z;
          const dx = ray.direction.x;
          const dy = ray.direction.y;
          const dz = ray.direction.z;

          const vx = px - ox;
          const vz = pz - oz;
          const horizontalDirLenSq = dx * dx + dz * dz;
          if (horizontalDirLenSq < 1e-6) continue;

          const tClosest = (vx * dx + vz * dz) / horizontalDirLenSq;
          if (tClosest <= 0 || tClosest >= 200) continue;

          const rayPtX = ox + tClosest * dx;
          const rayPtY = oy + tClosest * dy;
          const rayPtZ = oz + tClosest * dz;

          const distXZ = Math.hypot(rayPtX - px, rayPtZ - pz);
          const hitRadius = 0.58;
          const isHeightValid = rayPtY >= -0.05 && rayPtY <= 1.95;

          if (distXZ <= hitRadius && isHeightValid) {
            if (tClosest < closestHitDist) {
              closestHitDist = tClosest;
              hitRemotePlayerId = p.id;
              hitPoint = [rayPtX, rayPtY, rayPtZ];
              isHeadshot = rayPtY >= 1.35;
            }
          }
        }
      }
    }

    // MULTIPLAYER REMOTE PLAYER HIT
    if (hitRemotePlayerId && hitPoint) {
      const damage = currentSlot === 'vandal' 
        ? (isHeadshot ? 160 : 40)
        : currentSlot === 'sheriff'
        ? (isHeadshot ? 145 : 55)
        : 75;

      multiplayerService.sendDamage(hitRemotePlayerId, damage, isHeadshot, currentSlot);
      soundEngine.playHitSound(1, isHeadshot);
      useGameStore.getState().addFloatingText(
        isHeadshot ? '💥 160 HEADSHOT!' : `-${damage}`,
        hitPoint,
        isHeadshot ? '#ff0055' : '#00f0ff'
      );
      if (currentSlot !== 'knife') {
        addBulletTracer(
          [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z],
          hitPoint,
          isHeadshot ? '#ff0055' : '#00f0ff'
        );
      }
      return;
    }

    // 2. STANDARD TARGET HIT
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
        handleFireRef.current(); // Single shot on click
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
        }, 100);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatusRef.current !== 'playing') return;

      if (e.code === 'KeyW') keysRef.current.forward = true;
      if (e.code === 'KeyS') keysRef.current.backward = true;
      if (e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'KeyD') keysRef.current.right = true;
      if (e.code === 'Space') keysRef.current.jump = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keysRef.current.sprint = true;

      // Weapon Switching
      if (e.code === 'Digit1' || e.code === 'Numpad1' || e.key === '1') {
        const sc = scenarioRef.current;
        const targetSlot = sc.weaponType === 'pistol' ? 'sheriff' : 'vandal';
        setWeaponSlot(targetSlot);
        soundEngine.playWeaponInspect();
      }
      if (e.code === 'Digit2' || e.code === 'Numpad2' || e.key === '2') {
        setWeaponSlot('sheriff');
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
      if (e.code === 'Tab') {
        e.preventDefault();
        useMultiplayerStore.getState().setScoreboardOpen(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keysRef.current.forward = false;
      if (e.code === 'KeyS') keysRef.current.backward = false;
      if (e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'Space') keysRef.current.jump = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keysRef.current.sprint = false;
      if (e.code === 'Tab') {
        e.preventDefault();
        useMultiplayerStore.getState().setScoreboardOpen(false);
      }
    };

    const canvas = gl.domElement;
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gl, pauseGame, restartGame, requestLock, setWeaponSlot]);

  // Main Movement & Continuous Swept Collision Physics Loop
  useFrame((_, delta) => {
    if (gameStatusRef.current !== 'playing') {
      return;
    }

    const dt = Math.min(delta, 0.05);

    // =========================================================================
    // MULTIPLAYER STATE BROADCAST & RESPAWN TIMER
    // =========================================================================
    const isMultiplayerActive = useMultiplayerStore.getState().isMultiplayerActive;
    if (isMultiplayerActive) {
      const respawnTime = useMultiplayerStore.getState().respawnTimeRemaining;
      if (respawnTime > 0) {
        const nextTime = Math.max(0, respawnTime - dt);
        useMultiplayerStore.getState().setRespawnTimer(nextTime);
        if (nextTime === 0) {
          const spawnPads = [
            [-25, -25],
            [25, -25],
            [-25, 25],
            [25, 25],
            [0, -30],
            [0, 30],
            [-30, 0],
            [30, 0]
          ];
          const pad = spawnPads[Math.floor(Math.random() * spawnPads.length)];
          posRef.current.set(pad[0], 1.62, pad[1]);
          yawRef.current = Math.atan2(-pad[0], -pad[1]);
          velRef.current.set(0, 0, 0);
          camera.position.copy(posRef.current);
          useMultiplayerStore.getState().respawnLocalPlayer();
          multiplayerService.broadcastRespawn([pad[0], 1.62, pad[1]]);
        }
        return; // Freeze movement while waiting for respawn
      }

      // Broadcast position at 60Hz
      const rawSlot = activeWeaponSlotRef.current;
      const currentSlot: 'vandal' | 'sheriff' | 'knife' = rawSlot === 'knife' ? 'knife' : rawSlot === 'sheriff' ? 'sheriff' : 'vandal';
      multiplayerService.broadcastLocalState(
        [posRef.current.x, posRef.current.y, posRef.current.z],
        [pitchRef.current, yawRef.current, 0],
        [velRef.current.x, velRef.current.y, velRef.current.z],
        currentSlot,
        !isGroundedRef.current
      );
    }

    // Continuous Beam / Automatic Rifle Auto-Fire
    // Semi-automatic Pistol (Sheriff) and Knife NEVER spray on hold!
    if (isMouseDownRef.current) {
      if (scenarioRef.current.weaponType === 'beam') {
        raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        for (const item of intersects) {
          const tid = item.object.userData?.targetId || (item.object.parent && item.object.parent.userData?.targetId);
          if (tid) {
            registerTrackingTick(tid, dt);
            break;
          }
        }
      } else if (
        scenarioRef.current.isAutomatic &&
        activeWeaponSlotRef.current === 'vandal' &&
        scenarioRef.current.fireRateRps > 3
      ) {
        handleFireRef.current();
      }
    }

    // Direction Vectors relative to Camera Yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).normalize();

    const wishDir = new THREE.Vector3(0, 0, 0);
    if (keysRef.current.forward) wishDir.add(forward);
    if (keysRef.current.backward) wishDir.sub(forward);
    if (keysRef.current.right) wishDir.add(right);
    if (keysRef.current.left) wishDir.sub(right);

    const hasInput = wishDir.lengthSq() > 0.001;
    if (hasInput) {
      wishDir.normalize();
    }

    // Universal Jump & Movement Physics Engine
    const GRAVITY = 18.0;
    const JUMP_IMPULSE = isBhopScenario ? 6.2 : 5.4;
    const GROUND_FRICTION = isBhopScenario ? 5.0 : 9.0;
    const isSprinting = keysRef.current.sprint && hasInput;
    const MAX_GROUND_SPEED = isBhopScenario ? 7.0 : (isSprinting ? 9.5 : 5.8);

    if (isGroundedRef.current) {
      if (keysRef.current.jump) {
        velRef.current.y = JUMP_IMPULSE;
        isGroundedRef.current = false;
        soundEngine.playBhopJump();
      } else {
        // Ground friction deceleration
        const currentSpeed = Math.sqrt(velRef.current.x ** 2 + velRef.current.z ** 2);
        if (currentSpeed > 0) {
          const drop = currentSpeed * GROUND_FRICTION * dt;
          const newSpeed = Math.max(0, currentSpeed - drop);
          velRef.current.x = (velRef.current.x / currentSpeed) * newSpeed;
          velRef.current.z = (velRef.current.z / currentSpeed) * newSpeed;
        }

        // Ground acceleration
        if (hasInput) {
          const targetVel = wishDir.clone().multiplyScalar(MAX_GROUND_SPEED);
          velRef.current.x = THREE.MathUtils.lerp(velRef.current.x, targetVel.x, dt * 12);
          velRef.current.z = THREE.MathUtils.lerp(velRef.current.z, targetVel.z, dt * 12);
        }
      }
    } else {
      // In-Air Movement (Air-acceleration & Strafe physics)
      calculateAirAcceleration(velRef.current, wishDir, dt);

      // Apply Gravity
      velRef.current.y -= GRAVITY * dt;
    }

    rawMouseDeltaX.current = 0;

    // Continuous Swept Collision Detection with Parkour Blocks / Arena Floor
    const nextX = posRef.current.x + velRef.current.x * dt;
    const nextY = posRef.current.y + velRef.current.y * dt;
    const nextZ = posRef.current.z + velRef.current.z * dt;

    let highestSurfaceY = isBhopScenario ? -25.0 : 1.62;
    const playerRadius = 0.45;

    if (isBhopScenario) {
      for (const box of PARKOUR_COLLISION_BOXES) {
        if (
          nextX + playerRadius >= box.minX &&
          nextX - playerRadius <= box.maxX &&
          nextZ + playerRadius >= box.minZ &&
          nextZ - playerRadius <= box.maxZ
        ) {
          const surfaceY = box.maxY + 1.62;
          if (posRef.current.y >= surfaceY - 0.5) {
            highestSurfaceY = Math.max(highestSurfaceY, surfaceY);
          }
        }
      }
    }

    // Ground landing check
    if (nextY <= highestSurfaceY) {
      posRef.current.y = highestSurfaceY;
      velRef.current.y = 0;
      isGroundedRef.current = true;
    } else {
      posRef.current.y = nextY;
      isGroundedRef.current = false;
    }

    posRef.current.x = nextX;
    posRef.current.z = nextZ;

    // Void Fall / Respawn handling for Parkour
    if (isBhopScenario && posRef.current.y < -12.0) {
      posRef.current.set(0, 1.62, 0);
      velRef.current.set(0, 0, 0);
      isGroundedRef.current = true;
    }

    camera.position.copy(posRef.current);
    mouseDeltaRef.current = { x: 0, y: 0 };
  });

  const currentHorizSpeed = Math.sqrt(velRef.current.x ** 2 + velRef.current.z ** 2);

  return (
    <WeaponViewmodel
      isFiring={isMouseDownRef.current && gameStatus === 'playing'}
      isADS={isADSDownRef.current}
      mouseDelta={mouseDeltaRef.current}
      movementSpeed={currentHorizSpeed}
    />
  );
};
