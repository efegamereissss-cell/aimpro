import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useStatsStore } from '../../store/useStatsStore';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { calculateCm360, calculateEDPI } from '../../utils/sensitivity';
import { ScenarioConfig, Category } from '../../types/game';
import { GameSensPreset } from '../../types/settings';
import { 
  Play, 
  Target, 
  Sparkles, 
  BarChart3, 
  Sliders, 
  Trophy, 
  Zap, 
  Crosshair, 
  Flame,
  ArrowRight,
  Shield,
  Bot,
  Layers,
  Volume2,
  Maximize2,
  Award,
  Activity,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface MainMenuProps {
  onOpenBrowser: () => void;
  onOpenStudio: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onQuickPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onOpenBrowser,
  onOpenStudio,
  onOpenStats,
  onOpenSettings,
  onQuickPlay
}) => {
  const settings = useSettingsStore(state => state.settings);
  const updateSens = useSettingsStore(state => state.updateSens);
  const updateDpi = useSettingsStore(state => state.updateDpi);
  const updateGamePreset = useSettingsStore(state => state.updateGamePreset);
  const setScenario = useGameStore(state => state.setScenario);
  const startGame = useGameStore(state => state.startGame);
  const personalBests = useStatsStore(state => state.personalBests);

  const [activeCategoryTab, setActiveCategoryTab] = useState<Category>('clicking');

  const cm360 = calculateCm360(
    settings.controls.inGameSens,
    settings.controls.dpi,
    settings.controls.gamePreset
  );
  const edpi = calculateEDPI(settings.controls.inGameSens, settings.controls.dpi);

  const categoryScenarios = ALL_SCENARIOS.filter(s => s.category === activeCategoryTab).slice(0, 6);

  const handleStartScenario = (scenario: ScenarioConfig) => {
    setScenario(scenario);
    startGame();
    const canvas = document.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  };

  const gamePresets: GameSensPreset[] = ['Valorant', 'CS2', 'Apex Legends', 'Overwatch 2', 'Fortnite'];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 select-none flex flex-col justify-between min-h-[92vh] space-y-6">
      {/* 1. TOP ULTIMATE NAVBAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-3xl border border-cyber-border shadow-2xl backdrop-blur-xl">
        {/* Brand & Engine Badge */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-cyber-primary to-blue-600 flex items-center justify-center text-black font-black shadow-[0_0_30px_rgba(0,240,255,0.6)]">
              <Target className="w-7 h-7" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-primary"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                AIMPRO <span className="text-[11px] bg-gradient-to-r from-cyber-primary to-blue-500 text-black px-2.5 py-0.5 rounded-lg font-black tracking-widest uppercase">ULTIMATE</span>
              </h1>
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <Activity className="w-3 h-3" />
                <span>240 FPS ENGINE</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-cyber-muted tracking-widest uppercase">
              Next-Gen Espors Precision Engine
            </span>
          </div>
        </div>

        {/* Quick Game Preset Selector Tabs */}
        <div className="flex items-center gap-1 bg-cyber-card/90 p-1.5 rounded-2xl border border-cyber-border overflow-x-auto">
          {gamePresets.map(preset => (
            <button
              key={preset}
              onClick={() => updateGamePreset(preset)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                settings.controls.gamePreset === preset
                  ? 'bg-cyber-primary text-black font-black shadow-md shadow-cyber-primary/20'
                  : 'text-cyber-muted hover:text-white hover:bg-cyber-border/40'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Sensitivity & eDPI Quick Controller */}
        <div className="flex items-center gap-4 bg-cyber-card/90 px-5 py-2.5 rounded-2xl border border-cyber-border shadow-md">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-cyber-muted uppercase tracking-wider">
              {settings.controls.gamePreset} Sens
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={() => updateSens(Math.max(0.05, Math.round((settings.controls.inGameSens - 0.01) * 100) / 100))}
                className="w-6 h-6 rounded-lg bg-cyber-border text-white text-xs font-black hover:bg-cyber-primary hover:text-black transition-all"
              >
                -
              </button>
              <span className="text-base font-mono font-black text-cyber-primary w-12 text-center">
                {settings.controls.inGameSens.toFixed(2)}
              </span>
              <button
                onClick={() => updateSens(Math.round((settings.controls.inGameSens + 0.01) * 100) / 100)}
                className="w-6 h-6 rounded-lg bg-cyber-border text-white text-xs font-black hover:bg-cyber-primary hover:text-black transition-all"
              >
                +
              </button>
              <span className="text-xs text-cyber-neon font-mono font-bold ml-1.5">
                {cm360} cm
              </span>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-cyber-border/40 hover:bg-cyber-primary hover:text-black text-cyber-muted transition-all"
            title="Settings Studio"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN CENTER HERO & COMMAND CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Espor Hero Banner */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyber-primary/15 to-blue-500/15 border border-cyber-primary/40 text-cyber-primary text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Zero Latency Raw Pointer Lock • 1:1 Precision Engine
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none drop-shadow-2xl">
            DOMINATE EVERY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-cyan-300 to-cyber-accent">
              GUNFIGHT
            </span>
          </h2>

          <p className="text-xs md:text-sm text-cyber-muted max-w-xl leading-relaxed font-medium">
            Over 52 calibrated scenarios for Tactical Shooters (Valorant, CS2) and High-Mobility Tracking (Apex Legends, Overwatch 2).
          </p>

          {/* Action Launcher Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onQuickPlay}
              className="flex items-center gap-3 bg-gradient-to-r from-cyan-400 via-cyber-primary to-blue-500 hover:opacity-95 text-black px-9 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              Quick Warmup (Gridshot)
            </button>

            <button
              onClick={onOpenBrowser}
              className="flex items-center gap-2 bg-cyber-card hover:bg-cyber-border text-white px-7 py-4 rounded-2xl font-bold text-sm border border-cyber-border transition-all hover:border-cyber-primary shadow-lg hover:shadow-cyan-500/10"
            >
              <Target className="w-4 h-4 text-cyber-primary" />
              All 52 Scenarios
            </button>

            <button
              onClick={onOpenStudio}
              className="flex items-center gap-2 bg-cyber-card hover:bg-cyber-border text-cyber-accent px-6 py-4 rounded-2xl font-bold text-sm border border-cyber-border transition-all hover:border-cyber-accent shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Scenario Studio
            </button>
          </div>
        </div>

        {/* Right Column: Instant Scenario Browser Card */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-cyber-border shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyber-primary" />
              Instant Mode Launcher
            </h3>
            <span className="text-[10px] text-cyber-primary font-bold uppercase tracking-widest">
              1-Click Direct Play
            </span>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'clicking', label: 'Clicking', icon: Crosshair },
              { id: 'tracking', label: 'Tracking', icon: Zap },
              { id: 'switching', label: 'Switching', icon: Target },
              { id: 'strafing', label: 'Bot AI', icon: Bot }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id as Category)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                  activeCategoryTab === tab.id
                    ? 'bg-cyber-primary text-black font-black shadow-md'
                    : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scenario List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {categoryScenarios.map(sc => {
              const pb = personalBests[sc.id] || 0;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleStartScenario(sc)}
                  className="flex items-center justify-between bg-cyber-bg/80 hover:bg-cyber-card p-3 rounded-xl border border-cyber-border hover:border-cyber-primary cursor-pointer transition-all group"
                >
                  <div className="truncate mr-2">
                    <h4 className="text-xs font-black text-white group-hover:text-cyber-primary transition-colors truncate">
                      {sc.name}
                    </h4>
                    <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-semibold">
                      {sc.difficulty} • {sc.duration}s
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {pb > 0 && (
                      <span className="font-mono text-xs font-black text-cyber-warning">
                        {pb.toLocaleString()}
                      </span>
                    )}
                    <button className="w-7 h-7 rounded-lg bg-cyber-primary/10 group-hover:bg-cyber-primary text-cyber-primary group-hover:text-black flex items-center justify-center transition-all">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM 4 FEATURE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={onOpenBrowser}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-primary cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-cyber-primary" />
            <h4 className="text-xs font-black text-white uppercase">52 Scenarios</h4>
          </div>
          <span className="text-[10px] text-cyber-muted mt-2">Clicking, Tracking, Switching, Bot Duel</span>
        </div>

        <div
          onClick={onOpenStudio}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-accent cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(255,0,127,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyber-accent" />
            <h4 className="text-xs font-black text-white uppercase">Custom Studio</h4>
          </div>
          <span className="text-[10px] text-cyber-muted mt-2">Target Speeds, Radii & Health Editor</span>
        </div>

        <div
          onClick={onOpenStats}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-neon cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(0,255,102,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-cyber-neon" />
            <h4 className="text-xs font-black text-white uppercase">Skill Telemetry</h4>
          </div>
          <span className="text-[10px] text-cyber-muted mt-2">5-Axis Skill Radar & History Log</span>
        </div>

        <div
          onClick={onOpenSettings}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-warning cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(255,183,0,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyber-warning" />
            <h4 className="text-xs font-black text-white uppercase">Settings Studio</h4>
          </div>
          <span className="text-[10px] text-cyber-muted mt-2">1:1 Game Sens, Crosshair & Audio</span>
        </div>
      </div>
    </div>
  );
};
