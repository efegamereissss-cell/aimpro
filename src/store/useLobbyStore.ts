import { create } from 'zustand';
import { Lobby, LobbyFilterState } from '../types/esports';
import { esportsSound } from '../utils/soundEffects';
import { teamComStorage } from '../services/storage/TeamComStorage';

interface LobbyStore {
  lobbies: Lobby[];
  filters: LobbyFilterState;
  copiedLobbyId: string | null;
  isCreateModalOpen: boolean;
  toastMessage: string | null;

  // Actions
  init: () => Promise<void>;
  setFilters: (filters: Partial<LobbyFilterState>) => void;
  resetFilters: () => void;
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
  mic: 'all'
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

  init: async () => {
    // Load from permanent IndexedDB + Cloud
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

  createLobby: async (lobbyData) => {
    const newLobby: Lobby = {
      ...lobbyData,
      id: 'lobby-' + Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
      isFull: false
    };

    const current = get().lobbies;
    const updated = [newLobby, ...current];

    set({
      lobbies: updated,
      isCreateModalOpen: false,
      toastMessage: `Lobi Başarıyla Oluşturuldu! Kod: ${newLobby.partyCode}`
    });

    // Permanent IndexedDB & Cloud Save
    await teamComStorage.saveLobbies(updated);

    esportsSound.playCodeCopied();
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3500);
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
      }, 2500);
    } catch (err) {
      console.error('Failed to copy party code:', err);
    }
  },

  toggleLobbyFull: async (lobbyId) => {
    const updated = get().lobbies.map(l =>
      l.id === lobbyId ? { ...l, isFull: !l.isFull } : l
    );
    set({ lobbies: updated });
    await teamComStorage.saveLobbies(updated);
  },

  deleteLobby: async (lobbyId) => {
    const updated = get().lobbies.filter(l => l.id !== lobbyId);
    set({ lobbies: updated });
    await teamComStorage.saveLobbies(updated);
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setToast: (msg) => set({ toastMessage: msg })
}));

// Auto-run init on client
if (typeof window !== 'undefined') {
  useLobbyStore.getState().init();
}
