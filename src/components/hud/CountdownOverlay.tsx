import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Target, MousePointer } from 'lucide-react';

export const CountdownOverlay: React.FC = () => {
  const startGame = useGameStore(state => state.startGame);
  const scenario = useGameStore(state => state.activeScenario);

  const handleImmediateStart = () => {
    const canvas = document.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
    startGame();
  };

  return (
    <div
      onClick={handleImmediateStart}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md cursor-pointer select-none"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 glass-panel rounded-3xl border border-cyber-primary shadow-[0_0_40px_rgba(0,240,255,0.3)] animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-cyber-primary/20 border border-cyber-primary flex items-center justify-center text-cyber-primary shadow-[0_0_20px_rgba(0,240,255,0.5)]">
          <MousePointer className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            {scenario.name}
          </h2>
          <p className="text-xs font-bold text-cyber-primary uppercase tracking-widest mt-1">
            Click Anywhere to Lock Mouse & Start
          </p>
        </div>

        <div className="px-6 py-2 rounded-xl bg-cyber-card text-xs font-mono font-bold text-cyber-muted border border-cyber-border">
          {scenario.category} • {scenario.duration}s • {scenario.targetCount} Targets
        </div>
      </div>
    </div>
  );
};
