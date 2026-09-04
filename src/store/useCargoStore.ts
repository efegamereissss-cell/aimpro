import { create } from 'zustand';
import { Shipment, CarrierId } from '../types/cargo';
import { CARRIERS, detectCarrierByCode } from '../data/carriersData';
import { SAMPLE_SHIPMENTS, generateRealisticShipment } from '../data/sampleShipments';
import { esportsSound } from '../utils/soundEffects';

interface CargoStore {
  searchQuery: string;
  selectedCarrierId: CarrierId | 'auto';
  currentShipment: Shipment | null;
  isLoading: boolean;
  errorMessage: string | null;
  savedShipments: Shipment[];
  searchHistory: string[];
  toastMessage: string | null;

  // Actions
  init: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCarrierId: (id: CarrierId | 'auto') => void;
  trackShipment: (code: string, carrierId?: CarrierId) => Promise<void>;
  saveShipment: (shipment: Shipment, customLabel?: string) => void;
  removeSavedShipment: (trackingNumber: string) => void;
  updateSavedLabel: (trackingNumber: string, label: string) => void;
  copyTrackingNumber: (code: string) => Promise<void>;
  clearCurrentShipment: () => void;
  setToast: (msg: string | null) => void;
}

const STORAGE_SAVED_KEY = 'kargocom_saved_shipments_v1';
const STORAGE_HISTORY_KEY = 'kargocom_search_history_v1';

const getInitialSavedShipments = (): Shipment[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Default with one preset saved item for immediate delight
  return [SAMPLE_SHIPMENTS['123456789012']];
};

const getInitialSearchHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return ['123456789012', 'KP048291048TR', 'TY9841294812'];
};

export const useCargoStore = create<CargoStore>((set, get) => ({
  searchQuery: '',
  selectedCarrierId: 'auto',
  currentShipment: SAMPLE_SHIPMENTS['123456789012'], // Default prefilled for instant demo
  isLoading: false,
  errorMessage: null,
  savedShipments: getInitialSavedShipments(),
  searchHistory: getInitialSearchHistory(),
  toastMessage: null,

  init: () => {
    if (typeof window === 'undefined') return;
    set({
      savedShipments: getInitialSavedShipments(),
      searchHistory: getInitialSearchHistory()
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCarrierId: (id) => set({ selectedCarrierId: id }),

  trackShipment: async (code: string, carrierOverride?: CarrierId) => {
    const clean = code.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!clean) {
      set({ errorMessage: 'Lütfen geçerli bir kargo takip numarası girin.' });
      esportsSound.playGuessWrong();
      return;
    }

    esportsSound.playClick();
    set({ isLoading: true, errorMessage: null });

    // Brief realistic query animation (350ms)
    await new Promise(r => setTimeout(r, 350));

    try {
      const selected = get().selectedCarrierId;
      const carrier: CarrierId | undefined = carrierOverride || (selected !== 'auto' ? selected : undefined);
      const result = generateRealisticShipment(clean, carrier);

      // Add to search history
      const history = [clean, ...get().searchHistory.filter(h => h !== clean)].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
      } catch {}

      set({
        currentShipment: result,
        searchQuery: clean,
        isLoading: false,
        searchHistory: history,
        toastMessage: `${result.carrier.name} Gönderisi Başarıyla Sorgulandı!`
      });

      // Play deep satisfying TOK sound!
      esportsSound.playCodeCopied();

      setTimeout(() => {
        set({ toastMessage: null });
      }, 3500);
    } catch {
      set({
        isLoading: false,
        errorMessage: 'Kargo sorgulanırken bir hata oluştu. Lütfen tekrar deneyin.'
      });
      esportsSound.playGuessWrong();
    }
  },

  saveShipment: (shipment, customLabel) => {
    const existing = get().savedShipments;
    const updatedShipment = {
      ...shipment,
      customLabel: customLabel || shipment.customLabel || 'Kargom',
      savedAt: Date.now()
    };
    const updated = [updatedShipment, ...existing.filter(s => s.trackingNumber !== shipment.trackingNumber)];

    set({
      savedShipments: updated,
      toastMessage: `Kargo "${updatedShipment.customLabel}" Takip Listenize Eklendi!`
    });

    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(updated));
    } catch {}

    esportsSound.playLobbyCreated();

    setTimeout(() => {
      set({ toastMessage: null });
    }, 3500);
  },

  removeSavedShipment: (trackingNumber) => {
    const updated = get().savedShipments.filter(s => s.trackingNumber !== trackingNumber);
    set({
      savedShipments: updated,
      toastMessage: 'Kargo Takip Listenizden Kaldırıldı'
    });

    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(updated));
    } catch {}

    setTimeout(() => {
      set({ toastMessage: null });
    }, 2500);
  },

  updateSavedLabel: (trackingNumber, label) => {
    const updated = get().savedShipments.map(s =>
      s.trackingNumber === trackingNumber ? { ...s, customLabel: label } : s
    );
    set({ savedShipments: updated });
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(updated));
    } catch {}
  },

  copyTrackingNumber: async (code) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      // Play our deep satisfying TOK sound!
      esportsSound.playCodeCopied();

      set({ toastMessage: `Takip No Kopyalandı: ${code}` });
      setTimeout(() => {
        set({ toastMessage: null });
      }, 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  },

  clearCurrentShipment: () => set({ currentShipment: null, searchQuery: '' }),
  setToast: (msg) => set({ toastMessage: msg })
}));
