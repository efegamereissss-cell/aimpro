import * as THREE from 'three';

/**
 * CS 1.6 / Source Engine Balanced Bunnyhop & Strafe-Acceleration Physics
 * Calibrated to the authentic competitive sweet-spot (250 UPS base up to 450-500 UPS max)
 * with smooth, controlled speed buildup without uncontrollable flying.
 */

export interface MovementConfig {
  gravity: number;             // Standard CS 1.6 gravity (m/s^2)
  jumpImpulse: number;         // Clean authentic jump height
  groundFriction: number;      // Ground friction on floor contact
  groundMaxSpeed: number;      // Standard 250 UPS base walk speed (6.25 m/s)
  groundAccel: number;         // Ground acceleration rate
  airAccelerate: number;       // Balanced air-strafe acceleration
  maxAirWishSpeed: number;     // 30 UPS Source air projection speed cap
  maxSpeedCap: number;         // Max balanced bhop speed cap (12.5 m/s = 500 UPS)
}

export const CS_16_CONFIG: MovementConfig = {
  gravity: 20.0,
  jumpImpulse: 6.0,
  groundFriction: 14.0,
  groundMaxSpeed: 6.25,        // Exactly 250 UPS base speed
  groundAccel: 42.0,
  airAccelerate: 35.0,         // Controlled, balanced strafe acceleration (+25-35 UPS per clean hop)
  maxAirWishSpeed: 1.35,       // Standard Source 30 units/s air cap
  maxSpeedCap: 12.5            // Balanced 500 UPS speed limit (no flying away)
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

  // Smooth, balanced air acceleration
  const accelSpeed = Math.min(addSpeed, config.airAccelerate * wishSpeed * delta);

  velocity.x += wishDir.x * accelSpeed;
  velocity.z += wishDir.z * accelSpeed;

  // Soft speed cap clamp to keep movement controllable
  const hSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  if (hSpeed > config.maxSpeedCap) {
    const scale = config.maxSpeedCap / hSpeed;
    velocity.x *= scale;
    velocity.z *= scale;
  }

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
