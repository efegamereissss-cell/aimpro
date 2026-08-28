import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateCm360, calculateEDPI } from '../../utils/sensitivity';
import { PRO_CROSSHAIRS, exportCrosshairCode, importCrosshairCode } from '../../utils/crosshairCodes';
import { CrosshairRenderer } from '../ui/CrosshairRenderer';
import { soundEngine } from '../../audio/SoundEngine';
import { GameSensPreset } from '../../types/settings';
import { 
  X, 
  Sliders, 
  Crosshair, 
  Monitor, 
  Volume2, 
  RotateCcw, 
  Copy, 
  Download, 
  Sparkles, 
  Check, 
  Palette,
  Play
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'controls' | 'crosshair' | 'video' | 'audio';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('controls');
  const [copiedCode, setCopiedCode] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const settings = useSettingsStore(state => state.settings);
  const updateControls = useSettingsStore(state => state.updateControls);
  const updateCrosshair = useSettingsStore(state => state.updateCrosshair);
  const updateVideo = useSettingsStore(state => state.updateVideo);
  const updateAudio = useSettingsStore(state => state.updateAudio);
  const updateSens = useSettingsStore(state => state.updateSens);
  const updateDpi = useSettingsStore(state => state.updateDpi);
  const updateGamePreset = useSettingsStore(state => state.updateGamePreset);
  const resetToDefaults = useSettingsStore(state => state.resetToDefaults);

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
    'Fortnite',
    'Rainbow Six Siege',
    'Call of Duty',
    'Quake / Source'
  ];

  const handleExportCode = () => {
    const code = exportCrosshairCode(settings.crosshair);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleImportCode = () => {
    if (!importInput.trim()) return;
    const parsed = importCrosshairCode(importInput);
    if (parsed) {
      updateCrosshair(parsed);
      setImportStatus('Crosshair imported successfully!');
      setImportInput('');
      setTimeout(() => setImportStatus(null), 2500);
    } else {
      setImportStatus('Invalid crosshair profile code.');
      setTimeout(() => setImportStatus(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 select-none overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 md:p-8 border border-cyber-border shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyber-primary/20 border border-cyber-primary flex items-center justify-center text-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Esports Settings Studio</h2>
              <span className="text-[10px] text-cyber-muted uppercase tracking-widest font-bold">
                1:1 Sensitivity Conversion • Crosshair Studio • PBR Visuals
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyber-card hover:bg-cyber-border text-cyber-muted hover:text-white text-xs font-bold transition-all border border-cyber-border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-cyber-card hover:bg-cyber-danger/20 text-cyber-muted hover:text-cyber-danger transition-all border border-cyber-border"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-2 bg-cyber-card/80 p-1.5 rounded-2xl border border-cyber-border">
          {[
            { id: 'controls', label: 'Controls & Sens', icon: Sliders },
            { id: 'crosshair', label: 'Crosshair Studio', icon: Crosshair },
            { id: 'video', label: 'Graphics & Arena', icon: Monitor },
            { id: 'audio', label: 'Audio Synthesizer', icon: Volume2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'bg-cyber-primary text-black shadow-lg shadow-cyber-primary/25'
                    : 'text-cyber-muted hover:text-white hover:bg-cyber-border/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: CONTROLS & SENSITIVITY */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Game Preset */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border space-y-3">
                <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider block">
                  Game Sensitivity Profile
                </label>
                <select
                  value={settings.controls.gamePreset}
                  onChange={e => updateGamePreset(e.target.value as GameSensPreset)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-cyber-primary"
                >
                  {gamePresets.map(preset => (
                    <option key={preset} value={preset} className="bg-[#0b0f19] text-white">
                      {preset}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-cyber-muted block">
                  Converts yaw radians 1:1 to match in-game rotations.
                </span>
              </div>

              {/* In-Game Sensitivity */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    In-Game Sensitivity
                  </label>
                  <span className="font-mono text-lg font-black text-cyber-primary">
                    {settings.controls.inGameSens.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="3.5"
                  step="0.005"
                  value={settings.controls.inGameSens}
                  onChange={e => updateSens(parseFloat(e.target.value))}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                />
                <div className="flex items-center justify-between text-xs text-cyber-muted">
                  <span>0.01 (Slow)</span>
                  <span>3.50 (Ultra Fast)</span>
                </div>
              </div>

              {/* Mouse Hardware DPI */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    Mouse Hardware DPI
                  </label>
                  <span className="font-mono text-base font-black text-white">
                    {settings.controls.dpi} DPI
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[400, 800, 1600, 3200].map(dpi => (
                    <button
                      key={dpi}
                      onClick={() => updateDpi(dpi)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        settings.controls.dpi === dpi
                          ? 'bg-cyber-primary text-black font-black shadow-md'
                          : 'bg-cyber-bg text-cyber-muted hover:text-white border border-cyber-border'
                      }`}
                    >
                      {dpi}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Physical Distance (cm/360) */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border flex flex-col justify-between">
                <span className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                  Physical 360° Turn Distance
                </span>
                <div className="my-2">
                  <span className="font-mono text-4xl font-black text-cyber-neon drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">
                    {cm360} <span className="text-lg text-cyber-muted">cm / 360°</span>
                  </span>
                </div>
                <span className="text-xs text-cyber-muted font-mono">
                  Effective DPI (eDPI): <strong className="text-white">{edpi}</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CROSSHAIR STUDIO */}
        {activeTab === 'crosshair' && (
          <div className="space-y-6">
            {/* Live Crosshair Preview Stage */}
            <div className="relative w-full h-44 rounded-2xl bg-[#080c14] border border-cyber-border flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-24 h-24 rounded-full border border-cyber-primary" />
                <div className="w-48 h-48 rounded-full border border-cyber-border" />
              </div>
              <CrosshairRenderer />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-cyber-muted uppercase tracking-widest bg-cyber-card/80 px-2 py-1 rounded-md border border-cyber-border">
                Live Reticle Preview
              </div>
            </div>

            {/* Pro Presets Picker */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-cyber-muted tracking-wider block">
                Pro Esports Crosshair Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {PRO_CROSSHAIRS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => updateCrosshair(preset.settings)}
                    className="p-3 rounded-xl bg-cyber-card/70 hover:bg-cyber-border text-left border border-cyber-border transition-all hover:border-cyber-primary group"
                  >
                    <span className="text-[10px] font-bold text-cyber-primary uppercase block">
                      {preset.game}
                    </span>
                    <span className="text-xs font-black text-white group-hover:text-cyber-primary transition-colors block truncate">
                      {preset.player}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Import / Export Codes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 bg-cyber-card/60 p-3 rounded-2xl border border-cyber-border">
                <input
                  type="text"
                  placeholder="Paste Valorant or AIMPRO crosshair code..."
                  value={importInput}
                  onChange={e => setImportInput(e.target.value)}
                  className="flex-1 bg-cyber-bg border border-cyber-border rounded-xl px-3 py-2 text-xs text-white placeholder-cyber-muted focus:outline-none focus:border-cyber-primary font-mono"
                />
                <button
                  onClick={handleImportCode}
                  className="px-4 py-2 rounded-xl bg-cyber-primary text-black text-xs font-black uppercase tracking-wider hover:bg-cyber-primary/90 transition-all"
                >
                  Import
                </button>
              </div>

              <div className="flex items-center justify-between bg-cyber-card/60 p-3 rounded-2xl border border-cyber-border">
                <span className="text-xs font-bold text-cyber-muted uppercase pl-2">
                  Share Your Reticle Code
                </span>
                <button
                  onClick={handleExportCode}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-border hover:bg-cyber-primary hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
            {importStatus && (
              <span className="text-xs text-cyber-neon font-bold block text-center animate-pulse">
                {importStatus}
              </span>
            )}
          </div>
        )}

        {/* Tab 3: VIDEO & GRAPHICS */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Field of View (FOV) */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    Horizontal FOV
                  </label>
                  <span className="font-mono text-lg font-black text-cyber-primary">
                    {settings.video.fov}°
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  step="1"
                  value={settings.video.fov}
                  onChange={e => updateVideo({ fov: parseInt(e.target.value) })}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                />
                <span className="text-[11px] text-cyber-muted block">
                  103° matches default Valorant & Overwatch 1:1 view.
                </span>
              </div>

              {/* Target Color Palette */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border space-y-3">
                <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider block">
                  Target Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {['#00f0ff', '#ff0055', '#ffdd00', '#00ff66', '#a855f7', '#ffffff'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateVideo({ targetColor: color })}
                      className="w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 shadow-md"
                      style={{
                        backgroundColor: color,
                        borderColor: settings.video.targetColor === color ? '#ffffff' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AUDIO SYNTHESIZER */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Hit Sound Preset */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border space-y-3">
                <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider block">
                  Hit Sound Synthesizer Timbre
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'aimlab_crystal', label: 'Crystal Chime' },
                    { id: 'kovaak_bell', label: 'Metallic Bell' },
                    { id: 'quake_ding', label: 'Quake Ding' },
                    { id: 'cyber_plink', label: 'Cyber Plink' }
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updateAudio({ hitSoundPreset: preset.id as any });
                        soundEngine.preset = preset.id as any;
                        soundEngine.playHitSound(0, false);
                      }}
                      className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                        settings.audio.hitSoundPreset === preset.id
                          ? 'bg-cyber-primary text-black font-black shadow-md'
                          : 'bg-cyber-bg text-cyber-muted hover:text-white border border-cyber-border'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Frequency Pitch Slider */}
              <div className="bg-cyber-card/60 p-5 rounded-2xl border border-cyber-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    Base Hit Pitch Frequency
                  </label>
                  <span className="font-mono text-base font-black text-cyber-primary">
                    {settings.audio.hitSoundFrequency} Hz
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1600"
                  step="20"
                  value={settings.audio.hitSoundFrequency}
                  onChange={e => {
                    const f = parseInt(e.target.value);
                    updateAudio({ hitSoundFrequency: f });
                    soundEngine.baseHitFrequency = f;
                    soundEngine.playHitSound(0, false);
                  }}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                />
                <span className="text-[11px] text-cyber-muted block">
                  Adjust from deep thumps (400Hz) to razor-sharp crystal pings (1600Hz).
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
