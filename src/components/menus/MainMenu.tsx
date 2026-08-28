import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useStatsStore } from '../../store/useStatsStore';
import { ALL_SCENARIOS } from '../../data/scenarios';
import { calculateCm360, calculateEDPI } from '../../utils/sensitivity';
import { ScenarioConfig, Category } from '../../types/game';
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
  Award
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 select-none flex flex-col justify-between min-h-[92vh] space-y-6">
      {/* Top Navbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel px-6 py-4 rounded-3xl border border-cyber-border shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyber-primary via-cyan-400 to-cyber-accent flex items-center justify-center text-black font-black shadow-[0_0_25px_rgba(0,240,255,0.6)]">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              AIMPRO <span className="text-xs bg-cyber-primary text-black px-2.5 py-0.5 rounded-lg font-black tracking-wider shadow-sm">2.0 PRO</span>
            </h1>
            <span className="text-[10px] font-extrabold text-cyber-muted tracking-widest uppercase">
              Next-Gen 3D FPS Precision Aim Trainer
            </span>
          </div>
        </div>

        {/* Live Sensitivity Quick Adjuster Bar */}
        <div className="flex items-center gap-4 bg-cyber-card/90 px-5 py-2.5 rounded-2xl border border-cyber-border shadow-md">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black text-cyber-muted uppercase tracking-wider">
              {settings.controls.gamePreset} Sens Profile
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={() => updateSens(Math.max(0.05, Math.round((settings.controls.inGameSens - 0.01) * 100) / 100))}
                className="w-6 h-6 rounded-lg bg-cyber-border text-white text-xs font-black hover:bg-cyber-primary hover:text-black transition-all"
              >
                -
              </button>
              <span className="text-base font-mono font-black text-cyber-primary">
                {settings.controls.inGameSens.toFixed(2)}
              </span>
              <button
                onClick={() => updateSens(Math.round((settings.controls.inGameSens + 0.01) * 100) / 100)}
                className="w-6 h-6 rounded-lg bg-cyber-border text-white text-xs font-black hover:bg-cyber-primary hover:text-black transition-all"
              >
                +
              </button>
              <span className="text-xs text-cyber-neon font-mono font-bold ml-1.5">
                {cm360} cm/360
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

      {/* Main Center Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Title & Quick Warmup */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            1:1 Valorant & CS2 Camera Engine • Zero Input Lag
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none drop-shadow-2xl">
            PRECISION AIM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary via-white to-cyber-accent">REDEFINED</span>
          </h2>

          <p className="text-xs md:text-sm text-cyber-muted max-w-xl leading-relaxed font-medium">
            Over 50 competitive scenarios engineered for Tactical Shooters (Valorant, CS2) and Fast-Paced Arena Shooters (Apex Legends, Overwatch 2).
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onQuickPlay}
              className="flex items-center gap-3 bg-cyber-primary hover:bg-cyber-primary/90 text-black px-9 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              Quick Warmup (Gridshot)
            </button>

            <button
              onClick={onOpenBrowser}
              className="flex items-center gap-2 bg-cyber-card hover:bg-cyber-border text-white px-7 py-4 rounded-2xl font-bold text-sm border border-cyber-border transition-all hover:border-cyber-primary shadow-lg"
            >
              <Target className="w-4 h-4 text-cyber-primary" />
              52 Benchmark Routines
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

        {/* Right Column: Instant Scenario Selector Card */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-cyber-border shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyber-primary" />
              Instant Mode Launcher
            </h3>
            <span className="text-[10px] text-cyber-primary font-bold uppercase tracking-widest">
              1-Click Start
            </span>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'clicking', label: 'Click', icon: Crosshair },
              { id: 'tracking', label: 'Track', icon: Zap },
              { id: 'switching', label: 'Switch', icon: Target },
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

          {/* Scenario List for selected category */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {categoryScenarios.map(sc => {
              const pb = personalBests[sc.id] || 0;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleStartScenario(sc)}
                  className="flex items-center justify-between bg-cyber-bg/75 hover:bg-cyber-card p-3 rounded-xl border border-cyber-border hover:border-cyber-primary cursor-pointer transition-all group"
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

      {/* Bottom 4 Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: 52 Scenarios */}
        <div
          onClick={onOpenBrowser}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-primary cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-cyber-primary" />
            <h4 className="text-xs font-black text-white uppercase">52 Scenarios</h4>
          </div>
          <span className="text-[10px] text-cyber-muted mt-2">Clicking, Tracking, Switching, Bot Duel</span>
        </div>

        {/* Card 2: Custom Studio */}
        <div
          onClick={onOpenStudio}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-accent cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(255,0,127,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyber-accent" />
            <h4 className="text-xs font-black text-white uppercase">Custom Studio</h4>
          </div>
          <span className="text-[10px] text-cyber-muted mt-2">Target Speeds, Radii & Health Editor</span>
        </div>

        {/* Card 3: Skill Radar */}
        <div
          onClick={onOpenStats}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-neon cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,255,102,0.2)] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-cyber-neon" />
            <h4 className="text-xs font-black text-white uppercase">Skill Telemetry</h4>
          </div>
          <span className="text-[10px] text-cyber-muted mt-2">5-Axis Skill Radar & History Log</span>
        </div>

        {/* Card 4: Settings Studio */}
        <div
          onClick={onOpenSettings}
          className="glass-panel rounded-2xl p-4 border border-cyber-border hover:border-cyber-warning cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(255,183,0,0.2)] flex flex-col justify-between"
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
