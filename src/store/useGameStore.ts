import { create } from 'zustand';
import { 
  ScenarioConfig, 
  ActiveTarget, 
  HitEvent, 
  MatchStats, 
  FloatingTextItem, 
  BulletTracer, 
  ParticleItem 
} from '../types/game';
import { ALL_SCENARIOS } from '../data/scenarios';
import { calculateRankTier, randomRange } from '../utils/math';
import { soundEngine } from '../audio/SoundEngine';

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'results';

interface GameStore {
  activeScenario: ScenarioConfig;
  status: GameStatus;
  activeWeaponSlot: 'gun' | 'knife';
  timeRemaining: number;
  score: number;
  shotsFired: number;
  shotsHit: number;
  targetsDestroyed: number;
  currentStreak: number;
  maxStreak: number;
  reactionTimes: number[];
  activeTargets: ActiveTarget[];
  floatingTexts: FloatingTextItem[];
  bulletTracers: BulletTracer[];
  particles: ParticleItem[];
  lastHitmarker: { timestamp: number; isHeadshot: boolean; isKill: boolean } | null;
  lastMatchStats: MatchStats | null;

  // Actions
  setScenario: (scenario: ScenarioConfig) => void;
  setWeaponSlot: (slot: 'gun' | 'knife') => void;
  startCountdown: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  restartGame: () => void;
  exitToMenu: () => void;
  tickGame: (deltaSec: number) => void;
  registerShot: (hitTargetId?: string, hitPosition?: [number, number, number], isHeadshot?: boolean) => void;
  registerTrackingTick: (targetId: string, deltaSec: number) => void;
  spawnTarget: () => void;
  addFloatingText: (text: string, position: [number, number, number], color: string) => void;
  addBulletTracer: (from: [number, number, number], to: [number, number, number], color?: string) => void;
  addExplosionParticles: (position: [number, number, number], color?: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  activeScenario: ALL_SCENARIOS[0],
  status: 'idle',
  activeWeaponSlot: 'gun',
  timeRemaining: 60,
  score: 0,
  shotsFired: 0,
  shotsHit: 0,
  targetsDestroyed: 0,
  currentStreak: 0,
  maxStreak: 0,
  reactionTimes: [],
  activeTargets: [],
  floatingTexts: [],
  bulletTracers: [],
  particles: [],
  lastHitmarker: null,
  lastMatchStats: null,

  setScenario: (scenario: ScenarioConfig) => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({
      activeScenario: scenario,
      timeRemaining: scenario.duration,
      status: 'idle',
      activeTargets: [],
      score: 0,
      shotsFired: 0,
      shotsHit: 0,
      targetsDestroyed: 0,
      currentStreak: 0,
      maxStreak: 0,
      reactionTimes: []
    });
  },

  setWeaponSlot: (slot: 'gun' | 'knife') => {
    set({ activeWeaponSlot: slot });
  },

  startCountdown: () => {
    set({ status: 'countdown' });
  },

  startGame: () => {
    const scenario = get().activeScenario;
    set({
      status: 'playing',
      timeRemaining: scenario.duration,
      score: 0,
      shotsFired: 0,
      shotsHit: 0,
      targetsDestroyed: 0,
      currentStreak: 0,
      maxStreak: 0,
      reactionTimes: [],
      activeTargets: [],
      floatingTexts: [],
      bulletTracers: [],
      particles: [],
      lastHitmarker: null
    });

    for (let i = 0; i < scenario.targetCount; i++) {
      get().spawnTarget();
    }
  },

  pauseGame: () => {
    if (get().status === 'playing') {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      set({ status: 'paused' });
    }
  },

  resumeGame: () => {
    if (get().status === 'paused') {
      set({ status: 'playing' });
    }
  },

  restartGame: () => {
    get().startGame();
  },

