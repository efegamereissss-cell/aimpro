import * as THREE from 'three';

/**
 * CS 1.6 / Source Engine Strafe-Acceleration & Fast Bunnyhop Physics Engine
 * High-performance bhop server calibration with explosive air-acceleration.
 */

export interface MovementConfig {
  gravity: number;             // Gravity acceleration (m/s^2)
  jumpImpulse: number;         // Vertical launch impulse
  groundFriction: number;      // Ground deceleration friction
  groundMaxSpeed: number;      // Max ground walk speed
  groundAccel: number;         // Ground acceleration rate
  airAccelerate: number;       // Air-strafe acceleration multiplier
  maxAirWishSpeed: number;     // Air projection speed cap
}

export const CS_16_CONFIG: MovementConfig = {
  gravity: 19.5,
  jumpImpulse: 6.8,
  groundFriction: 12.0,
  groundMaxSpeed: 7.5,
  groundAccel: 55.0,
  airAccelerate: 750.0, // High-speed responsive strafe acceleration
  maxAirWishSpeed: 30.0
};

export function calculateAirAcceleration(
  velocity: THREE.Vector3,
  wishDir: THREE.Vector3,
  delta: number,
  config: MovementConfig = CS_16_CONFIG
): THREE.Vector3 {
  const wishSpeed = config.maxAirWishSpeed;
  
  // Project velocity onto wish direction
  const currentSpeed = velocity.x * wishDir.x + velocity.z * wishDir.z;
  const addSpeed = wishSpeed - currentSpeed;

  if (addSpeed <= 0) {
    return velocity;
  }

  // Fast Source/GoldSrc air-accelerate calculation
  const accelSpeed = Math.min(addSpeed, config.airAccelerate * delta * 2.5);

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
  
  if ((mouseDeltaX < -0.5 && isLeftDown && !isRightDown) ||
      (mouseDeltaX > 0.5 && isRightDown && !isLeftDown)) {
    return 100;
  }
  
  if (isLeftDown && isRightDown) return 40;
  if (!isLeftDown && !isRightDown) return 70;
  
  return 20;
}
