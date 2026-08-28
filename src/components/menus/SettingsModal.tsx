import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { GameSensPreset } from '../../types/settings';
import { calculateCm360, calculateEDPI } from '../../utils/sensitivity';
import { soundEngine } from '../../audio/SoundEngine';
import { 
  X, 
  Sliders, 
  Crosshair, 
  Monitor, 
  Volume2, 
  RotateCcw, 
  Check, 
  Sparkles,
  Play
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'crosshair' | 'video' | 'audio'>('controls');
  const settings = useSettingsStore(state => state.settings);
  const updateSens = useSettingsStore(state => state.updateSens);
  const updateDpi = useSettingsStore(state => state.updateDpi);
  const updateGamePreset = useSettingsStore(state => state.updateGamePreset);
  const updateCrosshair = useSettingsStore(state => state.updateCrosshair);
  const updateVideo = useSettingsStore(state => state.updateVideo);
  const updateAudio = useSettingsStore(state => state.updateAudio);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none overflow-y-auto">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-8 border border-cyber-border shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-cyber-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center text-cyber-primary">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Platform Settings</h2>
              <p className="text-xs text-cyber-muted">Sensitivity, Crosshair Studio, Video & Audio Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cyber-muted hover:text-white p-2 rounded-xl bg-cyber-card border border-cyber-border hover:bg-cyber-border transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-cyber-border/80 pb-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'controls'
                ? 'bg-cyber-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Sensitivity & Controls
          </button>

          <button
            onClick={() => setActiveTab('crosshair')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'crosshair'
                ? 'bg-cyber-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            Crosshair Studio
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-cyber-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Video & Graphics
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'audio'
                ? 'bg-cyber-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-cyber-card text-cyber-muted hover:text-white border border-cyber-border'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Web Audio Engine
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-6">
          {/* 1. CONTROLS & SENSITIVITY TAB */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              {/* Game Profile Preset */}
              <div>
                <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                  Game Sensitivity Profile
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gamePresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => updateGamePreset(preset)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold text-left border transition-all ${
                        settings.controls.gamePreset === preset
                          ? 'border-cyber-primary bg-cyber-primary/10 text-cyber-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'border-cyber-border bg-cyber-card text-cyber-muted hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sens Slider & Value Box */}
              <div className="bg-cyber-card/60 p-6 rounded-2xl border border-cyber-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    {settings.controls.gamePreset} In-Game Sensitivity
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10"
                    value={settings.controls.inGameSens}
                    onChange={e => updateSens(parseFloat(e.target.value) || 0.1)}
                    className="w-24 bg-cyber-card border border-cyber-border rounded-xl px-3 py-1.5 text-right font-mono font-black text-cyber-primary outline-none focus:border-cyber-primary"
                  />
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="3.0"
                  step="0.01"
                  value={settings.controls.inGameSens}
                  onChange={e => updateSens(parseFloat(e.target.value))}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                />

                {/* DPI Setting */}
                <div className="flex items-center justify-between pt-4 border-t border-cyber-border/60">
                  <span className="text-xs font-bold text-cyber-muted uppercase tracking-wider">Mouse DPI</span>
                  <div className="flex items-center gap-2">
                    {[400, 800, 1600, 3200].map(d => (
                      <button
                        key={d}
                        onClick={() => updateDpi(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                          settings.controls.dpi === d
                            ? 'bg-cyber-primary text-black border-cyber-primary'
                            : 'bg-cyber-card text-cyber-muted border-cyber-border hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                    <input
                      type="number"
                      value={settings.controls.dpi}
                      onChange={e => updateDpi(parseInt(e.target.value) || 800)}
                      className="w-20 bg-cyber-card border border-cyber-border rounded-xl px-2 py-1 text-center font-mono text-xs font-bold text-white outline-none focus:border-cyber-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Physical Metrics (cm/360 & eDPI) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyber-card/40 p-4 rounded-2xl border border-cyber-border">
                  <span className="text-xs font-bold text-cyber-muted uppercase">Physical Distance (cm/360)</span>
                  <span className="font-mono text-2xl font-black text-cyber-neon mt-1 block">
                    {cm360} cm
                  </span>
                  <span className="text-[11px] text-cyber-muted">360 degree mousepad sweep</span>
                </div>
                <div className="bg-cyber-card/40 p-4 rounded-2xl border border-cyber-border">
                  <span className="text-xs font-bold text-cyber-muted uppercase">Effective DPI (eDPI)</span>
                  <span className="font-mono text-2xl font-black text-cyber-primary mt-1 block">
                    {edpi}
                  </span>
                  <span className="text-[11px] text-cyber-muted">In-game Sens × Mouse DPI</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. CROSSHAIR STUDIO TAB */}
          {activeTab === 'crosshair' && (
            <div className="space-y-6">
              {/* Live Preview Box */}
              <div className="w-full h-44 bg-cyber-bg rounded-2xl border border-cyber-border flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Cross Grid */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="w-full h-[1px] bg-cyber-primary" />
                  <div className="h-full w-[1px] bg-cyber-primary absolute" />
                </div>

                {/* Render Custom Crosshair Preview */}
                <div className="relative flex items-center justify-center scale-150">
                  {settings.crosshair.dot && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: `${settings.crosshair.dotSize * 2}px`,
                        height: `${settings.crosshair.dotSize * 2}px`,
                        backgroundColor: settings.crosshair.color,
                        boxShadow: settings.crosshair.outline
                          ? `0 0 0 ${settings.crosshair.outlineThickness}px ${settings.crosshair.outlineColor}`
                          : undefined
                      }}
                    />
                  )}
                  {settings.crosshair.style === 'cross' && (
                    <>
                      <div
                        className="absolute"
                        style={{
                          width: `${settings.crosshair.thickness}px`,
                          height: `${settings.crosshair.size}px`,
                          bottom: `${settings.crosshair.gap}px`,
                          backgroundColor: settings.crosshair.color
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          width: `${settings.crosshair.thickness}px`,
                          height: `${settings.crosshair.size}px`,
                          top: `${settings.crosshair.gap}px`,
                          backgroundColor: settings.crosshair.color
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          width: `${settings.crosshair.size}px`,
                          height: `${settings.crosshair.thickness}px`,
                          right: `${settings.crosshair.gap}px`,
                          backgroundColor: settings.crosshair.color
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          width: `${settings.crosshair.size}px`,
                          height: `${settings.crosshair.thickness}px`,
                          left: `${settings.crosshair.gap}px`,
                          backgroundColor: settings.crosshair.color
                        }}
                      />
                    </>
                  )}
                </div>

                <span className="absolute bottom-3 text-[11px] font-bold text-cyber-muted uppercase tracking-widest">
                  Live Studio Preview
                </span>
              </div>

              {/* Crosshair Controls Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Style */}
                <div>
                  <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                    Crosshair Style
                  </label>
                  <select
                    value={settings.crosshair.style}
                    onChange={e => updateCrosshair({ style: e.target.value as any })}
                    className="w-full bg-cyber-card border border-cyber-border rounded-xl px-4 py-2.5 text-white font-medium focus:border-cyber-primary outline-none"
                  >
                    <option value="cross">Classic Cross</option>
                    <option value="dot">Center Dot Only</option>
                    <option value="circle">Hollow Circle</option>
                    <option value="t-shape">T-Shape Tactical</option>
                    <option value="box">Hollow Box</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                    Reticle Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.crosshair.color}
                      onChange={e => updateCrosshair({ color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.crosshair.color}
                      onChange={e => updateCrosshair({ color: e.target.value })}
                      className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-white font-mono text-xs uppercase outline-none focus:border-cyber-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Sliders: Size, Thickness, Gap */}
              <div className="grid grid-cols-3 gap-4 bg-cyber-card/40 p-4 rounded-2xl border border-cyber-border">
                <div>
                  <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                    <span>Length</span>
                    <span className="text-cyber-primary font-mono">{settings.crosshair.size}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={settings.crosshair.size}
                    onChange={e => updateCrosshair({ size: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                    <span>Thickness</span>
                    <span className="text-cyber-primary font-mono">{settings.crosshair.thickness}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={settings.crosshair.thickness}
                    onChange={e => updateCrosshair({ thickness: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                    <span>Center Gap</span>
                    <span className="text-cyber-primary font-mono">{settings.crosshair.gap}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={settings.crosshair.gap}
                    onChange={e => updateCrosshair({ gap: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. VIDEO & GRAPHICS TAB */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              {/* Arena Theme */}
              <div>
                <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                  3D Arena Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'cyber', name: 'Cyber Neon' },
                    { id: 'studio', name: 'Clean Studio' },
                    { id: 'tactical', name: 'Tactical Gray' },
                    { id: 'synthwave', name: 'Synthwave' },
                    { id: 'dark', name: 'Dark Void' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => updateVideo({ arenaTheme: theme.id as any })}
                      className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                        settings.video.arenaTheme === theme.id
                          ? 'border-cyber-primary bg-cyber-primary/10 text-cyber-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'border-cyber-border bg-cyber-card text-cyber-muted hover:text-white'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* FOV Slider */}
              <div className="bg-cyber-card/60 p-6 rounded-2xl border border-cyber-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    Field of View (FOV)
                  </span>
                  <span className="font-mono text-xl font-black text-cyber-primary">
                    {settings.video.fov}°
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="1"
                  value={settings.video.fov}
                  onChange={e => updateVideo({ fov: parseInt(e.target.value) })}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                />
                <div className="flex items-center gap-3 text-xs text-cyber-muted">
                  <button onClick={() => updateVideo({ fov: 103 })} className="hover:text-white underline">
                    Valorant (103°)
                  </button>
                  <span>•</span>
                  <button onClick={() => updateVideo({ fov: 90 })} className="hover:text-white underline">
                    CS2 (90°)
                  </button>
                  <span>•</span>
                  <button onClick={() => updateVideo({ fov: 110 })} className="hover:text-white underline">
                    Apex (110°)
                  </button>
                </div>
              </div>

              {/* Target Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                    Target Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.video.targetColor}
                      onChange={e => updateVideo({ targetColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.video.targetColor}
                      onChange={e => updateVideo({ targetColor: e.target.value })}
                      className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-white font-mono text-xs uppercase outline-none focus:border-cyber-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                    Target Hit Flash Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.video.targetHitColor}
                      onChange={e => updateVideo({ targetHitColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.video.targetHitColor}
                      onChange={e => updateVideo({ targetHitColor: e.target.value })}
                      className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-white font-mono text-xs uppercase outline-none focus:border-cyber-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. WEB AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Hit Sound Preset */}
              <div>
                <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                  Hit Sound Timbre
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'aimlab_crystal', name: 'AimLab Crystal' },
                    { id: 'kovaak_bell', name: 'KovaaK Bell' },
                    { id: 'quake_ding', name: 'Quake Ding' },
                    { id: 'cyber_plink', name: 'Cyber Plink' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        updateAudio({ hitSoundPreset: p.id as any });
                        soundEngine.preset = p.id as any;
                        soundEngine.playHitSound(0, false);
                      }}
                      className={`px-4 py-3 rounded-xl text-xs font-bold text-left border transition-all ${
                        settings.audio.hitSoundPreset === p.id
                          ? 'border-cyber-primary bg-cyber-primary/10 text-cyber-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'border-cyber-border bg-cyber-card text-cyber-muted hover:text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hit Frequency Slider + Test Button */}
              <div className="bg-cyber-card/60 p-6 rounded-2xl border border-cyber-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    Hit Sound Frequency
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-cyber-primary">
                      {settings.audio.hitSoundFrequency} Hz
                    </span>
                    <button
                      onClick={() => soundEngine.playHitSound(0, false)}
                      className="flex items-center gap-1.5 bg-cyber-primary text-black px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-md hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Test
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1600"
                  step="20"
                  value={settings.audio.hitSoundFrequency}
                  onChange={e => updateAudio({ hitSoundFrequency: parseInt(e.target.value) })}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                />
              </div>

              {/* Volume Sliders Grid */}
              <div className="grid grid-cols-2 gap-4 bg-cyber-card/40 p-4 rounded-2xl border border-cyber-border">
                <div>
                  <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                    <span>Master Volume</span>
                    <span className="text-cyber-primary font-mono">{Math.round(settings.audio.masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.audio.masterVolume}
                    onChange={e => updateAudio({ masterVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                    <span>Hit Ping Volume</span>
                    <span className="text-cyber-primary font-mono">{Math.round(settings.audio.hitVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.audio.hitVolume}
                    onChange={e => updateAudio({ hitVolume: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-cyber-border flex items-center justify-between shrink-0">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 text-xs font-bold text-cyber-muted hover:text-cyber-danger transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-cyber-primary hover:bg-cyber-primary/90 text-black px-8 py-3 rounded-xl font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]"
          >
            <Check className="w-4 h-4" />
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
