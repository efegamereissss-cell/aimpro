import { create } from 'zustand';
import { ValorantRank } from '../types/esports';
import { GUESS_RANK_SCENARIOS } from '../data/guessRankScenarios';
import { esportsSound } from '../utils/soundEffects';

interface RankGameStore {
  currentIndex: number;
  scenarios: typeof GUESS_RANK_SCENARIOS;
  selectedGuess: ValorantRank | null;
  isAnswerRevealed: boolean;
  score: number;
  streak: number;
  bestStreak: number;

  // Actions
  submitGuess: (rank: ValorantRank) => void;
  nextScenario: () => void;
  resetGame: () => void;
}

export const useRankGameStore = create<RankGameStore>((set, get) => ({
  currentIndex: 0,
  scenarios: GUESS_RANK_SCENARIOS,
  selectedGuess: null,
  isAnswerRevealed: false,
  score: 0,
  streak: 0,
  bestStreak: 0,

  submitGuess: (rank) => {
    const { scenarios, currentIndex, isAnswerRevealed, streak, bestStreak, score } = get();
    if (isAnswerRevealed) return;

    const current = scenarios[currentIndex];
    const isCorrect = current.correctRank === rank;

    if (isCorrect) {
      esportsSound.playGuessCorrect();
      const newStreak = streak + 1;
      set({
        selectedGuess: rank,
        isAnswerRevealed: true,
        score: score + 100 + streak * 25,
        streak: newStreak,
        bestStreak: Math.max(bestStreak, newStreak)
      });
    } else {
      esportsSound.playGuessWrong();
      set({
        selectedGuess: rank,
        isAnswerRevealed: true,
        streak: 0
      });
    }
  },

  nextScenario: () => {
    const { currentIndex, scenarios } = get();
    const nextIdx = (currentIndex + 1) % scenarios.length;
    set({
      currentIndex: nextIdx,
      selectedGuess: null,
      isAnswerRevealed: false
    });
  },

  resetGame: () => {
    set({
      currentIndex: 0,
      selectedGuess: null,
      isAnswerRevealed: false,
      score: 0,
      streak: 0
    });
  }
}));
