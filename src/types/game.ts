export type Category = 'clicking' | 'tracking' | 'switching' | 'strafing' | 'custom';

export type TargetShape = 'sphere' | 'cube' | 'capsule' | 'cylinder' | 'humanoid';

export type MovementPattern = 
  | 'static'
  | 'linear'
  | 'sinusoidal'
  | 'bounce'
  | 'strafe_short'
  | 'strafe_long'
  | 'strafe_random'
  | 'parabolic_jump'
  | 'orbit_360'
  | 'evasive_3d'
  | 'shrinking';

export interface ScenarioConfig {
  id: string;
  name: string;
  category: Category;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' | 'Grandmaster';
  duration: number; // in seconds (e.g. 60)
  targetCount: number; // active targets at once
  targetShape: TargetShape;
  targetRadius: number; // scale (e.g. 0.4 - 1.5)
  targetColor?: string;
  targetMaxHealth: number; // 1 for click/flick, >1 for tracking/switch
  movementPattern: MovementPattern;
  movementSpeed: number; // units/sec
  spawnArea: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
  };
  respawnDelayMs: number; // delay before new target appears
  trackingDrainRate?: number; // health drained per sec on tracking
  scorePerHit: number;
  scorePerKill: number;
  scorePenaltyMiss: number;
  weaponType: 'pistol' | 'rifle' | 'beam' | 'sniper' | 'shotgun';
  fireRateRps: number; // rounds per sec
  isAutomatic: boolean;
  tags: string[];
}

export interface ActiveTarget {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  radius: number;
  shape: TargetShape;
  maxHealth: number;
  currentHealth: number;
  createdAt: number;
  expireAt?: number;
  spawnPosition: [number, number, number];
  movementPattern: MovementPattern;
  movementPhase: number;
  isHitThisFrame?: boolean;
}

export interface HitEvent {
  targetId: string;
  position: [number, number, number];
  damage: number;
  isKill: boolean;
  isHeadshot: boolean;
  timestamp: number;
}

export interface MatchStats {
  scenarioId: string;
  scenarioName: string;
  category: Category;
  timestamp: number;
  duration: number;
  score: number;
  accuracy: number;
  shotsFired: number;
  shotsHit: number;
  targetsDestroyed: number;
  maxStreak: number;
  avgReactionTimeMs: number;
  damageDone: number;
  killsPerSecond: number;
  hitHistory: { time: number; score: number; accuracy: number; kps: number }[];
  rankTier: RankTier;
}

export type RankTier = 
  | 'Iron'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Grandmaster'
  | 'Ascendant';

export interface FloatingTextItem {
  id: string;
  text: string;
  position: [number, number, number];
  color: string;
  createdAt: number;
  lifetime: number;
}

export interface BulletTracer {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  createdAt: number;
  duration: number;
}

export interface ParticleItem {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  size: number;
  life: number; // 0 to 1
  maxLife: number;
}
