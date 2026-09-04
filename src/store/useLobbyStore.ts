import { create } from 'zustand';
import { Lobby, LobbyFilterState, ValorantRank, AgentRole } from '../types/esports';
import { esportsSound } from '../utils/soundEffects';
import { teamComStorage, getLocalUserId } from '../services/storage/TeamComStorage';

export interface UserProfile {
  name: string;
  tag: string;
  rank: ValorantRank;
  role: AgentRole;
}

interface LobbyStore {
  lobbies: Lobby[];
  filters: LobbyFilterState;
  copiedLobbyId: string | null;
  isCreateModalOpen: boolean;
  toastMessage: string | null;
  userProfile: UserProfile;

  // Actions
  init: () => Promise<void>;
  setFilters: (filters: Partial<LobbyFilterState>) => void;
  resetFilters: () => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  createLobby: (lobby: Omit<Lobby, 'id' | 'createdAt' | 'isFull'>) => Promise<void>;
  copyPartyCode: (lobbyId: string, partyCode: string) => Promise<void>;
  toggleLobbyFull: (lobbyId: string) => Promise<void>;
  deleteLobby: (lobbyId: string) => Promise<void>;
  setCreateModalOpen: (open: boolean) => void;
  setToast: (msg: string | null) => void;
}

const DEFAULT_FILTERS: LobbyFilterState = {
  searchQuery: '',
  rank: 'all',
  role: 'all',
  mode: 'all',
  server: 'all',
  mic: 'all',
  onlyOpen: false
};

const getSavedUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') {
    return { name: '', tag: 'TR1', rank: 'platinum', role: 'duelist' };
  }
  try {
    const raw = localStorage.getItem('teamcom_user_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name) return parsed;
    }
  } catch {}
  return { name: '', tag: 'TR1', rank: 'platinum', role: 'duelist' };
};

// Initial sync from localStorage
const getImmediateLocalLobbies = (): Lobby[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('teamcom_lobbies_permanent');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  lobbies: getImmediateLocalLobbies(),
  filters: DEFAULT_FILTERS,
  copiedLobbyId: null,
  isCreateModalOpen: false,
  toastMessage: null,
  userProfile: getSavedUserProfile(),

  init: async () => {
    // Load from permanent IndexedDB + Real-Time Cloud
    await teamComStorage.init((remoteLobbies) => {
      set({ lobbies: remoteLobbies });
    });
    const loaded = await teamComStorage.getLobbies();
    if (loaded && loaded.length > 0) {
      set({ lobbies: loaded });
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setUserProfile: (profile) => {
    const updated = { ...get().userProfile, ...profile };
    set({ userProfile: updated });
    try {
      localStorage.setItem('teamcom_user_profile', JSON.stringify(updated));
    } catch {}
  },

  createLobby: async (lobbyData) => {
    const newLobby: Lobby = {
      ...lobbyData,
      id: 'lobby-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      isFull: false,
      ownerId: getLocalUserId()
    };

    // Save profile name & tag if provided
    if (lobbyData.hostName) {
      get().setUserProfile({
        name: lobbyData.hostName,
        tag: lobbyData.hostTag || 'TR1',
        rank: lobbyData.hostRank
      });
    }

    const current = get().lobbies;
    const updated = [newLobby, ...current];

    set({
      lobbies: updated,
      isCreateModalOpen: false,
      toastMessage: `Lobi Başarıyla Yayınlandı! Kod: ${newLobby.partyCode}`
    });

    // Real-Time Global Broadcast & Local Save
    await teamComStorage.broadcastCreateLobby(newLobby);

    esportsSound.playLobbyCreated();
    setTimeout(() => {
      set({ toastMessage: null });
    }, 4000);
  },

  copyPartyCode: async (lobbyId, partyCode) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(partyCode);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = partyCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      esportsSound.playCodeCopied();
      set({
        copiedLobbyId: lobbyId,
        toastMessage: `Grup Kodu Kopyalandı: ${partyCode} (Valorant'ta Ctrl+V yapın!)`
      });

      setTimeout(() => {
        set(state => ({
          copiedLobbyId: state.copiedLobbyId === lobbyId ? null : state.copiedLobbyId,
          toastMessage: null
        }));
      }, 3000);
    } catch (err) {
      console.error('Failed to copy party code:', err);
    }
  },

  toggleLobbyFull: async (lobbyId) => {
    const target = get().lobbies.find(l => l.id === lobbyId);
    if (!target) return;
    const updatedLobby = { ...target, isFull: !target.isFull };
    const updated = get().lobbies.map(l => l.id === lobbyId ? updatedLobby : l);
    set({ lobbies: updated });
    await teamComStorage.broadcastCreateLobby(updatedLobby);
  },

  deleteLobby: async (lobbyId) => {
    const updated = get().lobbies.filter(l => l.id !== lobbyId);
    set({
      lobbies: updated,
      toastMessage: 'Lobi Başarıyla Kaldırıldı'
    });
    await teamComStorage.broadcastDeleteLobby(lobbyId);
    setTimeout(() => {
      set({ toastMessage: null });
    }, 2500);
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setToast: (msg) => set({ toastMessage: msg })
}));

// Auto-run init on client
if (typeof window !== 'undefined') {
  useLobbyStore.getState().init();
}
