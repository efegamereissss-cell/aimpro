import { create } from 'zustand';
import { Lobby, LobbyFilterState } from '../types/esports';
import { INITIAL_LOBBIES } from '../data/mockLobbies';
import { esportsSound } from '../utils/soundEffects';

interface LobbyStore {
  lobbies: Lobby[];
  filters: LobbyFilterState;
  copiedLobbyId: string | null;
  isCreateModalOpen: boolean;
  toastMessage: string | null;

  // Actions
  setFilters: (filters: Partial<LobbyFilterState>) => void;
  resetFilters: () => void;
  createLobby: (lobby: Omit<Lobby, 'id' | 'createdAt' | 'isFull'>) => void;
  copyPartyCode: (lobbyId: string, partyCode: string) => Promise<void>;
  toggleLobbyFull: (lobbyId: string) => void;
  deleteLobby: (lobbyId: string) => void;
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

const STORAGE_KEY = 'teamcom_lobbies_v2';

// Load stored lobbies or empty default
const loadLobbies = (): Lobby[] => {
  if (typeof window === 'undefined') return INITIAL_LOBBIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_LOBBIES;
};

// Cross-tab broadcast channel for TeamCom
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel('teamcom_lobby_sync');
  } catch {}
}

export const useLobbyStore = create<LobbyStore>((set, get) => {
  // Listen to remote tab updates
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'LOBBIES_UPDATED' && Array.isArray(event.data.lobbies)) {
        set({ lobbies: event.data.lobbies });
      }
    };
  }

  const persistAndBroadcast = (lobbies: Lobby[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lobbies));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'LOBBIES_UPDATED', lobbies });
      }
    } catch {}
  };

  return {
    lobbies: loadLobbies(),
    filters: DEFAULT_FILTERS,
    copiedLobbyId: null,
    isCreateModalOpen: false,
    toastMessage: null,

    setFilters: (newFilters) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters }
      }));
    },

    resetFilters: () => set({ filters: DEFAULT_FILTERS }),

    createLobby: (lobbyData) => {
      const newLobby: Lobby = {
        ...lobbyData,
        id: 'lobby-' + Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
        isFull: false
      };

      set(state => {
        const updated = [newLobby, ...state.lobbies];
        persistAndBroadcast(updated);
        return {
          lobbies: updated,
          isCreateModalOpen: false,
          toastMessage: `Lobi Başarıyla Oluşturuldu! Kod: ${newLobby.partyCode}`
        };
      });

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

    toggleLobbyFull: (lobbyId) => {
      set(state => {
        const updated = state.lobbies.map(l =>
          l.id === lobbyId ? { ...l, isFull: !l.isFull } : l
        );
        persistAndBroadcast(updated);
        return { lobbies: updated };
      });
    },

    deleteLobby: (lobbyId) => {
      set(state => {
        const updated = state.lobbies.filter(l => l.id !== lobbyId);
        persistAndBroadcast(updated);
        return { lobbies: updated };
      });
    },

    setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
    setToast: (msg) => set({ toastMessage: msg })
  };
});
