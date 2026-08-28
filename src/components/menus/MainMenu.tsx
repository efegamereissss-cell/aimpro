import React, { useState } from 'react';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { ScenarioConfig, Category } from '../../types/game';
import { useStatsStore } from '../../store/useStatsStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGameStore } from '../../store/useGameStore';
import { calculateCm360, calculateEDPI } from '../../utils/sensitivity';
import { GameSensPreset } from '../../types/settings';
import { 
  Play, 
  Target, 
  Zap, 
  Flame, 
  Crosshair, 
  Bot, 
  Trophy, 
  Sparkles, 
  Sliders, 
  Activity, 
  Clock, 
  ChevronRight,
  Cpu,
  Layers,
  FastForward,
  Wind
} from 'lucide-react';

interface MainMenuProps {
  onQuickPlay: () => void;
  onOpenBrowser: () => void;
  onOpenStudio: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onQuickPlay,
  onOpenBrowser,
  onOpenStudio,
  onOpenStats,
  onOpenSettings
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('strafing');

  const settings = useSettingsStore(state => state.settings);
  const updateSens = useSettingsStore(state => state.updateSens);
  const updateGamePreset = useSettingsStore(state => state.updateGamePreset);
  const personalBests = useStatsStore(state => state.personalBests);
  const setScenario = useGameStore(state => state.setScenario);
  const startGame = useGameStore(state => state.startGame);

  const cm360 = calculateCm360(
    settings.controls.inGameSens,
    settings.controls.dpi,
    settings.controls.gamePreset
  );
  const edpi = calculateEDPI(settings.controls.inGameSens, settings.controls.dpi);

  const gamePresets: GameSensPreset[] = [
    'Valorant',
    'CS2',
    'Apex Legends',
    'Overwatch 2',
    'Fortnite'
  ];

  const categoryScenarios = ALL_SCENARIOS.filter(s => s.category === activeCategory).slice(0, 3);

  const handleLaunchBhop = () => {
    const bhopScenario = ALL_SCENARIOS.find(s => s.id === 'cs16_bhop_parkour_cyber') || ALL_SCENARIOS[0];
    setScenario(bhopScenario);
    startGame();
    const canvas = document.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 select-none space-y-6 animate-in fade-in zoom-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BRAND & HARDWARE STATUS BAR */}
      {/* ========================================================================= */}
      <div className="glass-panel p-5 md:p-6 rounded-3xl border border-cyber-border/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-black font-black shadow-[0_0_25px_rgba(0,240,255,0.6)]">
            <Target className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
                AIMPRO <span className="text-cyber-primary">ULTIMATE</span>
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyber-primary/20 text-cyber-primary border border-cyber-primary/40 tracking-wider">
                v2.5 BHOP
              </span>
            </div>
            <span className="text-xs text-cyber-muted font-bold tracking-wider uppercase block mt-0.5">
              Next-Gen 3D FPS Precision & CS 1.6 Movement Parkour Engine
            </span>
          </div>
        </div>

