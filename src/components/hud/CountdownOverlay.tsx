import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../audio/SoundEngine';

export const CountdownOverlay: React.FC = () => {
  const [count, setCount] = useState(3);
  const startGame = useGameStore(state => state.startGame);

  useEffect(() => {
    soundEngine.playCountdown(false);

    const timer1 = setTimeout(() => {
      setCount(2);
      soundEngine.playCountdown(false);
    }, 1000);

    const timer2 = setTimeout(() => {
      setCount(1);
      soundEngine.playCountdown(false);
    }, 2000);

    const timer3 = setTimeout(() => {
      setCount(0); // GO!
      soundEngine.playCountdown(true);
    }, 3000);

    const timer4 = setTimeout(() => {
      startGame();
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [startGame]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center justify-center animate-bounce">
        <span className="text-8xl md:text-9xl font-black font-mono tracking-tighter text-cyber-primary drop-shadow-[0_0_35px_rgba(0,240,255,0.8)]">
          {count > 0 ? count : 'GO!'}
        </span>
        <span className="mt-4 text-sm font-semibold tracking-widest uppercase text-cyber-muted">
          Click screen to lock mouse
        </span>
      </div>
    </div>
  );
};
