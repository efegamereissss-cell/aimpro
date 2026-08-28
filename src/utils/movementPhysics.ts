import * as THREE from 'three';

/**
 * CS 1.6 / Source Engine Strafe-Acceleration & Bunnyhop Physics Engine
 * Implements authentic GoldSrc / Quake 3 air-accelerate vector projection math.
 */

export interface MovementConfig {
  gravity: number;             // e.g. 22.0 m/s^2 (CS 1.6 style)
  jumpImpulse: number;         // e.g. 6.2 m/s (gives ~45 units jump height)
  groundFriction: number;      // e.g. 14.0 m/s^2
  groundMaxSpeed: number;      // e.g. 6.0 m/s (250 UPS)
  groundAccel: number;         // e.g. 40.0 m/s^2
  airAccelerate: number;       // e.g. 120.0 (allows sharp strafe acceleration)
  maxAirWishSpeed: number;     // e.g. 1.2 m/s (30 UPS air cap for wishDir projection)
}

export const CS_16_CONFIG: MovementConfig = {
  gravity: 20.0,
  jumpImpulse: 6.4,
  groundFriction: 14.0,
  groundMaxSpeed: 6.25, // 250 units/s in Source
  groundAccel: 45.0,
  airAccelerate: 140.0,
  maxAirWishSpeed: 1.5
};

export function calculateAirAcceleration(
  velocity: THREE.Vector3,
  wishDir: THREE.Vector3,
  delta: number,
  config: MovementConfig = CS_16_CONFIG
): THREE.Vector3 {
  const wishSpeed = config.maxAirWishSpeed;
  
  // Project current velocity onto wish direction
  const currentSpeed = velocity.dot(wishDir);
  const addSpeed = wishSpeed - currentSpeed;

  if (addSpeed <= 0) {
    return velocity;
  }

  // Authentic Source/GoldSrc air-accelerate formula
  const accelSpeed = Math.min(addSpeed, config.airAccelerate * wishSpeed * delta);

  velocity.x += wishDir.x * accelSpeed;
  velocity.z += wishDir.z * accelSpeed;

  return velocity;
}

export function calculateStrafeSync(
  mouseDeltaX: number,
  isLeftDown: boolean,
  isRightDown: boolean
): number {
  if (Math.abs(mouseDeltaX) < 0.5) return 100;
  
  // Turning left with A pressed or turning right with D pressed
  if ((mouseDeltaX < -0.5 && isLeftDown && !isRightDown) ||
      (mouseDeltaX > 0.5 && isRightDown && !isLeftDown)) {
    return 100;
  }
  
  // Conflicting inputs
  if (isLeftDown && isRightDown) return 40;
  if (!isLeftDown && !isRightDown) return 70;
  
  return 20; // Counter-strafing in air (kills speed in real cs)
}
