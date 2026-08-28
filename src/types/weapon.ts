export interface WeaponState {
  isFiring: boolean;
  isADS: boolean;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  recoilOffset: [number, number, number]; // x, y, z recoil kick
  recoilRotOffset: [number, number, number]; // pitch, yaw, roll recoil kick
  swayOffset: [number, number, number];
  bobbingOffset: [number, number, number];
}

export interface WeaponModelConfig {
  id: string;
  name: string;
  type: 'pistol' | 'rifle' | 'beam' | 'sniper' | 'shotgun';
  damage: number;
  fireRate: number; // shots per sec
  magazineSize: number;
  reloadTimeSec: number;
  adsZoomFov: number; // FOV multiplier e.g. 0.75
  recoilRecoverySpeed: number;
  colorScheme: {
    primary: string;
    accent: string;
    glow: string;
  };
}
