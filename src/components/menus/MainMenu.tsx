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
  Cpu, 
  Layers, 
  Wind,
  BarChart2,
  FolderOpen,
  PlusCircle,
  ShieldCheck,
  Lock,
  Swords,
  Sun,
  Moon,
  Compass,
  Users
} from 'lucide-react';

interface MainMenuProps {
  onQuickPlay: () => void;
  onOpenBrowser: () => void;
  onOpenStudio: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenMultiplayer: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onQuickPlay,
  onOpenBrowser,
  onOpenStudio,
  onOpenStats,
  onOpenSettings,
  onOpenMultiplayer
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('clicking');

  const settings = useSettingsStore(state => state.settings);
  const updateSens = useSettingsStore(state => state.updateSens);
  const updateGamePreset = useSettingsStore(state => state.updateGamePreset);
  const updateVideo = useSettingsStore(state => state.updateVideo);
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

  const mapThemes: { id: 'cyber' | 'studio' | 'tactical' | 'dark'; label: string; icon: string }[] = [
    { id: 'cyber', label: 'Cyber Neon', icon: '🌌' },
    { id: 'studio', label: 'Valorant Range', icon: '☀️' },
    { id: 'tactical', label: 'CS2 Dust Range', icon: '🏜️' },
    { id: 'dark', label: 'Abyss Void', icon: '🌑' }
  ];

  const categoryScenarios = ALL_SCENARIOS.filter(s => s.category === activeCategory).slice(0, 3);

  const handleLaunchScenario = (sc: ScenarioConfig) => {
    setScenario(sc);
    startGame();
    const canvas = document.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  };

  const handleLaunchBhop = () => {
    const bhopScenario = ALL_SCENARIOS.find(s => s.id === 'cs16_bhop_parkour_cyber') || ALL_SCENARIOS[0];
    handleLaunchScenario(bhopScenario);
  };

