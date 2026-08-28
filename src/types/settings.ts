export type GameSensPreset = 
  | 'Valorant' 
  | 'CS2' 
  | 'Apex Legends' 
  | 'Overwatch 2' 
  | 'Fortnite' 
  | 'Rainbow Six Siege' 
  | 'Call of Duty' 
  | 'Quake / Source';

export interface CrosshairSettings {
  style: 'cross' | 'dot' | 'circle' | 't-shape' | 'box';
  size: number; // length of lines (2 - 30)
  thickness: number; // line width (1 - 10)
  gap: number; // center gap (0 - 25)
  dot: boolean;
  dotSize: number;
  color: string; // hex
  opacity: number; // 0.1 - 1
  outline: boolean;
  outlineColor: string;
  outlineThickness: number;
  dynamicBloom: boolean; // expands when moving / firing
}

export interface VideoSettings {
  fov: number; // 70 - 130
  fovType: 'horizontal' | 'vertical' | 'valorant' | 'cs';
  arenaTheme: 'cyber' | 'studio' | 'tactical' | 'synthwave' | 'dark';
  shadows: boolean;
  bloom: boolean;
  antialiasing: boolean;
  particleDensity: 'low' | 'medium' | 'high';
  fpsLimit: number; // 60, 144, 240, 360, 0 (uncapped)
  targetColor: string;
  targetHitColor: string;
}

export interface AudioSettings {
  masterVolume: number; // 0 - 1
  gunVolume: number;
  hitVolume: number;
  missVolume: number;
  hitSoundFrequency: number; // 200 - 2000 Hz
  hitSoundPreset: 'aimlab_crystal' | 'kovaak_bell' | 'quake_ding' | 'cyber_plink';
  comboPitchEscalation: boolean;
}

export interface ControlSettings {
  gamePreset: GameSensPreset;
  inGameSens: number;
  dpi: number;
  adsMultiplier: number;
  invertY: boolean;
  rawInput: boolean;
  keybinds: {
    shoot: string;
    ads: string;
    reload: string;
    pause: string;
    restart: string;
    forward: string;
    backward: string;
    left: string;
    right: string;
    jump: string;
  };
}

export interface UserSettings {
  controls: ControlSettings;
  crosshair: CrosshairSettings;
  video: VideoSettings;
  audio: AudioSettings;
}
