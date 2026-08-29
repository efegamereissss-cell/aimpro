import { create } from 'zustand';
import { RemotePlayerState, KillfeedEntry, HatType, PlayerCustomization } from '../types/multiplayer';

interface MultiplayerStore {
  isMultiplayerActive: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  roomCode: string;
  connectionError: string | null;

  // Local Player
  localId: string;
  nickname: string;
  color: string;
  hatType: HatType;
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  health: number;
  maxHealth: number;
  isAlive: boolean;
  kills: number;
  deaths: number;
  streak: number;
  respawnTimeRemaining: number;

  // Remote Players
  remotePlayers: Record<string, RemotePlayerState>;
  killfeed: KillfeedEntry[];
  isScoreboardOpen: boolean;

  // Actions
  setCustomization: (custom: Partial<PlayerCustomization>) => void;
  setMultiplayerActive: (active: boolean) => void;
  setConnected: (connected: boolean, roomCode?: string) => void;
  setConnecting: (connecting: boolean, error?: string | null) => void;
  setLocalTransform: (position: [number, number, number], rotation: [number, number, number], velocity: [number, number, number]) => void;
  updateLocalHealth: (damage: number) => { newHealth: number; isDead: boolean };
  setLocalHealth: (hp: number) => void;
  respawnLocalPlayer: () => void;
  incrementLocalKill: () => void;
  incrementLocalDeath: () => void;
  setRespawnTimer: (time: number) => void;
  setScoreboardOpen: (open: boolean) => void;

  // Remote Player Actions
  updateRemotePlayer: (player: Partial<RemotePlayerState> & { id: string }) => void;
  removeRemotePlayer: (id: string) => void;
  clearRemotePlayers: () => void;
  addKillfeedEntry: (entry: Omit<KillfeedEntry, 'id' | 'timestamp'>) => void;
}

const DEFAULT_NICKNAMES = ['CyberNinja', 'NeonSniper', 'ApexPredator', 'QuantumStrike', 'VortexPhantom', 'RadiantGhost', 'ShadowFlick'];
const DEFAULT_COLORS = ['#00f0ff', '#ff0055', '#ffea00', '#00ff66', '#a855f7', '#ff6600'];

const randomNick = DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)] + '_' + Math.floor(Math.random() * 99);
const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
const randomLocalId = 'p_' + Math.random().toString(36).substring(2, 9);

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  isMultiplayerActive: false,
  isConnected: false,
  isConnecting: false,
  roomCode: 'aimpro-global-dm',
  connectionError: null,

  // Local Player State
  localId: randomLocalId,
  nickname: typeof localStorage !== 'undefined' ? localStorage.getItem('aimpro_mp_nick') || randomNick : randomNick,
  color: typeof localStorage !== 'undefined' ? localStorage.getItem('aimpro_mp_color') || randomColor : randomColor,
  hatType: (typeof localStorage !== 'undefined' ? (localStorage.getItem('aimpro_mp_hat') as HatType) || 'triangle' : 'triangle'),
  position: [0, 1.62, 0],
  rotation: [0, 0, 0],
  velocity: [0, 0, 0],
  health: 100,
  maxHealth: 100,
  isAlive: true,
  kills: 0,
  deaths: 0,
  streak: 0,
  respawnTimeRemaining: 0,

  remotePlayers: {},
  killfeed: [],
  isScoreboardOpen: false,

  setCustomization: (custom) => {
    if (typeof localStorage !== 'undefined') {
      if (custom.nickname) localStorage.setItem('aimpro_mp_nick', custom.nickname);
      if (custom.color) localStorage.setItem('aimpro_mp_color', custom.color);
      if (custom.hatType) localStorage.setItem('aimpro_mp_hat', custom.hatType);
    }
    set(custom);
  },

  setMultiplayerActive: (active) => set({ isMultiplayerActive: active }),
  setConnected: (connected, roomCode) => set({ isConnected: connected, isConnecting: false, roomCode: roomCode || get().roomCode }),
  setConnecting: (connecting, error = null) => set({ isConnecting: connecting, connectionError: error }),

  setLocalTransform: (position, rotation, velocity) => set({ position, rotation, velocity }),

  updateLocalHealth: (damage) => {
    const state = get();
    const newHealth = Math.max(0, state.health - damage);
    const isDead = newHealth <= 0 && state.isAlive;
    
    set({
      health: newHealth,
      isAlive: newHealth > 0,
      deaths: isDead ? state.deaths + 1 : state.deaths,
      streak: isDead ? 0 : state.streak,
      respawnTimeRemaining: isDead ? 3.0 : state.respawnTimeRemaining
    });

    return { newHealth, isDead };
  },

  setLocalHealth: (hp) => set({ health: hp, isAlive: hp > 0 }),

  respawnLocalPlayer: () => set({
    health: 100,
    isAlive: true,
    respawnTimeRemaining: 0
  }),

  incrementLocalKill: () => {
    const s = get();
    set({
      kills: s.kills + 1,
      streak: s.streak + 1,
      health: Math.min(100, s.health + 35)
    });
  },

  incrementLocalDeath: () => set(s => ({
    deaths: s.deaths + 1,
    streak: 0
  })),

  setRespawnTimer: (time) => set({ respawnTimeRemaining: time }),
  setScoreboardOpen: (open) => set({ isScoreboardOpen: open }),

  updateRemotePlayer: (player) => set(s => {
    const existing = s.remotePlayers[player.id];
    const updated: RemotePlayerState = {
      id: player.id,
      nickname: player.nickname || existing?.nickname || 'Player',
      color: player.color || existing?.color || '#00f0ff',
      hatType: player.hatType || existing?.hatType || 'triangle',
      position: player.position || existing?.position || [0, 1.62, 0],
      rotation: player.rotation || existing?.rotation || [0, 0, 0],
      velocity: player.velocity || existing?.velocity || [0, 0, 0],
      activeWeapon: player.activeWeapon || existing?.activeWeapon || 'vandal',
      health: player.health !== undefined ? player.health : existing?.health !== undefined ? existing.health : 100,
      maxHealth: 100,
      isAlive: player.isAlive !== undefined ? player.isAlive : existing?.isAlive !== undefined ? existing.isAlive : true,
      isFiring: player.isFiring !== undefined ? player.isFiring : existing?.isFiring || false,
      isJumping: player.isJumping !== undefined ? player.isJumping : existing?.isJumping || false,
      kills: player.kills !== undefined ? player.kills : existing?.kills || 0,
      deaths: player.deaths !== undefined ? player.deaths : existing?.deaths || 0,
      ping: player.ping !== undefined ? player.ping : existing?.ping || 15,
      lastUpdated: Date.now()
    };

    return {
      remotePlayers: {
        ...s.remotePlayers,
        [player.id]: updated
      }
    };
  }),

  removeRemotePlayer: (id) => set(s => {
    const next = { ...s.remotePlayers };
    delete next[id];
    return { remotePlayers: next };
  }),

  clearRemotePlayers: () => set({ remotePlayers: {} }),

  addKillfeedEntry: (entry) => set(s => ({
    killfeed: [
      {
        ...entry,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now()
      },
      ...s.killfeed
    ].slice(0, 6)
  }))
}));