  exitToMenu: () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ status: 'idle', activeTargets: [] });
  },

  endGame: () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    const { 
      activeScenario, 
      score, 
      shotsFired, 
      shotsHit, 
      targetsDestroyed, 
      maxStreak, 
      reactionTimes 
    } = get();

    const duration = activeScenario.duration;
    const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 1000) / 10 : 0;
    const avgReactionTimeMs = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 220;
    const killsPerSecond = Math.round((targetsDestroyed / Math.max(duration, 1)) * 100) / 100;
    const rankTier = calculateRankTier(score, accuracy, activeScenario.category);

    const stats: MatchStats = {
      scenarioId: activeScenario.id,
      scenarioName: activeScenario.name,
      category: activeScenario.category,
      timestamp: Date.now(),
      duration,
      score,
      accuracy,
      shotsFired,
      shotsHit,
      targetsDestroyed,
      maxStreak,
      avgReactionTimeMs,
      damageDone: targetsDestroyed * activeScenario.targetMaxHealth,
      killsPerSecond,
      hitHistory: [],
      rankTier
    };

    set({ status: 'results', lastMatchStats: stats, activeTargets: [] });
  },

  tickGame: (deltaSec: number) => {
    const state = get();
    if (state.status !== 'playing') return;

    const newTime = state.timeRemaining - deltaSec;
    if (newTime <= 0) {
      set({ timeRemaining: 0 });
      get().endGame();
      return;
    }

    const now = Date.now();
    const updatedTargets: ActiveTarget[] = [];
    const scenario = state.activeScenario;

    state.activeTargets.forEach(target => {
      const elapsed = (now - target.createdAt) / 1000;
      let [x, y, z] = target.position;
      let [vx, vy, vz] = target.velocity;

      if (target.movementPattern === 'linear') {
        x += vx * deltaSec;
        y += vy * deltaSec;
        if (x < scenario.spawnArea.xMin || x > scenario.spawnArea.xMax) vx = -vx;
        if (y < scenario.spawnArea.yMin || y > scenario.spawnArea.yMax) vy = -vy;
      } else if (target.movementPattern === 'sinusoidal') {
        x = target.spawnPosition[0] + Math.sin(elapsed * scenario.movementSpeed + target.movementPhase) * 3.5;
        y = target.spawnPosition[1] + Math.cos(elapsed * (scenario.movementSpeed * 0.8) + target.movementPhase) * 1.5;
      } else if (target.movementPattern === 'bounce') {
        x += vx * deltaSec;
        y += vy * deltaSec;
        vy -= 9.8 * deltaSec;
        if (y <= scenario.spawnArea.yMin) {
          y = scenario.spawnArea.yMin;
          vy = Math.abs(vy) * 0.95;
        }
        if (x <= scenario.spawnArea.xMin || x >= scenario.spawnArea.xMax) vx = -vx;
      } else if (target.movementPattern === 'strafe_short' || target.movementPattern === 'strafe_long') {
        const period = target.movementPattern === 'strafe_short' ? 0.7 : 1.8;
        x = target.spawnPosition[0] + Math.sin((elapsed / period) * Math.PI) * (target.movementPattern === 'strafe_short' ? 2.0 : 4.5);
      } else if (target.movementPattern === 'strafe_random') {
        x += vx * deltaSec;
        if (Math.random() < 0.05) vx = -vx;
        if (x < scenario.spawnArea.xMin || x > scenario.spawnArea.xMax) vx = -vx;
      } else if (target.movementPattern === 'orbit_360') {
        const angle = elapsed * (scenario.movementSpeed * 0.4) + target.movementPhase;
        const radius = 9;
        x = Math.sin(angle) * radius;
        z = Math.cos(angle) * radius;
      } else if (target.movementPattern === 'evasive_3d') {
        x = target.spawnPosition[0] + Math.sin(elapsed * 2.5 + target.movementPhase) * 3.0;
        y = target.spawnPosition[1] + Math.cos(elapsed * 1.8 + target.movementPhase) * 2.0;
        z = target.spawnPosition[2] + Math.sin(elapsed * 1.2 + target.movementPhase) * 3.0;
      }

      if (scenario.movementPattern === 'shrinking') {
        const life = 1.2 - elapsed * 1.2;
        if (life <= 0) return;
      }

      updatedTargets.push({
        ...target,
        position: [x, y, z],
        velocity: [vx, vy, vz],
        isHitThisFrame: false
      });
    });

    while (updatedTargets.length < scenario.targetCount) {
      const sp = scenario.spawnArea;
      const spawnPos: [number, number, number] = [
        randomRange(sp.xMin, sp.xMax),
        randomRange(sp.yMin, sp.yMax),
        randomRange(sp.zMin, sp.zMax)
      ];
      const speed = scenario.movementSpeed;
      const angle = randomRange(0, Math.PI * 2);

      updatedTargets.push({
        id: 'target_' + Math.random().toString(36).substring(2, 9),
        position: [...spawnPos],
        velocity: [Math.cos(angle) * speed, Math.sin(angle) * speed, 0],
        radius: scenario.targetRadius,
        shape: scenario.targetShape,
        maxHealth: scenario.targetMaxHealth,
        currentHealth: scenario.targetMaxHealth,
        createdAt: now,
        spawnPosition: [...spawnPos],
        movementPattern: scenario.movementPattern,
        movementPhase: randomRange(0, Math.PI * 2)
      });
    }

    const activeTexts = state.floatingTexts.filter(t => now - t.createdAt < t.lifetime);
    const activeTracers = state.bulletTracers.filter(t => now - t.createdAt < t.duration);
    const activeParticles = state.particles
      .map(p => ({
        ...p,
        position: [
          p.position[0] + p.velocity[0] * deltaSec,
          p.position[1] + p.velocity[1] * deltaSec,
          p.position[2] + p.velocity[2] * deltaSec
        ] as [number, number, number],
        life: p.life - deltaSec / p.maxLife
      }))
      .filter(p => p.life > 0);

    set({
      timeRemaining: newTime,
      activeTargets: updatedTargets,
      floatingTexts: activeTexts,
      bulletTracers: activeTracers,
      particles: activeParticles
    });
  },

  registerShot: (hitTargetId?: string, hitPosition?: [number, number, number], isHeadshot: boolean = false) => {
    const state = get();
    if (state.status !== 'playing') return;

    const now = Date.now();
    const scenario = state.activeScenario;

    if (!hitTargetId) {
      soundEngine.playMissSound();
      const newStreak = 0;
      const penalty = scenario.scorePenaltyMiss;
      set({
        shotsFired: state.shotsFired + 1,
        currentStreak: newStreak,
        score: Math.max(0, state.score - penalty)
      });
      return;
    }

    const targetIndex = state.activeTargets.findIndex(t => t.id === hitTargetId);
    if (targetIndex === -1) return;

    const target = state.activeTargets[targetIndex];
    const reactionTime = now - target.createdAt;
    const newStreak = state.currentStreak + 1;
    const maxStreak = Math.max(state.maxStreak, newStreak);

    soundEngine.playHitSound(newStreak, isHeadshot);

    const isKill = target.currentHealth <= 1;
    const pointsGained = scenario.scorePerHit + (isKill ? scenario.scorePerKill : 0) + (isHeadshot ? 50 : 0);

    if (hitPosition) {
      get().addFloatingText(
        isKill ? '+' + pointsGained : (isHeadshot ? 'CRIT!' : '+25'),
        hitPosition,
        isHeadshot ? '#ff007f' : (isKill ? '#00f0ff' : '#fbbf24')
      );
      if (isKill) {
        get().addExplosionParticles(hitPosition, isHeadshot ? '#ff007f' : '#00f0ff');
      }
    }

    let nextTargets = [...state.activeTargets];
    let nextDestroyed = state.targetsDestroyed;

    if (isKill) {
      nextTargets.splice(targetIndex, 1);
      nextDestroyed += 1;
    } else {
      nextTargets[targetIndex] = {
        ...target,
        currentHealth: target.currentHealth - 1,
        isHitThisFrame: true
      };
    }

    set({
      shotsFired: state.shotsFired + 1,
      shotsHit: state.shotsHit + 1,
      score: state.score + pointsGained,
      targetsDestroyed: nextDestroyed,
      currentStreak: newStreak,
      maxStreak,
      activeTargets: nextTargets,
      reactionTimes: [...state.reactionTimes, reactionTime],
      lastHitmarker: { timestamp: now, isHeadshot, isKill }
    });
  },

  registerTrackingTick: (targetId: string, deltaSec: number) => {
    const state = get();
    if (state.status !== 'playing') return;

    const targetIndex = state.activeTargets.findIndex(t => t.id === targetId);
    if (targetIndex === -1) return;

    const scenario = state.activeScenario;
    const points = Math.round(scenario.scorePerHit * deltaSec * 60);

    soundEngine.playTrackingTick(1.0);

    set({
      shotsFired: state.shotsFired + 1,
      shotsHit: state.shotsHit + 1,
      score: state.score + points
    });
  },

  spawnTarget: () => {
    const scenario = get().activeScenario;
    const sp = scenario.spawnArea;
    const spawnPos: [number, number, number] = [
      randomRange(sp.xMin, sp.xMax),
      randomRange(sp.yMin, sp.yMax),
      randomRange(sp.zMin, sp.zMax)
    ];
    const speed = scenario.movementSpeed;
    const angle = randomRange(0, Math.PI * 2);

    const newTarget: ActiveTarget = {
      id: 'target_' + Math.random().toString(36).substring(2, 9),
      position: spawnPos,
      velocity: [Math.cos(angle) * speed, Math.sin(angle) * speed, 0],
      radius: scenario.targetRadius,
      shape: scenario.targetShape,
      maxHealth: scenario.targetMaxHealth,
      currentHealth: scenario.targetMaxHealth,
      createdAt: Date.now(),
      spawnPosition: spawnPos,
      movementPattern: scenario.movementPattern,
      movementPhase: randomRange(0, Math.PI * 2)
    };

    set(state => ({ activeTargets: [...state.activeTargets, newTarget] }));
  },

  addFloatingText: (text: string, position: [number, number, number], color: string) => {
    const item: FloatingTextItem = {
      id: 'text_' + Math.random().toString(36).substring(2, 9),
      text,
      position: [position[0], position[1] + 0.3, position[2]],
      color,
      createdAt: Date.now(),
      lifetime: 650
    };
    set(state => ({ floatingTexts: [...state.floatingTexts, item] }));
  },

  addBulletTracer: (from: [number, number, number], to: [number, number, number], color: string = '#00f0ff') => {
    const tracer: BulletTracer = {
      id: 'tracer_' + Math.random().toString(36).substring(2, 9),
      from,
      to,
      color,
      createdAt: Date.now(),
      duration: 120
    };
    set(state => ({ bulletTracers: [...state.bulletTracers, tracer] }));
  },

  addExplosionParticles: (position: [number, number, number], color: string = '#00f0ff') => {
    const count = 16;
    const newParticles: ParticleItem[] = [];
    for (let i = 0; i < count; i++) {
      const speed = randomRange(2.5, 7.0);
      const theta = randomRange(0, Math.PI * 2);
      const phi = randomRange(-Math.PI / 2, Math.PI / 2);
      newParticles.push({
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        position: [...position],
        velocity: [
          Math.cos(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * speed,
          Math.cos(phi) * Math.sin(theta) * speed
        ],
        color,
        size: randomRange(0.04, 0.12),
        life: 1.0,
        maxLife: randomRange(0.3, 0.6)
      });
    }
    set(state => ({ particles: [...state.particles, ...newParticles] }));
  }
}));
