import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateCm360 } from '../../utils/sensitivity';
import { soundEngine } from '../../audio/SoundEngine';
import { Play, RotateCcw, List, Home, Sliders, Volume2 } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenBrowser: () => void;
  onGoHome: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenBrowser,
  onGoHome
}) => {
  const scenario = useGameStore(state => state.activeScenario);
  const settings = useSettingsStore(state => state.settings);
  const updateSens = useSettingsStore(state => state.updateSens);
  const updateAudio = useSettingsStore(state => state.updateAudio);

  const cm360 = calculateCm360(
    settings.controls.inGameSens,
    settings.controls.dpi,
    settings.controls.gamePreset
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 border border-cyber-border shadow-2xl animate-in fade-in zoom-in duration-150 space-y-5">
        {/* Title */}
        <div className="text-center pb-4 border-b border-cyber-border">
          <span className="text-xs font-bold uppercase tracking-widest text-cyber-primary">Game Paused</span>
          <h2 className="text-2xl font-black text-white uppercase mt-0.5">{scenario.name}</h2>
          <span className="text-[11px] text-cyber-muted uppercase tracking-wider">
            {scenario.category} • {scenario.difficulty}
          </span>
        </div>

        {/* Quick Sensitivity Tweaker */}
        <div className="bg-cyber-card/60 p-4 rounded-2xl border border-cyber-border space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-cyber-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-white">
              <Sliders className="w-3.5 h-3.5 text-cyber-primary" />
              {settings.controls.gamePreset} Sens
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSens(Math.max(0.05, Math.round((settings.controls.inGameSens - 0.01) * 100) / 100))}
                className="w-6 h-6 rounded-md bg-cyber-border text-white text-xs font-black hover:bg-cyber-primary hover:text-black transition-all"
              >
                -
              </button>
              <span className="font-mono text-cyber-primary text-sm font-black">
                {settings.controls.inGameSens.toFixed(2)}
              </span>
              <button
                onClick={() => updateSens(Math.round((settings.controls.inGameSens + 0.01) * 100) / 100)}
                className="w-6 h-6 rounded-md bg-cyber-border text-white text-xs font-black hover:bg-cyber-primary hover:text-black transition-all"
              >
                +
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0.05"
            max="2.5"
            step="0.01"
            value={settings.controls.inGameSens}
            onChange={e => updateSens(parseFloat(e.target.value))}
            className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
          />

          <div className="flex items-center justify-between text-[11px] text-cyber-muted">
            <span>DPI: <strong className="text-white font-mono">{settings.controls.dpi}</strong></span>
            <span>Distance: <strong className="text-cyber-neon font-mono">{cm360} cm / 360°</strong></span>
          </div>
        </div>

        {/* Quick Audio Volume */}
        <div className="bg-cyber-card/40 p-3.5 rounded-2xl border border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cyber-muted uppercase">
            <Volume2 className="w-4 h-4 text-cyber-primary" />
            <span>Hit Sound Volume</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.audio.hitVolume}
              onChange={e => {
                const val = parseFloat(e.target.value);
                updateAudio({ hitVolume: val });
                soundEngine.hitVolume = val;
                soundEngine.playHitSound(0, false);
              }}
              className="w-28 h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
            />
            <span className="text-xs font-mono font-bold text-white w-8 text-right">
              {Math.round(settings.audio.hitVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full bg-cyber-primary hover:bg-cyber-primary/90 text-black py-3.5 rounded-xl font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
          >
            <Play className="w-5 h-5 fill-current" />
            Resume Game (ESC)
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full bg-cyber-card hover:bg-cyber-border text-white py-3 rounded-xl font-bold transition-all border border-cyber-border"
          >
            <RotateCcw className="w-4 h-4" />
            Quick Restart (R)
          </button>

          <button
            onClick={onOpenBrowser}
            className="flex items-center justify-center gap-2 w-full bg-cyber-card hover:bg-cyber-border text-white py-3 rounded-xl font-bold transition-all border border-cyber-border"
          >
            <List className="w-4 h-4" />
            All Scenarios Catalog
          </button>

          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 w-full bg-cyber-card hover:bg-cyber-danger/20 text-cyber-muted hover:text-cyber-danger py-2.5 rounded-xl font-bold transition-all border border-cyber-border text-xs"
          >
            <Home className="w-4 h-4" />
            Exit to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
