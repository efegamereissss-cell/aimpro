import { GameSensPreset } from '../types/settings';

// Yaw degrees per mouse count for each game engine
export const SENS_YAW_TABLE: Record<GameSensPreset, number> = {
  'Valorant': 0.07,
  'CS2': 0.022,
  'Apex Legends': 0.022,
  'Overwatch 2': 0.0066,
  'Fortnite': 0.005555,
  'Rainbow Six Siege': 0.00572957795,
  'Call of Duty': 0.0066,
  'Quake / Source': 0.022
};

/**
 * Calculates mouse delta angle in radians for standard First Person Camera
 * @param movementDelta Raw mouse movement pixel delta (movementX or movementY)
 * @param inGameSens In-game sensitivity slider value
 * @param preset Game sensitivity preset profile
 * @returns Radians rotated per mouse movement count
 */
export function calculateMouseRadians(
  movementDelta: number,
  inGameSens: number,
  preset: GameSensPreset
): number {
  const yawDegrees = SENS_YAW_TABLE[preset] || 0.07;
  const degrees = movementDelta * inGameSens * yawDegrees;
  return (degrees * Math.PI) / 180;
}

/**
 * Converts Horizontal Field of View (e.g. 103 for Valorant in 16:9) to Three.js Vertical FOV
 * @param fov Horizontal FOV input (70-130)
 * @param aspect Screen aspect ratio (default 16/9)
 * @returns Authentic Vertical FOV for Three.js PerspectiveCamera
 */
export function getEffectiveVerticalFov(fov: number, aspect: number = 16 / 9): number {
  // If user specifies standard game horizontal FOV (e.g. 103 for Valorant, 90 for Source 4:3)
  if (fov >= 80) {
    const hRad = (fov * Math.PI) / 180;
    const vRad = 2 * Math.atan(Math.tan(hRad / 2) / aspect);
    return (vRad * 180) / Math.PI;
  }
  return fov;
}

/**
 * Converts sensitivity between game presets
 */
export function convertSensitivity(
  sens: number,
  fromGame: GameSensPreset,
  toGame: GameSensPreset
): number {
  const fromYaw = SENS_YAW_TABLE[fromGame];
  const toYaw = SENS_YAW_TABLE[toGame];
  if (!fromYaw || !toYaw) return sens;
  return (sens * fromYaw) / toYaw;
}

/**
 * Calculates physical cm per 360-degree rotation
 */
export function calculateCm360(
  inGameSens: number,
  dpi: number,
  preset: GameSensPreset
): number {
  if (inGameSens <= 0 || dpi <= 0) return 0;
  const yaw = SENS_YAW_TABLE[preset] || 0.07;
  const degreesPerCount = inGameSens * yaw;
  const countsFor360 = 360 / degreesPerCount;
  const inches = countsFor360 / dpi;
  const cm = inches * 2.54;
  return Math.round(cm * 100) / 100;
}

/**
 * Calculates eDPI (effective DPI)
 */
export function calculateEDPI(inGameSens: number, dpi: number): number {
  return Math.round(inGameSens * dpi * 100) / 100;
}
