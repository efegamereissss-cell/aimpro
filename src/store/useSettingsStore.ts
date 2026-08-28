import { create } from 'zustand';
import { UserSettings, GameSensPreset, CrosshairSettings, VideoSettings, AudioSettings, ControlSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { soundEngine } from '../audio/SoundEngine';

const STORAGE_KEY = 'aimpro_ultimate_settings_v2';

function loadSavedSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

interface SettingsStore {
  settings: UserSettings;
  updateControls: (controls: Partial<ControlSettings>) => void;
  updateSens: (sens: number) => void;
  updateDpi: (dpi: number) => void;
  updateGamePreset: (preset: GameSensPreset) => void;
  updateCrosshair: (crosshair: Partial<CrosshairSettings>) => void;
  updateVideo: (video: Partial<VideoSettings>) => void;
  updateAudio: (audio: Partial<AudioSettings>) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => {
  const initial = loadSavedSettings();
  
  // Sync sound engine on init
  soundEngine.updateVolumes(
    initial.audio.masterVolume,
    initial.audio.gunVolume,
    initial.audio.hitVolume,
    initial.audio.missVolume
  );
  soundEngine.baseHitFrequency = initial.audio.hitSoundFrequency;
  soundEngine.preset = initial.audio.hitSoundPreset;
  soundEngine.comboPitchEscalation = initial.audio.comboPitchEscalation;

  const save = (newSettings: UserSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  return {
    settings: initial,
    updateControls: (controls: Partial<ControlSettings>) => {
      set(state => {
        const next = {
          ...state.settings,
          controls: { ...state.settings.controls, ...controls }
        };
        save(next);
        return { settings: next };
      });
    },
    updateSens: (sens: number) => {
      set(state => {
        const next = {
          ...state.settings,
          controls: { ...state.settings.controls, inGameSens: sens }
        };
        save(next);
        return { settings: next };
      });
    },
    updateDpi: (dpi: number) => {
      set(state => {
        const next = {
          ...state.settings,
          controls: { ...state.settings.controls, dpi }
        };
        save(next);
        return { settings: next };
      });
    },
    updateGamePreset: (preset: GameSensPreset) => {
      set(state => {
        const next = {
          ...state.settings,
          controls: { ...state.settings.controls, gamePreset: preset }
        };
        save(next);
        return { settings: next };
      });
    },
    updateCrosshair: (crosshair: Partial<CrosshairSettings>) => {
      set(state => {
        const next = {
          ...state.settings,
          crosshair: { ...state.settings.crosshair, ...crosshair }
        };
        save(next);
        return { settings: next };
      });
    },
    updateVideo: (video: Partial<VideoSettings>) => {
      set(state => {
        const next = {
          ...state.settings,
          video: { ...state.settings.video, ...video }
        };
        save(next);
        return { settings: next };
      });
    },
    updateAudio: (audio: Partial<AudioSettings>) => {
      set(state => {
        const next = {
          ...state.settings,
          audio: { ...state.settings.audio, ...audio }
        };
        save(next);
        // Live update SoundEngine
        soundEngine.updateVolumes(
          next.audio.masterVolume,
          next.audio.gunVolume,
          next.audio.hitVolume,
          next.audio.missVolume
        );
        soundEngine.baseHitFrequency = next.audio.hitSoundFrequency;
        soundEngine.preset = next.audio.hitSoundPreset;
        soundEngine.comboPitchEscalation = next.audio.comboPitchEscalation;
        return { settings: next };
      });
    },
    resetToDefaults: () => {
      save(DEFAULT_SETTINGS);
      set({ settings: DEFAULT_SETTINGS });
    }
  };
});
