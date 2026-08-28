import { create } from 'zustand';
import { MatchStats, Category } from '../types/game';

const STATS_STORAGE_KEY = 'aimlab_pro_stats_v1';

export interface CategorySkillRadar {
  clicking: number;
  tracking: number;
  switching: number;
  speed: number;
  precision: number;
}

interface StatsStore {
  history: MatchStats[];
  personalBests: Record<string, number>; // scenarioId -> high score
  addMatch: (stats: MatchStats) => void;
  getPersonalBest: (scenarioId: string) => number;
  getSkillRadar: () => CategorySkillRadar;
  clearHistory: () => void;
}

function loadSavedStats(): { history: MatchStats[]; personalBests: Record<string, number> } {
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return { history: [], personalBests: {} };
}

export const useStatsStore = create<StatsStore>((set, get) => {
  const initial = loadSavedStats();

  const persist = (history: MatchStats[], pbs: Record<string, number>) => {
    try {
      localStorage.setItem(
        STATS_STORAGE_KEY,
        JSON.stringify({ history: history.slice(0, 100), personalBests: pbs })
      );
    } catch {
      // ignore
    }
  };

  return {
    history: initial.history,
    personalBests: initial.personalBests,
    addMatch: (match: MatchStats) => {
      set(state => {
        const nextHistory = [match, ...state.history].slice(0, 100);
        const currentPB = state.personalBests[match.scenarioId] || 0;
        const nextPBs = { ...state.personalBests };
        if (match.score > currentPB) {
          nextPBs[match.scenarioId] = match.score;
        }
        persist(nextHistory, nextPBs);
        return { history: nextHistory, personalBests: nextPBs };
      });
    },
    getPersonalBest: (scenarioId: string) => {
      return get().personalBests[scenarioId] || 0;
    },
    getSkillRadar: (): CategorySkillRadar => {
      const history = get().history;
      if (history.length === 0) {
        return { clicking: 50, tracking: 50, switching: 50, speed: 50, precision: 50 };
      }

      const getCategoryAvg = (cat: Category) => {
        const matches = history.filter(m => m.category === cat);
        if (matches.length === 0) return 50;
        const total = matches.reduce((acc, m) => acc + (m.accuracy * 0.5 + Math.min(m.score / 1000, 50)), 0);
        return Math.min(Math.round(total / matches.length), 100);
      };

      const clicking = getCategoryAvg('clicking');
      const tracking = getCategoryAvg('tracking');
      const switching = getCategoryAvg('switching');

      // Speed is calculated from avg KPS & Reaction Time
      const avgKps = history.reduce((a, b) => a + b.killsPerSecond, 0) / history.length;
      const speed = Math.min(Math.round(avgKps * 25 + 30), 100);

      // Precision is calculated from overall accuracy
      const avgAcc = history.reduce((a, b) => a + b.accuracy, 0) / history.length;
      const precision = Math.min(Math.round(avgAcc), 100);

      return { clicking, tracking, switching, speed, precision };
    },
    clearHistory: () => {
      localStorage.removeItem(STATS_STORAGE_KEY);
      set({ history: [], personalBests: {} });
    }
  };
});
