import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CrosshairRenderer } from '../ui/CrosshairRenderer';
import { Flame, Target, Zap, Clock, ShieldAlert, Sparkles, Eye } from 'lucide-react';

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

  const showHitmarker = lastHitmarker && Date.now() - lastHitmarker.timestamp < 130;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-4 md:p-6">
      {/* Top Header HUD Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between glass-panel rounded-3xl px-6 py-3.5 border border-cyber-border shadow-2xl">
        {/* Scenario Name & Category */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyber-primary to-cyber-accent flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(0,240,255,0.5)]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black tracking-tight text-white uppercase">{scenario.name}</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30">
                {scenario.difficulty}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyber-muted">
              AIMPRO 2.0 • {scenario.category} • {scenario.weaponType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Center Timer & Score */}
        <div className="flex items-center gap-8 md:gap-12">
          {/* Time Left */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-cyber-muted text-[11px] font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-cyber-primary" />
              <span>Time Left</span>
            </div>
            <span
              className={`font-mono text-3xl md:text-4xl font-black tracking-tight ${
                isLowTime ? 'text-cyber-danger animate-pulse' : 'text-white'
              }`}
            >
              {Math.ceil(timeRemaining)}<span className="text-sm font-normal text-cyber-muted ml-0.5">s</span>
            </span>
          </div>

          {/* Score Counter */}
          <div className="flex flex-col items-center min-w-[130px]">
            <span className="text-cyber-muted text-[11px] font-bold uppercase tracking-wider">Total Score</span>
            <span className="font-mono text-3xl md:text-4xl font-black text-cyber-primary glow-text-cyan">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Stats: Accuracy, Streak, KPS */}
        <div className="flex items-center gap-5 md:gap-7">
          {/* Accuracy */}
          <div className="flex flex-col items-end">
            <span className="text-cyber-muted text-[11px] font-bold uppercase tracking-wider">Accuracy</span>
            <span className="font-mono text-xl md:text-2xl font-black text-white">{accuracy}%</span>
          </div>

          {/* KPS (Kills / Sec) */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-cyber-muted text-[11px] font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-cyber-warning" />
              <span>KPS</span>
            </div>
            <span className="font-mono text-xl md:text-2xl font-black text-white">{kps}</span>
          </div>

          {/* Streak Combo Multiplier */}
          <div className="flex items-center gap-2.5 bg-cyber-card/90 border border-cyber-border px-4 py-2 rounded-2xl shadow-md">
            <Flame className={`w-5 h-5 ${streak >= 8 ? 'text-cyber-accent animate-bounce' : 'text-cyber-warning'}`} />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black text-cyber-muted tracking-wider">Streak</span>
              <span className="font-mono font-black text-base text-white">x{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Timer Bar Progress */}
      <div className="w-full max-w-6xl mx-auto mt-2 h-1.5 bg-cyber-card/80 rounded-full overflow-hidden border border-cyber-border/40">
        <div
          className={`h-full transition-all duration-150 ${
            isLowTime ? 'bg-cyber-danger' : 'bg-gradient-to-r from-cyber-primary via-cyber-neon to-cyber-accent'
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
            className={`relative w-9 h-9 transition-transform duration-75 scale-125 ${
              lastHitmarker?.isHeadshot ? 'text-cyber-accent scale-150' : 'text-cyber-primary'
            }`}
          >
            {/* 4 diagonal cross ticks */}
            <div className="absolute top-0 left-0 w-2.5 h-0.5 bg-current rotate-45 transform origin-top-left shadow-[0_0_8px_currentColor]" />
            <div className="absolute top-0 right-0 w-2.5 h-0.5 bg-current -rotate-45 transform origin-top-right shadow-[0_0_8px_currentColor]" />
            <div className="absolute bottom-0 left-0 w-2.5 h-0.5 bg-current -rotate-45 transform origin-bottom-left shadow-[0_0_8px_currentColor]" />
            <div className="absolute bottom-0 right-0 w-2.5 h-0.5 bg-current rotate-45 transform origin-bottom-right shadow-[0_0_8px_currentColor]" />
          </div>
        </div>
      )}

      {/* Bottom Hotkey Cheatsheet */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-bold text-cyber-muted tracking-wider uppercase">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-cyber-card/80 px-3 py-1.5 rounded-xl border border-cyber-border">
            <kbd className="text-cyber-primary font-mono font-black">ESC</kbd> Pause Menu
          </span>
          <span className="flex items-center gap-1.5 bg-cyber-card/80 px-3 py-1.5 rounded-xl border border-cyber-border">
            <kbd className="text-cyber-primary font-mono font-black">R</kbd> Quick Restart
          </span>
          <span className="flex items-center gap-1.5 bg-cyber-card/80 px-3 py-1.5 rounded-xl border border-cyber-border">
            <kbd className="text-cyber-primary font-mono font-black">F</kbd> Inspect Weapon
          </span>
        </div>
        <div className="flex items-center gap-2 text-cyber-primary font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>AIMPRO 2.0 ULTRA ENGINE</span>
        </div>
      </div>
    </div>
  );
};
