import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CrosshairRenderer } from '../ui/CrosshairRenderer';
import { Flame, Target, Zap, Clock, ShieldAlert } from 'lucide-react';

export const GameHUD: React.FC = () => {
  const scenario = useGameStore(state => state.activeScenario);
  const timeRemaining = useGameStore(state => state.timeRemaining);
  const score = useGameStore(state => state.score);
  const shotsFired = useGameStore(state => state.shotsFired);
  const shotsHit = useGameStore(state => state.shotsHit);
  const streak = useGameStore(state => state.currentStreak);
  const targetsDestroyed = useGameStore(state => state.targetsDestroyed);
  const lastHitmarker = useGameStore(state => state.lastHitmarker);

  const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 1000) / 10 : 100;
  const elapsed = Math.max(scenario.duration - timeRemaining, 0.1);
  const kps = Math.round((targetsDestroyed / elapsed) * 100) / 100;

  const timeProgress = (timeRemaining / scenario.duration) * 100;
  const isLowTime = timeRemaining <= 10;

  const showHitmarker = lastHitmarker && Date.now() - lastHitmarker.timestamp < 120;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-6">
      {/* Top Header HUD Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between glass-panel rounded-2xl px-6 py-3 border border-cyber-border shadow-2xl">
        {/* Scenario Name & Category */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center text-cyber-primary">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white uppercase">{scenario.name}</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-cyber-muted">
              {scenario.category} • {scenario.difficulty}
            </span>
          </div>
        </div>

        {/* Center Timer & Score */}
        <div className="flex items-center gap-8">
          {/* Time Left */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-cyber-muted text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Time</span>
            </div>
            <span
              className={`font-mono text-3xl font-black tracking-tight ${
                isLowTime ? 'text-cyber-danger animate-pulse' : 'text-white'
              }`}
            >
              {Math.ceil(timeRemaining)}s
            </span>
          </div>

          {/* Score Counter */}
          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-cyber-muted text-xs font-semibold uppercase tracking-wider">Score</span>
            <span className="font-mono text-3xl font-black text-cyber-primary glow-text-cyan">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Stats: Accuracy, Streak, KPS */}
        <div className="flex items-center gap-6">
          {/* Accuracy */}
          <div className="flex flex-col items-end">
            <span className="text-cyber-muted text-xs font-semibold uppercase tracking-wider">Accuracy</span>
            <span className="font-mono text-xl font-bold text-white">{accuracy}%</span>
          </div>

          {/* KPS (Kills / Sec) */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-cyber-muted text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-cyber-warning" />
              <span>KPS</span>
            </div>
            <span className="font-mono text-xl font-bold text-white">{kps}</span>
          </div>

          {/* Streak Combo Multiplier */}
          <div className="flex items-center gap-2 bg-cyber-card/80 border border-cyber-border px-3.5 py-1.5 rounded-xl">
            <Flame className={`w-5 h-5 ${streak >= 10 ? 'text-cyber-accent animate-bounce' : 'text-cyber-warning'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-cyber-muted tracking-wider">Streak</span>
              <span className="font-mono font-black text-sm text-white">x{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Timer Bar Progress */}
      <div className="w-full max-w-5xl mx-auto mt-2 h-1.5 bg-cyber-card/80 rounded-full overflow-hidden border border-cyber-border/40">
        <div
          className={`h-full transition-all duration-150 ${
            isLowTime ? 'bg-cyber-danger' : 'bg-gradient-to-r from-cyber-primary to-cyber-accent'
          }`}
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      {/* Center Dynamic Crosshair */}
      <CrosshairRenderer />

      {/* Center 2D Hitmarker Animation */}
      {showHitmarker && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-45">
          <div
            className={`relative w-8 h-8 transition-transform duration-75 scale-125 ${
              lastHitmarker?.isHeadshot ? 'text-cyber-accent' : 'text-cyber-primary'
            }`}
          >
            {/* 4 diagonal cross ticks */}
            <div className="absolute top-0 left-0 w-2 h-0.5 bg-current rotate-45 transform origin-top-left" />
            <div className="absolute top-0 right-0 w-2 h-0.5 bg-current -rotate-45 transform origin-top-right" />
            <div className="absolute bottom-0 left-0 w-2 h-0.5 bg-current -rotate-45 transform origin-bottom-left" />
            <div className="absolute bottom-0 right-0 w-2 h-0.5 bg-current rotate-45 transform origin-bottom-right" />
          </div>
        </div>
      )}

      {/* Bottom Hotkey Help Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs font-semibold text-cyber-muted tracking-wider uppercase">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 bg-cyber-card/80 px-2.5 py-1 rounded-md border border-cyber-border">
            <kbd className="text-cyber-primary font-mono font-bold">ESC</kbd> Pause Menu
          </span>
          <span className="flex items-center gap-1.5 bg-cyber-card/80 px-2.5 py-1 rounded-md border border-cyber-border">
            <kbd className="text-cyber-primary font-mono font-bold">R</kbd> Quick Restart
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-cyber-primary" />
          <span>Click window to lock cursor</span>
        </div>
      </div>
    </div>
  );
};
