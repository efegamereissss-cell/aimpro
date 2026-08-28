import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { CrosshairRenderer } from '../ui/CrosshairRenderer';
import { soundEngine } from '../../audio/SoundEngine';
import { 
  Flame, 
  Target, 
  Zap, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Trophy, 
  Gauge, 
  Activity,
  Skull,
  Crown,
  Swords
} from 'lucide-react';

export const GameHUD: React.FC = () => {
  const scenario = useGameStore(state => state.activeScenario);
  const timeRemaining = useGameStore(state => state.timeRemaining);
  const score = useGameStore(state => state.score);
  const shotsFired = useGameStore(state => state.shotsFired);
  const shotsHit = useGameStore(state => state.shotsHit);
  const streak = useGameStore(state => state.currentStreak);
  const targetsDestroyed = useGameStore(state => state.targetsDestroyed);
  const lastHitmarker = useGameStore(state => state.lastHitmarker);
  const activeWeaponSlot = useGameStore(state => state.activeWeaponSlot);
  const setWeaponSlot = useGameStore(state => state.setWeaponSlot);

  const [killBanner, setKillBanner] = useState<{ count: number; isAce: boolean } | null>(null);
  const killTimeoutRef = useRef<number | null>(null);

  const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 1000) / 10 : 100;
  const elapsed = Math.max(scenario.duration - timeRemaining, 0.1);
  const kps = Math.round((targetsDestroyed / elapsed) * 100) / 100;

  const isLowTime = timeRemaining <= 10;
  const showHitmarker = lastHitmarker && Date.now() - lastHitmarker.timestamp < 120;
  const isBhopMode = scenario.id.includes('bhop') || scenario.category === 'strafing';

  // Trigger Valorant Kill Banner on Kill
  useEffect(() => {
    if (lastHitmarker && lastHitmarker.isKill) {
      const currentKillCount = Math.max(1, streak);
      const isAce = currentKillCount >= 5;

      setKillBanner({ count: currentKillCount, isAce });
      soundEngine.playKillBannerSound(currentKillCount);

      if (killTimeoutRef.current) {
        clearTimeout(killTimeoutRef.current);
      }
      killTimeoutRef.current = window.setTimeout(() => {
        setKillBanner(null);
      }, isAce ? 1600 : 950);
    }
  }, [lastHitmarker, streak]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-6 md:p-8">
      {/* Top Corners Layout */}
      <div className="w-full flex items-start justify-between">
        {/* TOP-LEFT CORNER: Tactical Scenario Info & Circular/Digital Timer */}
        <div className="flex items-center gap-4 glass-panel rounded-3xl p-4 border border-cyber-border/80 shadow-2xl backdrop-blur-md">
          <div
            className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shadow-lg transition-colors ${
              isLowTime
                ? 'bg-cyber-danger/20 border-cyber-danger text-cyber-danger animate-pulse'
                : 'bg-cyber-card/90 border-cyber-primary/40 text-cyber-primary'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-cyber-muted">Time</span>
            <span className="font-mono text-2xl font-black leading-none mt-0.5 text-white">
              {Math.ceil(timeRemaining)}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-white uppercase">{scenario.name}</h2>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/30">
                {scenario.difficulty}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyber-muted mt-0.5">
              {scenario.category} • {scenario.weaponType.toUpperCase()}
            </span>
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono font-bold">
              <span className="text-cyber-muted">ACC: <strong className="text-white">{accuracy}%</strong></span>
              <span className="text-cyber-muted">KPS: <strong className="text-cyber-warning">{kps}</strong></span>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT CORNER: Score Counter & Multiplier Combo */}
        <div className="flex items-center gap-4 glass-panel rounded-3xl p-4 border border-cyber-border/80 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyber-muted">Total Score</span>
            <span className="font-mono text-3xl md:text-4xl font-black text-cyber-primary drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]">
              {score.toLocaleString()}
            </span>
            <span className="text-[10px] text-cyber-muted font-bold tracking-wider mt-0.5">
              {targetsDestroyed} ELIMINATIONS
            </span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-cyber-card/90 border border-cyber-border flex flex-col items-center justify-center shadow-lg">
            <Flame className={`w-6 h-6 ${streak >= 5 ? 'text-cyber-accent animate-bounce' : 'text-cyber-warning'}`} />
            <span className="font-mono font-black text-xs text-white mt-0.5">x{streak}</span>
          </div>
        </div>
      </div>

      {/* Center Dynamic Crosshair */}
      <CrosshairRenderer />

      {/* Center 2D Hitmarker Animation */}
      {showHitmarker && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-45">
          <div
            className={`relative w-8 h-8 transition-transform duration-75 scale-125 ${
              lastHitmarker?.isHeadshot ? 'text-cyber-accent scale-150' : 'text-cyber-primary'
            }`}
          >
            <div className="absolute top-0 left-0 w-2.5 h-0.5 bg-current rotate-45 transform origin-top-left shadow-[0_0_8px_currentColor]" />
            <div className="absolute top-0 right-0 w-2.5 h-0.5 bg-current -rotate-45 transform origin-top-right shadow-[0_0_8px_currentColor]" />
            <div className="absolute bottom-0 left-0 w-2.5 h-0.5 bg-current -rotate-45 transform origin-bottom-left shadow-[0_0_8px_currentColor]" />
            <div className="absolute bottom-0 right-0 w-2.5 h-0.5 bg-current rotate-45 transform origin-bottom-right shadow-[0_0_8px_currentColor]" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VALORANT-STYLE KILL BANNER & PROGRESSIVE STREAK VFX */}
      {/* ========================================================================= */}
      {killBanner && (
        <div className="fixed inset-x-0 bottom-24 flex items-center justify-center pointer-events-none z-50 animate-in zoom-in-75 fade-in duration-150">
          <div
            className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all ${
              killBanner.isAce
                ? 'bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-500/30 border-yellow-300 text-yellow-200 shadow-[0_0_45px_rgba(250,204,21,0.8)] scale-110'
                : killBanner.count === 4
                ? 'bg-purple-950/80 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_30px_rgba(217,70,239,0.5)]'
                : killBanner.count === 3
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.5)]'
                : killBanner.count === 2
                ? 'bg-slate-900/90 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'bg-slate-900/90 border-slate-400 text-white shadow-lg'
            }`}
          >
            {killBanner.isAce ? (
              <Crown className="w-7 h-7 text-yellow-300 fill-current animate-bounce" />
            ) : (
              <Skull className="w-6 h-6 text-current" />
            )}

            <div className="flex flex-col">
              <span className="font-mono text-base md:text-lg font-black tracking-widest uppercase leading-tight">
                {killBanner.count === 1
                  ? 'ELIMINATED'
                  : killBanner.count === 2
                  ? 'DOUBLE KILL'
                  : killBanner.count === 3
                  ? 'TRIPLE KILL'
                  : killBanner.count === 4
                  ? 'QUADRA KILL'
                  : '🏆 ACE - TEAM WIPED!'}
              </span>
              <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">
                {killBanner.count}x STREAK COMBO
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Interactive Weapon Slots, Speedometer & Keybindings */}
      <div className="w-full flex items-center justify-between text-xs font-bold text-cyber-muted tracking-wider uppercase">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Slot 1: Prelude Vandal */}
          <button
            onClick={() => setWeaponSlot('vandal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              activeWeaponSlot === 'vandal' || activeWeaponSlot === 'gun'
                ? 'bg-cyber-primary text-black font-black border-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                : 'bg-cyber-card/90 text-white border-cyber-border hover:border-cyber-primary'
            }`}
          >
            <kbd className="font-mono font-black">1</kbd> Prelude Vandal
          </button>

          {/* Slot 2: Arcane Sheriff */}
          <button
            onClick={() => setWeaponSlot('sheriff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              activeWeaponSlot === 'sheriff'
                ? 'bg-amber-400 text-black font-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                : 'bg-cyber-card/90 text-white border-cyber-border hover:border-amber-400'
            }`}
          >
            <kbd className="font-mono font-black">2</kbd> Arcane Sheriff
          </button>

          {/* Slot 3: RGX Karambit */}
          <button
            onClick={() => setWeaponSlot('knife')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              activeWeaponSlot === 'knife'
                ? 'bg-emerald-400 text-black font-black border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                : 'bg-cyber-card/90 text-white border-cyber-border hover:border-emerald-400'
            }`}
          >
            <kbd className="font-mono font-black">3</kbd> RGX Blade
          </button>

          <span className="flex items-center gap-1.5 bg-cyber-card/90 px-3 py-1.5 rounded-xl border border-cyber-border shadow-md">
            <kbd className="text-cyber-primary font-mono font-black">F</kbd> Inspect
          </span>
          <span className="flex items-center gap-1.5 bg-cyber-card/90 px-3 py-1.5 rounded-xl border border-cyber-border shadow-md">
            <kbd className="text-cyber-primary font-mono font-black">SPACE / WHEEL</kbd> Jump
          </span>
        </div>

        {/* CS 1.6 Movement Mode Active Badge */}
        <div className="flex items-center gap-2 text-emerald-400 font-mono font-black bg-cyber-card/90 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>CS 1.6 AIR-ACCELERATE: ON</span>
        </div>
      </div>
    </div>
  );
};
