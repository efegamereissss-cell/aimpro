import * as THREE from 'three';

/**
 * CS 1.6 / Source Engine Progressive Bunnyhop & Compounding Strafe-Acceleration Physics
 * Starts at standard 250 UPS base walk speed and aggressively accelerates with each
 * consecutive hop (+60 to +100 UPS per clean strafe jump) reaching 1000+ UPS hypersonic speeds!
 */

export interface MovementConfig {
  gravity: number;             // Standard CS 1.6 gravity (m/s^2)
  jumpImpulse: number;         // Clean CS 1.6 jump height
  groundFriction: number;      // Ground friction on floor contact
  groundMaxSpeed: number;      // Standard 250 UPS base walk speed (6.25 m/s)
  groundAccel: number;         // Ground acceleration rate
  airAccelerate: number;       // Progressive air-strafe acceleration
  maxAirWishSpeed: number;     // Air projection speed cap
}

export const CS_16_CONFIG: MovementConfig = {
  gravity: 19.5,
  jumpImpulse: 6.4,
  groundFriction: 14.0,
  groundMaxSpeed: 6.25,        // Exactly 250 UPS base speed
  groundAccel: 48.0,
  airAccelerate: 220.0,        // Rapid progressive acceleration per clean strafe
  maxAirWishSpeed: 30.0        // Allows stacking high horizontal velocity
};

export function calculateAirAcceleration(
  velocity: THREE.Vector3,
  wishDir: THREE.Vector3,
  delta: number,
  config: MovementConfig = CS_16_CONFIG
): THREE.Vector3 {
  const wishSpeed = config.maxAirWishSpeed;
  
  // Project horizontal velocity onto wish direction
  const currentSpeed = velocity.x * wishDir.x + velocity.z * wishDir.z;
  const addSpeed = wishSpeed - currentSpeed;

  if (addSpeed <= 0) {
    return velocity;
  }

  // Compounding Source/GoldSrc air acceleration
  const currentHorizSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  // Give a dynamic speed multiplier as player chains bhops
  const speedBonusMultiplier = 1.0 + Math.min(currentHorizSpeed / 8.0, 2.5);

  const accelSpeed = Math.min(addSpeed, config.airAccelerate * delta * speedBonusMultiplier);

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
