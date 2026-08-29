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
  updateLocalHealth: (delta: number) => { newHealth: number; isDead: boolean };
  setLocalHealth: (hp: number) => void;
  respawnLocalPlayer: () => void;
  incrementLocalKill: () => void;
  incrementLocalDeath: () => void;
  setRespawnTimer: (time: number) => void;
  setScoreboardOpen: (open: boolean) => void;

  // Remote Player Actions
  updateRemotePlayer: (player: RemotePlayerState) => void;
  removeRemotePlayer: (id: string) => void;
  clearRemotePlayers: () => void;
  addKillfeedEntry: (entry: Omit<KillfeedEntry, 'id' | 'timestamp'>) => void;
}

const DEFAULT_NICKNAMES = ['CyberNinja', 'NeonSniper', 'ApexPredator', 'QuantumStrike', 'VortexPhantom', 'RadiantGhost', 'ShadowFlick'];
const DEFAULT_COLORS = ['#00f0ff', '#ff0055', '#ffea00', '#00ff66', '#a855f7', '#ff6600'];

const randomNick = DEFAULT_NICKNAMES[Math.floor(Math.random() * DEFAULT_NICKNAMES.length)] + Math.floor(Math.random() * 99);
const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  isMultiplayerActive: false,
  isConnected: false,
  isConnecting: false,
  roomCode: 'aimpro-global-dm',
  connectionError: null,

  // Local Player State
  localId: 'player_' + Math.random().toString(36).substring(2, 9),
  nickname: typeof localStorage !== 'undefined' ? localStorage.getItem('aimpro_mp_nick') || randomNick : randomNick,
  color: typeof localStorage !== 'undefined' ? localStorage.getItem('aimpro_mp_color') || randomColor : randomColor,
  hatType: (typeof localStorage !== 'undefined' ? (localStorage.getItem('aimpro_mp_hat') as HatType) || 'triangle' : 'triangle'),
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
      health: Math.min(100, s.health + 35) // Reward 35 HP on kill!
    });
  },

  incrementLocalDeath: () => set(s => ({
    deaths: s.deaths + 1,
    streak: 0
  })),

  setRespawnTimer: (time) => set({ respawnTimeRemaining: time }),
  setScoreboardOpen: (open) => set({ isScoreboardOpen: open }),

  updateRemotePlayer: (player) => set(s => ({
    remotePlayers: {
      ...s.remotePlayers,
      [player.id]: player
    }
  })),

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
    ].slice(0, 6) // Keep latest 6 entries
  }))
}));