  const handleLaunchBotDuel = () => {
    const duelScenario = ALL_SCENARIOS.find(s => s.id === 'tactical_bot_duel_peeking') || ALL_SCENARIOS.find(s => s.id === 'strafe_bot_arena') || ALL_SCENARIOS[0];
    handleLaunchScenario(duelScenario);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 select-none space-y-6 animate-in fade-in zoom-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BRAND & QUICK UTILITY NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="glass-panel p-4 md:p-6 rounded-3xl border border-cyber-border/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
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
                v2.6 ESPORTS
              </span>
            </div>
            <span className="text-xs text-cyber-muted font-bold tracking-wider uppercase block mt-0.5">
              1:1 Valorant & CS2 Physics • 3D Tactical Bot Range • CS 1.6 Bhop Course
            </span>
          </div>
        </div>

        {/* Top Navigation Action Buttons & Map Theme Quick Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Map Theme Toggle */}
          <div className="flex items-center gap-1 bg-cyber-card/80 p-1 rounded-xl border border-cyber-border mr-1">
            {mapThemes.map(th => (
              <button
                key={th.id}
                onClick={() => updateVideo({ arenaTheme: th.id })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  settings.video.arenaTheme === th.id
                    ? 'bg-cyber-primary text-black font-black shadow-sm'
                    : 'text-cyber-muted hover:text-white'
                }`}
                title={th.label}
              >
                <span>{th.icon}</span>
                <span className="hidden lg:inline">{th.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onOpenBrowser}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyber-card hover:bg-cyber-primary hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all border border-cyber-border shadow-sm"
          >
            <FolderOpen className="w-4 h-4 text-cyber-primary" />
            Senaryolar (52)
          </button>
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyber-card hover:bg-cyber-primary hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all border border-cyber-border shadow-sm"
          >
            <BarChart2 className="w-4 h-4 text-cyber-warning" />
            İstatistikler
          </button>
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyber-card hover:bg-cyber-primary hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all border border-cyber-border shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-cyber-accent" />
            Stüdyo
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-primary text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105"
          >
            <Sliders className="w-4 h-4" />
            Ayarlar
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 CORE MODES: AIM ÇALIŞMASI | BOT DÜELLOSU | CS 1.6 BHOP | ONLINE DEATHMATCH */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CORE MODE 1: AIM ÇALIŞMASI & POLİGON */}
        <div className="glass-panel p-5 rounded-3xl border border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4 group hover:border-cyan-400 transition-all duration-300 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 tracking-wider">
                🎯 Mod 1: Poligon
              </span>
              <span className="text-[10px] font-mono font-bold text-cyber-muted">52 Senaryo</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
              Aim Çalışması
            </h2>
            <p className="text-[11px] text-cyber-muted font-medium leading-relaxed line-clamp-3">
              Mikro flick, kafa hizası hassasiyeti ve hedef değiştirme. 1:1 Valorant Sheriff & Vandal.
            </p>
          </div>

          <div className="relative z-10 pt-1">
            <button
              onClick={onQuickPlay}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-102"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Gridshot
            </button>
          </div>
        </div>

        {/* CORE MODE 2: TAKTİKSEL BOT DÜELLOSU */}
        <div className="glass-panel p-5 rounded-3xl border border-fuchsia-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4 group hover:border-fuchsia-400 transition-all duration-300 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-fuchsia-500/20 transition-all" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 tracking-wider flex items-center gap-1">
                <Swords className="w-3 h-3" />
                🤖 Mod 2: Espor Bot
              </span>
              <span className="text-[10px] font-mono font-bold text-fuchsia-400">1-Tap Haven</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
              Bot Düellosu
            </h2>
            <p className="text-[11px] text-cyber-muted font-medium leading-relaxed line-clamp-3">
              Haven C-Long köşe duvarından ani A/D peek atan 3D Omen botuna karşı 1-tap kafa antrenmanı!
            </p>
          </div>

          <div className="relative z-10 pt-1">
            <button
              onClick={handleLaunchBotDuel}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:from-fuchsia-400 hover:to-indigo-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:scale-102"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Bot Düellosu
            </button>
          </div>
        </div>

        {/* CORE MODE 3: CS 1.6 BUNNY HOP PARKURU */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4 group hover:border-emerald-400 transition-all duration-300 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 tracking-wider flex items-center gap-1">
                <Wind className="w-3 h-3 animate-bounce" />
                🐰 Mod 3: CS 1.6
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">1:1 Bhop</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
              Bhop Parkuru
            </h2>
            <p className="text-[11px] text-cyber-muted font-medium leading-relaxed line-clamp-3">
              Orijinal CS 1.6 Air-Acceleration fiziği! Havada strafe yaparak 20 engelli parkuru geçin.
            </p>
          </div>

          <div className="relative z-10 pt-1">
            <button
              onClick={handleLaunchBhop}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-400 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-black py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-102"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Bhop Başlat
            </button>
          </div>
        </div>

        {/* CORE MODE 4: ONLINE MULTIPLAYER DEATHMATCH (REDMATCH 2 STYLE) */}
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/50 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4 group hover:border-amber-400 transition-all duration-300 backdrop-blur-xl bg-gradient-to-b from-amber-500/5 to-transparent">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 animate-pulse" />
                🌐 Mod 4: Çevrimiçi DM
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400">100 HP Can</span>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
              Online Deathmatch
            </h2>
            <p className="text-[11px] text-cyber-muted font-medium leading-relaxed line-clamp-3">
              Redmatch 2 tarzı geometrik avatarlarla gerçek oyunculara karşı 100 HP çok oyunculu düello!
            </p>
          </div>

          <div className="relative z-10 pt-1">
            <button
              onClick={onOpenMultiplayer}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-orange-400 text-black py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-102"
            >
              <Users className="w-3.5 h-3.5" />
              Lobiye Katıl
            </button>
          </div>
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
              Canlı Hassasiyet ve Oyun Profili
            </span>
          </div>
          <span className="text-xs font-mono text-cyber-muted">
            1:1 Piksel Hassas Açı Dönüşümü (Valorant / CS2)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Game Profile Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-cyber-muted tracking-wider block">
              Aktif Oyun Profili
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
                Oyun İçi Hassasiyet (Sens)
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
                Fiziksel 360° Dönüş
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
      {/* 4. AIM ÇALIŞMASI KATEGORİLERİ & HIZLI LİSTE */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-white">
            Aim Çalışması Kategorileri
          </span>
          <span className="text-xs text-cyber-muted font-bold">
            Antrenman yapmak istediğiniz alana tıklayın
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'clicking', label: 'Clicking & Flick', icon: Crosshair },
            { id: 'tracking', label: 'Reactive Tracking', icon: Zap },
            { id: 'switching', label: 'Target Switching', icon: Target },
            { id: 'strafing', label: 'Bot Düellosu & Hareket', icon: Bot }
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

        {/* 3 Featured Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryScenarios.map(scenario => {
            const pb = personalBests[scenario.id] || 0;
            return (
              <div
                key={scenario.id}
                onClick={() => handleLaunchScenario(scenario)}
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
                      <span className="text-cyber-muted">Kayıt Yok</span>
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

      {/* ========================================================================= */}
      {/* 5. CYBER SECURITY & DDOS GUARD FOOTER STATUS BAR */}
      {/* ========================================================================= */}
      <div className="glass-panel p-3.5 rounded-2xl border border-cyber-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-cyber-muted backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-bold">AIMPRO CYBER SHIELD v4.0</span>
          <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
            PROTECTED
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Lock className="w-3 h-3 text-cyber-primary" />
            Anti-Tamper & Obfuscated
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            DDoS Guard Active
          </span>
          <span className="text-slate-400">
            SSL 256-Bit Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
