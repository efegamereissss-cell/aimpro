import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/useGameStore';
import { useStatsStore } from '../../store/useStatsStore';
import { RANK_COLORS } from '../../utils/math';
import { 
  Trophy, 
  RotateCcw, 
  List, 
  Home, 
  Flame, 
  Zap, 
  Crosshair, 
  Clock, 
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ResultScreenProps {
  onPlayAgain: () => void;
  onOpenBrowser: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  onPlayAgain,
  onOpenBrowser,
  onGoHome
}) => {
  const lastMatch = useGameStore(state => state.lastMatchStats);
  const addMatch = useStatsStore(state => state.addMatch);
  const getPersonalBest = useStatsStore(state => state.getPersonalBest);

  useEffect(() => {
    if (!lastMatch) return;

    // Save match to persistent history
    addMatch(lastMatch);

    // Check if new PB
    const prevPB = getPersonalBest(lastMatch.scenarioId);
    if (lastMatch.score > prevPB) {
      // Confetti celebration
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [lastMatch, addMatch, getPersonalBest]);

  if (!lastMatch) return null;

  const prevPB = getPersonalBest(lastMatch.scenarioId);
  const isNewPB = lastMatch.score >= prevPB && lastMatch.score > 0;
  const rankColor = RANK_COLORS[lastMatch.rankTier] || '#00f0ff';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 md:p-6 select-none overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 md:p-8 border border-cyber-border shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-5">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-cyber-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AIMPRO 2.0 Telemetry • {lastMatch.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mt-1">
              {lastMatch.scenarioName}
            </h1>
          </div>

          {/* Rank Badge */}
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border bg-cyber-card/90 shadow-lg"
            style={{ borderColor: rankColor }}
          >
            <Award className="w-8 h-8" style={{ color: rankColor }} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-cyber-muted tracking-widest">Skill Tier</span>
              <span className="text-lg font-black tracking-wide" style={{ color: rankColor }}>
                {lastMatch.rankTier}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Highlights: Grand Score & PB Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
          {/* Main Final Score */}
          <div className="md:col-span-2 bg-cyber-card/70 rounded-2xl p-6 border border-cyber-border relative overflow-hidden flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyber-muted uppercase tracking-widest">Match Score</span>
              {isNewPB && (
                <span className="flex items-center gap-1.5 bg-cyber-neon/10 border border-cyber-neon/40 text-cyber-neon text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  <Trophy className="w-3.5 h-3.5" />
                  New Personal Record!
                </span>
              )}
            </div>

            <div className="my-4">
              <span className="font-mono text-5xl md:text-6xl font-black text-cyber-primary drop-shadow-[0_0_25px_rgba(0,240,255,0.5)]">
                {lastMatch.score.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold text-cyber-muted">
              <span>Personal Best: <strong className="text-white font-mono">{Math.max(lastMatch.score, prevPB).toLocaleString()}</strong></span>
              <span>Routine Duration: <strong className="text-white font-mono">{lastMatch.duration}s</strong></span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="bg-cyber-card/70 rounded-2xl p-6 border border-cyber-border flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyber-muted uppercase tracking-widest">Accuracy</span>
              <Crosshair className="w-4 h-4 text-cyber-primary" />
            </div>
            <div className="my-4">
              <span className="font-mono text-5xl font-black text-white">
                {lastMatch.accuracy}%
              </span>
            </div>
            <span className="text-xs font-bold text-cyber-muted">
              <strong className="text-white font-mono">{lastMatch.shotsHit}</strong> Hits / <strong className="text-cyber-muted font-mono">{lastMatch.shotsFired - lastMatch.shotsHit}</strong> Misses
            </span>
          </div>
        </div>

        {/* Secondary Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {/* Reaction Time */}
          <div className="bg-cyber-card/50 rounded-2xl p-4 border border-cyber-border/70">
            <div className="flex items-center gap-2 text-cyber-muted text-xs font-bold uppercase">
              <Clock className="w-4 h-4 text-cyber-primary" />
              <span>Reaction Time</span>
            </div>
            <span className="font-mono text-2xl font-black text-white mt-2 block">
              {lastMatch.avgReactionTimeMs} <span className="text-xs font-bold text-cyber-muted">ms</span>
            </span>
          </div>

          {/* Targets Destroyed */}
          <div className="bg-cyber-card/50 rounded-2xl p-4 border border-cyber-border/70">
            <div className="flex items-center gap-2 text-cyber-muted text-xs font-bold uppercase">
              <Zap className="w-4 h-4 text-cyber-warning" />
              <span>KPS Rate</span>
            </div>
            <span className="font-mono text-2xl font-black text-white mt-2 block">
              {lastMatch.killsPerSecond} <span className="text-xs font-bold text-cyber-muted">k/s</span>
            </span>
          </div>

          {/* Targets Total */}
          <div className="bg-cyber-card/50 rounded-2xl p-4 border border-cyber-border/70">
            <div className="flex items-center gap-2 text-cyber-muted text-xs font-bold uppercase">
              <Trophy className="w-4 h-4 text-cyber-primary" />
              <span>Eliminations</span>
            </div>
            <span className="font-mono text-2xl font-black text-white mt-2 block">
              {lastMatch.targetsDestroyed}
            </span>
          </div>

          {/* Max Streak */}
          <div className="bg-cyber-card/50 rounded-2xl p-4 border border-cyber-border/70">
            <div className="flex items-center gap-2 text-cyber-muted text-xs font-bold uppercase">
              <Flame className="w-4 h-4 text-cyber-accent" />
              <span>Max Combo</span>
            </div>
            <span className="font-mono text-2xl font-black text-white mt-2 block">
              x{lastMatch.maxStreak}
            </span>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-cyber-border/80">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 bg-cyber-card hover:bg-cyber-border text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-cyber-border"
            >
              <Home className="w-4 h-4" />
              Main Menu
            </button>
            <button
              onClick={onOpenBrowser}
              className="flex items-center gap-2 bg-cyber-card hover:bg-cyber-border text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-cyber-border"
            >
              <List className="w-4 h-4" />
              All Scenarios
            </button>
          </div>

          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 bg-cyber-primary hover:bg-cyber-primary/90 text-black px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
