import React, { useState } from 'react';
import { ScenarioConfig, Category, TargetShape, MovementPattern } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';
import { X, Play, Sliders, Sparkles } from 'lucide-react';

interface CustomScenarioModalProps {
  onClose: () => void;
  onStartScenario: (scenario: ScenarioConfig) => void;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  onClose,
  onStartScenario
}) => {
  const [name, setName] = useState('Custom Aim Arena');
  const [category, setCategory] = useState<Category>('clicking');
  const [targetShape, setTargetShape] = useState<TargetShape>('sphere');
  const [targetCount, setTargetCount] = useState(3);
  const [targetRadius, setTargetRadius] = useState(0.6);
  const [targetMaxHealth, setTargetMaxHealth] = useState(1);
  const [movementPattern, setMovementPattern] = useState<MovementPattern>('static');
  const [movementSpeed, setMovementSpeed] = useState(3.5);
  const [duration, setDuration] = useState(60);
  const [weaponType, setWeaponType] = useState<'pistol' | 'rifle' | 'beam' | 'sniper'>('pistol');

  const handleLaunch = () => {
    const customConfig: ScenarioConfig = {
      id: 'custom_' + Date.now(),
      name,
      category,
      description: 'Custom created scenario tailored for precision training.',
      difficulty: 'Intermediate',
      duration,
      targetCount,
      targetShape,
      targetRadius,
      targetMaxHealth,
      movementPattern,
      movementSpeed: movementPattern === 'static' ? 0 : movementSpeed,
      spawnArea: { xMin: -8, xMax: 8, yMin: 0.5, yMax: 5.5, zMin: -10, zMax: -10 },
      respawnDelayMs: 0,
      scorePerHit: 100,
      scorePerKill: 200,
      scorePenaltyMiss: 40,
      weaponType,
      fireRateRps: weaponType === 'beam' ? 60 : (weaponType === 'rifle' ? 14 : 10),
      isAutomatic: weaponType === 'rifle' || weaponType === 'beam',
      tags: ['Custom', 'Sandbox', category]
    };

    onStartScenario(customConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none overflow-y-auto">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 border border-cyber-border shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-cyber-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 border border-cyber-primary/30 flex items-center justify-center text-cyber-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Scenario Studio</h2>
              <p className="text-xs text-cyber-muted">Design & customize your ideal training routine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cyber-muted hover:text-white p-2 rounded-xl bg-cyber-card border border-cyber-border hover:bg-cyber-border transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Form */}
        <div className="space-y-6 my-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Scenario Name */}
          <div>
            <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
              Scenario Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-cyber-card border border-cyber-border rounded-xl px-4 py-2.5 text-white font-medium focus:border-cyber-primary outline-none"
            />
          </div>

          {/* Category & Weapon Type Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full bg-cyber-card border border-cyber-border rounded-xl px-4 py-2.5 text-white font-medium focus:border-cyber-primary outline-none"
              >
                <option value="clicking">Clicking / Flicking</option>
                <option value="tracking">Continuous Tracking</option>
                <option value="switching">Target Switching</option>
                <option value="strafing">AI Strafing Duel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                Weapon Type
              </label>
              <select
                value={weaponType}
                onChange={e => setWeaponType(e.target.value as any)}
                className="w-full bg-cyber-card border border-cyber-border rounded-xl px-4 py-2.5 text-white font-medium focus:border-cyber-primary outline-none"
              >
                <option value="pistol">Tactical Pistol (Semi-Auto)</option>
                <option value="rifle">Assault Rifle (Automatic)</option>
                <option value="beam">Laser Beam (Continuous)</option>
                <option value="sniper">Precision Railgun (High Damage)</option>
              </select>
            </div>
          </div>

          {/* Sliders: Target Count & Target Radius */}
          <div className="grid grid-cols-2 gap-4 bg-cyber-card/40 p-4 rounded-2xl border border-cyber-border">
            <div>
              <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                <span>Target Count</span>
                <span className="text-cyber-primary font-mono">{targetCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={targetCount}
                onChange={e => setTargetCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                <span>Target Radius (Scale)</span>
                <span className="text-cyber-primary font-mono">{targetRadius.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.05"
                value={targetRadius}
                onChange={e => setTargetRadius(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
              />
            </div>
          </div>

          {/* Movement Pattern & Speed */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-cyber-muted uppercase tracking-wider mb-2">
                Movement Pattern
              </label>
              <select
                value={movementPattern}
                onChange={e => setMovementPattern(e.target.value as MovementPattern)}
                className="w-full bg-cyber-card border border-cyber-border rounded-xl px-4 py-2.5 text-white font-medium focus:border-cyber-primary outline-none"
              >
                <option value="static">Static (Still)</option>
                <option value="sinusoidal">Sinusoidal Wave</option>
                <option value="bounce">Physics Bouncing</option>
                <option value="strafe_short">Fast ADAD Strafe</option>
                <option value="strafe_long">Wide Strafe</option>
                <option value="strafe_random">Unpredictable AI Strafe</option>
                <option value="orbit_360">360 Orbit</option>
                <option value="evasive_3d">3D Depth Evasion</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                <span>Movement Speed</span>
                <span className="text-cyber-primary font-mono">{movementSpeed.toFixed(1)} u/s</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={movementSpeed}
                onChange={e => setMovementSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary mt-3"
              />
            </div>
          </div>

          {/* Target HP & Duration */}
          <div className="grid grid-cols-2 gap-4 bg-cyber-card/40 p-4 rounded-2xl border border-cyber-border">
            <div>
              <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                <span>Target Health (HP)</span>
                <span className="text-cyber-primary font-mono">{targetMaxHealth === 1 ? '1 (One-Tap)' : targetMaxHealth}</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={targetMaxHealth}
                onChange={e => setTargetMaxHealth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-cyber-muted mb-2">
                <span>Duration</span>
                <span className="text-cyber-primary font-mono">{duration}s</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
                className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer Launch Button */}
        <div className="pt-6 border-t border-cyber-border flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-bold text-cyber-muted hover:text-white bg-cyber-card hover:bg-cyber-border border border-cyber-border transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 bg-cyber-primary hover:bg-cyber-primary/90 text-black px-8 py-3 rounded-xl font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Custom Scenario
          </button>
        </div>
      </div>
    </div>
  );
};
