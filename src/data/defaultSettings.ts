import { UserSettings } from '../types/settings';

export const DEFAULT_SETTINGS: UserSettings = {
  controls: {
    gamePreset: 'Valorant',
    inGameSens: 0.45,
    dpi: 800,
    adsMultiplier: 1.0,
    invertY: false,
    rawInput: true,
    keybinds: {
      shoot: 'Mouse0',
      ads: 'Mouse2',
      reload: 'KeyR',
      pause: 'Escape',
      restart: 'KeyR',
      forward: 'KeyW',
      backward: 'KeyS',
      left: 'KeyA',
      right: 'KeyD',
      jump: 'Space'
    }
  },
  crosshair: {
    style: 'cross',
    size: 6,
    thickness: 2,
    gap: 4,
    dot: true,
    dotSize: 2,
    color: '#00f0ff',
    opacity: 1.0,
    outline: true,
    outlineColor: '#000000',
    outlineThickness: 1,
    dynamicBloom: true
  },
  video: {
    fov: 103,
    fovType: 'valorant',
    arenaTheme: 'cyber',
    shadows: true,
    bloom: true,
    antialiasing: true,
    particleDensity: 'high',
    fpsLimit: 0, // uncapped
    targetColor: '#00f0ff',
    targetHitColor: '#ff007f'
  },
  audio: {
    masterVolume: 0.8,
    gunVolume: 0.5,
    hitVolume: 0.85,
    missVolume: 0.25,
    hitSoundFrequency: 880,
    hitSoundPreset: 'aimlab_crystal',
    comboPitchEscalation: true
  }
};