        {/* Hardware Status Engine Indicators */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-card/80 border border-cyber-border text-xs font-mono font-bold text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>240Hz Engine</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-card/80 border border-cyber-border text-xs font-mono font-bold text-white shadow-sm">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span>CS 1.6 Air-Accel</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyber-primary/15 hover:bg-cyber-primary hover:text-black text-cyber-primary border border-cyber-primary/30 text-xs font-black uppercase tracking-wider transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO ACTION & BHOP PARKUR LAUNCHER */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BIG HERO CARD 1: CS 1.6 BUNNY HOP PARKUR */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-emerald-400 transition-all duration-300 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Wind className="w-4 h-4 animate-bounce" />
                Featured Movement Mode
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none drop-shadow-md">
              CS 1.6 Bunny Hop Parkour
            </h2>
            <p className="text-sm text-cyber-muted font-medium max-w-xl leading-relaxed">
              Authentic GoldSrc / Source Air-Acceleration physics! Turn with mouse while pressing <strong className="text-white">A / D</strong> in mid-air to accelerate up to <strong className="text-emerald-400">1000+ UPS</strong> across 20 obstacle blocks, speed booster pads, and checkpoint rings!
            </p>
          </div>

          {/* Quick Play Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10 pt-2">
            <button
              onClick={handleLaunchBhop}
              className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-400 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-black py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.8)] hover:scale-102"
            >
              <Play className="w-5 h-5 fill-current" />
              Start CS 1.6 Bhop Parkour
            </button>

            <button
              onClick={onQuickPlay}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-cyber-card hover:bg-cyber-border text-white text-xs font-black uppercase tracking-wider transition-all border border-cyber-border hover:border-cyber-primary/50"
            >
              <Target className="w-4 h-4 text-cyber-primary" />
              Aim Warmup (Gridshot)
            </button>
          </div>
        </div>

        {/* PRO WARMUP HIGHLIGHT CARD */}
        <div className="glass-panel p-6 rounded-3xl border border-cyber-border/80 shadow-2xl flex flex-col justify-between space-y-4 backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 tracking-wider">
                Pro Valorant Routine
              </span>
              <Trophy className="w-4 h-4 text-cyber-warning" />
            </div>

            <h3 className="text-xl font-black text-white uppercase mt-3">
              TenZ God Warmup
            </h3>
            <span className="text-xs font-bold text-cyber-primary block mt-0.5">
              4-Stage Routine • 4 min
            </span>
            <p className="text-xs text-cyber-muted mt-2 font-medium leading-relaxed">
              Stage 1: Gridshot Ultimate • Stage 2: Microflex Precision • Stage 3: Sixshot Dots • Stage 4: ADAD Bot Duel.
            </p>
          </div>

          <button
            onClick={onQuickPlay}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-cyber-card hover:bg-rose-500 hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all border border-cyber-border hover:border-rose-500 shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            Start TenZ Routine
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LIVE SENSITIVITY & eDPI CONTROL DECK */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 rounded-3xl border border-cyber-border/80 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-cyber-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyber-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Live Esports Sensitivity Deck
            </span>
          </div>
          <span className="text-xs font-mono text-cyber-muted">
            1:1 Pixel-Perfect Yaw Radians Conversion
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Game Profile Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-cyber-muted tracking-wider block">
              Active Game Profile
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {gamePresets.map(preset => (
                <button
                  key={preset}
                  onClick={() => updateGamePreset(preset)}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    settings.controls.gamePreset === preset
                      ? 'bg-cyber-primary text-black shadow-md'
                      : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* In-Game Sens Fine Tuner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-cyber-muted tracking-wider">
                In-Game Sensitivity
              </label>
              <span className="font-mono text-base font-black text-cyber-primary">
                {settings.controls.inGameSens.toFixed(3)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateSens(Math.max(0.01, parseFloat((settings.controls.inGameSens - 0.01).toFixed(3))))}
                className="w-9 h-9 rounded-xl bg-cyber-card hover:bg-cyber-border text-white font-black text-sm border border-cyber-border flex items-center justify-center transition-all"
              >
                -
              </button>
              <input
                type="range"
                min="0.01"
                max="2.5"
                step="0.005"
                value={settings.controls.inGameSens}
                onChange={e => updateSens(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
              />
              <button
                onClick={() => updateSens(parseFloat((settings.controls.inGameSens + 0.01).toFixed(3)))}
                className="w-9 h-9 rounded-xl bg-cyber-card hover:bg-cyber-border text-white font-black text-sm border border-cyber-border flex items-center justify-center transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Physical cm/360 Display */}
          <div className="bg-cyber-card/60 p-4 rounded-2xl border border-cyber-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-cyber-muted tracking-wider block">
                Physical Turn Distance
              </span>
              <span className="font-mono text-2xl font-black text-cyber-neon mt-0.5 block">
                {cm360} <span className="text-xs text-cyber-muted">cm/360°</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-cyber-muted tracking-wider block">
                eDPI
              </span>
              <span className="font-mono text-xl font-black text-white mt-0.5 block">
                {edpi}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CORE DISCIPLINE TRAINING MATRIX */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Category Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'strafing', label: 'Movement & Bhop', icon: Wind },
            { id: 'clicking', label: 'Clicking & Flick', icon: Crosshair },
            { id: 'tracking', label: 'Reactive Tracking', icon: Zap },
            { id: 'switching', label: 'Target Switching', icon: Target }
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as Category)}
                className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                  isSelected
                    ? 'bg-cyber-card text-cyber-primary border-cyber-primary shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                    : 'bg-cyber-card/60 text-cyber-muted hover:text-white border-cyber-border hover:border-cyber-border/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3 Featured Scenarios for Selected Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryScenarios.map(scenario => {
            const pb = personalBests[scenario.id] || 0;
            return (
              <div
                key={scenario.id}
                onClick={() => {
                  setScenario(scenario);
                  startGame();
                  const canvas = document.querySelector('canvas');
                  if (canvas && document.pointerLockElement !== canvas) {
                    canvas.requestPointerLock();
                  }
                }}
                className="glass-panel p-5 rounded-3xl border border-cyber-border hover:border-cyber-primary transition-all duration-200 cursor-pointer group hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] flex flex-col justify-between space-y-4 hover:-translate-y-1 backdrop-blur-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-cyber-primary/15 text-cyber-primary border border-cyber-primary/30">
                      {scenario.difficulty}
                    </span>
                    <span className="text-xs font-mono text-cyber-muted font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyber-primary" />
                      {scenario.duration}s
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-cyber-primary transition-colors uppercase mt-3">
                    {scenario.name}
                  </h3>
                  <p className="text-xs text-cyber-muted line-clamp-2 mt-1 font-medium leading-relaxed">
                    {scenario.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between">
                  <div className="text-xs font-mono font-bold">
                    {pb > 0 ? (
                      <span className="flex items-center gap-1 text-cyber-warning">
                        <Trophy className="w-3.5 h-3.5" />
                        PB: {pb.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-cyber-muted">No Record Yet</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-cyber-primary/10 group-hover:bg-cyber-primary text-cyber-primary group-hover:text-black flex items-center justify-center transition-all shadow-md">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
