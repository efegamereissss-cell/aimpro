import * as THREE from 'three';

/**
 * CS 1.6 / Source Engine Progressive Bunnyhop & Strafe-Acceleration Physics
 * Starts at standard 250 UPS walk speed and progressively accelerates smoothly
 * (+40-60 UPS per clean strafe hop) up to 800+ UPS as you chain bhops.
 */

export interface MovementConfig {
  gravity: number;             // Standard CS 1.6 gravity (m/s^2)
  jumpImpulse: number;         // Clean CS 1.6 jump height
  groundFriction: number;      // Ground friction on floor contact
  groundMaxSpeed: number;      // Standard 250 UPS base walk speed (6.25 m/s)
  groundAccel: number;         // Ground acceleration rate
  airAccelerate: number;       // Smooth progressive air-strafe acceleration
  maxAirWishSpeed: number;     // 30 UPS Source air projection speed cap
}

export const CS_16_CONFIG: MovementConfig = {
  gravity: 19.5,
  jumpImpulse: 6.2,
  groundFriction: 14.0,
  groundMaxSpeed: 6.25,        // Exactly 250 UPS base speed
  groundAccel: 45.0,
  airAccelerate: 85.0,         // Smooth progressive acceleration (+45 UPS per clean strafe)
  maxAirWishSpeed: 1.65        // Authentic 30 units/s air cap
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

  // Smooth, progressive GoldSrc / Source air acceleration
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
  
  if ((mouseDeltaX < -0.5 && isLeftDown && !isRightDown) ||
      (mouseDeltaX > 0.5 && isRightDown && !isLeftDown)) {
    return 100;
  }
  
  if (isLeftDown && isRightDown) return 40;
  if (!isLeftDown && !isRightDown) return 70;
  
  return 20;
}
